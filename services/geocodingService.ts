import { Coordinates } from '../types';

export interface LocationDetails extends Coordinates {
  displayName: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// Using OpenStreetMap Nominatim API (Free, no key required for small demo usage)
export const getCoordinates = async (query: string): Promise<Coordinates | null> => {
  if (!query) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
};

// Get detailed location information
export const getLocationDetails = async (query: string): Promise<LocationDetails | null> => {
  if (!query) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name || query,
        address: result.address || {},
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting location details:", error);
    return null;
  }
};

// Location suggestion for autocomplete
export interface LocationSuggestion {
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Reverse geocoding: Get address from coordinates
 * Uses Nominatim reverse geocoding API
 */
export const getAddressFromCoordinates = async (coordinates: Coordinates): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=18&addressdetails=1&accept-language=fr`,
      {
        headers: {
          'User-Agent': 'RandoTrack/1.0',
        },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error("Error reverse geocoding coordinates:", error);
    return null;
  }
};

/**
 * Get location suggestions for autocomplete
 * Returns up to 5 suggestions based on the query
 */
export const getLocationSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    // Nominatim API call with debouncing (handled in component)
    // Limited to 5 suggestions to keep it fast and relevant
    // Focused on French-speaking countries for better results
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=fr,be,ch,lu,mc&dedupe=1&accept-language=fr`,
      {
        headers: {
          'User-Agent': 'RandoTrack/1.0', // Nominatim requires a User-Agent
        },
      }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data)) {
      return data.map((item: any) => ({
        displayName: item.display_name || query,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
        address: item.address || {},
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error getting location suggestions:", error);
    return [];
  }
};