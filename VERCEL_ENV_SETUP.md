# ⚙️ Configuration des Variables d'Environnement sur Vercel

## 🚨 IMPORTANT : Variables d'environnement requises

Votre application nécessite ces variables d'environnement pour fonctionner correctement sur Vercel.

## 📝 Étapes de configuration

### 1. Aller dans Vercel Dashboard

1. Connectez-vous sur [https://vercel.com](https://vercel.com)
2. Sélectionnez votre projet **APPRANDO**
3. Allez dans **Settings** (Paramètres)
4. Cliquez sur **Environment Variables** (Variables d'environnement)

### 2. Ajouter les variables

Ajoutez ces **deux variables** exactement comme indiqué :

#### Variable 1 :
- **Name (Nom)** : `VITE_SUPABASE_URL`
- **Value (Valeur)** : `https://khulgddhqmrekyuqrqci.supabase.co`
- **Environments** : Cochez toutes les cases :
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### Variable 2 :
- **Name (Nom)** : `VITE_SUPABASE_ANON_KEY`
- **Value (Valeur)** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodWxnZGRocW1yZWt5dXFycWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzUxMjksImV4cCI6MjA4MDg1MTEyOX0.O1662WgL4qTvRooTRRbJ_2v6t-642MAxfnctOLe9DyU`
- **Environments** : Cochez toutes les cases :
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### 3. Sauvegarder

1. Cliquez sur **Save** (Enregistrer) pour chaque variable
2. Vérifiez que les deux variables apparaissent dans la liste

### 4. Redéployer

⚠️ **IMPORTANT** : Après avoir ajouté les variables d'environnement, vous DEVEZ redéployer votre application :

**Option A : Redéploiement automatique**
- Faites un nouveau commit et push sur GitHub
- Vercel redéploiera automatiquement avec les nouvelles variables

**Option B : Redéploiement manuel**
1. Dans Vercel Dashboard, allez dans l'onglet **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Confirmez le redéploiement

## ✅ Vérification

Après le redéploiement :
1. Vérifiez que le site fonctionne sans erreur dans la console
2. L'erreur "Variables d'environnement Supabase manquantes" ne devrait plus apparaître
3. Testez l'ajout d'une randonnée pour vérifier la connexion à Supabase

## 🔍 Dépannage

### Le site affiche toujours l'erreur après le redéploiement

1. Vérifiez que les noms des variables commencent bien par `VITE_`
2. Vérifiez que vous avez sélectionné tous les environnements (Production, Preview, Development)
3. Vérifiez que vous avez bien cliqué sur **Save** pour chaque variable
4. Attendez quelques minutes et rafraîchissez le site

### Comment vérifier les variables dans Vercel

1. Allez dans **Settings** > **Environment Variables**
2. Vérifiez que les variables sont listées
3. Les valeurs sont masquées par sécurité, mais les noms doivent être visibles

## 📚 Ressources

- [Documentation Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentation Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)





