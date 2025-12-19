import { supabase } from '../lib/supabase';
import { UserProfile, UserFollow } from '../types';
import { getUserProfile } from './communityService';

/**
 * Suivre un utilisateur
 */
export const followUser = async (followingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Vous devez être connecté pour suivre un utilisateur');
    }

    if (user.id === followingId) {
      throw new Error('Vous ne pouvez pas vous suivre vous-même');
    }

    const { error } = await supabase
      .from('user_follows')
      .insert([{ follower_id: user.id, following_id: followingId }]);

    if (error) {
      // Si l'utilisateur suit déjà, ce n'est pas une erreur
      if (error.code === '23505') {
        // Code d'erreur pour violation de contrainte unique
        return true;
      }
      console.error('Erreur lors du suivi:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur followUser:', error);
    throw error;
  }
};

/**
 * Ne plus suivre un utilisateur
 */
export const unfollowUser = async (followingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Vous devez être connecté pour ne plus suivre un utilisateur');
    }

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId);

    if (error) {
      console.error('Erreur lors du désabonnement:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur unfollowUser:', error);
    throw error;
  }
};

/**
 * Vérifier si l'utilisateur actuel suit un autre utilisateur
 */
export const checkIfFollowing = async (followingId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, ce qui est normal
      console.error('Erreur lors de la vérification du suivi:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erreur checkIfFollowing:', error);
    return false;
  }
};

/**
 * Récupérer la liste des utilisateurs suivis
 */
export const fetchFollowing = async (userId?: string): Promise<UserFollow[]> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des suivis:', error);
      throw error;
    }

    // Récupérer les profils des utilisateurs suivis
    const followsWithProfiles = await Promise.all(
      (data || []).map(async (follow) => {
        const followingProfile = await getUserProfile(follow.following_id);
        return {
          id: follow.id,
          followerId: follow.follower_id,
          followingId: follow.following_id,
          createdAt: follow.created_at,
          followingProfile,
        };
      })
    );

    return followsWithProfiles;
  } catch (error) {
    console.error('Erreur fetchFollowing:', error);
    return [];
  }
};

/**
 * Récupérer la liste des followers (utilisateurs qui suivent)
 */
export const fetchFollowers = async (userId?: string): Promise<UserFollow[]> => {
  try {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return [];

    const { data, error } = await supabase
      .from('user_follows')
      .select('*')
      .eq('following_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des followers:', error);
      throw error;
    }

    // Récupérer les profils des followers
    const followsWithProfiles = await Promise.all(
      (data || []).map(async (follow) => {
        const followerProfile = await getUserProfile(follow.follower_id);
        return {
          id: follow.id,
          followerId: follow.follower_id,
          followingId: follow.following_id,
          createdAt: follow.created_at,
          followerProfile,
        };
      })
    );

    return followsWithProfiles;
  } catch (error) {
    console.error('Erreur fetchFollowers:', error);
    return [];
  }
};

/**
 * Récupérer les suggestions d'utilisateurs à suivre
 */
export const fetchUserSuggestions = async (limit: number = 10): Promise<UserProfile[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Récupérer les utilisateurs qui ont des randonnées publiques
    const { data: publicHikes, error: hikesError } = await supabase
      .from('hikes')
      .select('user_id')
      .eq('is_public', true)
      .neq('user_id', user.id)
      .not('user_id', 'is', null);

    if (hikesError) {
      console.error('Erreur lors de la récupération des randonnées publiques:', hikesError);
      return [];
    }

    // Récupérer les IDs des utilisateurs déjà suivis
    const following = await fetchFollowing(user.id);
    const followingIds = new Set(following.map((f) => f.followingId));

    // Compter les randonnées par utilisateur
    const userHikeCount: Record<string, number> = {};
    (publicHikes || []).forEach((hike) => {
      if (hike.user_id && !followingIds.has(hike.user_id)) {
        userHikeCount[hike.user_id] = (userHikeCount[hike.user_id] || 0) + 1;
      }
    });

    // Trier par nombre de randonnées et prendre les meilleurs
    const sortedUserIds = Object.entries(userHikeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([userId]) => userId);

    // Récupérer les profils
    const profiles = await Promise.all(
      sortedUserIds.map((userId) => getUserProfile(userId))
    );

    return profiles.filter((p): p is UserProfile => p !== undefined);
  } catch (error) {
    console.error('Erreur fetchUserSuggestions:', error);
    return [];
  }
};

/**
 * Récupérer les randonnées des utilisateurs suivis (fil d'actualité)
 */
export const fetchFeedHikes = async (limit: number = 20): Promise<any[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Récupérer les utilisateurs suivis
    const following = await fetchFollowing(user.id);
    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return [];
    }

    // Récupérer les randonnées publiques des utilisateurs suivis
    const { data, error } = await supabase
      .from('hikes')
      .select('*')
      .eq('is_public', true)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur lors de la récupération du fil d\'actualité:', error);
      throw error;
    }

    // Convertir et enrichir avec les statistiques
    const { rowToHikeData } = await import('../lib/supabase');
    const hikes = (data || []).map(rowToHikeData);

    const { getHikeLikesCount, getHikeCommentsCount, checkIfLiked, getUserProfile } = await import('./communityService');

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
    console.error('Erreur fetchFeedHikes:', error);
    return [];
  }
};
