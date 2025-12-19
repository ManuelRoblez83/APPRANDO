import { HikeData } from '../types';
import { fetchHikes } from './hikeService';
import { fetchPublicHikes } from './communityService';

export interface PerformanceDataPoint {
  date: string; // Date au format YYYY-MM
  month: string; // Nom du mois en français
  year: number;
  distance: number; // Distance totale du mois en km
  ascent: number; // Dénivelé positif total du mois en m
  descent: number; // Dénivelé négatif total du mois en m
  hikeCount: number; // Nombre de randonnées du mois
  averageDistance: number; // Distance moyenne par randonnée
  averageAscent: number; // Dénivelé moyen par randonnée
}

export interface CommunityAverages {
  averageDistance: number; // Distance moyenne par randonnée
  averageAscent: number; // Dénivelé moyen par randonnée
  averageHikesPerMonth: number; // Nombre moyen de randonnées par mois
  averageMonthlyDistance: number; // Distance moyenne parcourue par mois
  totalUsers: number; // Nombre d'utilisateurs avec randonnées publiques
}

export interface PerformanceHistory {
  dataPoints: PerformanceDataPoint[];
  totalDistance: number;
  totalAscent: number;
  totalHikes: number;
  averageDistance: number;
  averageAscent: number;
  bestMonth: PerformanceDataPoint | null;
  currentMonth: PerformanceDataPoint | null;
}

/**
 * Calcule l'historique des performances de l'utilisateur
 */
export const calculatePerformanceHistory = async (): Promise<PerformanceHistory> => {
  try {
    const hikes = await fetchHikes();

    if (hikes.length === 0) {
      return {
        dataPoints: [],
        totalDistance: 0,
        totalAscent: 0,
        totalHikes: 0,
        averageDistance: 0,
        averageAscent: 0,
        bestMonth: null,
        currentMonth: null,
      };
    }

    // Grouper les randonnées par mois
    const monthlyData: Map<string, HikeData[]> = new Map();

    hikes.forEach((hike) => {
      const date = new Date(hike.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, []);
      }
      monthlyData.get(monthKey)!.push(hike);
    });

    // Calculer les statistiques pour chaque mois
    const dataPoints: PerformanceDataPoint[] = [];
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    monthlyData.forEach((monthHikes, monthKey) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthName = monthNames[month - 1];

      const distance = monthHikes.reduce((sum, hike) => sum + parseFloat(hike.distance.toString()), 0);
      const ascent = monthHikes.reduce((sum, hike) => sum + (hike.elevationProfile?.totalAscent || 0), 0);
      const descent = monthHikes.reduce((sum, hike) => sum + (hike.elevationProfile?.totalDescent || 0), 0);
      const hikeCount = monthHikes.length;

      dataPoints.push({
        date: monthKey,
        month: monthName,
        year,
        distance: Math.round(distance * 100) / 100,
        ascent: Math.round(ascent),
        descent: Math.round(descent),
        hikeCount,
        averageDistance: Math.round((distance / hikeCount) * 100) / 100,
        averageAscent: Math.round(ascent / hikeCount),
      });
    });

    // Trier par date (plus ancien au plus récent)
    dataPoints.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.date.localeCompare(b.date);
    });

    // Calculer les totaux
    const totalDistance = dataPoints.reduce((sum, dp) => sum + dp.distance, 0);
    const totalAscent = dataPoints.reduce((sum, dp) => sum + dp.ascent, 0);
    const totalHikes = hikes.length;

    // Trouver le meilleur mois (par distance)
    const bestMonth = dataPoints.reduce((best, current) => 
      current.distance > best.distance ? current : best,
      dataPoints[0] || null
    );

    // Trouver le mois actuel
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonth = dataPoints.find(dp => dp.date === currentMonthKey) || null;

    return {
      dataPoints,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalAscent: Math.round(totalAscent),
      totalHikes,
      averageDistance: totalHikes > 0 ? Math.round((totalDistance / totalHikes) * 100) / 100 : 0,
      averageAscent: totalHikes > 0 ? Math.round(totalAscent / totalHikes) : 0,
      bestMonth,
      currentMonth,
    };
  } catch (error) {
    console.error('Erreur lors du calcul de l\'historique des performances:', error);
    return {
      dataPoints: [],
      totalDistance: 0,
      totalAscent: 0,
      totalHikes: 0,
      averageDistance: 0,
      averageAscent: 0,
      bestMonth: null,
      currentMonth: null,
    };
  }
};

/**
 * Calcule les moyennes communautaires à partir des randonnées publiques
 */
