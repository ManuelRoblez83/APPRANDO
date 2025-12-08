import { Coordinates } from '../types';

// Using OpenStreetMap Nominatim API (Free, no key required for small demo usage)
export const getCoordinates = async (query: string): Promise<Coordinates | null> => {
  if (!query) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
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