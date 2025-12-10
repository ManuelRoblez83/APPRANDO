# Guide d'insertion des randonnées d'exemple

Ce guide explique comment insérer 20 randonnées d'exemple dans votre base de données Supabase.

## 📋 Prérequis

- Avoir créé la table `hikes` avec le script `supabase/schema.sql`
- Être connecté à votre projet Supabase
- Avoir un compte utilisateur créé (pour l'association des randonnées)

## 🚀 Étapes d'insertion

### 1. Se connecter à Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Allez dans **SQL Editor** (dans le menu de gauche)

### 2. Exécuter le script

1. Cliquez sur **"New query"**
2. Ouvrez le fichier `supabase/sample-hikes.sql`
3. Copiez-collez tout le contenu dans l'éditeur SQL
4. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

## 📍 Randonnées incluses

Le script insère 20 randonnées variées à travers la France :

1. **Tour du Mont-Blanc** - Chamonix aux Contamines (16.5 km, +667m)
2. **GR34 Bretagne** - Cap Fréhel à Fort la Latte (8.2 km, +250m)
3. **Chemin de Stevenson** - Le Monastier à Pradelles (22 km, +850m)
4. **Gorges du Verdon** - Sentier Blanc-Martel (13.5 km, +500m)
5. **Camino de Santiago** - Saint-Jean-Pied-de-Port à Roncevaux (25 km, +1250m)
6. **Calanques de Marseille** - Sormiou à Morgiou (6.8 km, +350m)
7. **Crêtes des Vosges** - Hohneck au Grand Ballon (18.5 km, +600m)
8. **Causses du Quercy** - Rocamadour à Cahors (32 km, +650m)
9. **Canal du Midi** - Toulouse à Montgiscard (15 km, +50m)
10. **Puy de Dôme** - Ascension (5.5 km, +415m)
11. **Forêt de Fontainebleau** - Tour de la forêt (12.5 km, +200m)
12. **Baie du Mont-Saint-Michel** - Traversée (10 km, plat)
13. **Jura** - Mouthe à Métabief (20 km, +700m)
14. **GR20 Corse** - Calenzana à Bonifatu (14 km, +1110m)
15. **Parc du Mercantour** - Lac d'Allos (17.5 km, +807m)
16. **Val de Loire** - Chambord à Blois (18 km, +80m)
17. **Pyrénées** - Gavarnie à Brèche de Roland (22 km, +1442m)
18. **Massif Central** - Meymac à Ussel (19 km, +420m)
19. **Massif de l'Estérel** - Pic de l'Ours (11 km, +492m)
20. **Lac d'Annecy** - Tour complet (40 km, +200m)

## ⚙️ Association aux utilisateurs

**⚠️ IMPORTANT :** Le script `sample-hikes.sql` utilise `auth.uid()` qui peut ne pas fonctionner dans l'éditeur SQL.

**Solution recommandée :** Utilisez le fichier **`sample-hikes-v2.sql`** qui associe automatiquement les randonnées au premier utilisateur trouvé dans votre base de données.

**Alternative - Utiliser votre UUID manuellement :**

1. **Trouver votre UUID utilisateur :**
   - Connectez-vous à votre application RandoTrack dans le navigateur
   - Ouvrez la console (F12)
   - Tapez : `(await supabase.auth.getUser()).data.user.id`
   - Copiez l'UUID affiché

2. **Ou utiliser cette requête SQL dans Supabase :**
   ```sql
   SELECT id, email FROM auth.users;
   ```

3. **Modifier le script :** Remplacez `auth.uid()` par votre UUID dans toutes les lignes INSERT

## 🔄 Réexécuter le script

Si vous souhaitez réinsérer les randonnées :
1. Décommentez la ligne `DELETE FROM hikes...` au début du script pour supprimer les anciennes
2. Ou modifiez les noms des randonnées pour éviter les doublons

## ✅ Vérification

Après l'exécution :
1. Allez dans **Table Editor** > **hikes**
2. Vous devriez voir les 20 nouvelles randonnées
3. Les randonnées apparaîtront dans votre application RandoTrack !