export const calculateCommunityAverages = async (): Promise<CommunityAverages> => {
  try {
    const publicHikes = await fetchPublicHikes({ limit: 1000 });

    if (publicHikes.length === 0) {
      return {
        averageDistance: 0,
        averageAscent: 0,
        averageHikesPerMonth: 0,
        averageMonthlyDistance: 0,
        totalUsers: 0,
      };
    }

    // Calculer les statistiques
    const totalDistance = publicHikes.reduce((sum, hike) => sum + parseFloat(hike.distance.toString()), 0);
    const totalAscent = publicHikes.reduce((sum, hike) => sum + (hike.elevationProfile?.totalAscent || 0), 0);
    const hikeCount = publicHikes.length;

    // Grouper par utilisateur pour calculer les moyennes mensuelles
    const userHikes: Map<string, HikeData[]> = new Map();
    publicHikes.forEach((hike) => {
      const userId = hike.userId || 'unknown';
      if (!userHikes.has(userId)) {
        userHikes.set(userId, []);
      }
      userHikes.get(userId)!.push(hike);
    });

    // Calculer les moyennes mensuelles par utilisateur
    const monthlyDistances: number[] = [];
    userHikes.forEach((hikes) => {
      const monthlyData: Map<string, number> = new Map();
      
      hikes.forEach((hike) => {
        const date = new Date(hike.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const distance = parseFloat(hike.distance.toString());
        
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + distance);
      });

      monthlyData.forEach((distance) => {
        monthlyDistances.push(distance);
      });
    });

    const averageMonthlyDistance = monthlyDistances.length > 0
      ? Math.round((monthlyDistances.reduce((a, b) => a + b, 0) / monthlyDistances.length) * 100) / 100
      : 0;

    // Calculer le nombre moyen de randonnées par mois par utilisateur
    const hikesPerMonthByUser: number[] = [];
    userHikes.forEach((hikes) => {
      const monthlyCount: Map<string, number> = new Map();
      
      hikes.forEach((hike) => {
        const date = new Date(hike.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyCount.set(monthKey, (monthlyCount.get(monthKey) || 0) + 1);
      });

      monthlyCount.forEach((count) => {
        hikesPerMonthByUser.push(count);
      });
    });

    const averageHikesPerMonth = hikesPerMonthByUser.length > 0
      ? Math.round((hikesPerMonthByUser.reduce((a, b) => a + b, 0) / hikesPerMonthByUser.length) * 100) / 100
      : 0;

    return {
      averageDistance: Math.round((totalDistance / hikeCount) * 100) / 100,
      averageAscent: Math.round(totalAscent / hikeCount),
      averageHikesPerMonth,
      averageMonthlyDistance,
      totalUsers: userHikes.size,
    };
  } catch (error) {
    console.error('Erreur lors du calcul des moyennes communautaires:', error);
    return {
      averageDistance: 0,
      averageAscent: 0,
      averageHikesPerMonth: 0,
      averageMonthlyDistance: 0,
      totalUsers: 0,
    };
  }
};

/**
 * Compare les performances de l'utilisateur avec la moyenne communautaire
 */
export const compareWithCommunity = async (): Promise<{
  userHistory: PerformanceHistory;
  communityAverages: CommunityAverages;
  comparison: {
    distanceVsAverage: number; // Pourcentage de différence
    ascentVsAverage: number;
    hikesPerMonthVsAverage: number;
    monthlyDistanceVsAverage: number;
  };
}> => {
  const [userHistory, communityAverages] = await Promise.all([
    calculatePerformanceHistory(),
    calculateCommunityAverages(),
  ]);

  // Calculer les moyennes de l'utilisateur
  const userAverageMonthlyDistance = userHistory.dataPoints.length > 0
    ? userHistory.dataPoints.reduce((sum, dp) => sum + dp.distance, 0) / userHistory.dataPoints.length
    : 0;

  const userAverageHikesPerMonth = userHistory.dataPoints.length > 0
    ? userHistory.dataPoints.reduce((sum, dp) => sum + dp.hikeCount, 0) / userHistory.dataPoints.length
    : 0;

  // Calculer les différences en pourcentage
  const calculatePercentageDiff = (user: number, community: number): number => {
    if (community === 0) return user > 0 ? 100 : 0;
    return Math.round(((user - community) / community) * 100);
  };

  return {
    userHistory,
    communityAverages,
    comparison: {
      distanceVsAverage: calculatePercentageDiff(userHistory.averageDistance, communityAverages.averageDistance),
      ascentVsAverage: calculatePercentageDiff(userHistory.averageAscent, communityAverages.averageAscent),
      hikesPerMonthVsAverage: calculatePercentageDiff(userAverageHikesPerMonth, communityAverages.averageHikesPerMonth),
      monthlyDistanceVsAverage: calculatePercentageDiff(userAverageMonthlyDistance, communityAverages.averageMonthlyDistance),
    },
  };
};

