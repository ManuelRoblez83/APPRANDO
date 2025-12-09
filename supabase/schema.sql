-- Créer la table des randonnées
CREATE TABLE IF NOT EXISTS hikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  distance NUMERIC(10, 2) NOT NULL,
  duration TEXT NOT NULL,
  start_coords JSONB,
  end_coords JSONB,
  elevation_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_hikes_date ON hikes(date DESC);
CREATE INDEX IF NOT EXISTS idx_hikes_created_at ON hikes(created_at DESC);

-- Activer Row Level Security (RLS) pour la sécurité
ALTER TABLE hikes ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent (pour éviter les erreurs)
DROP POLICY IF EXISTS "Allow public read access" ON hikes;
DROP POLICY IF EXISTS "Allow public insert access" ON hikes;
DROP POLICY IF EXISTS "Allow public update access" ON hikes;
DROP POLICY IF EXISTS "Allow public delete access" ON hikes;

-- Politique pour permettre à tous de lire les randonnées (pour l'instant)
-- Vous pouvez la modifier plus tard pour ajouter l'authentification
CREATE POLICY "Allow public read access" ON hikes
  FOR SELECT
  USING (true);

-- Politique pour permettre à tous d'insérer des randonnées
CREATE POLICY "Allow public insert access" ON hikes
  FOR INSERT
  WITH CHECK (true);

-- Politique pour permettre à tous de mettre à jour les randonnées
CREATE POLICY "Allow public update access" ON hikes
  FOR UPDATE
  USING (true);

-- Politique pour permettre à tous de supprimer les randonnées
CREATE POLICY "Allow public delete access" ON hikes
  FOR DELETE
  USING (true);

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

