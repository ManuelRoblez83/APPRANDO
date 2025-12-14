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
  elevationProfile?: {
    minElevation: number;
    maxElevation: number;
    totalAscent: number;
    totalDescent: number;
  };
  photos?: string[]; // URLs des photos
  notes?: string; // Description/notes de la randonnée
  tags?: string[]; // Tags (montagne, lac, forêt...)
  difficulty?: number; // Note de difficulté (1-5 étoiles)
  beauty?: number; // Note de beauté (1-5 étoiles)
}

export interface HikeFormData {
  name: string;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  duration: string;
  photos?: File[]; // Fichiers photos à uploader
  notes?: string; // Description/notes de la randonnée
  tags?: string[]; // Tags (montagne, lac, forêt...)
  difficulty?: number; // Note de difficulté (1-5 étoiles)
  beauty?: number; // Note de beauté (1-5 étoiles)
}