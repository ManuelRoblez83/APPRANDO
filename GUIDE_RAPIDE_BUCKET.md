# 🚀 Guide Rapide : Créer le Bucket hikes-photos

## ⚠️ Message d'erreur actuel
```
Bucket "hikes-photos" not found. Veuillez créer le bucket dans Supabase Storage.
```

**Bonne nouvelle** : Votre randonnée est sauvegardée ! Seules les photos ne peuvent pas être uploadées pour le moment.

## ✅ Solution en 2 étapes (5 minutes)

### Étape 1 : Créer le bucket (2 minutes)

1. **Connectez-vous à Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans "Storage"** (menu de gauche)
4. **Cliquez sur "New bucket"** (bouton en haut à droite)
5. **Remplissez le formulaire** :
   - **Name** : `hikes-photos` ⚠️ **Exactement ce nom, sans espaces ni majuscules**
   - **Public bucket** : ✅ **COCHEZ cette case** (très important !)
6. **Cliquez sur "Create bucket"**

### Étape 2 : Configurer les permissions (3 minutes)

1. **Allez dans "SQL Editor"** (menu de gauche dans Supabase)
2. **Cliquez sur "New query"**
3. **Copiez-collez TOUT le contenu** du fichier `supabase/hikes-photos-storage.sql`
4. **Cliquez sur "Run"** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

## ✅ Vérification

Après ces étapes, vous devriez voir dans **Storage > Policies** :
- ✅ "Hike photos are publicly accessible" (SELECT)
- ✅ "Users can upload their own hike photos" (INSERT)
- ✅ "Users can update their own hike photos" (UPDATE)
- ✅ "Users can delete their own hike photos" (DELETE)

## 🎉 C'est tout !

Une fois configuré, vous pourrez :
- ✅ Uploader des photos lors de la création/modification de randonnées
- ✅ Voir les photos dans la liste des randonnées
- ✅ Supprimer des photos

## 📝 Note importante

**Même sans le bucket**, votre application fonctionne normalement :
- ✅ Création et modification de randonnées
- ✅ Calcul d'itinéraires
- ✅ Affichage sur la carte
- ✅ Toutes les autres fonctionnalités

Seule l'upload de photos est désactivée jusqu'à la configuration du bucket.
