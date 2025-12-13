import { supabase } from '../lib/supabase';

const HIKES_PHOTOS_BUCKET = 'hikes-photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB pour les photos de randonnées
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload une photo pour une randonnée
 */
export const uploadHikePhoto = async (
  hikeId: string,
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
        error: 'Le fichier est trop volumineux. Maximum 5MB.',
      };
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${hikeId}/${fileName}`;

    // Essayer d'uploader directement - la vérification du bucket peut échouer à cause des permissions
    // mais l'upload fonctionnera si le bucket existe vraiment
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(HIKES_PHOTOS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Erreur upload Supabase:', uploadError);
      console.error('Code:', uploadError.statusCode);
      console.error('Message:', uploadError.message);
      console.error('Error object:', JSON.stringify(uploadError, null, 2));
      
      // Vérifier différents types d'erreurs
      const errorMessage = uploadError.message || '';
      
      if (errorMessage.includes('not found') || errorMessage.includes('Bucket') || errorMessage.includes('does not exist')) {
        return {
          url: null,
          error: `Bucket "${HIKES_PHOTOS_BUCKET}" non trouvé. Vérifiez que le bucket existe et est public dans Supabase Storage.`,
        };
      }
      
      if (errorMessage.includes('permission') || errorMessage.includes('policy') || errorMessage.includes('RLS')) {
        return {
          url: null,
          error: `Erreur de permissions. Vérifiez que les politiques RLS sont configurées (exécutez supabase/hikes-photos-storage.sql).`,
        };
      }
      
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        // Essayer avec un nom de fichier différent
        const fileExt = file.name.split('.').pop();
        const retryFileName = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}_retry.${fileExt}`;
        const retryFilePath = `${userId}/${hikeId}/${retryFileName}`;
        
        const { error: retryError } = await supabase.storage
          .from(HIKES_PHOTOS_BUCKET)
          .upload(retryFilePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
        
        if (!retryError) {
          const { data: urlData } = await supabase.storage
            .from(HIKES_PHOTOS_BUCKET)
            .getPublicUrl(retryFilePath);
          return {
            url: urlData.publicUrl,
            error: null,
          };
        }
      }
      
      // Autres erreurs
      return {
        url: null,
        error: uploadError.message || 'Erreur lors de l\'upload de la photo.',
      };
    }

    // Récupérer l'URL publique
    const { data: urlData } = await supabase.storage
      .from(HIKES_PHOTOS_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      error: null,
    };
  } catch (error: any) {
    console.error('Erreur lors de l\'upload de la photo de randonnée:', error);
    return {
      url: null,
      error: error.message || 'Erreur lors de l\'upload de la photo.',
    };
  }
};

/**
 * Upload plusieurs photos pour une randonnée
 */
export const uploadHikePhotos = async (
  hikeId: string,
  userId: string,
  files: File[]
): Promise<{ urls: string[]; errors: string[] }> => {
  const results = await Promise.all(
    files.map(file => uploadHikePhoto(hikeId, userId, file))
  );

  const urls: string[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.url) {
      urls.push(result.url);
    } else if (result.error) {
      errors.push(`Photo ${index + 1}: ${result.error}`);
    }
  });

  return { urls, errors };
};

/**
 * Supprime une photo de randonnée
 */
export const deleteHikePhoto = async (
  photoUrl: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Extraire le chemin du fichier depuis l'URL
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(HIKES_PHOTOS_BUCKET) + 1).join('/');

    const { error } = await supabase.storage
      .from(HIKES_PHOTOS_BUCKET)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message || 'Erreur lors de la suppression de la photo.',
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la photo:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la suppression de la photo.',
    };
  }
};

/**
 * Récupère toutes les photos d'une randonnée
 */
export const getHikePhotos = async (
  hikeId: string,
  userId: string
): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(HIKES_PHOTOS_BUCKET)
      .list(`${userId}/${hikeId}/`, {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error || !data) {
      return [];
    }

    const urls = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from(HIKES_PHOTOS_BUCKET)
          .getPublicUrl(`${userId}/${hikeId}/${file.name}`);
        return urlData.publicUrl;
      })
    );

    return urls;
  } catch (error) {
    console.error('Erreur lors de la récupération des photos:', error);
    return [];
  }
};

/**
 * Supprime toutes les photos d'une randonnée
 */
export const deleteAllHikePhotos = async (
  hikeId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data, error: listError } = await supabase.storage
      .from(HIKES_PHOTOS_BUCKET)
      .list(`${userId}/${hikeId}/`);

    if (listError || !data || data.length === 0) {
      return { success: true, error: null };
    }

    const filePaths = data.map(file => `${userId}/${hikeId}/${file.name}`);

    const { error: deleteError } = await supabase.storage
      .from(HIKES_PHOTOS_BUCKET)
      .remove(filePaths);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || 'Erreur lors de la suppression des photos.',
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.error('Erreur lors de la suppression des photos:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la suppression des photos.',
    };
  }
};
