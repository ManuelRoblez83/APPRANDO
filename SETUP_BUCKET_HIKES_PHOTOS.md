# Configuration du Bucket hikes-photos dans Supabase

## ⚠️ Erreur : "Bucket not found"

Si vous voyez l'erreur **"Bucket not found"** lors de l'upload de photos, cela signifie que le bucket `hikes-photos` n'a pas été créé dans Supabase Storage.

## 📋 Solution : Créer le bucket

### Étape 1 : Créer le bucket dans Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans **Storage** (dans le menu de gauche)
3. Cliquez sur **"New bucket"**
4. Configurez le bucket :
   - **Name** : `hikes-photos` (exactement ce nom, sans espaces)
   - **Public bucket** : ✅ **Cocher cette case** (important pour que les photos soient accessibles)
5. Cliquez sur **"Create bucket"**

### Étape 2 : Configurer les politiques de sécurité

1. Dans l'éditeur SQL de Supabase, allez dans **SQL Editor**
2. Cliquez sur **"New query"**
3. Copiez-collez le contenu du fichier `supabase/hikes-photos-storage.sql`
4. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)

### Étape 3 : Vérifier la configuration

1. Allez dans **Storage** > **Policies**
2. Vous devriez voir les 4 politiques créées pour le bucket `hikes-photos` :
   - "Hike photos are publicly accessible" (SELECT)
   - "Users can upload their own hike photos" (INSERT)
   - "Users can update their own hike photos" (UPDATE)
   - "Users can delete their own hike photos" (DELETE)

## ✅ Après la configuration

Une fois le bucket créé et configuré :
- Les photos pourront être uploadées sans erreur
- La randonnée sera sauvegardée même si l'upload de photos échoue (fonctionnalité de secours)
- Les photos seront accessibles publiquement via leurs URLs

## 📝 Note importante

**Même si le bucket n'est pas configuré**, vous pouvez toujours :
- ✅ Créer et modifier des randonnées
- ✅ Sauvegarder toutes les autres informations
- ❌ Seule l'upload de photos ne fonctionnera pas

L'application continuera de fonctionner normalement, seule la fonctionnalité de photos sera désactivée jusqu'à la configuration du bucket.
