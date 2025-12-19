-- Migration pour les fonctionnalités communautaires
-- Ajouter la colonne is_public à la table hikes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hikes' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE hikes ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Créer un index pour améliorer les performances des requêtes publiques
CREATE INDEX IF NOT EXISTS idx_hikes_is_public ON hikes(is_public) WHERE is_public = true;

-- Table pour les likes de randonnées
CREATE TABLE IF NOT EXISTS hike_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hike_id UUID REFERENCES hikes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(hike_id, user_id) -- Un utilisateur ne peut liker qu'une fois par randonnée
);

-- Index pour les likes
CREATE INDEX IF NOT EXISTS idx_hike_likes_hike_id ON hike_likes(hike_id);
CREATE INDEX IF NOT EXISTS idx_hike_likes_user_id ON hike_likes(user_id);

-- Activer RLS pour hike_likes
ALTER TABLE hike_likes ENABLE ROW LEVEL SECURITY;

-- Politiques pour hike_likes
DROP POLICY IF EXISTS "Anyone can view likes" ON hike_likes;
DROP POLICY IF EXISTS "Users can like hikes" ON hike_likes;
DROP POLICY IF EXISTS "Users can unlike hikes" ON hike_likes;

-- Tout le monde peut voir les likes
CREATE POLICY "Anyone can view likes" ON hike_likes
  FOR SELECT
  USING (true);

-- Les utilisateurs authentifiés peuvent liker
CREATE POLICY "Users can like hikes" ON hike_likes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- Les utilisateurs peuvent retirer leur like
CREATE POLICY "Users can unlike hikes" ON hike_likes
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Table pour les commentaires de randonnées
CREATE TABLE IF NOT EXISTS hike_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hike_id UUID REFERENCES hikes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index pour les commentaires
CREATE INDEX IF NOT EXISTS idx_hike_comments_hike_id ON hike_comments(hike_id);
CREATE INDEX IF NOT EXISTS idx_hike_comments_user_id ON hike_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_hike_comments_created_at ON hike_comments(created_at DESC);

-- Activer RLS pour hike_comments
ALTER TABLE hike_comments ENABLE ROW LEVEL SECURITY;

-- Politiques pour hike_comments
DROP POLICY IF EXISTS "Anyone can view comments on public hikes" ON hike_comments;
DROP POLICY IF EXISTS "Users can comment on public hikes" ON hike_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON hike_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON hike_comments;

-- Tout le monde peut voir les commentaires sur les randonnées publiques
CREATE POLICY "Anyone can view comments on public hikes" ON hike_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hikes 
      WHERE hikes.id = hike_comments.hike_id 
      AND hikes.is_public = true
    )
  );

-- Les utilisateurs authentifiés peuvent commenter les randonnées publiques
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

-- Les utilisateurs peuvent modifier leurs propres commentaires
CREATE POLICY "Users can update own comments" ON hike_comments
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Les utilisateurs peuvent supprimer leurs propres commentaires
CREATE POLICY "Users can delete own comments" ON hike_comments
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Table pour le système de followers
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(follower_id, following_id), -- Un utilisateur ne peut suivre qu'une fois
  CHECK (follower_id != following_id) -- Un utilisateur ne peut pas se suivre lui-même
);

-- Index pour user_follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- Activer RLS pour user_follows
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_follows
DROP POLICY IF EXISTS "Users can view follows" ON user_follows;
DROP POLICY IF EXISTS "Users can follow others" ON user_follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON user_follows;

-- Les utilisateurs peuvent voir qui suit qui (pour les suggestions)
CREATE POLICY "Users can view follows" ON user_follows
  FOR SELECT
  USING (true);

-- Les utilisateurs authentifiés peuvent suivre d'autres utilisateurs
CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT
  WITH CHECK ((select auth.uid()) = follower_id);

-- Les utilisateurs peuvent se désabonner
CREATE POLICY "Users can unfollow others" ON user_follows
  FOR DELETE
  USING ((select auth.uid()) = follower_id);

-- Mettre à jour la politique RLS pour hikes afin de permettre la lecture publique
-- Combiner avec la politique existante pour éviter les politiques multiples permissives
DROP POLICY IF EXISTS "Users can view own hikes" ON hikes;
DROP POLICY IF EXISTS "Users can view own hikes or public hikes" ON hikes;
DROP POLICY IF EXISTS "Public can view public hikes" ON hikes;

-- Politique combinée optimisée : utilisateurs voient leurs propres randonnées OU les randonnées publiques
CREATE POLICY "Users can view own hikes or public hikes" ON hikes
  FOR SELECT
  USING (
    (select auth.uid()) = user_id 
    OR is_public = true
  );

-- Trigger pour mettre à jour updated_at automatiquement pour hike_comments
DROP TRIGGER IF EXISTS update_hike_comments_updated_at ON hike_comments;

CREATE TRIGGER update_hike_comments_updated_at
  BEFORE UPDATE ON hike_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
