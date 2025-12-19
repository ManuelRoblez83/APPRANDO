import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { followUser, unfollowUser, checkIfFollowing } from '../services/followService';
import toast from 'react-hot-toast';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'compact';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  onFollowChange,
  variant = 'default',
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkFollowing = async () => {
      setIsChecking(true);
      try {
        const following = await checkIfFollowing(userId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Erreur lors de la vérification du suivi:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkFollowing();
  }, [userId]);

  const handleFollow = async () => {
    if (isLoading || isChecking) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        onFollowChange?.(false);
        toast.success('Vous ne suivez plus cet utilisateur');
      } else {
        await followUser(userId);
        setIsFollowing(true);
        onFollowChange?.(true);
        toast.success('Vous suivez maintenant cet utilisateur');
      }
    } catch (error: any) {
      console.error('Erreur lors du suivi/désabonnement:', error);
      toast.error(error.message || 'Erreur lors de l\'action');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="px-3 py-1.5 bg-stone-100 dark:bg-stone-700 rounded-full animate-pulse">
        <div className="w-16 h-4 bg-stone-300 dark:bg-stone-600 rounded"></div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleFollow}
        disabled={isLoading}
        className={`p-2 rounded-full transition-all duration-200 ${
          isFollowing
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={isFollowing ? 'Ne plus suivre' : 'Suivre'}
      >
        {isFollowing ? (
          <UserCheck className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
        isFollowing
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
          : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          <span className="text-sm font-medium">Suivi</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span className="text-sm font-medium">Suivre</span>
        </>
      )}
    </button>
  );
};
