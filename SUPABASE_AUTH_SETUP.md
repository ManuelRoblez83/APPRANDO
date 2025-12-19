# Configuration de l'Authentification Supabase

Ce document explique comment mettre à jour votre base de données Supabase pour activer l'authentification et associer les randonnées aux utilisateurs.

## Étape 1 : Mettre à jour le schéma de la base de données

1. Connectez-vous à votre projet Supabase
2. Allez dans l'éditeur SQL (SQL Editor)
3. Exécutez le script `supabase/schema.sql` mis à jour

Le schéma a été modifié pour :
- Ajouter une colonne `user_id` à la table `hikes`
- Mettre en place des politiques Row Level Security (RLS) pour que chaque utilisateur ne voie que ses propres randonnées
- Créer un index sur `user_id` pour améliorer les performances

## Étape 2 : Activer l'authentification par email dans Supabase

1. Dans votre projet Supabase, allez dans **Authentication** > **Providers**
2. Assurez-vous que **Email** est activé
3. (Optionnel) Configurez les paramètres d'email :
   - Confirmation d'email requise ou non
   - Templates d'email personnalisés

## Étape 2.5 : Activer la Protection contre les Mots de Passe Compromis ⚠️ IMPORTANT

**🔒 Sécurité** : Il est fortement recommandé d'activer la protection contre les mots de passe compromis.

**⚠️ Prérequis** : Cette fonctionnalité nécessite un plan **Pro** ou supérieur (non disponible sur le plan Free).

1. Dans votre projet Supabase, allez dans **Authentication** > **Settings** (⚙️)
   - **Important** : C'est dans "Settings", pas "Policies"
2. Faites défiler jusqu'à la section **"Password Security"**
3. Recherchez l'option **"Prevent leaked passwords"** ou **"Leaked password protection"**
4. **Activez** le toggle/switch pour cette fonctionnalité
5. La fonctionnalité fonctionne automatiquement en mode strict (rejet des mots de passe compromis)

📖 **Guide détaillé** : Consultez `SUPABASE_PASSWORD_SECURITY.md` pour plus d'informations et le dépannage.

## Étape 3 : Tester l'authentification

Une fois le schéma mis à jour :

1. **Inscription** : Cliquez sur "Inscription" dans l'application, entrez un email et un mot de passe (minimum 6 caractères)
2. **Connexion** : Utilisez vos identifiants pour vous connecter
3. **Vérification** : Après connexion, vous devriez voir votre email affiché en haut à droite

## Fonctionnalités

- ✅ Inscription avec email et mot de passe
- ✅ Connexion avec email et mot de passe
- ✅ Déconnexion
- ✅ Les randonnées sont automatiquement associées à l'utilisateur connecté
- ✅ Chaque utilisateur ne voit que ses propres randonnées
- ✅ Les randonnées se rechargent automatiquement lors de la connexion/déconnexion

## Important

⚠️ **Note** : Après avoir mis à jour le schéma avec les nouvelles politiques RLS, les anciennes randonnées créées sans `user_id` ne seront plus accessibles. Si vous avez des données existantes que vous souhaitez conserver, vous devrez :

1. Désactiver temporairement RLS
2. Ajouter un `user_id` manuel aux anciennes randonnées
3. Réactiver RLS

Ou simplement créer de nouvelles randonnées après vous être connecté.












