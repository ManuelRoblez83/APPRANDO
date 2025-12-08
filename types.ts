export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HikeData {
  id: string;
  name: string;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: number; // in km
  duration: string; // e.g., "2h 30m"
  startCoords?: Coordinates;
  endCoords?: Coordinates;
}

export interface HikeFormData {
  name: string;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  duration: string;
}