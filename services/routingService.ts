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
 * Calculate route using OSRM (Open Source Routing Machine) API
 * Uses walking profile to ensure only pedestrian-accessible routes
 * Free service, no API key required for basic usage
 * @deprecated Use getRoutes for multiple alternatives
 */
export const getRoute = async (
  start: Coordinates,
  end: Coordinates
): Promise<RouteData | null> => {
  try {
    // Vérifier si les coordonnées de départ et d'arrivée sont identiques (ou très proches)
    const distanceBetweenPoints = calculateDistance(start, end);
    if (distanceBetweenPoints < 10) {
      console.warn('Les points de départ et d\'arrivée sont trop proches ou identiques');
      // Pour un tour complet (comme un lac), on peut ajouter un petit décalage
      // mais ici on retourne null car OSRM ne peut pas calculer un itinéraire
      return null;
    }

    // OSRM routing API - using walking profile for pedestrian routes only
    // Enhanced precision with full geometry and detailed steps
    // overview=full: maximum geometry precision with all route points
    // geometries=geojson: high precision coordinates
    // steps=true: detailed turn-by-turn instructions for more geometry points
    // alternatives=false: single best route for faster response
    const url = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true&alternatives=false&continue_straight=false`;
    
    const response = await fetch(url);
    
    // Check if response is ok
    if (!response.ok) {
      console.warn(`OSRM API returned status ${response.status}: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Check for API errors in response
    if (data.error) {
      console.warn('OSRM API error:', data.error);
      return null;
    }

    // Check if route was found successfully
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Validate that we have valid route data
      if (!route.geometry || !route.geometry.coordinates || route.geometry.coordinates.length === 0) {
        console.warn('Route found but has no geometry');
        return null;
      }

      // Extract all coordinates from the main geometry
      // With overview=full, we get maximum precision with all route points in correct order
      // This provides the most accurate pedestrian route rendering
      const allCoordinates: RoutePoint[] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({
          lng: parseFloat(lng.toFixed(7)), // Preserve precision to ~1cm
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
      // OSRM's duration can be inaccurate, so we recalculate with realistic speeds
      const realisticDuration = calculateRealisticWalkingDuration(route.distance);

      return {
        coordinates: allCoordinates,
        distance: route.distance, // in meters
        duration: realisticDuration, // in seconds (realistic walking duration)
        geometry: JSON.stringify(route.geometry), // Convert GeoJSON to string
        steps: steps.length > 0 ? steps : undefined,
      };
    }

    // Handle specific error codes
    if (data.code === 'NoRoute') {
      console.warn('No pedestrian route found between the specified points');
      return null;
    }

    console.warn('Route calculation failed:', data.code, data.message);
    return null;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
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
