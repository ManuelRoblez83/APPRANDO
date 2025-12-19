import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, BarChart3, Target, Award } from 'lucide-react';
import { compareWithCommunity } from '../services/performanceService';
import { PerformanceHistory as PerformanceHistoryData } from '../services/performanceService';

interface CommunityComparisonProps {
  userHistory?: PerformanceHistoryData | null;
}

export const CommunityComparison: React.FC<CommunityComparisonProps> = ({ userHistory }) => {
  const [comparison, setComparison] = useState<{
    userHistory: PerformanceHistoryData;
    communityAverages: {
      averageDistance: number;
      averageAscent: number;
      averageHikesPerMonth: number;
      averageMonthlyDistance: number;
      totalUsers: number;
    };
    comparison: {
      distanceVsAverage: number;
      ascentVsAverage: number;
      hikesPerMonthVsAverage: number;
      monthlyDistanceVsAverage: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComparison();
  }, [userHistory]);

  const loadComparison = async () => {
    setIsLoading(true);
    try {
      const data = await compareWithCommunity();
      setComparison(data);
    } catch (error) {
      console.error('Erreur lors du chargement de la comparaison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent inline-block"></div>
          <p className="text-stone-500 dark:text-stone-400 mt-3">Chargement de la comparaison...</p>
        </div>
      </div>
    );
  }

  if (!comparison || !comparison.userHistory || comparison.userHistory.dataPoints.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Comparaison avec la Communauté
        </h3>
        <div className="text-center py-8 text-stone-500 dark:text-stone-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Pas assez de données pour comparer</p>
          <p className="text-sm mt-2">Créez des randonnées pour voir votre position</p>
        </div>
      </div>
    );
  }

  const { userHistory, communityAverages, comparison: comp } = comparison;

  // Calculer les moyennes mensuelles de l'utilisateur
  const userAverageMonthlyDistance = userHistory.dataPoints.length > 0
    ? userHistory.dataPoints.reduce((sum, dp) => sum + dp.distance, 0) / userHistory.dataPoints.length
    : 0;

  const userAverageHikesPerMonth = userHistory.dataPoints.length > 0
    ? userHistory.dataPoints.reduce((sum, dp) => sum + dp.hikeCount, 0) / userHistory.dataPoints.length
    : 0;

  const renderComparisonCard = (
    title: string,
    userValue: number,
    communityValue: number,
    unit: string,
    percentageDiff: number,
    icon: React.ReactNode
  ) => {
    const isPositive = percentageDiff >= 0;
    const percentage = Math.abs(percentageDiff);

    return (
      <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            {icon}
            <span className="font-semibold">{title}</span>
          </div>
          {percentageDiff !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
              isPositive
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{percentage}%</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">Vous</p>
            <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              {userValue.toFixed(1)}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-500">{unit}</p>
          </div>
          <div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-1">Moyenne</p>
            <p className="text-2xl font-bold text-stone-600 dark:text-stone-400">
              {communityValue.toFixed(1)}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-500">{unit}</p>
          </div>
        </div>
        {/* Barre de comparaison */}
        <div className="mt-4">
          <div className="flex items-center gap-2 h-4 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (userValue / (communityValue || 1)) * 50)}%`,
              }}
            />
            <div className="h-full w-0.5 bg-stone-400 dark:bg-stone-600" />
            <div
              className="h-full bg-stone-400 dark:bg-stone-600 rounded-full"
              style={{ width: '50%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mt-1">
            <span>Vous</span>
            <span>Moyenne</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Comparaison avec la Communauté
        </h3>
        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
          <Users className="w-4 h-4" />
          <span>{communityAverages.totalUsers} utilisateurs</span>
        </div>
      </div>

      {/* Statistiques communautaires */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-3">
          <BarChart3 className="w-5 h-5" />
          <span className="font-semibold">Moyennes communautaires</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-stone-600 dark:text-stone-400">Distance moyenne</p>
            <p className="font-bold text-stone-800 dark:text-stone-100">
              {communityAverages.averageDistance.toFixed(1)} km
            </p>
          </div>
          <div>
            <p className="text-stone-600 dark:text-stone-400">Dénivelé moyen</p>
            <p className="font-bold text-stone-800 dark:text-stone-100">
              {communityAverages.averageAscent.toFixed(0)} m
            </p>
          </div>
          <div>
            <p className="text-stone-600 dark:text-stone-400">Randonnées/mois</p>
            <p className="font-bold text-stone-800 dark:text-stone-100">
              {communityAverages.averageHikesPerMonth.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-stone-600 dark:text-stone-400">Distance/mois</p>
            <p className="font-bold text-stone-800 dark:text-stone-100">
              {communityAverages.averageMonthlyDistance.toFixed(1)} km
            </p>
          </div>
        </div>
      </div>

      {/* Comparaisons détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderComparisonCard(
          'Distance par randonnée',
          userHistory.averageDistance,
          communityAverages.averageDistance,
          'km',
          comp.distanceVsAverage,
          <Target className="w-5 h-5" />
        )}
        {renderComparisonCard(
          'Dénivelé par randonnée',
          userHistory.averageAscent,
          communityAverages.averageAscent,
          'm',
          comp.ascentVsAverage,
          <Award className="w-5 h-5" />
        )}
        {renderComparisonCard(
          'Randonnées par mois',
          userAverageHikesPerMonth,
          communityAverages.averageHikesPerMonth,
          'randonnées',
          comp.hikesPerMonthVsAverage,
          <BarChart3 className="w-5 h-5" />
        )}
        {renderComparisonCard(
          'Distance par mois',
          userAverageMonthlyDistance,
          communityAverages.averageMonthlyDistance,
          'km',
          comp.monthlyDistanceVsAverage,
          <TrendingUp className="w-5 h-5" />
        )}
      </div>

      {/* Résumé global */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-3">
          <Award className="w-5 h-5" />
          <span className="font-semibold">Votre position</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Distance moyenne:</span>
            <span className={`font-semibold ${
              comp.distanceVsAverage >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {comp.distanceVsAverage >= 0 ? '+' : ''}{comp.distanceVsAverage}% vs moyenne
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Dénivelé moyen:</span>
            <span className={`font-semibold ${
              comp.ascentVsAverage >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {comp.ascentVsAverage >= 0 ? '+' : ''}{comp.ascentVsAverage}% vs moyenne
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Fréquence:</span>
            <span className={`font-semibold ${
              comp.hikesPerMonthVsAverage >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {comp.hikesPerMonthVsAverage >= 0 ? '+' : ''}{comp.hikesPerMonthVsAverage}% vs moyenne
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

