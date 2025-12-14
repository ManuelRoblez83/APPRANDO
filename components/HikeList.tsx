import React, { useState, useMemo } from 'react';
import { HikeData } from '../types';
import { MapPin, Clock, Ruler, Calendar, Trash2, Edit2, Eye, TrendingUp, TrendingDown, Search, X, Image, Star, Tag, FileText } from 'lucide-react';
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
      
      // Rechercher dans les notes
      if (hike.notes && hike.notes.toLowerCase().includes(query)) return true;
      
      // Rechercher dans les tags
      if (hike.tags && hike.tags.some(tag => tag.toLowerCase().includes(query))) return true;
      
      return false;
    });
  }, [hikes, searchQuery]);

  if (hikes.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-stone-800 rounded-3xl border-2 border-dashed border-stone-300 dark:border-stone-700 shadow-sm animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-stone-600 dark:text-stone-300 font-medium text-lg mb-1">Aucune randonnée enregistrée</p>
            <p className="text-stone-400 dark:text-stone-500 text-sm">Commencez par créer votre première randonnée !</p>
          </div>
        </div>
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
        <div className="text-center py-16 bg-white dark:bg-stone-800 rounded-3xl border-2 border-dashed border-stone-300 dark:border-stone-700 shadow-sm animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
              <Search className="w-8 h-8 text-stone-400 dark:text-stone-500" />
            </div>
            <div>
              <p className="text-stone-600 dark:text-stone-300 font-medium text-lg mb-1">Aucun résultat trouvé</p>
              <p className="text-stone-400 dark:text-stone-500 text-sm mb-4">Aucune randonnée ne correspond à votre recherche.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-sm font-medium rounded-3xl transition-all duration-200 hover:shadow-md active:scale-95"
              >
                <X className="w-4 h-4" />
                Effacer la recherche
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHikes.map((hike, index) => (
        <div 
          key={hike.id} 
          className="bg-white dark:bg-stone-800 rounded-3xl shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => onShowOnMap(hike)}
        >
          {/* Photos de la randonnée */}
          {hike.photos && hike.photos.length > 0 && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={hike.photos[0]}
                alt={hike.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {hike.photos.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  <span>{hike.photos.length}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 p-5 border-b border-stone-100 dark:border-stone-700 flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 truncate text-lg group-hover:text-emerald-700 dark:group-hover:text-emerald-200 transition-colors">{hike.name}</h3>
              <div className="flex items-center text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {new Date(hike.date).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3" onClick={(e) => e.stopPropagation()}>
              <SocialShare hike={hike} />
              <button 
                onClick={() => onEdit(hike)}
                className="text-stone-400 dark:text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:scale-90"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(hike.id)}
                className="text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-5 text-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1 flex-shrink-0">
                <div className="w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-emerald-200 dark:ring-emerald-800"></div>
                <div className="w-0.5 h-8 bg-gradient-to-b from-emerald-200 to-red-200 dark:from-emerald-700 dark:to-red-700"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-red-200 dark:ring-red-800"></div>
              </div>
              <div className="flex flex-col gap-3 w-full min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-stone-500 dark:text-stone-400 text-xs font-medium uppercase tracking-wide">Départ</span>
                  <span className="font-semibold truncate text-stone-800 dark:text-stone-200 text-sm">{hike.startLocation}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-stone-500 dark:text-stone-400 text-xs font-medium uppercase tracking-wide">Arrivée</span>
                  <span className="font-semibold truncate text-stone-800 dark:text-stone-200 text-sm">{hike.endLocation}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-stone-100 dark:border-stone-700 space-y-3">
              <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400 text-xs">
                <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700 px-2.5 py-1 rounded-full">
                  <Ruler className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">{hike.distance} km</span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">{hike.duration}</span>
                </div>
              </div>
              {hike.elevationProfile && (
                <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400 text-xs">
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">+{Math.round(hike.elevationProfile.totalAscent)} m</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-400 font-semibold">-{Math.round(hike.elevationProfile.totalDescent)} m</span>
                  </div>
                </div>
              )}
              
              {/* Tags */}
              {hike.tags && hike.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {hike.tags.slice(0, 4).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                  {hike.tags.length > 4 && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 rounded-full text-xs">
                      +{hike.tags.length - 4}
                    </span>
                  )}
                </div>
              )}
              
              {/* Notes (aperçu) */}
              {hike.notes && (
                <div className="pt-2">
                  <div className="flex items-start gap-2 text-stone-600 dark:text-stone-400 text-xs">
                    <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2 italic">{hike.notes}</p>
                  </div>
                </div>
              )}
              
              {/* Notations */}
              {(hike.difficulty || hike.beauty) && (
                <div className="flex items-center gap-4 pt-2">
                  {hike.difficulty && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-500 dark:text-stone-400">Difficulté:</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= hike.difficulty!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-stone-200 dark:fill-stone-700 text-stone-300 dark:text-stone-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {hike.beauty && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-500 dark:text-stone-400">Beauté:</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= hike.beauty!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-stone-200 dark:fill-stone-700 text-stone-300 dark:text-stone-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium pt-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                <Eye className="w-4 h-4" />
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