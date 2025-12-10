# Configuration du Storage Supabase pour les Photos de Profil

Ce guide explique comment configurer Supabase Storage pour permettre aux utilisateurs d'uploader des photos de profil.

## 📋 Étapes de configuration

### 1. Créer le bucket de stockage

1. Connectez-vous à votre projet Supabase
2. Allez dans **Storage** (dans le menu de gauche)
3. Cliquez sur **"New bucket"**
4. Configurez le bucket :
   - **Name** : `avatars`
   - **Public bucket** : ✅ Cocher cette case (pour que les photos soient accessibles publiquement)
5. Cliquez sur **"Create bucket"**

### 2. Configurer les politiques de sécurité

1. Dans l'éditeur SQL de Supabase, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez-collez le contenu du fichier `supabase/storage-setup.sql`
4. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

Ces politiques permettent :
- ✅ Tous les utilisateurs peuvent voir les photos de profil (lecture publique)
- ✅ Seuls les utilisateurs authentifiés peuvent uploader leur propre photo
- ✅ Chaque utilisateur peut seulement modifier/supprimer sa propre photo

### 3. Vérifier la configuration

1. Allez dans **Storage** > **Policies**
2. Vous devriez voir les 4 politiques créées pour le bucket `avatars` :
   - "Avatar images are publicly accessible" (SELECT)
   - "Users can upload their own avatar" (INSERT)
   - "Users can update their own avatar" (UPDATE)
   - "Users can delete their own avatar" (DELETE)

## ✅ Fonctionnalités

Une fois configuré, les utilisateurs peuvent :
- ✅ Voir leur photo de profil dans le header (ou une photo par défaut avec initiales)
- ✅ Uploader une nouvelle photo de profil depuis leur page de profil
- ✅ Supprimer leur photo de profil
- ✅ Les photos sont automatiquement redimensionnées et optimisées

## 📝 Notes importantes

- Les photos sont stockées dans le format : `avatars/{user_id}/avatar_{timestamp}.{extension}`
- Taille maximale : 2MB
- Formats acceptés : JPG, PNG, WebP
- Si un utilisateur n'a pas de photo, une photo par défaut avec ses initiales est générée automatiquement



