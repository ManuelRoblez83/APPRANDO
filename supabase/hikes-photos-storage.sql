-- Créer le bucket pour les photos de randonnées
-- Note: Vous devez exécuter ce script dans l'éditeur SQL de Supabase

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('hikes-photos', 'hikes-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Hike photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own hike photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own hike photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own hike photos" ON storage.objects;

-- Politique pour permettre à tous les utilisateurs authentifiés de lire les photos de randonnées
CREATE POLICY "Hike photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hikes-photos');

-- Politique pour permettre aux utilisateurs d'uploader leurs propres photos de randonnées
CREATE POLICY "Users can upload their own hike photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hikes-photos' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres photos de randonnées
CREATE POLICY "Users can update their own hike photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hikes-photos' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres photos de randonnées
CREATE POLICY "Users can delete their own hike photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hikes-photos' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);
