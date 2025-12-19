-- Correction de performance : Optimiser les politiques RLS
-- Ce script corrige les politiques RLS pour éviter la réévaluation de auth.uid() pour chaque ligne
-- En utilisant (select auth.uid()) au lieu de auth.uid(), la fonction est évaluée une seule fois par requête

-- ============================================
-- Table: hikes
-- ============================================

-- Recréer les politiques pour hikes avec optimisation
-- IMPORTANT: Combiner les deux politiques SELECT en une seule pour éviter les politiques multiples permissives
-- Supprimer TOUTES les politiques SELECT existantes pour éviter les doublons
DROP POLICY IF EXISTS "Users can view own hikes" ON hikes;
DROP POLICY IF EXISTS "Public can view public hikes" ON hikes;
DROP POLICY IF EXISTS "Users can view own hikes or public hikes" ON hikes;
DROP POLICY IF EXISTS "Allow public read access" ON hikes;

-- Créer une SEULE politique combinée optimisée
-- Cette politique permet :
-- 1. Aux utilisateurs de voir leurs propres randonnées (même si privées)
-- 2. À tout le monde de voir les randonnées publiques
CREATE POLICY "Users can view own hikes or public hikes" ON hikes
  FOR SELECT
  USING (
    (select auth.uid()) = user_id 
    OR is_public = true
  );

DROP POLICY IF EXISTS "Users can insert own hikes" ON hikes;
CREATE POLICY "Users can insert own hikes" ON hikes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own hikes" ON hikes;
CREATE POLICY "Users can update own hikes" ON hikes
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own hikes" ON hikes;
CREATE POLICY "Users can delete own hikes" ON hikes
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- Table: user_profiles
-- ============================================

-- Recréer les politiques pour user_profiles avec optimisation
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- Table: favorite_hikes
-- ============================================

-- Recréer les politiques pour favorite_hikes avec optimisation
DROP POLICY IF EXISTS "Users can view own favorite hikes" ON favorite_hikes;
CREATE POLICY "Users can view own favorite hikes" ON favorite_hikes
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own favorite hikes" ON favorite_hikes;
CREATE POLICY "Users can insert own favorite hikes" ON favorite_hikes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own favorite hikes" ON favorite_hikes;
CREATE POLICY "Users can delete own favorite hikes" ON favorite_hikes
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- Table: hike_likes
-- ============================================

-- Recréer les politiques pour hike_likes avec optimisation
DROP POLICY IF EXISTS "Users can like hikes" ON hike_likes;
CREATE POLICY "Users can like hikes" ON hike_likes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can unlike hikes" ON hike_likes;
CREATE POLICY "Users can unlike hikes" ON hike_likes
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- Table: hike_comments
-- ============================================

-- Recréer les politiques pour hike_comments avec optimisation
DROP POLICY IF EXISTS "Users can comment on public hikes" ON hike_comments;
CREATE POLICY "Users can comment on public hikes" ON hike_comments
  FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM hikes 
      WHERE hikes.id = hike_comments.hike_id 
      AND hikes.is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can update own comments" ON hike_comments;
CREATE POLICY "Users can update own comments" ON hike_comments
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON hike_comments;
CREATE POLICY "Users can delete own comments" ON hike_comments
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- Table: user_follows
-- ============================================

-- Recréer les politiques pour user_follows avec optimisation
DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT
  WITH CHECK ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON user_follows;
CREATE POLICY "Users can unfollow others" ON user_follows
  FOR DELETE
  USING ((select auth.uid()) = follower_id);

-- ============================================
-- Storage Policies (optimisation optionnelle)
-- ============================================

-- Optimiser les politiques de storage pour hikes-photos
DROP POLICY IF EXISTS "Users can upload their own hike photos" ON storage.objects;
CREATE POLICY "Users can upload their own hike photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hikes-photos' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own hike photos" ON storage.objects;
CREATE POLICY "Users can update their own hike photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hikes-photos' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own hike photos" ON storage.objects;
CREATE POLICY "Users can delete their own hike photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hikes-photos' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

-- Optimiser les politiques de storage pour avatars
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

