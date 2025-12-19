import React, { useState, useEffect } from 'react';
import { UserPlus, Users, User } from 'lucide-react';
import { fetchUserSuggestions } from '../services/followService';
import { UserProfile } from '../types';
import { FollowButton } from './FollowButton';

interface UserSuggestionsProps {
  limit?: number;
  onFollowChange?: () => void;
}

export const UserSuggestions: React.FC<UserSuggestionsProps> = ({
  limit = 10,
  onFollowChange,
}) => {
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const userSuggestions = await fetchUserSuggestions(limit);
      setSuggestions(userSuggestions);
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = (profile: UserProfile): string => {
    if (profile.nickname) {
      return profile.nickname;
    }
    if (profile.firstName) {
      return profile.firstName + (profile.lastName ? ` ${profile.lastName}` : '');
    }
    return 'Randonneur';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
            Suggestions de connexions
          </h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent inline-block"></div>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
            Suggestions de connexions
          </h3>
        </div>
        <p className="text-stone-500 dark:text-stone-400 text-sm text-center py-4">
          Aucune suggestion pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-700">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          Suggestions de connexions
        </h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between gap-3 p-3 bg-stone-50 dark:bg-stone-900 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 dark:text-stone-100 truncate">
                  {getUserDisplayName(profile)}
                </p>
                {profile.firstName && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {profile.firstName} {profile.lastName || ''}
                  </p>
                )}
              </div>
            </div>
            <FollowButton
              userId={profile.userId}
              variant="compact"
              onFollowChange={onFollowChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

