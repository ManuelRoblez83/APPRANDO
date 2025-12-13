# Configuration du Storage Supabase pour les Photos de Randonnées

Ce guide explique comment configurer Supabase Storage pour permettre aux utilisateurs d'uploader des photos pour leurs randonnées.

## 📋 Étapes de configuration

### 1. Créer le bucket de stockage

1. Connectez-vous à votre projet Supabase
2. Allez dans **Storage** (dans le menu de gauche)
3. Cliquez sur **"New bucket"**
4. Configurez le bucket :
   - **Name** : `hikes-photos`
   - **Public bucket** : ✅ Cocher cette case (pour que les photos soient accessibles publiquement)
5. Cliquez sur **"Create bucket"**

### 2. Configurer les politiques de sécurité

1. Dans l'éditeur SQL de Supabase, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez-collez le contenu du fichier `supabase/hikes-photos-storage.sql`
4. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

Ces politiques permettent :
- ✅ Tous les utilisateurs peuvent voir les photos de randonnées (lecture publique)
- ✅ Seuls les utilisateurs authentifiés peuvent uploader leurs propres photos
- ✅ Chaque utilisateur peut seulement modifier/supprimer ses propres photos

### 3. Mettre à jour le schéma de la base de données

1. Dans l'éditeur SQL de Supabase, exécutez le script `supabase/schema.sql` pour ajouter la colonne `photos` à la table `hikes` si elle n'existe pas déjà

### 4. Vérifier la configuration

1. Allez dans **Storage** > **Policies**
2. Vous devriez voir les 4 politiques créées pour le bucket `hikes-photos` :
   - "Hike photos are publicly accessible" (SELECT)
   - "Users can upload their own hike photos" (INSERT)
   - "Users can update their own hike photos" (UPDATE)
   - "Users can delete their own hike photos" (DELETE)

## ✅ Fonctionnalités

Une fois configuré, les utilisateurs peuvent :
- ✅ Ajouter plusieurs photos lors de la création ou modification d'une randonnée
- ✅ Voir les photos dans la liste des randonnées (première photo affichée)
- ✅ Supprimer des photos existantes
- ✅ Les photos sont stockées de manière sécurisée et organisée

## 📝 Notes importantes

- Les photos sont stockées dans le format : `hikes-photos/{user_id}/{hike_id}/photo_{timestamp}_{random}.{extension}`
- Taille maximale : 5MB par photo
- Formats acceptés : JPG, PNG, WebP
- Les photos sont automatiquement organisées par utilisateur et par randonnée

## 🔧 Dépannage

Si vous rencontrez des erreurs lors de l'upload :

1. Vérifiez que le bucket `hikes-photos` existe et est public
2. Vérifiez que les politiques RLS sont correctement configurées
3. Vérifiez que l'utilisateur est bien authentifié
4. Vérifiez la taille et le format des fichiers (max 5MB, JPG/PNG/WebP uniquement)
