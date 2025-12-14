import { Coordinates } from '../types';

export interface ElevationPoint extends Coordinates {
  elevation: number;
}

export interface ElevationProfile {
  points: ElevationPoint[];
  minElevation: number;
  maxElevation: number;
  totalAscent: number; // Dénivelé positif en mètres
  totalDescent: number; // Dénivelé négatif en mètres
}

/**
 * Get elevation data for coordinates using OpenTopoData API
 * Free service, no API key required
 */
export const getElevations = async (coordinates: Coordinates[]): Promise<number[]> => {
  if (coordinates.length === 0) return [];
  
  try {
    // OpenTopoData API - batch request for multiple coordinates
    const locations = coordinates.map(coord => `${coord.lat},${coord.lng}`).join('|');
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${locations}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((result: any) => result.elevation || 0);
      }
      
      return [];
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Elevation API timeout - request took too long');
      } else {
        console.error('Error fetching elevation data:', fetchError);
      }
      return [];
    }
  } catch (error) {
    console.error('Error in getElevations:', error);
    return [];
  }
};

/**
 * Sample coordinates to reduce API calls and improve performance
 * Takes every Nth point based on total distance
 */
const sampleCoordinates = (coordinates: Coordinates[], maxPoints: number = 100): Coordinates[] => {
  if (coordinates.length <= maxPoints) return coordinates;
  
  const step = Math.ceil(coordinates.length / maxPoints);
  const sampled: Coordinates[] = [];
  
  // Always include first and last point
  sampled.push(coordinates[0]);
  
  for (let i = step; i < coordinates.length - step; i += step) {
    sampled.push(coordinates[i]);
  }
  
  // Always include last point
  if (sampled[sampled.length - 1] !== coordinates[coordinates.length - 1]) {
    sampled.push(coordinates[coordinates.length - 1]);
  }
  
  return sampled;
};

/**
 * Calculate elevation profile and statistics from coordinates
 * Automatically samples coordinates for long routes to improve performance
 */
export const calculateElevationProfile = async (
  coordinates: Coordinates[]
): Promise<ElevationProfile | null> => {
  if (coordinates.length === 0) return null;

  try {
    // Sample coordinates for routes with many points to improve performance
    // Use max 100 points for elevation calculation (more than enough for accurate profile)
    const sampledCoords = sampleCoordinates(coordinates, 100);
    
    // Get elevations for sampled coordinates
    const elevations = await getElevations(sampledCoords);
    
    if (elevations.length !== sampledCoords.length) {
      console.warn('Elevation data incomplete');
      return null;
    }

    // Create elevation points from sampled coordinates
    const sampledPoints: ElevationPoint[] = sampledCoords.map((coord, index) => ({
      ...coord,
      elevation: elevations[index] || 0,
    }));
    
    // Interpolate elevations for all original coordinates
    // This gives us elevation data for all points while only querying a subset
    const points: ElevationPoint[] = coordinates.map((coord) => {
      // Find the two closest sampled points
      let closestIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < sampledCoords.length; i++) {
        const dist = Math.sqrt(
          Math.pow(coord.lat - sampledCoords[i].lat, 2) + 
          Math.pow(coord.lng - sampledCoords[i].lng, 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = i;
        }
      }
      
      return {
        ...coord,
        elevation: sampledPoints[closestIndex].elevation,
      };
    });

    // Calculate statistics
    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);
    
    // Calculate total ascent and descent
    let totalAscent = 0;
    let totalDescent = 0;
    
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) {
        totalAscent += diff;
      } else {
        totalDescent += Math.abs(diff);
      }
    }

    return {
      points,
      minElevation,
      maxElevation,
      totalAscent: Math.round(totalAscent),
      totalDescent: Math.round(totalDescent),
    };
  } catch (error) {
    console.error('Error calculating elevation profile:', error);
    return null;
  }
};

/**
 * Format elevation to readable string
 */
export const formatElevation = (meters: number): string => {
  return `${Math.round(meters)} m`;
};

/**
 * Format elevation difference
 */
export const formatElevationDifference = (meters: number): string => {
  if (meters === 0) return '0 m';
  const sign = meters > 0 ? '+' : '';
  return `${sign}${Math.round(meters)} m`;
};

