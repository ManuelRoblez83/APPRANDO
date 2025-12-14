import { Coordinates } from '../types';

/**
 * Calculate realistic walking duration based on distance
 * Uses variable speed based on distance and terrain type
 * More accurate for pedestrian/hiking routes
 */
export const calculateRealisticWalkingDuration = (distanceMeters: number): number => {
  const distanceKm = distanceMeters / 1000;
  
  // Variable speed based on distance (longer distances = slower average speed due to fatigue)
  let speedKmPerHour: number;
  
  if (distanceKm < 1) {
    // Very short distances: faster walking (urban pace)
    speedKmPerHour = 4.5;
  } else if (distanceKm < 5) {
    // Short to medium distances: moderate pace
    speedKmPerHour = 4.0;
  } else if (distanceKm < 15) {
    // Medium to long distances: hiking pace
    speedKmPerHour = 3.5;
  } else if (distanceKm < 30) {
    // Long distances: slower hiking pace with breaks
    speedKmPerHour = 3.0;
  } else {
    // Very long distances: slow pace accounting for fatigue and breaks
    speedKmPerHour = 2.5;
  }
  
  // Calculate base time
  const baseHours = distanceKm / speedKmPerHour;
  
  // Add time for breaks (5 minutes per hour for distances > 5km)
  let breakTime = 0;
  if (distanceKm > 5) {
    const hoursNeeded = Math.ceil(baseHours);
    breakTime = (hoursNeeded * 5 * 60); // 5 minutes per hour in seconds
  }
  
  const totalSeconds = (baseHours * 3600) + breakTime;
  return Math.round(totalSeconds);
};

export interface RoutePoint extends Coordinates {
  elevation?: number;
}

export interface RouteStep {
  distance: number;
  duration: number;
  instruction?: string;
  name?: string;
  mode?: string;
  geometry: number[][]; // [lng, lat] coordinates
}

export interface RouteData {
  coordinates: RoutePoint[];
  distance: number; // in meters
  duration: number; // in seconds
  geometry: string; // encoded polyline
  steps?: RouteStep[]; // Detailed steps for high precision
  elevationProfile?: {
    minElevation: number;
    maxElevation: number;
    totalAscent: number;
    totalDescent: number;
  };
}

/**
 * Calculate multiple alternative routes using OSRM API
 * Returns up to 3 different pedestrian routes if available
 */
export const getRoutes = async (
  start: Coordinates,
  end: Coordinates,
  maxAlternatives: number = 3
): Promise<RouteData[]> => {
  try {
    // Vérifier si les coordonnées de départ et d'arrivée sont identiques (ou très proches)
    const distanceBetweenPoints = calculateDistance(start, end);
    if (distanceBetweenPoints < 10) {
      console.warn('Les points de départ et d\'arrivée sont trop proches ou identiques');
      return [];
    }

    // OSRM routing API - using walking profile for pedestrian routes only
    // alternatives=true: get multiple route options (OSRM returns up to 3 alternatives automatically)
    const url = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true&alternatives=true&continue_straight=false`;
    
    const response = await fetch(url);
    
    // Check if response is ok
    if (!response.ok) {
      console.warn(`OSRM API returned status ${response.status}: ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    // Check for API errors in response
    if (data.error) {
      console.warn('OSRM API error:', data.error);
      return [];
    }

    // Check if routes were found successfully
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const routes: RouteData[] = [];
      
      // Process each route (up to maxAlternatives)
      data.routes.slice(0, maxAlternatives).forEach((route: any, index: number) => {
        // Validate that we have valid route data
        if (!route.geometry || !route.geometry.coordinates || route.geometry.coordinates.length === 0) {
          console.warn(`Route ${index} found but has no geometry`);
          return;
        }

        // Extract all coordinates from the main geometry
        const allCoordinates: RoutePoint[] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => ({
            lng: parseFloat(lng.toFixed(7)),
            lat: parseFloat(lat.toFixed(7)),
          })
        );

        // Extract step information for detailed route data
        const steps: RouteStep[] = [];
        if (route.legs && route.legs.length > 0) {
          route.legs.forEach((leg: any) => {
            if (leg.steps && Array.isArray(leg.steps)) {
              leg.steps.forEach((step: any) => {
                if (step.geometry && step.geometry.coordinates) {
                  steps.push({
                    distance: step.distance || 0,
                    duration: step.duration || 0,
                    instruction: step.maneuver?.instruction || step.maneuver?.type || '',
                    name: step.name || '',
                    mode: step.mode || 'walking',
                    geometry: step.geometry.coordinates,
                  });
                }
              });
            }
          });
        }

        // Calculate realistic walking duration based on actual distance
        const realisticDuration = calculateRealisticWalkingDuration(route.distance);

        routes.push({
          coordinates: allCoordinates,
          distance: route.distance,
          duration: realisticDuration,
          geometry: JSON.stringify(route.geometry),
          steps: steps.length > 0 ? steps : undefined,
        });
      });

      return routes;
    }

    // Handle specific error codes
    if (data.code === 'NoRoute') {
      console.warn('No pedestrian route found between the specified points');
      return [];
    }

    console.warn('Route calculation failed:', data.code, data.message);
    return [];
  } catch (error) {
    console.error('Error getting routes:', error);
    return [];
  }
};

