import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Filter, TrendingUp, Calendar, Ruler, Clock, Star, Tag, User, Heart, MessageCircle, Eye } from 'lucide-react';
import { fetchPublicHikes, fetchPopularHikes } from '../services/communityService';
import { HikeData } from '../types';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { FollowButton } from './FollowButton';
import { MapDisplay } from './MapDisplay';

interface CommunityHikesProps {
  onShowHikeOnMap?: (hike: HikeData) => void;
}

export const CommunityHikes: React.FC<CommunityHikesProps> = ({ onShowHikeOnMap }) => {
  const [hikes, setHikes] = useState<HikeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'likes' | 'created_at'>('created_at');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHike, setSelectedHike] = useState<HikeData | null>(null);
  const [showPopular, setShowPopular] = useState(false);

  useEffect(() => {
    loadHikes();
  }, [sortBy, selectedDifficulty, regionFilter]);

  const loadHikes = async () => {
    setIsLoading(true);
    try {
      if (showPopular) {
        const popularHikes = await fetchPopularHikes(50);
        setHikes(popularHikes);
      } else {
        const publicHikes = await fetchPublicHikes({
          difficulty: selectedDifficulty || undefined,
          region: regionFilter || undefined,
          orderBy: sortBy,
          limit: 100,
        });
        setHikes(publicHikes);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des randonnées:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHikes = useMemo(() => {
    let filtered = hikes;

    // Filtrer par recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((hike) => {
        if (hike.name.toLowerCase().includes(query)) return true;
        if (hike.startLocation.toLowerCase().includes(query)) return true;
        if (hike.endLocation.toLowerCase().includes(query)) return true;
        if (hike.notes?.toLowerCase().includes(query)) return true;
        if (hike.tags?.some((tag) => tag.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    return filtered;
  }, [hikes, searchQuery]);

  const getUserDisplayName = (hike: HikeData): string => {
    if (hike.userProfile?.nickname) {
      return hike.userProfile.nickname;
    }
    if (hike.userProfile?.firstName) {
      return hike.userProfile.firstName + (hike.userProfile.lastName ? ` ${hike.userProfile.lastName}` : '');
    }
    return 'Randonneur anonyme';
  };

  return (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1">
              Découvrir les Randonnées
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm">
              Explorez les randonnées partagées par la communauté
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPopular(!showPopular);
                loadHikes();
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showPopular
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Populaires
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-stone-200 dark:hover:bg-stone-600 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, lieu, tags..."
            className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          />
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Difficulté
              </label>
              <select
                value={selectedDifficulty || ''}
                onChange={(e) => setSelectedDifficulty(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Toutes</option>
                <option value="1">⭐ Très facile</option>
                <option value="2">⭐⭐ Facile</option>
                <option value="3">⭐⭐⭐ Modérée</option>
                <option value="4">⭐⭐⭐⭐ Difficile</option>
                <option value="5">⭐⭐⭐⭐⭐ Très difficile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Région
              </label>
              <input
                type="text"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                placeholder="Ex: Alpes, Pyrénées..."
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'likes' | 'created_at')}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="created_at">Plus récentes</option>
                <option value="date">Date de randonnée</option>
                <option value="likes">Plus populaires</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Liste des randonnées */}
      {isLoading ? (
        <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent inline-block"></div>
          <p className="text-stone-500 dark:text-stone-400 mt-3">Chargement des randonnées...</p>
        </div>
      ) : filteredHikes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700">
          <MapPin className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600 dark:text-stone-400 font-medium">
            Aucune randonnée trouvée
          </p>
          <p className="text-stone-500 dark:text-stone-500 text-sm mt-2">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHikes.map((hike) => (
            <div
              key={hike.id}
              className="bg-white dark:bg-stone-800 rounded-3xl shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Photo */}
              {hike.photos && hike.photos.length > 0 && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={hike.photos[0]}
                    alt={hike.name}
                    className="w-full h-full object-cover"
                  />
                  {hike.photos.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {hike.photos.length} photos
                    </div>
                  )}
                </div>
              )}

              <div className="p-5 space-y-4">
                {/* Header avec utilisateur */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100 truncate">
                      {hike.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-sm text-stone-600 dark:text-stone-400 truncate">
                        {getUserDisplayName(hike)}
                      </span>
                    </div>
                  </div>
                  {hike.userId && (
                    <FollowButton userId={hike.userId} variant="compact" />
                  )}
                </div>

                {/* Informations de base */}
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(hike.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Lieux */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-stone-700 dark:text-stone-300 truncate">
                      {hike.startLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-stone-700 dark:text-stone-300 truncate">
                      {hike.endLocation}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded-full">
                    <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold">{hike.distance} km</span>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold">{hike.duration}</span>
                  </div>
                  {hike.difficulty && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < hike.difficulty!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-stone-200 dark:fill-stone-700 text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {hike.tags && hike.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hike.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-xs"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions sociales */}
                <div className="flex items-center gap-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                  <LikeButton
                    hikeId={hike.id}
                    initialLikesCount={hike.likesCount || 0}
                    initialIsLiked={hike.isLiked || false}
                  />
                  <CommentSection
                    hikeId={hike.id}
                    initialCommentsCount={hike.commentsCount || 0}
                  />
                  {onShowHikeOnMap && (
                    <button
                      onClick={() => onShowHikeOnMap(hike)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 rounded-full hover:bg-stone-200 dark:hover:bg-stone-600 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Voir</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Résultats */}
      {!isLoading && filteredHikes.length > 0 && (
        <p className="text-center text-stone-500 dark:text-stone-400 text-sm">
          {filteredHikes.length} randonnée{filteredHikes.length > 1 ? 's' : ''} trouvée{filteredHikes.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

