import { supabase } from '../lib/supabase';

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Génère une photo de profil par défaut avec les initiales de l'utilisateur
 */
export const generateDefaultAvatar = (email: string): string => {
  // Récupérer les initiales depuis l'email
  const parts = email.split('@')[0].split(/[._-]/);
  const initials = parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);

  // Générer une couleur basée sur l'email (cohérente)
  const hash = email.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash % 360);
  const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
  const lightness = 45 + (Math.abs(hash) % 15); // 45-60%

  // Créer un SVG avec les initiales
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="hsl(${hue}, ${saturation}%, ${lightness}%)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `.trim();

  // Convertir en data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Récupère l'URL de la photo de profil de l'utilisateur
 */
export const getProfilePictureUrl = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(`${userId}/`, {
        limit: 1,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    const { data: urlData } = await supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(`${userId}/${data[0].name}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération de la photo de profil:', error);
    return null;
  }
};

/**
 * Upload une photo de profil
 */
export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Vérifier le type de fichier
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        url: null,
        error: 'Format non supporté. Utilisez JPG, PNG ou WebP.',
      };
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: null,
        error: 'Le fichier est trop volumineux. Maximum 2MB.',
      };
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Supprimer l'ancienne photo s'il y en a une
    await deleteOldProfilePictures(userId);

    // Upload la nouvelle photo
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return {
        url: null,
        error: uploadError.message || 'Erreur lors de l\'upload de la photo.',
      };
    }

    // Récupérer l'URL publique
    const { data: urlData } = await supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      error: null,
    };
  } catch (error: any) {
    console.error('Erreur lors de l\'upload de la photo de profil:', error);
    return {
      url: null,
      error: error.message || 'Erreur lors de l\'upload de la photo.',
    };
  }
};

/**
 * Supprime les anciennes photos de profil de l'utilisateur
 */
const deleteOldProfilePictures = async (userId: string): Promise<void> => {
  try {
    const { data: files, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(`${userId}/`);

    if (error || !files || files.length === 0) {
      return;
    }

    // Supprimer tous les fichiers
    const filePaths = files.map(file => `${userId}/${file.name}`);
    await supabase.storage.from(AVATAR_BUCKET).remove(filePaths);
  } catch (error) {
    console.error('Erreur lors de la suppression des anciennes photos:', error);
  }
};

/**
 * Supprime la photo de profil de l'utilisateur
 */
export const deleteProfilePicture = async (userId: string): Promise<{ error: string | null }> => {
  try {
    await deleteOldProfilePictures(userId);
    return { error: null };
  } catch (error: any) {
    return {
      error: error.message || 'Erreur lors de la suppression de la photo.',
    };
  }
};