/**
 * Calculate route using OSRM with multiple server instances
 * Tries different public OSRM servers for better reliability
 */
const getRouteOSRMMultiServer = async (
  start: Coordinates,
  end: Coordinates,
  config: { overview: string; steps: boolean; name: string }
): Promise<RouteData | null> => {
  // Liste de serveurs OSRM publics alternatifs
  const servers = [
    'https://router.project-osrm.org',
    'https://routing.openstreetmap.de',
    // Note: D'autres serveurs peuvent être ajoutés ici
  ];
  
  for (const server of servers) {
    try {
      const url = `${server}/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=${config.overview}&geometries=geojson&steps=${config.steps}&alternatives=false&continue_straight=false`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout plus court pour chaque serveur
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
          mode: 'cors',
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          if (!route.geometry?.coordinates || route.geometry.coordinates.length === 0) {
            continue;
          }
          
          const allCoordinates: RoutePoint[] = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => ({
              lng: parseFloat(lng.toFixed(7)),
              lat: parseFloat(lat.toFixed(7)),
            })
          );
          
          const steps: RouteStep[] = [];
          if (config.steps && route.legs) {
            route.legs.forEach((leg: any) => {
              if (leg.steps && Array.isArray(leg.steps)) {
                leg.steps.forEach((step: any) => {
                  if (step.geometry?.coordinates) {
                    steps.push({
                      distance: step.distance || 0,
                      duration: step.duration || 0,
                      instruction: step.maneuver?.instruction || step.maneuver?.type || '',
                      name: step.name || '',
                      mode: 'walking',
                      geometry: step.geometry.coordinates,
                    });
                  }
                });
              }
            });
          }
          
          const realisticDuration = calculateRealisticWalkingDuration(route.distance);
          
          return {
            coordinates: allCoordinates,
            distance: route.distance,
            duration: realisticDuration,
            geometry: JSON.stringify(route.geometry),
            steps: steps.length > 0 ? steps : undefined,
          };
        }
        
        if (data.code === 'NoRoute') {
          return null; // Pas de route, ne pas réessayer
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          continue; // Essayer le serveur suivant
        }
      }
    } catch (error) {
      continue; // Essayer le serveur suivant
    }
  }
  
  return null;
};

/**
 * Calculate route using OpenRouteService API (primary)
 * Free service with API key (can be obtained for free)
 * Better for pedestrian routing than OSRM
 */
