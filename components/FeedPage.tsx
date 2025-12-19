import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Ruler, Clock, Star, Tag, User, Heart, MessageCircle, Eye, RefreshCw } from 'lucide-react';
import { fetchFeedHikes } from '../services/followService';
import { HikeData } from '../types';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { FollowButton } from './FollowButton';

interface FeedPageProps {
  onShowHikeOnMap?: (hike: HikeData) => void;
}

export const FeedPage: React.FC<FeedPageProps> = ({ onShowHikeOnMap }) => {
  const [hikes, setHikes] = useState<HikeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const feedHikes = await fetchFeedHikes(50);
      setHikes(feedHikes);
    } catch (error) {
      console.error('Erreur lors du chargement du fil d\'actualité:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFeed();
    setIsRefreshing(false);
  };

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
      {/* Header */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Fil d'Actualité
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm">
              Les dernières randonnées des utilisateurs que vous suivez
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-full text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Liste des randonnées */}
      {isLoading ? (
        <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent inline-block"></div>
          <p className="text-stone-500 dark:text-stone-400 mt-3">Chargement du fil d'actualité...</p>
        </div>
      ) : hikes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700">
          <Users className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <p className="text-stone-600 dark:text-stone-400 font-medium mb-2">
            Aucune randonnée dans votre fil d'actualité
          </p>
          <p className="text-stone-500 dark:text-stone-500 text-sm">
            Commencez à suivre d'autres randonneurs pour voir leurs randonnées ici !
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {hikes.map((hike) => (
            <div
              key={hike.id}
              className="bg-white dark:bg-stone-800 rounded-3xl shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Photo */}
              {hike.photos && hike.photos.length > 0 && (
                <div className="relative h-64 overflow-hidden">
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

              <div className="p-6 space-y-4">
                {/* Header avec utilisateur */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 dark:text-stone-100 truncate">
                        {getUserDisplayName(hike)}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {new Date(hike.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  {hike.userId && (
                    <FollowButton userId={hike.userId} variant="compact" />
                  )}
                </div>

                {/* Nom de la randonnée */}
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                  {hike.name}
                </h3>

                {/* Lieux */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-stone-700 dark:text-stone-300">
                      {hike.startLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-stone-700 dark:text-stone-300">
                      {hike.endLocation}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-full text-sm">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">{hike.distance} km</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-full text-sm">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">{hike.duration}</span>
                  </div>
                  {hike.difficulty && (
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-full text-sm">
                      <span className="text-xs text-stone-600 dark:text-stone-400 mr-1">Difficulté:</span>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
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
                  <div className="flex flex-wrap gap-2">
                    {hike.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-xs"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {hike.notes && (
                  <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap bg-stone-50 dark:bg-stone-900 p-3 rounded-xl">
                    {hike.notes}
                  </p>
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
                      <span className="text-sm">Voir sur la carte</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
