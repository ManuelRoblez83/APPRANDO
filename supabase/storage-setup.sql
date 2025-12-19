-- Créer le bucket pour les photos de profil (avatars)
-- Note: Vous devez exécuter ce script dans l'éditeur SQL de Supabase

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Politique pour permettre à tous les utilisateurs authentifiés de lire les avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Politique pour permettre aux utilisateurs d'uploader leur propre avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de supprimer leur propre avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

