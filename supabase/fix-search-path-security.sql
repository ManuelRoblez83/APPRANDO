-- Correction de sécurité : Fixer le search_path pour la fonction update_updated_at_column
-- Ce script corrige la vulnérabilité de sécurité liée au search_path mutable

-- Supprimer et recréer la fonction avec un search_path fixe
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recréer la fonction avec search_path sécurisé
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;

-- Recréer les triggers qui utilisent cette fonction
-- Trigger pour la table hikes
DROP TRIGGER IF EXISTS update_hikes_updated_at ON hikes;
CREATE TRIGGER update_hikes_updated_at
  BEFORE UPDATE ON hikes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour la table user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour la table hike_comments (si elle existe)
DROP TRIGGER IF EXISTS update_hike_comments_updated_at ON hike_comments;
CREATE TRIGGER update_hike_comments_updated_at
  BEFORE UPDATE ON hike_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
