import { HikeData } from '../types';
import { fetchHikes } from './hikeService';

export interface UserStatistics {
  totalHikes: number;
  totalDistance: number; // en km
  totalAscent: number; // en mètres
  totalDescent: number; // en mètres
  averageDistance: number; // en km
  longestHike: HikeData | null;
  recentHikes: HikeData[];
}

/**
 * Calcule les statistiques de l'utilisateur à partir de ses randonnées
 */
export const calculateUserStatistics = async (): Promise<UserStatistics> => {
  try {
    const hikes = await fetchHikes();

    if (hikes.length === 0) {
      return {
        totalHikes: 0,
        totalDistance: 0,
        totalAscent: 0,
        totalDescent: 0,
        averageDistance: 0,
        longestHike: null,
        recentHikes: [],
      };
    }

    // Calculer les totaux
    const totalDistance = hikes.reduce((sum, hike) => sum + parseFloat(hike.distance.toString()), 0);
    
    const totalAscent = hikes.reduce((sum, hike) => {
      return sum + (hike.elevationProfile?.totalAscent || 0);
    }, 0);

    const totalDescent = hikes.reduce((sum, hike) => {
      return sum + (hike.elevationProfile?.totalDescent || 0);
    }, 0);

    // Trouver la randonnée la plus longue
    const longestHike = hikes.reduce((longest, hike) => {
      return parseFloat(hike.distance.toString()) > parseFloat(longest.distance.toString()) 
        ? hike 
        : longest;
    }, hikes[0]);

    // Récupérer les 5 randonnées les plus récentes
    const recentHikes = hikes
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalHikes: hikes.length,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalAscent,
      totalDescent,
      averageDistance: Math.round((totalDistance / hikes.length) * 100) / 100,
      longestHike,
      recentHikes,
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalHikes: 0,
      totalDistance: 0,
      totalAscent: 0,
      totalDescent: 0,
      averageDistance: 0,
      longestHike: null,
      recentHikes: [],
    };
  }
};

