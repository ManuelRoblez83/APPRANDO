import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { likeHike, unlikeHike, checkIfLiked, getHikeLikesCount } from '../services/communityService';
import toast from 'react-hot-toast';

interface LikeButtonProps {
  hikeId: string;
  initialLikesCount?: number;
  initialIsLiked?: boolean;
  onLikeChange?: (likesCount: number, isLiked: boolean) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  hikeId,
  initialLikesCount = 0,
  initialIsLiked = false,
  onLikeChange,
}) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial
    const checkInitialState = async () => {
      try {
        const [currentLikesCount, currentIsLiked] = await Promise.all([
          getHikeLikesCount(hikeId),
          checkIfLiked(hikeId),
        ]);
        setLikesCount(currentLikesCount);
        setIsLiked(currentIsLiked);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'état initial:', error);
      }
    };

    checkInitialState();
  }, [hikeId]);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        await unlikeHike(hikeId);
        const newCount = likesCount - 1;
        setLikesCount(newCount);
        setIsLiked(false);
        onLikeChange?.(newCount, false);
      } else {
        await likeHike(hikeId);
        const newCount = likesCount + 1;
        setLikesCount(newCount);
        setIsLiked(true);
        onLikeChange?.(newCount, true);
      }
    } catch (error: any) {
      console.error('Erreur lors du like/unlike:', error);
      toast.error(error.message || 'Erreur lors de l\'action');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
        isLiked
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
          : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isLiked ? 'Retirer le like' : 'Liker cette randonnée'}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 ${
          isLiked ? 'fill-red-600 dark:fill-red-400' : ''
        }`}
      />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
};

