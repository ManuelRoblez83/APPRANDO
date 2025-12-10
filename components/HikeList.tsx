import React, { useState, useMemo } from 'react';
import { HikeData } from '../types';
import { MapPin, Clock, Ruler, Calendar, Trash2, Edit2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { SocialShare } from './SocialShare';
import { SearchBar } from './SearchBar';

interface HikeListProps {
  hikes: HikeData[];
  onDelete: (id: string) => void;
  onEdit: (hike: HikeData) => void;
  onShowOnMap: (hike: HikeData) => void;
}

export const HikeList: React.FC<HikeListProps> = ({ hikes, onDelete, onEdit, onShowOnMap }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les randonnées selon la recherche
  const filteredHikes = useMemo(() => {
    if (!searchQuery.trim()) {
      return hikes;
    }

    const query = searchQuery.toLowerCase().trim();
    return hikes.filter((hike) => {
      // Rechercher dans le nom
      if (hike.name.toLowerCase().includes(query)) return true;
      
      // Rechercher dans le lieu de départ
      if (hike.startLocation.toLowerCase().includes(query)) return true;
      
      // Rechercher dans le lieu d'arrivée
      if (hike.endLocation.toLowerCase().includes(query)) return true;
      
      // Rechercher dans la date
      const dateStr = new Date(hike.date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      if (dateStr.toLowerCase().includes(query)) return true;
      
      // Rechercher dans la distance
      if (hike.distance.toString().includes(query)) return true;
      
      return false;
    });
  }, [hikes, searchQuery]);

  if (hikes.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-stone-800 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
        <p className="text-stone-400 dark:text-stone-500">Aucune randonnée enregistrée pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher par nom, lieu, date ou distance..."
        />
        {searchQuery && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
            {filteredHikes.length} randonnée{filteredHikes.length > 1 ? 's' : ''} trouvée{filteredHikes.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Résultats de la recherche */}
      {filteredHikes.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-stone-800 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
          <p className="text-stone-400 dark:text-stone-500">Aucune randonnée ne correspond à votre recherche.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHikes.map((hike) => (
        <div 
          key={hike.id} 
          className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onShowOnMap(hike)}
        >
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 border-b border-stone-100 dark:border-stone-700 flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 truncate">{hike.name}</h3>
              <div className="flex items-center text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(hike.date).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
              <SocialShare hike={hike} />
              <button 
                onClick={() => onEdit(hike)}
                className="text-stone-400 dark:text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(hike.id)}
                className="text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4 text-sm space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <div className="w-0.5 h-6 bg-stone-200 dark:bg-stone-700"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 text-xs">Départ</span>
                  <span className="font-medium truncate max-w-[150px] text-stone-800 dark:text-stone-200">{hike.startLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400 text-xs">Arrivée</span>
                  <span className="font-medium truncate max-w-[150px] text-stone-800 dark:text-stone-200">{hike.endLocation}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-stone-100 dark:border-stone-700 space-y-2">
              <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400 text-xs">
                <div className="flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                  <span>{hike.distance} km</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                  <span>{hike.duration}</span>
                </div>
              </div>
              {hike.elevationProfile && (
                <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">+{Math.round(hike.elevationProfile.totalAscent)} m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-red-700 dark:text-red-400 font-medium">-{Math.round(hike.elevationProfile.totalDescent)} m</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium pt-1">
                <Eye className="w-3 h-3" />
                <span>Cliquer pour voir sur la carte</span>
              </div>
            </div>
          </div>
        </div>
          ))}
        </div>
      )}
    </div>
  );
};