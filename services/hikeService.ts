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
    
    // Validation des champs requis avec messages détaillés
    if (!rowWithUserId.name || rowWithUserId.name.trim() === '') {
      throw new Error('Le nom de la randonnée est requis');
    }
    if (!rowWithUserId.date || rowWithUserId.date.trim() === '') {
      throw new Error('La date est requise');
    }
    if (!rowWithUserId.start_location || rowWithUserId.start_location.trim() === '') {
      throw new Error('Le point de départ est requis');
    }
    if (!rowWithUserId.end_location || rowWithUserId.end_location.trim() === '') {
      throw new Error('Le point d\'arrivée est requis');
    }
    
    // S'assurer que la distance est valide (au moins 0)
    if (isNaN(rowWithUserId.distance) || rowWithUserId.distance < 0) {
      rowWithUserId.distance = 0;
    }
    
    // S'assurer que la durée est définie
    if (!rowWithUserId.duration) {
      rowWithUserId.duration = '';
    }

    console.log('Création de la randonnée avec les données:', {
      name: rowWithUserId.name,
      date: rowWithUserId.date,
      start_location: rowWithUserId.start_location,
      end_location: rowWithUserId.end_location,
      distance: rowWithUserId.distance,
      duration: rowWithUserId.duration,
      has_start_coords: !!rowWithUserId.start_coords,
      has_end_coords: !!rowWithUserId.end_coords,
      user_id: user.id,
    });

    const { data, error } = await supabase
      .from('hikes')
      .insert([rowWithUserId])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase lors de la création:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message:', error.message);
      console.error('Détails:', error.details);
      console.error('Hint:', error.hint);
      console.error('Données envoyées:', JSON.stringify(rowWithUserId, null, 2));
      
      // Retourner un message d'erreur plus détaillé
      const errorMessage = error.message || 'Erreur inconnue lors de la création';
      throw new Error(`Erreur Supabase: ${errorMessage}${error.details ? ` (${error.details})` : ''}`);
    }

    if (!data) {
      throw new Error('Aucune donnée retournée après la création');
    }

    return rowToHikeData(data as HikeRow);
  } catch (error: any) {
    console.error('Erreur createHike:', error);
    console.error('Message d\'erreur:', error?.message);
    console.error('Stack:', error?.stack);
    
    // Propager l'erreur avec le message pour l'afficher à l'utilisateur
    throw error;
  }
};

/**
 * Mettre à jour une randonnée existante
 */
export const updateHike = async (hike: HikeData): Promise<HikeData | null> => {
  try {
    if (!hike.id) {
      throw new Error('L\'ID de la randonnée est requis pour la mise à jour');
    }

    const row = hikeDataToRow(hike);
    
    // Validation des champs requis
    if (!row.name || !row.date || !row.start_location || !row.end_location) {
      throw new Error('Tous les champs requis doivent être remplis');
    }
    
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
        photos: row.photos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hike.id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la randonnée:', error);
      console.error('ID de la randonnée:', hike.id);
      console.error('Données envoyées:', row);
      throw error;
    }

    return rowToHikeData(data as HikeRow);
  } catch (error: any) {
    console.error('Erreur updateHike:', error);
    console.error('Message d\'erreur:', error?.message);
    console.error('Détails:', error);
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