const getRouteOpenRouteService = async (
  start: Coordinates,
  end: Coordinates
): Promise<RouteData | null> => {
  try {
    // OpenRouteService API - foot-hiking profile (better for hiking/pedestrian routes)
    // Format: GET request with start=lng,lat&end=lng,lat
    // API key can be obtained for free at https://openrouteservice.org/
    const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY || '';
    
    // Vérifier si la clé API est configurée
    if (!apiKey || apiKey.trim() === '') {
      console.log('⚠️ OpenRouteService: Aucune clé API configurée');
      console.log('💡 Pour utiliser OpenRouteService, ajoutez VITE_OPENROUTESERVICE_API_KEY dans votre fichier .env');
      return null; // Ne pas essayer sans clé API
    }
    
    // Masquer la clé API dans les logs (afficher seulement les 4 premiers et 4 derniers caractères)
    const maskedKey = apiKey.length > 8 
      ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
      : '***';
    console.log('✅ OpenRouteService: Clé API détectée:', maskedKey);
    
    const url = `https://api.openrouteservice.org/v2/directions/foot-hiking?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;
    
    console.log('🌐 OpenRouteService: Requête vers', url.substring(0, 100).replace(apiKey, maskedKey) + '...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      clearTimeout(timeoutId);
      
      console.log('📡 OpenRouteService: Réponse reçue', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('❌ OpenRouteService: Erreur HTTP', {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 200)
        });
        
        // If 401/403, API key might be needed
        if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ OpenRouteService: Clé API requise. Obtenez une clé gratuite sur https://openrouteservice.org/dev/#/signup');
        }
        return null;
      }
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ OpenRouteService: Erreur de parsing JSON', parseError);
        const text = await response.text().catch(() => '');
        console.error('Réponse brute:', text.substring(0, 500));
        return null;
      }
      
      console.log('📦 OpenRouteService: Données parsées', {
        hasRoutes: !!data.routes,
        routesCount: data.routes?.length || 0
      });
      
      // Structure de réponse OpenRouteService v2:
      // {
      //   "routes": [
      //     {
      //       "geometry": {
      //         "type": "LineString",
      //         "coordinates": [[lng, lat], ...]
      //       },
      //       "segments": [...],
      //       "summary": {
      //         "distance": number,
      //         "duration": number
      //       }
      //     }
      //   ]
      // }
      
      // Vérifier si la réponse contient une erreur
      if (data.error) {
        console.error('❌ OpenRouteService: Erreur dans la réponse', data.error);
        return null;
      }
      
      if (!data || !data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
        console.warn('⚠️ OpenRouteService: Pas de routes dans la réponse', {
          hasData: !!data,
          hasRoutes: !!data?.routes,
          routesType: Array.isArray(data?.routes),
          routesLength: data?.routes?.length || 0,
          dataKeys: data ? Object.keys(data) : []
        });
        return null;
      }
      
      const route = data.routes[0];
      
      // Vérifier la géométrie
      if (!route.geometry || !route.geometry.coordinates || !Array.isArray(route.geometry.coordinates)) {
        console.warn('OpenRouteService: Pas de géométrie valide dans la réponse');
        return null;
      }
      
      // Extraire les coordonnées (format GeoJSON: [lng, lat])
      const routeCoordinates: RoutePoint[] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({
          lng: parseFloat(lng.toFixed(7)),
          lat: parseFloat(lat.toFixed(7)),
        })
      );
      
      if (routeCoordinates.length === 0) {
        console.warn('OpenRouteService: Aucune coordonnée extraite');
        return null;
      }
      
      // Extraire les steps depuis les segments
      const steps: RouteStep[] = [];
      if (route.segments && Array.isArray(route.segments)) {
        route.segments.forEach((segment: any) => {
          if (segment.steps && Array.isArray(segment.steps)) {
            segment.steps.forEach((step: any) => {
              if (step.distance !== undefined) {
                steps.push({
                  distance: step.distance || 0,
                  duration: step.duration || 0,
                  instruction: step.instruction || step.instruction_text || '',
                  name: step.name || '',
                  mode: 'walking',
                  geometry: step.way_points || [],
                });
              }
            });
          }
        });
      }
      
      // Extraire la distance depuis summary
      const distance = route.summary?.distance || 0;
      if (distance === 0) {
        console.warn('OpenRouteService: Distance est 0');
        return null;
      }
      
      const realisticDuration = calculateRealisticWalkingDuration(distance);
      
      console.log('✅ OpenRouteService: Itinéraire trouvé', { 
        distance: (distance / 1000).toFixed(2) + 'km',
        points: routeCoordinates.length,
        steps: steps.length
      });
      
      return {
        coordinates: routeCoordinates,
        distance: distance,
        duration: realisticDuration,
        geometry: JSON.stringify(route.geometry),
        steps: steps.length > 0 ? steps : undefined,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn('⏱️ OpenRouteService: Timeout (requête annulée après 20s)');
      } else if (error.name === 'TypeError' && error.message?.includes('Failed to fetch')) {
        console.error('🌐 OpenRouteService: Erreur réseau - Failed to fetch', {
          message: error.message,
          cause: error.cause
        });
      } else {
        console.error('❌ OpenRouteService: Erreur inattendue', {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 200)
        });
      }
    }
  } catch (error: any) {
    console.error('❌ OpenRouteService: Erreur externe', error);
  }
  return null;
};

/**
 * Calculate route using GraphHopper API (fallback)
 * Free tier available with API key
 */
const getRouteGraphHopper = async (
  start: Coordinates,
  end: Coordinates
): Promise<RouteData | null> => {
  try {
    // GraphHopper API - foot profile
    // Note: Requires API key for free tier
    // Format: point=lat,lng
    const apiKey = import.meta.env.VITE_GRAPHHOPPER_API_KEY || '';
    if (!apiKey) {
      console.log('GraphHopper: Pas de clé API configurée');
      return null;
    }
    const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&profile=foot&type=json&points_encoded=false&key=${apiKey}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // If 401/403, API key might be needed
        if (response.status === 401 || response.status === 403) {
          console.log('GraphHopper: API key might be required');
        }
        return null;
      }
      
      const data = await response.json();
      
      if (data.paths && data.paths.length > 0) {
        const path = data.paths[0];
        const points = path.points?.coordinates;
        
        let coordinates: RoutePoint[] = [];
        if (Array.isArray(points) && points.length > 0 && Array.isArray(points[0])) {
          coordinates = points.map(([lng, lat]: [number, number]) => ({
            lng: parseFloat(lng.toFixed(7)),
            lat: parseFloat(lat.toFixed(7)),
          }));
        }
        
        const realisticDuration = calculateRealisticWalkingDuration(path.distance || 0);
        
        const steps: RouteStep[] = [];
        if (path.instructions && Array.isArray(path.instructions)) {
          path.instructions.forEach((inst: any) => {
            steps.push({
              distance: inst.distance || 0,
              duration: inst.time || 0,
              instruction: inst.text || '',
              name: inst.street_name || '',
              mode: 'walking',
              geometry: [],
            });
          });
        }
        
        return {
          coordinates,
          distance: path.distance || 0,
          duration: realisticDuration,
          geometry: JSON.stringify({ type: 'LineString', coordinates: points || [] }),
          steps: steps.length > 0 ? steps : undefined,
        };
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name !== 'AbortError') {
        console.warn('GraphHopper error:', error.message);
      }
    }
  } catch (error) {
    // Silent fail, try next service
  }
  return null;
};

/**
 * Calculate route using OSRM (Open Source Routing Machine) API
 * Uses walking profile to ensure only pedestrian-accessible routes
 * Free service, no API key required for basic usage
 * Now used as fallback after OpenRouteService and GraphHopper
 */
export const getRoute = async (
  start: Coordinates,
  end: Coordinates
): Promise<RouteData | null> => {
  // Vérifier si les coordonnées de départ et d'arrivée sont identiques (ou très proches)
  const distanceBetweenPoints = calculateDistance(start, end);
  if (distanceBetweenPoints < 10) {
    console.warn('Les points de départ et d\'arrivée sont trop proches ou identiques');
    return null;
  }

  console.log('🔍 Calcul d\'itinéraire:', { start, end, distance: distanceBetweenPoints.toFixed(0) + 'm' });
  
  // Essayer plusieurs services séquentiellement pour éviter de surcharger les APIs
  console.log('🌐 ========================================');
  console.log('🌐 DÉBUT DU CALCUL D\'ITINÉRAIRE');
  console.log('🌐 ========================================');
  
  // Vérifier les clés API configurées
  const orsApiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY || '';
  const ghApiKey = import.meta.env.VITE_GRAPHHOPPER_API_KEY || '';
  
  console.log('🔑 Clés API configurées:');
  console.log('  - OpenRouteService:', orsApiKey ? `✅ Oui (${orsApiKey.substring(0, 4)}...${orsApiKey.substring(orsApiKey.length - 4)})` : '❌ Non');
  console.log('  - GraphHopper:', ghApiKey ? `✅ Oui (${ghApiKey.substring(0, 4)}...${ghApiKey.substring(ghApiKey.length - 4)})` : '❌ Non');
  console.log('  - OSRM: ✅ Gratuit (sans clé requise)');
  console.log('');
  
  // Essayer OpenRouteService en premier (seulement si une clé API est configurée)
  if (orsApiKey && orsApiKey.trim() !== '') {
    console.log('🌐 1/3 - Tentative avec OpenRouteService (avec clé API)...');
    let route = await getRouteOpenRouteService(start, end).catch((error) => {
      console.warn('❌ OpenRouteService a échoué, passage au service suivant:', error.message);
      return null;
    });
    if (route) {
      console.log('✅ ========================================');
      console.log('✅ SUCCÈS: Itinéraire trouvé via OpenRouteService');
      console.log('✅ ========================================');
      return route;
    }
    console.log('⚠️ OpenRouteService n\'a pas retourné d\'itinéraire');
  } else {
    console.log('ℹ️ OpenRouteService ignoré (pas de clé API configurée)');
  }
  
  // Essayer GraphHopper en second (seulement si une clé API est configurée)
  if (ghApiKey && ghApiKey.trim() !== '') {
    console.log('🌐 2/3 - Tentative avec GraphHopper (avec clé API)...');
    let route = await getRouteGraphHopper(start, end).catch((error) => {
      console.warn('❌ GraphHopper a échoué, passage au service suivant:', error.message);
      return null;
    });
    if (route) {
      console.log('✅ ========================================');
      console.log('✅ SUCCÈS: Itinéraire trouvé via GraphHopper');
      console.log('✅ ========================================');
      return route;
    }
    console.log('⚠️ GraphHopper n\'a pas retourné d\'itinéraire');
  } else {
    console.log('ℹ️ GraphHopper ignoré (pas de clé API configurée)');
  }
  
  // En dernier recours, essayer OSRM (gratuit, sans clé API requise)
  console.log('🌐 3/3 - Tentative avec OSRM (service gratuit, sans clé API requise)...');

  // OSRM routing API - using walking profile for pedestrian routes only
  // Estimate distance to choose appropriate overview level
  const estimatedDistance = calculateDistance(start, end);
  const overviewLevel = estimatedDistance > 50000 ? 'simplified' : 'full';
  
  // Essayer d'abord avec steps, puis sans si ça échoue (plus rapide)
  const configs = [
    { overview: overviewLevel, steps: true, name: 'complet' },
    { overview: 'simplified', steps: false, name: 'simplifié' },
  ];
  
  for (let attempt = 0; attempt < configs.length; attempt++) {
    const config = configs[attempt];
    console.log(`📡 Tentative OSRM (${attempt + 1}/${configs.length}, ${config.name})...`);
    
    // Essayer avec plusieurs serveurs OSRM
    const route = await getRouteOSRMMultiServer(start, end, config);
    if (route) {
      console.log('✅ ========================================');
      console.log('✅ SUCCÈS: Itinéraire trouvé via OSRM');
      console.log('✅ ========================================');
      return route;
    }
    
    // Si pas de route trouvée et c'est la dernière tentative
    if (attempt === configs.length - 1) {
      console.warn('⚠️ ========================================');
      console.warn('⚠️ Aucun service de routage n\'a fonctionné');
      console.warn('⚠️ Utilisation d\'un itinéraire approximatif (ligne droite)');
      console.warn('⚠️ ========================================');
      return createFallbackRoute(start, end);
    }
    
    console.log('🔄 Essai avec une configuration simplifiée...');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Si on arrive ici, retourner un fallback
  console.warn('⚠️ ========================================');
  console.warn('⚠️ Tous les services de routage ont échoué');
  console.warn('⚠️ Utilisation d\'un itinéraire approximatif (ligne droite)');
  console.warn('⚠️ ========================================');
  return createFallbackRoute(start, end);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Fallback if routing API fails
 */
export const calculateDistance = (start: Coordinates, end: Coordinates): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (start.lat * Math.PI) / 180;
  const φ2 = (end.lat * Math.PI) / 180;
  const Δφ = ((end.lat - start.lat) * Math.PI) / 180;
  const Δλ = ((end.lng - start.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Create a fallback route when OSRM API is unavailable
 * Generates an approximate route with intermediate points for better visualization
 */
export const createFallbackRoute = (start: Coordinates, end: Coordinates): RouteData => {
  const distanceMeters = calculateDistance(start, end);
  const duration = calculateRealisticWalkingDuration(distanceMeters);
  
  // Generate intermediate points for a more realistic route visualization
  // Create 5-10 intermediate points along the straight line
  const numPoints = Math.max(5, Math.min(10, Math.floor(distanceMeters / 500))); // 1 point per 500m
  const coordinates: RoutePoint[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    coordinates.push({
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio,
    });
  }
  
  // Create a simple GeoJSON geometry
  const geometryString = JSON.stringify({
    type: 'LineString',
    coordinates: coordinates.map(coord => [coord.lng, coord.lat])
  });
  
  return {
    coordinates,
    distance: distanceMeters,
    duration,
    geometry: geometryString,
  };
};

/**
 * Format distance to readable string
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * Estimate walking duration based on distance (legacy function)
 * @deprecated Use calculateRealisticWalkingDuration instead
 */
export const estimateWalkingDuration = (distanceMeters: number): number => {
  return calculateRealisticWalkingDuration(distanceMeters);
};

/**
 * Format duration to readable string
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
