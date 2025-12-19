import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Ruler, Mountain, Activity } from 'lucide-react';
import { calculatePerformanceHistory, PerformanceHistory as PerformanceHistoryData } from '../services/performanceService';

interface PerformanceHistoryProps {
  onDataLoaded?: (data: PerformanceHistoryData) => void;
}

export const PerformanceHistory: React.FC<PerformanceHistoryProps> = ({ onDataLoaded }) => {
  const [history, setHistory] = useState<PerformanceHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'distance' | 'ascent' | 'hikeCount'>('distance');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await calculatePerformanceHistory();
      setHistory(data);
      onDataLoaded?.(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent inline-block"></div>
          <p className="text-stone-500 dark:text-stone-400 mt-3">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (!history || history.dataPoints.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Historique des Performances
        </h3>
        <div className="text-center py-8 text-stone-500 dark:text-stone-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune donnée disponible</p>
          <p className="text-sm mt-2">Créez des randonnées pour voir votre évolution</p>
        </div>
      </div>
    );
  }

  const dataPoints = history.dataPoints;
  const maxValue = Math.max(
    ...dataPoints.map(dp => 
      selectedMetric === 'distance' ? dp.distance :
      selectedMetric === 'ascent' ? dp.ascent :
      dp.hikeCount
    )
  );

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'distance':
        return 'Distance (km)';
      case 'ascent':
        return 'Dénivelé (m)';
      case 'hikeCount':
        return 'Nombre de randonnées';
    }
  };

  const getMetricValue = (dp: typeof dataPoints[0]) => {
    switch (selectedMetric) {
      case 'distance':
        return dp.distance;
      case 'ascent':
        return dp.ascent;
      case 'hikeCount':
        return dp.hikeCount;
    }
  };

  const formatMetricValue = (value: number) => {
    if (selectedMetric === 'distance') {
      return `${value.toFixed(1)} km`;
    } else if (selectedMetric === 'ascent') {
      return `${Math.round(value)} m`;
    } else {
      return `${value}`;
    }
  };

  // Calculer la largeur et la hauteur du graphique
  const chartWidth = 1000;
  const chartHeight = 300;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Créer les points du graphique
  const points = dataPoints.map((dp, index) => {
    const x = padding.left + (index / (dataPoints.length - 1 || 1)) * graphWidth;
    const value = getMetricValue(dp);
    const y = padding.top + graphHeight - (value / (maxValue || 1)) * graphHeight;
    return { x, y, value, dataPoint: dp };
  });

  // Créer le chemin SVG pour la ligne
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Historique des Performances
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMetric('distance')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedMetric === 'distance'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            Distance
          </button>
          <button
            onClick={() => setSelectedMetric('ascent')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedMetric === 'ascent'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            Dénivelé
          </button>
          <button
            onClick={() => setSelectedMetric('hikeCount')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedMetric === 'hikeCount'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            Nombre
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <Ruler className="w-4 h-4" />
            <span className="text-xs font-medium">Distance totale</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {history.totalDistance.toFixed(1)}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400">km</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <Mountain className="w-4 h-4" />
            <span className="text-xs font-medium">Dénivelé total</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {history.totalAscent.toLocaleString()}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400">m</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Total randonnées</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {history.totalHikes}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Moyenne</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {history.averageDistance.toFixed(1)}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400">km/randonnée</p>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-4 overflow-x-auto">
        <div className="min-w-full" style={{ width: `${chartWidth}px` }}>
          <svg width={chartWidth} height={chartHeight} className="w-full">
            {/* Grille */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + graphHeight - ratio * graphHeight;
              return (
                <line
                  key={ratio}
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-stone-300 dark:text-stone-700"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Axe Y */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + graphHeight - ratio * graphHeight;
              const value = maxValue * ratio;
              return (
                <g key={ratio}>
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-stone-600 dark:fill-stone-400"
                  >
                    {selectedMetric === 'distance' ? value.toFixed(1) :
                     selectedMetric === 'ascent' ? Math.round(value) :
                     Math.round(value)}
                  </text>
                </g>
              );
            })}

            {/* Ligne du graphique */}
            <path
              d={pathData}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-emerald-600 dark:text-emerald-400"
            />

            {/* Points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="currentColor"
                  className="text-emerald-600 dark:text-emerald-400"
                />
                {/* Tooltip au survol */}
                <title>
                  {point.dataPoint.month} {point.dataPoint.year}: {formatMetricValue(point.value)}
                </title>
              </g>
            ))}

            {/* Axe X - Labels des mois */}
            {dataPoints.map((dp, index) => {
              const x = padding.left + (index / (dataPoints.length - 1 || 1)) * graphWidth;
              const shouldShow = dataPoints.length <= 12 || index % Math.ceil(dataPoints.length / 12) === 0 || index === dataPoints.length - 1;
              
              if (!shouldShow) return null;

              return (
                <g key={index}>
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-stone-600 dark:fill-stone-400"
                    transform={`rotate(-45 ${x} ${chartHeight - padding.bottom + 20})`}
                  >
                    {dp.month.substring(0, 3)} {dp.year.toString().slice(-2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Meilleur mois */}
      {history.bestMonth && (
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Meilleur mois</span>
          </div>
          <p className="text-stone-800 dark:text-stone-100 font-bold">
            {history.bestMonth.month} {history.bestMonth.year}
          </p>
          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
            <div>
              <span className="text-stone-600 dark:text-stone-400">Distance:</span>
              <p className="font-semibold text-stone-800 dark:text-stone-100">
                {history.bestMonth.distance.toFixed(1)} km
              </p>
            </div>
            <div>
              <span className="text-stone-600 dark:text-stone-400">Dénivelé:</span>
              <p className="font-semibold text-stone-800 dark:text-stone-100">
                {history.bestMonth.ascent.toLocaleString()} m
              </p>
            </div>
            <div>
              <span className="text-stone-600 dark:text-stone-400">Randonnées:</span>
              <p className="font-semibold text-stone-800 dark:text-stone-100">
                {history.bestMonth.hikeCount}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
