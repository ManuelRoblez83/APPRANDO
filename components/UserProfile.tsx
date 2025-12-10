import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  TrendingUp, 
  MapPin, 
  Mountain, 
  ArrowLeft,
  Calendar,
  Route,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
  Camera
} from 'lucide-react';
import { getCurrentUser, updatePassword, updateEmail, signOut, User as SupabaseUser } from '../services/authService';
import { calculateUserStatistics, UserStatistics } from '../services/userStatsService';
import { fetchHikes, deleteHike } from '../services/hikeService';
import { HikeData } from '../types';
import { 
  getProfilePictureUrl, 
  uploadProfilePicture, 
  generateDefaultAvatar,
  deleteProfilePicture 
} from '../services/profileService';

interface UserProfileProps {
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'statistics'>('profile');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États pour la modification du profil
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          setNewEmail(currentUser.email || '');
          const userStats = await calculateUserStatistics();
          setStats(userStats);
          
          // Charger la photo de profil
          const profileUrl = await getProfilePictureUrl(currentUser.id);
          setProfilePictureUrl(profileUrl);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingPhoto(true);
    setPhotoError('');
    setPhotoSuccess(false);

    const { url, error } = await uploadProfilePicture(user.id, file);
    
    if (error) {
      setPhotoError(error);
    } else if (url) {
      setProfilePictureUrl(url);
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
    }

    setIsUploadingPhoto(false);
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError('');

    const { error } = await deleteProfilePicture(user.id);
    
    if (error) {
      setPhotoError(error);
    } else {
      setProfilePictureUrl(null);
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
    }

    setIsUploadingPhoto(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);

    if (!newEmail || newEmail === user?.email) {
      setEmailError('Veuillez entrer une nouvelle adresse email différente');
      return;
    }

    const { error } = await updateEmail(newEmail);
    if (error) {
      setEmailError(error);
    } else {
      setEmailSuccess(true);
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
      setTimeout(() => setEmailSuccess(false), 3000);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    const { error } = await updatePassword(newPassword);
    if (error) {
      setPasswordError(error);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="text-stone-600 mt-4">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Accès non autorisé</h2>
          <p className="text-stone-600 mb-6">Vous devez être connecté pour accéder à votre profil.</p>
          <button
            onClick={onBack}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Mon Compte</h1>
          <div className="w-24"></div> {/* Spacer pour centrer le titre */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* En-tête du profil */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Photo de profil"
                  className="w-20 h-20 rounded-full object-cover border-4 border-emerald-200"
                />
              ) : user.email ? (
                <img
                  src={generateDefaultAvatar(user.email)}
                  alt="Photo de profil par défaut"
                  className="w-20 h-20 rounded-full object-cover border-4 border-emerald-200"
                />
              ) : (
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-200">
                  <User className="w-10 h-10 text-emerald-700" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors disabled:opacity-50"
                title="Changer la photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-stone-800">Mon Profil</h2>
              <p className="text-stone-600">{user.email}</p>
              <p className="text-sm text-stone-500 mt-1">
                Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
              {photoError && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  {photoError}
                </div>
              )}
              {photoSuccess && (
                <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Photo de profil mise à jour !
                </div>
              )}
              {profilePictureUrl && (
                <button
                  onClick={handleDeletePhoto}
                  disabled={isUploadingPhoto}
                  className="mt-2 text-xs text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer la photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="flex border-b border-stone-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <User className="w-5 h-5 inline-block mr-2" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <Lock className="w-5 h-5 inline-block mr-2" />
              Mot de passe
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'statistics'
                  ? 'text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline-block mr-2" />
              Statistiques
            </button>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {/* Onglet Profil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Modifier l'email
                  </h3>
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Nouvelle adresse email
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          setEmailError('');
                          setEmailSuccess(false);
                        }}
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition auth-input"
                        style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        placeholder="nouveau@email.com"
                      />
                    </div>
                    {emailError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {emailError}
                      </div>
                    )}
                    {emailSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Email modifié avec succès !
                      </div>
                    )}
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      Enregistrer
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Onglet Mot de passe */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Changer le mot de passe
                  </h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError('');
                          setPasswordSuccess(false);
                        }}
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition auth-input"
                        style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <p className="text-xs text-stone-500 mt-1">Minimum 6 caractères</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError('');
                          setPasswordSuccess(false);
                        }}
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition auth-input"
                        style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                    {passwordError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Mot de passe modifié avec succès !
                      </div>
                    )}
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      Enregistrer
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Onglet Statistiques */}
            {activeTab === 'statistics' && stats && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Mes Statistiques
                </h3>

                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Route className="w-6 h-6 text-emerald-700" />
                      <h4 className="text-sm font-semibold text-emerald-800">Randonnées</h4>
                    </div>
                    <p className="text-3xl font-bold text-emerald-900">{stats.totalHikes}</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-6 h-6 text-blue-700" />
                      <h4 className="text-sm font-semibold text-blue-800">Distance totale</h4>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalDistance} km</p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Mountain className="w-6 h-6 text-orange-700" />
                      <h4 className="text-sm font-semibold text-orange-800">Dénivelé +</h4>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">
                      {Math.round(stats.totalAscent)} m
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Mountain className="w-6 h-6 text-purple-700" />
                      <h4 className="text-sm font-semibold text-purple-800">Dénivelé -</h4>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {Math.round(stats.totalDescent)} m
                    </p>
                  </div>
                </div>

                {/* Statistiques supplémentaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                    <h4 className="font-semibold text-stone-800 mb-2">Distance moyenne</h4>
                    <p className="text-2xl font-bold text-stone-900">{stats.averageDistance} km</p>
                  </div>

                  {stats.longestHike && (
                    <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                      <h4 className="font-semibold text-stone-800 mb-2">Plus longue randonnée</h4>
                      <p className="text-xl font-bold text-stone-900">{stats.longestHike.name}</p>
                      <p className="text-sm text-stone-600">{stats.longestHike.distance} km</p>
                    </div>
                  )}
                </div>

                {/* Randonnées récentes */}
                {stats.recentHikes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-4">Randonnées récentes</h4>
                    <div className="space-y-3">
                      {stats.recentHikes.map((hike) => (
                        <div
                          key={hike.id}
                          className="bg-stone-50 rounded-lg p-4 border border-stone-200 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-stone-800">{hike.name}</p>
                            <div className="flex items-center gap-4 text-sm text-stone-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(hike.date).toLocaleDateString('fr-FR')}
                              </span>
                              <span>{hike.distance} km</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

