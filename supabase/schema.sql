-- Créer la table des randonnées
CREATE TABLE IF NOT EXISTS hikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  distance NUMERIC(10, 2) NOT NULL,
  duration TEXT NOT NULL,
  start_coords JSONB,
  end_coords JSONB,
  elevation_profile JSONB,
  photos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Ajouter la colonne user_id si elle n'existe pas déjà (pour les migrations)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hikes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE hikes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ajouter la colonne photos si elle n'existe pas déjà (pour les migrations)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hikes' AND column_name = 'photos'
  ) THEN
    ALTER TABLE hikes ADD COLUMN photos JSONB;
  END IF;
END $$;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_hikes_date ON hikes(date DESC);
CREATE INDEX IF NOT EXISTS idx_hikes_created_at ON hikes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hikes_user_id ON hikes(user_id);

-- Activer Row Level Security (RLS) pour la sécurité
ALTER TABLE hikes ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Allow public read access" ON hikes;
DROP POLICY IF EXISTS "Allow public insert access" ON hikes;
DROP POLICY IF EXISTS "Allow public update access" ON hikes;
DROP POLICY IF EXISTS "Allow public delete access" ON hikes;
DROP POLICY IF EXISTS "Users can view own hikes" ON hikes;
DROP POLICY IF EXISTS "Users can insert own hikes" ON hikes;
DROP POLICY IF EXISTS "Users can update own hikes" ON hikes;
DROP POLICY IF EXISTS "Users can delete own hikes" ON hikes;

-- Politique pour permettre aux utilisateurs de lire leurs propres randonnées
CREATE POLICY "Users can view own hikes" ON hikes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer leurs propres randonnées
CREATE POLICY "Users can insert own hikes" ON hikes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres randonnées
CREATE POLICY "Users can update own hikes" ON hikes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres randonnées
CREATE POLICY "Users can delete own hikes" ON hikes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS update_hikes_updated_at ON hikes;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_hikes_updated_at
  BEFORE UPDATE ON hikes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

