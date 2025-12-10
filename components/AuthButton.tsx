import React, { useState, useEffect } from 'react';
import { User, LogIn, UserPlus, LogOut, X, Settings } from 'lucide-react';
import { signIn, signUp, signOut, getCurrentUser, onAuthStateChange } from '../services/authService';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getProfilePictureUrl, generateDefaultAvatar } from '../services/profileService';

interface AuthButtonProps {
  onShowProfile?: () => void;
  refreshProfilePicture?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ onShowProfile, refreshProfilePicture }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Charger la photo de profil
  useEffect(() => {
    const loadProfilePicture = async () => {
      if (user?.id) {
        const url = await getProfilePictureUrl(user.id);
        setProfilePictureUrl(url);
      } else {
        setProfilePictureUrl(null);
      }
    };

    loadProfilePicture();
  }, [user, refreshProfilePicture]);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    checkUser();

    // Écouter les changements d'authentification
    const { data: { subscription } } = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        setShowModal(false);
        setEmail('');
        setPassword('');
        setError('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { user: newUser, error: signUpError } = await signUp(email, password);
        if (signUpError) {
          setError(signUpError);
        } else {
          setError('');
          alert('Inscription réussie ! Un email de confirmation a été envoyé (si nécessaire).');
        }
      } else {
        const { user: loggedInUser, error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    const { error } = await signOut();
    if (error) {
      alert('Erreur lors de la déconnexion: ' + error);
    }
    setIsSubmitting(false);
  };

  const openSignIn = () => {
    setIsSignUp(false);
    setError('');
    setEmail('');
    setPassword('');
    setShowModal(true);
  };

  const openSignUp = () => {
    setIsSignUp(true);
    setError('');
    setEmail('');
    setPassword('');
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-800 animate-pulse"></div>
    );
  }

  return (
    <>
      {user ? (
        <div className="flex items-center gap-3">
          {onShowProfile && (
            <button
              onClick={onShowProfile}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 px-3 py-2 rounded-3xl transition-colors text-sm font-medium"
              title="Mon compte"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Mon compte</span>
            </button>
          )}
          <button
            onClick={onShowProfile}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Mon profil"
          >
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Photo de profil"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300"
              />
            ) : user.email ? (
              <img
                src={generateDefaultAvatar(user.email)}
                alt="Photo de profil par défaut"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center border-2 border-emerald-300">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </button>
          <button
            onClick={handleSignOut}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 px-3 py-2 rounded-3xl transition-colors text-sm font-medium disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Connexion</span>
          </button>
          <button
            onClick={openSignUp}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Inscription</span>
          </button>
        </div>
      )}

      {/* Modal de connexion/inscription */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
                {isSignUp ? 'Créer un compte' : 'Se connecter'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input w-full p-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-white dark:bg-stone-700 text-black dark:text-stone-100"
                  placeholder="votre@email.com"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input w-full p-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-white dark:bg-stone-700 text-black dark:text-stone-100"
                  placeholder="••••••••"
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                />
                {isSignUp && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Minimum 6 caractères
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-3xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-3xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      {isSignUp ? 'Inscription...' : 'Connexion...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                      {isSignUp ? 'Créer mon compte' : 'Se connecter'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  {isSignUp
                    ? 'Déjà un compte ? Se connecter'
                    : 'Pas encore de compte ? S\'inscrire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

