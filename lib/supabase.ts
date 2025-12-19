import { createClient } from '@supabase/supabase-js';
import { HikeData } from '../types';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. Veuillez créer un fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY'
  );
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface HikeRow {
  id: string;
  user_id: string | null;
  name: string;
  date: string;
  start_location: string;
  end_location: string;
  distance: number;
  duration: string;
  start_coords: { lat: number; lng: number } | null;
  end_coords: { lat: number; lng: number } | null;
  elevation_profile: {
    minElevation: number;
    maxElevation: number;
    totalAscent: number;
    totalDescent: number;
  } | null;
  photos: string[] | null; // URLs des photos
  notes: string | null; // Description/notes de la randonnée
  tags: string[] | null; // Tags (montagne, lac, forêt...)
  difficulty: number | null; // Note de difficulté (1-5 étoiles)
  beauty: number | null; // Note de beauté (1-5 étoiles)
  is_public: boolean | null; // Si la randonnée est publique
  created_at?: string;
  updated_at?: string;
}

// Convertir HikeRow en HikeData
export const rowToHikeData = (row: HikeRow): HikeData => {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    startLocation: row.start_location,
    endLocation: row.end_location,
    distance: row.distance,
    duration: row.duration,
    startCoords: row.start_coords || undefined,
    endCoords: row.end_coords || undefined,
    elevationProfile: row.elevation_profile || undefined,
    photos: row.photos || undefined,
    notes: row.notes || undefined,
    tags: row.tags || undefined,
    difficulty: row.difficulty || undefined,
    beauty: row.beauty || undefined,
    isPublic: row.is_public || false,
    userId: row.user_id || undefined,
  };
};

// Convertir HikeData en HikeRow
export const hikeDataToRow = (hike: HikeData): Omit<HikeRow, 'created_at' | 'updated_at'> => {
  // Si l'ID est vide, Supabase générera automatiquement un UUID
  const row: any = {
    name: hike.name,
    date: hike.date,
    start_location: hike.startLocation,
    end_location: hike.endLocation,
    distance: hike.distance,
    duration: hike.duration,
    start_coords: hike.startCoords || null,
    end_coords: hike.endCoords || null,
    elevation_profile: hike.elevationProfile || null,
    photos: hike.photos || null,
    notes: hike.notes || null,
    tags: hike.tags || null,
    difficulty: hike.difficulty || null,
    beauty: hike.beauty || null,
    is_public: hike.isPublic || false,
  };
  
  // Ajouter l'ID seulement s'il est défini
  if (hike.id) {
    row.id = hike.id;
  }
  
  // Ajouter user_id seulement s'il est défini
  if (hike.userId) {
    row.user_id = hike.userId;
  }
  
  return row;
};

