import React, { useState, useEffect, useCallback } from 'react';
import { Mountain, Map as MapIcon, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { HomePage } from './components/HomePage';
import { UserProfile } from './components/UserProfile';
import { HikeForm } from './components/HikeForm';
import { MapDisplay } from './components/MapDisplay';
import { HikeList } from './components/HikeList';
import { AuthButton } from './components/AuthButton';
import { ThemeToggle } from './components/ThemeToggle';
import { HikeData, HikeFormData, Coordinates } from './types';
import { getCoordinates, getAddressFromCoordinates } from './services/geocodingService';
import { getRoute, RouteData, RoutePoint, formatDistance, formatDuration, calculateDistance, estimateWalkingDuration, calculateRealisticWalkingDuration } from './services/routingService';
import { calculateElevationProfile } from './services/elevationService';
import { fetchHikes, createHike, updateHike, deleteHike } from './services/hikeService';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  // État pour afficher la page d'accueil ou l'application principale
  const [showHomePage, setShowHomePage] = useState(true);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [refreshProfileKey, setRefreshProfileKey] = useState(0);
  // State for the list of saved hikes
  const [hikes, setHikes] = useState<HikeData[]>([]);
  const [isLoadingHikes, setIsLoadingHikes] = useState(true);

  // State for the form
  const [formData, setFormData] = useState<HikeFormData>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    startLocation: '',
    endLocation: '',
    distance: '',
    duration: '',
  });

  // State for the current preview on map
  const [previewCoords, setPreviewCoords] = useState<{
    start?: Coordinates;
    end?: Coordinates;
  }>({});

  // State for route data
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);


  const [isLoading, setIsLoading] = useState(false);
  const [isFormValidForSave, setIsFormValidForSave] = useState(false);
  const [editingHikeId, setEditingHikeId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);

  // Charger les randonnées depuis Supabase au montage du composant et lors des changements d'auth
  useEffect(() => {
    const loadHikes = async () => {
      setIsLoadingHikes(true);
      try {
        const loadedHikes = await fetchHikes();
        setHikes(loadedHikes);
      } catch (error) {
        console.error('Erreur lors du chargement des randonnées:', error);
        // Ne pas afficher d'alerte si l'utilisateur n'est pas connecté
        if ((error as Error).message !== 'Vous devez être connecté pour créer une randonnée') {
          console.warn('Impossible de charger les randonnées. L\'utilisateur n\'est peut-être pas connecté.');
        }
      } finally {
        setIsLoadingHikes(false);
      }
    };

    loadHikes();

    // Écouter les changements d'authentification pour recharger les randonnées
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadHikes();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Reset save validity and clear calculated values if location changes
    if (name === 'startLocation' || name === 'endLocation') {
      setIsFormValidForSave(false);
      setRouteData(null);
      // Clear distance and duration when locations change (will be recalculated on preview)
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        distance: '',
        duration: ''
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle geocoding preview
  const handlePreview = async () => {
    if (!formData.startLocation || !formData.endLocation) return;
    
    setIsLoading(true);
    setIsRouteLoading(true);
    setRouteData(null);
    
    try {
      const [start, end] = await Promise.all([
        getCoordinates(formData.startLocation),
        getCoordinates(formData.endLocation),
      ]);

      if (start && end) {
        setPreviewCoords({ start, end });
        
        // Get pedestrian route
        try {
          const route = await getRoute(start, end);
          if (route) {
            // Calculate elevation profile for the route
            try {
              const elevationProfile = await calculateElevationProfile(route.coordinates);
              if (elevationProfile) {
                route.elevationProfile = {
                  minElevation: elevationProfile.minElevation,
                  maxElevation: elevationProfile.maxElevation,
                  totalAscent: elevationProfile.totalAscent,
                  totalDescent: elevationProfile.totalDescent,
                };
              }
            } catch (elevError) {
              console.warn("Could not calculate elevation profile:", elevError);
              // Continue without elevation data
            }
            
            // Set the route
            setRouteData(route);
            
            // Auto-fill distance and duration
            setFormData(prev => ({
              ...prev,
              distance: (route.distance / 1000).toFixed(2),
              duration: formatDuration(route.duration)
            }));
            setIsFormValidForSave(true);
          } else {
            // No pedestrian route found - clear route data and show message
            setRouteData(null);
            toast.error("Aucun itinéraire pédestre n'a pu être trouvé entre ces deux points. Veuillez vérifier que les lieux sont accessibles à pied.");
            setIsFormValidForSave(false);
          }
        } catch (routeError) {
          console.warn("Could not fetch route details:", routeError);
          setRouteData(null);
          toast.error("Impossible de calculer un itinéraire pédestre. Veuillez vérifier votre connexion ou essayer avec d'autres points.");
          setIsFormValidForSave(false);
        }
      } else {
        toast.error("Impossible de trouver l'une des localisations. Veuillez vérifier l'orthographe.");
        setIsFormValidForSave(false);
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      toast.error("Erreur de connexion lors de la recherche des lieux.");
      setIsFormValidForSave(false);
    } finally {
      setIsLoading(false);
      setIsRouteLoading(false);
    }
  };

  // Handle saving the hike (create or update)
  const handleSave = async () => {
    if (!isFormValidForSave || !previewCoords.start || !previewCoords.end) return;

    setIsLoading(true);

    try {
      if (editingHikeId) {
        // Update existing hike
        const updatedHike: HikeData = {
          id: editingHikeId,
          name: formData.name || `Randonnée du ${formData.date}`,
          date: formData.date,
          startLocation: formData.startLocation,
          endLocation: formData.endLocation,
          distance: parseFloat(formData.distance) || 0,
          duration: formData.duration,
          startCoords: previewCoords.start,
          endCoords: previewCoords.end,
          elevationProfile: routeData?.elevationProfile,
        };

        const savedHike = await updateHike(updatedHike);
        if (savedHike) {
          setHikes((prev) => prev.map((hike) => 
            hike.id === editingHikeId ? savedHike : hike
          ));
          setEditingHikeId(null);
          toast.success('Randonnée mise à jour avec succès !');
        } else {
          toast.error('Erreur lors de la mise à jour de la randonnée.');
        }
      } else {
        // Create new hike - L'ID sera généré par Supabase
        const newHike: HikeData = {
          id: '', // L'ID sera généré par Supabase
          name: formData.name || `Randonnée du ${formData.date}`,
          date: formData.date,
          startLocation: formData.startLocation,
          endLocation: formData.endLocation,
          distance: parseFloat(formData.distance) || 0,
          duration: formData.duration,
          startCoords: previewCoords.start,
          endCoords: previewCoords.end,
          elevationProfile: routeData?.elevationProfile,
        };

        const savedHike = await createHike(newHike);
        if (savedHike) {
          setHikes((prev) => [savedHike, ...prev]);
          toast.success('Randonnée enregistrée avec succès !');
        } else {
          toast.error('Erreur lors de l\'enregistrement de la randonnée.');
        }
      }
      
      // Reset form
      setFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        startLocation: '',
        endLocation: '',
        distance: '',
        duration: '',
      });
      setPreviewCoords({});
      setRouteData(null);
      setIsFormValidForSave(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde. Vérifiez votre connexion Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a fallback straight-line route when OSRM doesn't find a pedestrian route
  const createFallbackRoute = (start: Coordinates, end: Coordinates, distanceKm?: number): RouteData => {
    const distanceMeters = distanceKm ? distanceKm * 1000 : calculateDistance(start, end);
    const duration = calculateRealisticWalkingDuration(distanceMeters);
    
    // Create a simple straight-line route with start and end points
    const coordinates: RoutePoint[] = [
      { lat: start.lat, lng: start.lng },
      { lat: end.lat, lng: end.lng }
    ];
    
    // Create a simple GeoJSON geometry string representation
    const geometryString = JSON.stringify({
      type: 'LineString',
      coordinates: [[start.lng, start.lat], [end.lng, end.lat]]
    });
    
    return {
      coordinates,
      distance: distanceMeters,
      duration,
      geometry: geometryString
    };
  };

  // Handle displaying hike preview on map
  const handlePreviewHike = async (start: Coordinates, end: Coordinates, startName: string, endName: string, savedDistance?: number) => {
    setIsRouteLoading(true);
    setRouteData(null);
    
    try {
      const route = await getRoute(start, end);
      if (route) {
        // Calculate elevation profile for the route
        try {
          const elevationProfile = await calculateElevationProfile(route.coordinates);
          if (elevationProfile) {
            route.elevationProfile = {
              minElevation: elevationProfile.minElevation,
              maxElevation: elevationProfile.maxElevation,
              totalAscent: elevationProfile.totalAscent,
              totalDescent: elevationProfile.totalDescent,
            };
          }
        } catch (elevError) {
          console.warn("Could not calculate elevation profile:", elevError);
          // Continue without elevation data
        }
        
        setRouteData(route);
        setPreviewCoords({ start, end });
      } else {
        // If no pedestrian route found, create a fallback straight-line route
        // This is especially useful for saved hikes that were previously calculated
        console.warn("No pedestrian route found from OSRM, using fallback straight-line route");
        const fallbackRoute = createFallbackRoute(start, end, savedDistance);
        setRouteData(fallbackRoute);
        setPreviewCoords({ start, end });
        // Show info toast for saved hikes
        if (savedDistance) {
          toast("Itinéraire approximatif affiché (ligne droite). L'API de routage n'a pas trouvé d'itinéraire pédestre détaillé.", {
            icon: 'ℹ️',
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Error loading route for hike:", error);
      // Even on error, create a fallback route so markers are visible
      const fallbackRoute = createFallbackRoute(start, end, savedDistance);
      setRouteData(fallbackRoute);
      setPreviewCoords({ start, end });
    } finally {
      setIsRouteLoading(false);
    }
  };

  // Handle editing a hike
  const handleEdit = (hike: HikeData) => {
    setEditingHikeId(hike.id);
    setFormData({
      name: hike.name,
      date: hike.date,
      startLocation: hike.startLocation,
      endLocation: hike.endLocation,
      distance: hike.distance.toString(),
      duration: hike.duration,
    });
    
    // Load coordinates and display preview
    if (hike.startCoords && hike.endCoords) {
      setPreviewCoords({
        start: hike.startCoords,
        end: hike.endCoords,
      });
      // Recalculate route for the saved hike (use saved distance as fallback)
      handlePreviewHike(hike.startCoords, hike.endCoords, hike.startLocation, hike.endLocation, hike.distance);
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle displaying a saved hike on the map
  const handleShowOnMap = (hike: HikeData) => {
    if (hike.startCoords && hike.endCoords) {
      // Update form with hike location names for proper display on map
      setFormData(prev => ({
        ...prev,
        startLocation: hike.startLocation,
        endLocation: hike.endLocation,
      }));
      handlePreviewHike(hike.startCoords, hike.endCoords, hike.startLocation, hike.endLocation, hike.distance);
      // Scroll to map
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle map click to select start or end point
  const handleMapClick = async (coordinates: Coordinates) => {
    if (!selectionMode) return;

    setIsLoading(true);
    
    try {
      // Get address from coordinates using reverse geocoding
      const address = await getAddressFromCoordinates(coordinates);
      
      if (selectionMode === 'start') {
        setPreviewCoords(prev => ({ ...prev, start: coordinates }));
        setFormData(prev => ({
          ...prev,
          startLocation: address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
        }));
      } else {
        setPreviewCoords(prev => ({ ...prev, end: coordinates }));
        setFormData(prev => ({
          ...prev,
          endLocation: address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
        }));
      }
      
      // Clear selection mode
      setSelectionMode(null);
      
      // If both points are now selected, automatically preview the route
      const currentStart = selectionMode === 'start' ? coordinates : previewCoords.start;
      const currentEnd = selectionMode === 'end' ? coordinates : previewCoords.end;
      
      if (currentStart && currentEnd) {
        // Trigger preview after a short delay to allow state to update
        setTimeout(async () => {
          await handlePreview();
        }, 300);
      }
    } catch (error) {
      console.error("Error handling map click:", error);
      // Still update coordinates even if reverse geocoding fails
      if (selectionMode === 'start') {
        setPreviewCoords(prev => ({ ...prev, start: coordinates }));
        setFormData(prev => ({
          ...prev,
          startLocation: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
        }));
      } else {
        setPreviewCoords(prev => ({ ...prev, end: coordinates }));
        setFormData(prev => ({
          ...prev,
          endLocation: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
        }));
      }
      setSelectionMode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette randonnée ?")) {
      setIsLoading(true);
      try {
        const success = await deleteHike(id);
        if (success) {
          setHikes((prev) => prev.filter(h => h.id !== id));
          // Clear form if deleting the hike being edited
          if (editingHikeId === id) {
            setEditingHikeId(null);
            setFormData({
              name: '',
              date: new Date().toISOString().split('T')[0],
              startLocation: '',
              endLocation: '',
              distance: '',
              duration: '',
            });
            setPreviewCoords({});
            setRouteData(null);
            setIsFormValidForSave(false);
          }
          toast.success('Randonnée supprimée avec succès !');
        } else {
          toast.error('Erreur lors de la suppression de la randonnée.');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression. Vérifiez votre connexion Supabase.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingHikeId(null);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      startLocation: '',
      endLocation: '',
      distance: '',
      duration: '',
    });
    setPreviewCoords({});
    setRouteData(null);
    setIsFormValidForSave(false);
  };

  // Afficher la page d'accueil si showHomePage est true
  if (showHomePage) {
    return <HomePage onEnterApp={() => setShowHomePage(false)} />;
  }

  // Afficher la page de profil si showUserProfile est true
  if (showUserProfile) {
    return (
      <UserProfile
        onBack={() => {
          setShowUserProfile(false);
          // Rafraîchir la photo de profil après retour du profil
          setRefreshProfileKey((prev) => prev + 1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 transition-colors duration-500">
      {/* Header */}
      <header className="bg-emerald-900 dark:bg-stone-800 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 border-b border-emerald-800/20 dark:border-stone-700/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setShowHomePage(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <Mountain className="w-8 h-8 text-emerald-300 dark:text-emerald-400 transition-transform duration-300 group-hover:rotate-12" />
            <h1 className="text-2xl font-bold tracking-tight">RandoTrack</h1>
          </button>
          <div className="flex items-center gap-4">
            <div className="text-emerald-200 dark:text-stone-300 text-sm hidden lg:block animate-fade-in">
              Planifiez votre prochaine aventure
            </div>
            <ThemeToggle />
            <AuthButton 
              onShowProfile={() => setShowUserProfile(true)}
              refreshProfilePicture={refreshProfileKey}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        
        {/* Top Section: Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div className="space-y-6">
            <div className="animate-scale-in">
              <HikeForm 
                formData={formData}
                onChange={handleInputChange}
                onPreview={handlePreview}
                onSave={handleSave}
                onCancel={editingHikeId ? handleCancelEdit : undefined}
                isLoading={isLoading}
                canSave={isFormValidForSave}
                isEditing={!!editingHikeId}
                onSelectOnMap={setSelectionMode}
                selectionMode={selectionMode}
                existingHikes={hikes}
                onLoadHike={handleEdit}
              />
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/50 dark:border-emerald-800/30 p-5 rounded-3xl text-sm text-emerald-800 dark:text-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
              <h3 className="font-bold flex items-center gap-2 mb-3 text-base">
                <MapIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Comment ça marche ?
              </h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span>
                  <span>Entrez le <strong>point de départ</strong> et le <strong>point d'arrivée</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span>
                  <span>Cliquez sur <strong>Prévisualiser</strong> pour calculer l'itinéraire</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span>
                  <span><strong>Seuls les itinéraires pédestres</strong> sont affichés (sentiers, chemins piétons)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span>
                  <span>La <strong>distance</strong> (en km) et la <strong>durée</strong> sont calculées automatiquement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span>
                  <span>L'itinéraire réel à pied s'affiche sur la carte avec tous les détails</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span>
                  <span><strong>Enregistrez</strong> pour conserver votre randonnée</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="flex flex-col animate-slide-in-right">
              <MapDisplay
                startCoords={previewCoords.start}
                endCoords={previewCoords.end}
                startName={formData.startLocation}
                endName={formData.endLocation}
                routeData={routeData}
                isRouteLoading={isRouteLoading}
                onMapClick={handleMapClick}
                selectionMode={selectionMode}
                formattedDistance={formData.distance}
                formattedDuration={formData.duration}
              />
          </div>
        </div>

        {/* Bottom Section: List */}
        <div className="pt-8 border-t border-stone-200 dark:border-stone-700 animate-fade-in">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
            <List className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Vos Randonnées Enregistrées
            {isLoadingHikes && (
              <span className="text-sm text-stone-500 dark:text-stone-400 ml-2 animate-pulse">(Chargement...)</span>
            )}
          </h2>
          {isLoadingHikes ? (
            <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 shadow-sm">
              <span className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent inline-block"></span>
              <p className="text-stone-400 dark:text-stone-500 mt-3 font-medium">Chargement des randonnées...</p>
            </div>
          ) : (
            <HikeList 
              hikes={hikes} 
              onDelete={handleDelete}
              onEdit={handleEdit}
              onShowOnMap={handleShowOnMap}
            />
          )}
        </div>

      </main>
    </div>
  );
};

export default App;