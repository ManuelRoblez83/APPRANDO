# Configuration des Profils Utilisateurs Supabase

Ce guide explique comment configurer la base de données Supabase pour permettre aux utilisateurs de gérer leurs informations personnelles et leurs randonnées favorites.

## 📋 Étapes de configuration

### 1. Exécuter le script SQL

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor** (dans le menu de gauche)
3. Cliquez sur **"New query"**
4. Copiez-collez le contenu du fichier `supabase/user-profiles.sql`
5. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

Ce script crée :
- ✅ La table `user_profiles` pour stocker les informations personnelles (nom, prénom, date de naissance, pseudonyme)
- ✅ La table `favorite_hikes` pour gérer les randonnées favorites (relation many-to-many)
- ✅ Les politiques Row Level Security (RLS) pour la sécurité
- ✅ Les index pour améliorer les performances
- ✅ Les triggers pour mettre à jour automatiquement `updated_at`

## ✅ Fonctionnalités disponibles

Une fois configuré, les utilisateurs peuvent :

### Informations personnelles
- ✅ Ajouter/modifier leur prénom
- ✅ Ajouter/modifier leur nom
- ✅ Ajouter/modifier leur date de naissance
- ✅ Ajouter/modifier leur pseudonyme
- ✅ Le pseudonyme s'affiche dans l'en-tête du profil s'il est défini

### Randonnées favorites
- ✅ Marquer des randonnées comme favorites
- ✅ Retirer des randonnées des favoris
- ✅ Voir toutes leurs randonnées favorites dans un onglet dédié
- ✅ La liste de toutes les randonnées avec un bouton cœur pour ajouter/retirer des favoris

## 📝 Structure de la base de données

### Table `user_profiles`
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users, Unique)
- first_name (TEXT, nullable)
- last_name (TEXT, nullable)
- birth_date (DATE, nullable)
- nickname (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table `favorite_hikes`
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- hike_id (UUID, Foreign Key → hikes)
- created_at (TIMESTAMP)
- UNIQUE(user_id, hike_id) -- Évite les doublons
```

## 🔒 Sécurité

Les politiques RLS garantissent que :
- ✅ Chaque utilisateur peut seulement lire/modifier/supprimer son propre profil
- ✅ Chaque utilisateur peut seulement gérer ses propres randonnées favorites
- ✅ Aucun utilisateur ne peut accéder aux données d'un autre utilisateur

## 🎨 Interface utilisateur

Les nouvelles fonctionnalités sont accessibles dans l'onglet **"Profil"** et **"Favoris"** de la page de compte :
- **Onglet Profil** : Formulaire pour modifier les informations personnelles et l'email
- **Onglet Favoris** : Liste de toutes les randonnées avec possibilité de les marquer comme favorites

