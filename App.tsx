import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Mountain, Map as MapIcon, List, AlertTriangle, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
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
import { uploadHikePhotos, deleteHikePhoto } from './services/hikePhotoService';
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
    photos: [],
  });
  const [hikePhotos, setHikePhotos] = useState<string[]>([]); // Photos existantes de la randonnée en cours d'édition

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  // Handle photos change
  const handlePhotosChange = (files: File[]) => {
    setFormData((prev) => ({ ...prev, photos: files }));
  };

  // Handle delete existing photo
  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      const result = await deleteHikePhoto(photoUrl);
      if (result.success) {
        setHikePhotos(prev => prev.filter(url => url !== photoUrl));
        toast.success('Photo supprimée avec succès');
      } else {
        toast.error(result.error || 'Erreur lors de la suppression de la photo');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      toast.error('Erreur lors de la suppression de la photo');
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
    // Validation minimale : au moins les lieux doivent être remplis
    if (!formData.startLocation || !formData.endLocation) {
      toast.error('Veuillez remplir au moins le point de départ et le point d\'arrivée');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté pour sauvegarder une randonnée');
        setIsLoading(false);
        return;
      }

      // Si les coordonnées ne sont pas disponibles, les calculer automatiquement
      let startCoords = previewCoords.start;
      let endCoords = previewCoords.end;
      let elevationProfile = routeData?.elevationProfile;
      let calculatedRouteData = routeData;

      if (!startCoords || !endCoords) {
        try {
          // Calculer les coordonnées depuis les adresses
          const [start, end] = await Promise.all([
            getCoordinates(formData.startLocation),
            getCoordinates(formData.endLocation),
          ]);

          if (start && end) {
            startCoords = start;
            endCoords = end;
            
            // Essayer de calculer l'itinéraire si possible
            try {
              const route = await getRoute(start, end);
              if (route) {
                calculatedRouteData = route;
                // Calculer le profil d'élévation si possible
                try {
                  const elevationProfileData = await calculateElevationProfile(route.coordinates);
                  if (elevationProfileData) {
                    elevationProfile = {
                      minElevation: elevationProfileData.minElevation,
                      maxElevation: elevationProfileData.maxElevation,
                      totalAscent: elevationProfileData.totalAscent,
                      totalDescent: elevationProfileData.totalDescent,
                    };
                    calculatedRouteData.elevationProfile = elevationProfile;
                  }
                } catch (elevError) {
                  console.warn("Could not calculate elevation profile:", elevError);
                }
                
                // Les valeurs de distance et durée seront utilisées dans hikeData plus bas
              }
            } catch (routeError) {
              console.warn("Could not fetch route details:", routeError);
              // Continuer sans itinéraire détaillé
            }
          } else {
            toast.error("Impossible de trouver les coordonnées des lieux. Veuillez vérifier les adresses.");
            setIsLoading(false);
            return;
          }
        } catch (geocodingError) {
          console.error("Geocoding failed", geocodingError);
          toast.error("Erreur lors de la recherche des coordonnées. Veuillez vérifier les adresses.");
          setIsLoading(false);
          return;
        }
      }

      let photoUrls: string[] = [...hikePhotos]; // Photos existantes
      let hikeIdForPhotos = editingHikeId || ''; // ID de la randonnée pour l'upload de photos

      // Upload new photos if any
      if (formData.photos && formData.photos.length > 0) {
        // If creating new hike, we need to create it first to get the ID
        if (!editingHikeId) {
          // S'assurer que les coordonnées sont disponibles avant de créer
          if (!startCoords || !endCoords) {
            toast.error('Les coordonnées sont requises pour créer une randonnée avec photos. Veuillez prévisualiser la carte d\'abord.');
            setIsLoading(false);
            return;
          }
          
          const newHike: HikeData = {
            id: '',
            name: formData.name || `Randonnée du ${formData.date}`,
            date: formData.date,
            startLocation: formData.startLocation,
            endLocation: formData.endLocation,
            distance: parseFloat(formData.distance) || 0,
            duration: formData.duration || '',
            startCoords: startCoords,
            endCoords: endCoords,
            elevationProfile: elevationProfile,
            photos: [],
          };
          
          let savedHike: HikeData | null = null;
          try {
            savedHike = await createHike(newHike);
          } catch (createError: any) {
            console.error('Erreur lors de la création:', createError);
            const errorMessage = createError?.message || 'Erreur inconnue lors de la création de la randonnée';
            toast.error(`Erreur: ${errorMessage}`, { duration: 5000 });
            setIsLoading(false);
            return;
          }
          
          if (!savedHike) {
            toast.error('Erreur lors de la création de la randonnée. Aucune donnée retournée.');
            setIsLoading(false);
            return;
          }
          hikeIdForPhotos = savedHike.id;
          setEditingHikeId(savedHike.id); // Set for update below
        }

        // Upload photos (ne pas bloquer la sauvegarde si l'upload échoue)
        try {
          const uploadResult = await uploadHikePhotos(hikeIdForPhotos, user.id, formData.photos);
          if (uploadResult.errors.length > 0) {
            // Afficher un avertissement mais continuer
            toast.error(`Erreurs lors de l'upload des photos: ${uploadResult.errors.join(', ')}. La randonnée sera sauvegardée sans les nouvelles photos.`, {
              duration: 5000,
            });
            console.error('Erreurs upload photos:', uploadResult.errors);
          } else {
            // Ajouter les URLs des photos uploadées avec succès
            photoUrls = [...photoUrls, ...uploadResult.urls];
            if (uploadResult.urls.length > 0) {
              toast.success(`${uploadResult.urls.length} photo(s) uploadée(s) avec succès`);
            }
          }
        } catch (uploadError: any) {
          // Erreur critique (bucket non trouvé, etc.) - afficher un message mais continuer
          console.error('Erreur critique lors de l\'upload des photos:', uploadError);
          toast.error(`Impossible d'uploader les photos: ${uploadError.message || 'Bucket non configuré'}. La randonnée sera sauvegardée sans les photos.`, {
            duration: 6000,
          });
          // Continuer sans les photos
        }
      }

      // Create or update hike with photo URLs
      const hikeId = editingHikeId || hikeIdForPhotos || '';
      
      // Utiliser les valeurs calculées de l'itinéraire si disponibles et si les champs sont vides
      let finalDistance = parseFloat(formData.distance) || 0;
      let finalDuration = formData.duration || '';
      
      if (calculatedRouteData && (!formData.distance || formData.distance === '0' || formData.distance === '')) {
        finalDistance = calculatedRouteData.distance / 1000; // Convertir en km
        finalDuration = formatDuration(calculatedRouteData.duration);
      }
      
      // Validation finale avant sauvegarde
      if (!startCoords || !endCoords) {
        toast.error('Les coordonnées GPS sont requises. Veuillez vérifier les adresses ou prévisualiser la carte.');
        setIsLoading(false);
        return;
      }
      
      const hikeData: HikeData = {
        id: hikeId,
        name: formData.name || `Randonnée du ${formData.date}`,
        date: formData.date,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        distance: finalDistance,
        duration: finalDuration,
        startCoords: startCoords,
        endCoords: endCoords,
        elevationProfile: elevationProfile,
        photos: photoUrls,
      };

      if (hikeId && hikeId.trim() !== '') {
        // Update existing hike (ou celle créée pour les photos)
        const savedHike = await updateHike(hikeData);
        if (savedHike) {
          setHikes((prev) => {
            const existingIndex = prev.findIndex(h => h.id === savedHike.id);
            if (existingIndex >= 0) {
              // Mettre à jour la randonnée existante
              return prev.map((hike) => 
                hike.id === savedHike.id ? savedHike : hike
              );
            } else {
              // Ajouter la nouvelle randonnée
              return [savedHike, ...prev];
            }
          });
          
          // Mettre à jour les photos existantes avec les nouvelles URLs
          setHikePhotos(savedHike.photos || []);
          
          // Mettre à jour les coordonnées et l'itinéraire si calculés
          if (startCoords && endCoords) {
            setPreviewCoords({ start: startCoords, end: endCoords });
            if (calculatedRouteData) {
              setRouteData(calculatedRouteData);
            }
          }
          
          // Mettre à jour le formulaire avec les données sauvegardées
          setFormData(prev => ({
            ...prev,
            distance: savedHike.distance.toString(),
            duration: savedHike.duration,
          }));
          
          // Ne pas sortir du mode édition - permettre de continuer à modifier
          toast.success(editingHikeId ? 'Randonnée mise à jour avec succès !' : 'Randonnée enregistrée avec succès !');
        } else {
          const errorMessage = 'Erreur lors de la mise à jour de la randonnée. Vérifiez votre connexion et réessayez.';
          console.error('Erreur updateHike:', hikeData);
          toast.error(errorMessage);
        }
      } else {
        // Create new hike (only if no photos were uploaded above)
        let savedHike: HikeData | null = null;
        try {
          savedHike = await createHike(hikeData);
        } catch (createError: any) {
          console.error('Erreur lors de la création:', createError);
          const errorMessage = createError?.message || 'Erreur inconnue lors de la création de la randonnée';
          toast.error(`Erreur: ${errorMessage}`, { duration: 5000 });
          setIsLoading(false);
          return;
        }
        
        if (savedHike) {
          setHikes((prev) => [savedHike, ...prev]);
          
          // Mettre à jour les coordonnées et l'itinéraire si calculés
          if (startCoords && endCoords) {
            setPreviewCoords({ start: startCoords, end: endCoords });
            if (calculatedRouteData) {
              setRouteData(calculatedRouteData);
            }
          }
          
          toast.success('Randonnée enregistrée avec succès !');
          
          // Reset form seulement pour les nouvelles randonnées
          setFormData({
            name: '',
            date: new Date().toISOString().split('T')[0],
            startLocation: '',
            endLocation: '',
            distance: '',
            duration: '',
            photos: [],
          });
          setHikePhotos([]);
          setPreviewCoords({});
          setRouteData(null);
          setIsFormValidForSave(false);
        } else {
          const errorMessage = 'Erreur lors de la création de la randonnée. Aucune donnée retournée.';
          console.error('Erreur createHike - aucune donnée retournée:', hikeData);
          toast.error(errorMessage);
        }
      }
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
      photos: [],
    });
    setHikePhotos(hike.photos || []);
    
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

  const confirmDelete = async (id: string) => {
    setIsLoading(true);
    setDeleteConfirmId(null);
    
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
            photos: [],
          });
          setHikePhotos([]);
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
  };

  const handleDelete = (id: string) => {
    // Afficher une modal de confirmation
    setDeleteConfirmId(id);
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
      photos: [],
    });
    setHikePhotos([]);
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

      {/* Configuration du Toaster */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#047857',
            color: '#fff',
            borderRadius: '1rem',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#047857',
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#991b1b',
              color: '#fff',
            },
          },
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        
        {/* Top Section: Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div className="space-y-6">
            <div className="animate-scale-in">
              <HikeForm 
                formData={formData}
                onChange={handleInputChange}
                onPhotosChange={handlePhotosChange}
                onPreview={handlePreview}
                onSave={handleSave}
                onCancel={editingHikeId ? handleCancelEdit : undefined}
                isLoading={isLoading}
                canSave={true}
                isEditing={!!editingHikeId}
                onSelectOnMap={setSelectionMode}
                selectionMode={selectionMode}
                existingHikes={hikes}
                onLoadHike={handleEdit}
                existingPhotos={hikePhotos}
                onDeletePhoto={handleDeletePhoto}
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

      {/* Modal de confirmation de suppression */}
      {deleteConfirmId && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-white dark:bg-stone-800 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                  Supprimer la randonnée
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  Cette action est irréversible
                </p>
              </div>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-stone-700 dark:text-stone-300 mb-6">
              Êtes-vous sûr de vouloir supprimer cette randonnée ? Cette action ne peut pas être annulée.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-3 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-xl font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const idToDelete = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await confirmDelete(idToDelete!);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default App;