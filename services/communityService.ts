import { supabase, rowToHikeData } from '../lib/supabase';
import { HikeData, HikeComment, UserProfile } from '../types';

/**
 * Récupérer les randonnées publiques
 */
export const fetchPublicHikes = async (options?: {
  limit?: number;
  difficulty?: number;
  region?: string;
  orderBy?: 'date' | 'likes' | 'created_at';
}): Promise<HikeData[]> => {
  try {
    let query = supabase
      .from('hikes')
      .select('*')
      .eq('is_public', true);

    // Filtrer par difficulté si spécifiée
    if (options?.difficulty) {
      query = query.eq('difficulty', options.difficulty);
    }

    // Filtrer par région (recherche dans start_location ou end_location)
    if (options?.region) {
      const regionLower = options.region.toLowerCase();
      query = query.or(`start_location.ilike.%${regionLower}%,end_location.ilike.%${regionLower}%`);
    }

    // Trier
    if (options?.orderBy === 'likes') {
      // Pour trier par likes, on devra faire une jointure ou une sous-requête
      // Pour l'instant, on trie par date
      query = query.order('created_at', { ascending: false });
    } else if (options?.orderBy === 'date') {
      query = query.order('date', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Limiter les résultats
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des randonnées publiques:', error);
      throw error;
    }

    const hikes = (data || []).map(rowToHikeData);

    // Récupérer les statistiques (likes, commentaires) et les profils utilisateurs
    const hikesWithStats = await Promise.all(
      hikes.map(async (hike) => {
        const [likesCount, commentsCount, isLiked, userProfile] = await Promise.all([
          getHikeLikesCount(hike.id),
          getHikeCommentsCount(hike.id),
          checkIfLiked(hike.id),
          getUserProfile(hike.userId || ''),
        ]);

        return {
          ...hike,
          likesCount,
          commentsCount,
          isLiked,
          userProfile,
        };
      })
    );

    return hikesWithStats;
  } catch (error) {
    console.error('Erreur fetchPublicHikes:', error);
    return [];
  }
};

/**
 * Récupérer le nombre de likes d'une randonnée
 */
export const getHikeLikesCount = async (hikeId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('hike_likes')
      .select('*', { count: 'exact', head: true })
      .eq('hike_id', hikeId);

    if (error) {
      console.error('Erreur lors du comptage des likes:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erreur getHikeLikesCount:', error);
    return 0;
  }
};

/**
 * Vérifier si l'utilisateur actuel a liké une randonnée
 */
export const checkIfLiked = async (hikeId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('hike_likes')
      .select('id')
      .eq('hike_id', hikeId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, ce qui est normal
      console.error('Erreur lors de la vérification du like:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erreur checkIfLiked:', error);
    return false;
  }
};

/**
 * Liker une randonnée
 */
export const likeHike = async (hikeId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Vous devez être connecté pour liker une randonnée');
    }

    const { error } = await supabase
      .from('hike_likes')
      .insert([{ hike_id: hikeId, user_id: user.id }]);

    if (error) {
      console.error('Erreur lors du like:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur likeHike:', error);
    throw error;
  }
};

/**
 * Retirer le like d'une randonnée
 */
export const unlikeHike = async (hikeId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Vous devez être connecté pour retirer un like');
    }

    const { error } = await supabase
      .from('hike_likes')
      .delete()
      .eq('hike_id', hikeId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur lors du retrait du like:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur unlikeHike:', error);
    throw error;
  }
};

/**
 * Récupérer les commentaires d'une randonnée
 */
export const fetchHikeComments = async (hikeId: string): Promise<HikeComment[]> => {
  try {
    const { data, error } = await supabase
      .from('hike_comments')
      .select('*')
      .eq('hike_id', hikeId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      throw error;
    }

    // Récupérer les profils utilisateurs pour chaque commentaire
    const commentsWithProfiles = await Promise.all(
      (data || []).map(async (comment) => {
        const userProfile = await getUserProfile(comment.user_id);
        return {
          id: comment.id,
          hikeId: comment.hike_id,
          userId: comment.user_id,
          content: comment.content,
          createdAt: comment.created_at,
          updatedAt: comment.updated_at,
          userProfile,
        };
      })
    );

    return commentsWithProfiles;
  } catch (error) {
    console.error('Erreur fetchHikeComments:', error);
    return [];
  }
};

/**
 * Récupérer le nombre de commentaires d'une randonnée
 */
export const getHikeCommentsCount = async (hikeId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('hike_comments')
      .select('*', { count: 'exact', head: true })
      .eq('hike_id', hikeId);

    if (error) {
      console.error('Erreur lors du comptage des commentaires:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erreur getHikeCommentsCount:', error);
    return 0;
  }
};

/**
 * Ajouter un commentaire à une randonnée
 */
export const addComment = async (hikeId: string, content: string): Promise<HikeComment | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Vous devez être connecté pour commenter');
    }

    if (!content.trim()) {
      throw new Error('Le commentaire ne peut pas être vide');
    }

    const { data, error } = await supabase
      .from('hike_comments')
      .insert([{ hike_id: hikeId, user_id: user.id, content: content.trim() }])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }

    const userProfile = await getUserProfile(user.id);

    return {
      id: data.id,
      hikeId: data.hike_id,
      userId: data.user_id,
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userProfile,
    };
  } catch (error) {
    console.error('Erreur addComment:', error);
    throw error;
  }
};

/**
 * Supprimer un commentaire
 */
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('hike_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur deleteComment:', error);
    throw error;
  }
};

/**
 * Récupérer le profil d'un utilisateur
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | undefined> => {
  try {
    if (!userId) return undefined;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Si le profil n'existe pas, ce n'est pas une erreur critique
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Erreur lors de la récupération du profil:', error);
      return undefined;
    }

    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name || undefined,
      lastName: data.last_name || undefined,
      nickname: data.nickname || undefined,
      birthDate: data.birth_date || undefined,
    };
  } catch (error) {
    console.error('Erreur getUserProfile:', error);
    return undefined;
  }
};

/**
 * Récupérer les randonnées populaires (par nombre de likes)
 */
export const fetchPopularHikes = async (limit: number = 10): Promise<HikeData[]> => {
  try {
    // Récupérer toutes les randonnées publiques avec leurs likes
    const { data: likesData, error: likesError } = await supabase
      .from('hike_likes')
      .select('hike_id');

    if (likesError) {
      console.error('Erreur lors de la récupération des likes:', likesError);
    }

    // Compter les likes par randonnée
    const likesCount: Record<string, number> = {};
    (likesData || []).forEach((like) => {
      likesCount[like.hike_id] = (likesCount[like.hike_id] || 0) + 1;
    });

    // Récupérer les randonnées publiques
    const hikes = await fetchPublicHikes({ limit: 100 }); // Récupérer plus pour trier

    // Trier par nombre de likes
    const sortedHikes = hikes
      .map((hike) => ({
        ...hike,
        likesCount: likesCount[hike.id] || 0,
      }))
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, limit);

    return sortedHikes;
  } catch (error) {
    console.error('Erreur fetchPopularHikes:', error);
    return [];
  }
};

