-- Correction de performance : Fusionner les politiques multiples permissives
-- Ce script supprime les politiques en double et les remplace par une seule politique optimisée
-- Problème : Plusieurs politiques permissives pour la même action SELECT sur la table hikes
-- Solution : Combiner en une seule politique avec condition OR

-- ============================================
-- Table: hikes - Fusionner les politiques SELECT
-- ============================================

-- Supprimer TOUTES les politiques SELECT existantes pour éviter les doublons
-- Important : Supprimer toutes les variantes possibles de noms de politiques
DROP POLICY IF EXISTS "Users can view own hikes" ON hikes;
DROP POLICY IF EXISTS "Public can view public hikes" ON hikes;
DROP POLICY IF EXISTS "Users can view own hikes or public hikes" ON hikes;
DROP POLICY IF EXISTS "Allow public read access" ON hikes;
DROP POLICY IF EXISTS "Public can view public hikes" ON hikes;
DROP POLICY IF EXISTS "Anyone can view public hikes" ON hikes;

-- Vérifier et supprimer toutes les politiques SELECT existantes (méthode alternative)
-- Cette requête liste toutes les politiques SELECT pour vérification
-- SELECT policyname FROM pg_policies WHERE tablename = 'hikes' AND cmd = 'SELECT';

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

-- Vérification : Il ne doit rester qu'UNE SEULE politique SELECT sur hikes
-- Vous pouvez vérifier avec :
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'hikes' AND cmd = 'SELECT';

