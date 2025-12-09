import { supabase, rowToHikeData, hikeDataToRow, HikeRow } from '../lib/supabase';
import { HikeData } from '../types';

/**
 * Récupérer toutes les randonnées de l'utilisateur connecté
 */
export const fetchHikes = async (): Promise<HikeData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Si pas d'utilisateur connecté, retourner un tableau vide
      return [];
    }

    const { data, error } = await supabase
      .from('hikes')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des randonnées:', error);
      throw error;
    }

    return (data as HikeRow[]).map(rowToHikeData);
  } catch (error) {
    console.error('Erreur fetchHikes:', error);
    return [];
  }
};

/**
 * Créer une nouvelle randonnée
 */
export const createHike = async (hike: HikeData): Promise<HikeData | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Vous devez être connecté pour créer une randonnée');
    }

    const row = hikeDataToRow(hike);
    const rowWithUserId = { ...row, user_id: user.id };
    
    const { data, error } = await supabase
      .from('hikes')
      .insert([rowWithUserId])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la randonnée:', error);
      throw error;
    }

    return rowToHikeData(data as HikeRow);
  } catch (error) {
    console.error('Erreur createHike:', error);
    return null;
  }
};

/**
 * Mettre à jour une randonnée existante
 */
export const updateHike = async (hike: HikeData): Promise<HikeData | null> => {
  try {
    const row = hikeDataToRow(hike);
    
    const { data, error } = await supabase
      .from('hikes')
      .update({
        name: row.name,
        date: row.date,
        start_location: row.start_location,
        end_location: row.end_location,
        distance: row.distance,
        duration: row.duration,
        start_coords: row.start_coords,
        end_coords: row.end_coords,
        elevation_profile: row.elevation_profile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hike.id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la randonnée:', error);
      throw error;
    }

    return rowToHikeData(data as HikeRow);
  } catch (error) {
    console.error('Erreur updateHike:', error);
    return null;
  }
};

/**
 * Supprimer une randonnée
 */
export const deleteHike = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('hikes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de la randonnée:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur deleteHike:', error);
    return false;
  }
};

