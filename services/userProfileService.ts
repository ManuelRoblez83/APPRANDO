import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  nickname: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInput {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  nickname?: string;
}

// Récupérer le profil d'un utilisateur
export const getUserProfile = async (userId: string): Promise<{ profile: UserProfile | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116 = no rows returned (normal si le profil n'existe pas encore)
      if (error.code === 'PGRST116') {
        return { profile: null, error: null };
      }
      throw error;
    }

    return { profile: data || null, error: null };
  } catch (error: any) {
    // Si la table n'existe pas encore, retourner null sans erreur
    if (error?.message?.includes('does not exist') || error?.message?.includes('relation')) {
      return { profile: null, error: null };
    }
    console.error('Erreur lors de la récupération du profil:', error);
    return { profile: null, error: error.message || 'Erreur lors de la récupération du profil' };
  }
};

// Créer ou mettre à jour le profil d'un utilisateur
export const upsertUserProfile = async (
  userId: string,
  profileData: UserProfileInput
): Promise<{ profile: UserProfile | null; error: string | null }> => {
  try {
    // Vérifier si la table existe en essayant de récupérer un profil
    let existingProfile = null;
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      existingProfile = data;
    } catch (checkError: any) {
      // Si la table n'existe pas ou si aucun profil n'existe, on continue
      if (checkError?.code !== 'PGRST116' && !checkError?.message?.includes('does not exist') && !checkError?.message?.includes('relation')) {
        throw checkError;
      }
    }

    // Vérifier si la table existe
    try {
      const profileToUpsert = {
        user_id: userId,
        ...profileData,
        // Convertir la date de naissance si elle est fournie
        birth_date: profileData.birth_date || null,
      };

      let data, error;
      
      if (existingProfile) {
        // Mettre à jour le profil existant
        ({ data, error } = await supabase
          .from('user_profiles')
          .update(profileToUpsert)
          .eq('user_id', userId)
          .select()
          .single());
      } else {
        // Créer un nouveau profil
        ({ data, error } = await supabase
          .from('user_profiles')
          .insert(profileToUpsert)
          .select()
          .single());
      }

      if (error) throw error;

      return { profile: data as UserProfile, error: null };
    } catch (tableError: any) {
      // Si la table n'existe pas encore, retourner une erreur explicite
      if (tableError?.message?.includes('does not exist') || tableError?.message?.includes('relation')) {
        return { 
          profile: null, 
          error: 'Les tables de profil ne sont pas encore configurées. Veuillez exécuter le script SQL user-profiles.sql dans Supabase.' 
        };
      }
      throw tableError;
    }
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du profil:', error);
    return { profile: null, error: error.message || 'Erreur lors de la sauvegarde du profil' };
  }
};

// Récupérer les randonnées favorites d'un utilisateur
export const getFavoriteHikes = async (userId: string): Promise<{ hikeIds: string[]; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('favorite_hikes')
      .select('hike_id')
      .eq('user_id', userId);

    if (error) {
      // Si la table n'existe pas encore, retourner un tableau vide
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        return { hikeIds: [], error: null };
      }
      throw error;
    }

    const hikeIds = data?.map(row => row.hike_id) || [];
    return { hikeIds, error: null };
  } catch (error: any) {
    // Si la table n'existe pas encore, retourner un tableau vide
    if (error?.message?.includes('does not exist') || error?.message?.includes('relation')) {
      return { hikeIds: [], error: null };
    }
    console.error('Erreur lors de la récupération des randonnées favorites:', error);
    return { hikeIds: [], error: error.message || 'Erreur lors de la récupération des randonnées favorites' };
  }
};

// Ajouter une randonnée aux favoris
export const addFavoriteHike = async (userId: string, hikeId: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('favorite_hikes')
      .insert({ user_id: userId, hike_id: hikeId });

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    return { error: error.message || 'Erreur lors de l\'ajout aux favoris' };
  }
};

// Retirer une randonnée des favoris
export const removeFavoriteHike = async (userId: string, hikeId: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('favorite_hikes')
      .delete()
      .eq('user_id', userId)
      .eq('hike_id', hikeId);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error('Erreur lors de la suppression des favoris:', error);
    return { error: error.message || 'Erreur lors de la suppression des favoris' };
  }
};

// Vérifier si une randonnée est dans les favoris
export const isFavoriteHike = async (userId: string, hikeId: string): Promise<{ isFavorite: boolean; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('favorite_hikes')
      .select('id')
      .eq('user_id', userId)
      .eq('hike_id', hikeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { isFavorite: !!data, error: null };
  } catch (error: any) {
    console.error('Erreur lors de la vérification des favoris:', error);
    return { isFavorite: false, error: error.message || 'Erreur lors de la vérification des favoris' };
  }
};

