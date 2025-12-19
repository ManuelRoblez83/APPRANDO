# Fonctionnalités Communautaires

Ce document décrit les nouvelles fonctionnalités communautaires ajoutées à RandoTrack.

## 📋 Fonctionnalités Implémentées

### 1. Découverte Communautaire
- ✅ Voir les randonnées publiques d'autres utilisateurs
- ✅ Système de "likes" et commentaires
- ✅ Recherche de randonnées par région/difficulté
- ✅ Carte des randonnées populaires

### 2. Système d'amis/followers
- ✅ Suivre d'autres randonneurs
- ✅ Fil d'actualité des randonnées des amis
- ✅ Suggestions de connexions

## 🗄️ Base de Données

### Migration SQL

Exécutez le fichier `supabase/migration-community-features.sql` dans votre éditeur SQL Supabase pour créer les tables nécessaires :

- `hike_likes` : Table pour les likes de randonnées
- `hike_comments` : Table pour les commentaires
- `user_follows` : Table pour le système de followers
- Colonne `is_public` ajoutée à la table `hikes`

### Politiques de Sécurité (RLS)

Les politiques Row Level Security (RLS) sont configurées pour :
- Permettre la lecture publique des randonnées marquées comme publiques
- Permettre à tous de voir les likes et commentaires sur les randonnées publiques
- Permettre aux utilisateurs authentifiés de liker, commenter et suivre
- Permettre aux utilisateurs de modifier/supprimer leurs propres likes et commentaires

## 🚀 Utilisation

### Rendre une randonnée publique

1. Lors de la création ou modification d'une randonnée, cochez l'option **"Rendre cette randonnée publique"**
2. La randonnée sera visible par tous les utilisateurs dans la section "Découvrir"

### Découvrir des randonnées

1. Cliquez sur **"Découvrir"** dans la navigation
2. Utilisez les filtres pour rechercher par :
   - Difficulté (1-5 étoiles)
   - Région (recherche dans les lieux de départ/arrivée)
   - Tri par date, popularité, etc.
3. Cliquez sur **"Populaires"** pour voir les randonnées les plus likées

### Interagir avec les randonnées

- **Liker** : Cliquez sur le bouton ❤️ pour liker une randonnée
- **Commenter** : Cliquez sur le bouton 💬 pour voir et ajouter des commentaires
- **Suivre** : Cliquez sur le bouton 👤+ pour suivre un utilisateur

### Fil d'actualité

1. Cliquez sur **"Fil d'Actualité"** dans la navigation
2. Vous verrez les randonnées publiques des utilisateurs que vous suivez
3. Utilisez le bouton **"Actualiser"** pour charger les dernières randonnées

### Suggestions de connexions

Dans le fil d'actualité, une colonne de suggestions affiche les utilisateurs que vous pourriez suivre, basés sur leurs randonnées publiques.

## 📁 Structure des Fichiers

### Services
- `services/communityService.ts` : Gestion des randonnées publiques, likes, commentaires
- `services/followService.ts` : Gestion des followers et du fil d'actualité

### Composants
- `components/LikeButton.tsx` : Bouton pour liker/retirer le like
- `components/CommentSection.tsx` : Section pour afficher et ajouter des commentaires
- `components/FollowButton.tsx` : Bouton pour suivre/ne plus suivre
- `components/CommunityHikes.tsx` : Page de découverte communautaire
- `components/FeedPage.tsx` : Page du fil d'actualité
- `components/UserSuggestions.tsx` : Suggestions de connexions

### Types
Les types TypeScript ont été mis à jour dans `types.ts` pour inclure :
- `isPublic` dans `HikeData` et `HikeFormData`
- `HikeComment` : Interface pour les commentaires
- `UserFollow` : Interface pour les relations de suivi
- `UserProfile` : Interface pour les profils utilisateurs

## 🔒 Sécurité

Toutes les fonctionnalités respectent les politiques RLS de Supabase :
- Seules les randonnées marquées comme publiques sont visibles par tous
- Les utilisateurs ne peuvent modifier/supprimer que leurs propres likes et commentaires
- Les utilisateurs ne peuvent suivre que d'autres utilisateurs (pas eux-mêmes)

## 📝 Notes

- Les randonnées privées (non publiques) restent visibles uniquement par leur propriétaire
- Les utilisateurs peuvent rendre leurs randonnées publiques ou privées à tout moment
- Le système de suggestions se base sur les utilisateurs ayant des randonnées publiques
