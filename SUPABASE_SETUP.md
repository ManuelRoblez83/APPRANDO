# Guide de configuration Supabase

Ce guide vous explique comment configurer Supabase pour votre application RandoTrack.

## 📋 Étape 1 : Créer un compte Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"** ou **"Sign up"**
3. Créez un compte (vous pouvez utiliser GitHub, Google, ou votre email)

## 📋 Étape 2 : Créer un nouveau projet

1. Une fois connecté, cliquez sur **"New Project"**
2. Remplissez les informations :
   - **Name** : `randotrack` (ou le nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort (⚠️ **Notez-le**, vous en aurez besoin)
   - **Region** : Choisissez la région la plus proche (ex: `West EU (Paris)`)
3. Cliquez sur **"Create new project"**
4. Attendez 1-2 minutes que le projet soit créé

## 📋 Étape 3 : Récupérer les clés d'API

1. Dans votre projet Supabase, allez dans **Settings** (⚙️) > **API**
2. Vous trouverez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon/public key** : Une longue clé commençant par `eyJ...`

## 📋 Étape 4 : Créer le fichier .env

1. À la racine du projet, créez un fichier `.env`
2. Ajoutez les variables suivantes (remplacez par vos valeurs) :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

**⚠️ Important :** Ne commitez JAMAIS ce fichier `.env` dans Git (il est déjà dans `.gitignore`)

## 📋 Étape 5 : Créer la table dans Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor** (dans le menu de gauche)
2. Cliquez sur **"New query"**
3. Copiez-collez le contenu du fichier `supabase/schema.sql`
4. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)
5. Vous devriez voir un message de succès

## 📋 Étape 6 : Vérifier la table

1. Allez dans **Table Editor** (dans le menu de gauche)
2. Vous devriez voir la table `hikes` avec les colonnes :
   - `id` (uuid)
   - `name` (text)
   - `date` (date)
   - `start_location` (text)
   - `end_location` (text)
   - `distance` (numeric)
   - `duration` (text)
   - `start_coords` (jsonb)
   - `end_coords` (jsonb)
   - `elevation_profile` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## 📋 Étape 7 : Démarrer l'application

1. Assurez-vous que votre fichier `.env` est correctement configuré
2. Redémarrez le serveur de développement :
   ```bash
   npm run dev
   ```
3. L'application devrait maintenant se connecter à Supabase !

## 🔒 Sécurité (optionnel)

Par défaut, les politiques RLS permettent à tous d'accéder aux données. Pour ajouter de l'authentification :

1. Allez dans **Authentication** > **Policies**
2. Modifiez les politiques RLS pour n'autoriser que les utilisateurs authentifiés
3. Ajoutez l'authentification Supabase à votre application

## ❓ Dépannage

### Erreur : "Variables d'environnement Supabase manquantes"
- Vérifiez que le fichier `.env` existe à la racine du projet
- Vérifiez que les noms des variables commencent par `VITE_`
- Redémarrez le serveur de développement après avoir créé/modifié `.env`

### Erreur : "relation 'hikes' does not exist"
- Assurez-vous d'avoir exécuté le script SQL dans l'éditeur SQL de Supabase
- Vérifiez que la table existe dans **Table Editor**

### Les données ne se sauvegardent pas
- Vérifiez que les clés d'API sont correctes dans `.env`
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez les logs dans Supabase > **Logs** > **API Logs**

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide JavaScript/TypeScript](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

