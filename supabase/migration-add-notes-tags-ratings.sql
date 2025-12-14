-- Migration: Ajout des champs notes, tags, difficulty et beauty
-- Date: 2024
-- Description: Ajoute les fonctionnalités de description riche, tags et notation par étoiles

-- Ajouter la colonne notes si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hikes' AND column_name = 'notes'
  ) THEN
    ALTER TABLE hikes ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Ajouter la colonne tags si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hikes' AND column_name = 'tags'
  ) THEN
    ALTER TABLE hikes ADD COLUMN tags JSONB;
  END IF;
END $$;

-- Ajouter la colonne difficulty si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hikes' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE hikes ADD COLUMN difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5);
  END IF;
END $$;

-- Ajouter la colonne beauty si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hikes' AND column_name = 'beauty'
  ) THEN
    ALTER TABLE hikes ADD COLUMN beauty INTEGER CHECK (beauty >= 1 AND beauty <= 5);
  END IF;
END $$;

-- Créer un index pour améliorer les recherches par tags (optionnel)
CREATE INDEX IF NOT EXISTS idx_hikes_tags ON hikes USING GIN (tags);
