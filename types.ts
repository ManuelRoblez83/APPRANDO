export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HikeData {
  id: string;
  name: string;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: number; // in km
  duration: string; // e.g., "2h 30m"
  startCoords?: Coordinates;
  endCoords?: Coordinates;
  elevationProfile?: {
    minElevation: number;
    maxElevation: number;
    totalAscent: number;
    totalDescent: number;
  };
  photos?: string[]; // URLs des photos
  notes?: string; // Description/notes de la randonnée
  tags?: string[]; // Tags (montagne, lac, forêt...)
  difficulty?: number; // Note de difficulté (1-5 étoiles)
  beauty?: number; // Note de beauté (1-5 étoiles)
  isPublic?: boolean; // Si la randonnée est publique
  userId?: string; // ID de l'utilisateur propriétaire
  userProfile?: UserProfile; // Profil de l'utilisateur propriétaire
  likesCount?: number; // Nombre de likes
  commentsCount?: number; // Nombre de commentaires
  isLiked?: boolean; // Si l'utilisateur actuel a liké cette randonnée
}

export interface HikeFormData {
  name: string;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  duration: string;
  photos?: File[]; // Fichiers photos à uploader
  notes?: string; // Description/notes de la randonnée
  tags?: string[]; // Tags (montagne, lac, forêt...)
  difficulty?: number; // Note de difficulté (1-5 étoiles)
  beauty?: number; // Note de beauté (1-5 étoiles)
  isPublic?: boolean; // Si la randonnée doit être publique
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  birthDate?: string;
  avatarUrl?: string;
}

export interface HikeComment {
  id: string;
  hikeId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userProfile?: UserProfile;
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  followerProfile?: UserProfile;
  followingProfile?: UserProfile;
}