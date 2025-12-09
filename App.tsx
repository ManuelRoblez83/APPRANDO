import React, { useState, useEffect, useCallback } from 'react';
import { Mountain, Map as MapIcon, List } from 'lucide-react';
import { HikeForm } from './components/HikeForm';
import { MapDisplay } from './components/MapDisplay';
import { HikeList } from './components/HikeList';
import { HikeData, HikeFormData, Coordinates } from './types';
import { getCoordinates, getAddressFromCoordinates } from './services/geocodingService';
import { getRoute, RouteData, formatDistance, formatDuration, calculateDistance, estimateWalkingDuration } from './services/routingService';
import { calculateElevationProfile } from './services/elevationService';
import { fetchHikes, createHike, updateHike, deleteHike } from './services/hikeService';

const App: React.FC = () => {
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

  // Charger les randonnées depuis Supabase au montage du composant
  useEffect(() => {
    const loadHikes = async () => {
      setIsLoadingHikes(true);
      try {
        const loadedHikes = await fetchHikes();
        setHikes(loadedHikes);
      } catch (error) {
        console.error('Erreur lors du chargement des randonnées:', error);
        alert('Impossible de charger les randonnées. Vérifiez votre connexion Supabase.');
      } finally {
        setIsLoadingHikes(false);
      }
    };

    loadHikes();
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
        
        // Get detailed pedestrian route - only show routes that are walkable
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
            
            // Only use route if it's a valid pedestrian route
            setRouteData(route);
            // Always auto-fill distance and duration with calculated values from pedestrian route
            setFormData(prev => ({
              ...prev,
              distance: (route.distance / 1000).toFixed(2),
              duration: formatDuration(route.duration)
            }));
            setIsFormValidForSave(true);
          } else {
            // No pedestrian route found - clear route data and show message
            setRouteData(null);
            alert("Aucun itinéraire pédestre n'a pu être trouvé entre ces deux points. Veuillez vérifier que les lieux sont accessibles à pied.");
            setIsFormValidForSave(false);
          }
        } catch (routeError) {
          console.warn("Could not fetch route details:", routeError);
          // Don't show fallback straight line - only show actual pedestrian routes
          setRouteData(null);
          alert("Impossible de calculer un itinéraire pédestre. Veuillez vérifier votre connexion ou essayer avec d'autres points.");
          setIsFormValidForSave(false);
        }
      } else {
        alert("Impossible de trouver l'une des localisations. Veuillez vérifier l'orthographe.");
        setIsFormValidForSave(false);
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      alert("Erreur de connexion lors de la recherche des lieux.");
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
          alert('Randonnée mise à jour avec succès !');
        } else {
          alert('Erreur lors de la mise à jour de la randonnée.');
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
          alert('Randonnée enregistrée avec succès !');
        } else {
          alert('Erreur lors de l\'enregistrement de la randonnée.');
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
      alert('Erreur lors de la sauvegarde. Vérifiez votre connexion Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle displaying hike preview on map
  const handlePreviewHike = async (start: Coordinates, end: Coordinates, startName: string, endName: string) => {
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
        // Even if no route, show the markers
        setPreviewCoords({ start, end });
        setRouteData(null);
      }
    } catch (error) {
      console.error("Error loading route for hike:", error);
      setPreviewCoords({ start, end });
      setRouteData(null);
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
      // Recalculate route for the saved hike
      handlePreviewHike(hike.startCoords, hike.endCoords, hike.startLocation, hike.endLocation);
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
      handlePreviewHike(hike.startCoords, hike.endCoords, hike.startLocation, hike.endLocation);
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
          alert('Randonnée supprimée avec succès !');
        } else {
          alert('Erreur lors de la suppression de la randonnée.');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression. Vérifiez votre connexion Supabase.');
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

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="w-8 h-8 text-emerald-300" />
            <h1 className="text-2xl font-bold tracking-tight">RandoTrack</h1>
          </div>
          <div className="text-emerald-200 text-sm hidden sm:block">
            Planifiez votre prochaine aventure
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Top Section: Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div className="space-y-4">
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
            />
            
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm text-emerald-800">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <MapIcon className="w-4 h-4" /> Comment ça marche ?
              </h3>
              <ul className="space-y-1 text-xs">
                <li>• Entrez le <strong>point de départ</strong> et le <strong>point d'arrivée</strong></li>
                <li>• Cliquez sur <strong>Prévisualiser</strong> pour calculer l'itinéraire</li>
                <li>• <strong>Seuls les itinéraires pédestres</strong> sont affichés (sentiers, chemins piétons)</li>
                <li>• La <strong>distance</strong> (en km) et la <strong>durée</strong> sont calculées automatiquement</li>
                <li>• L'itinéraire réel à pied s'affiche sur la carte avec tous les détails</li>
                <li>• <strong>Enregistrez</strong> pour conserver votre randonnée</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="flex flex-col">
              <MapDisplay
                startCoords={previewCoords.start}
                endCoords={previewCoords.end}
                startName={formData.startLocation}
                endName={formData.endLocation}
                routeData={routeData}
                isRouteLoading={isRouteLoading}
                onMapClick={handleMapClick}
                selectionMode={selectionMode}
              />
          </div>
        </div>

        {/* Bottom Section: List */}
        <div className="pt-8 border-t border-stone-200">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <List className="w-6 h-6" />
            Vos Randonnées Enregistrées
            {isLoadingHikes && (
              <span className="text-sm text-stone-500 ml-2">(Chargement...)</span>
            )}
          </h2>
          {isLoadingHikes ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-300">
              <span className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent inline-block"></span>
              <p className="text-stone-400 mt-2">Chargement des randonnées...</p>
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