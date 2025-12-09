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
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((result: any) => result.elevation || 0);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    return [];
  }
};

/**
 * Calculate elevation profile and statistics from coordinates
 */
export const calculateElevationProfile = async (
  coordinates: Coordinates[]
): Promise<ElevationProfile | null> => {
  if (coordinates.length === 0) return null;

  try {
    // Get elevations for all coordinates
    const elevations = await getElevations(coordinates);
    
    if (elevations.length !== coordinates.length) {
      console.warn('Elevation data incomplete');
      return null;
    }

    // Create elevation points
    const points: ElevationPoint[] = coordinates.map((coord, index) => ({
      ...coord,
      elevation: elevations[index] || 0,
    }));

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

