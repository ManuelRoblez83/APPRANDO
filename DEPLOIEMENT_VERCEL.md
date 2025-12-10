# 🚀 Configuration Vercel pour le déploiement automatique

Ce guide vous aide à configurer Vercel pour que votre application se déploie automatiquement à chaque push sur GitHub.

## 📋 Prérequis

1. ✅ Compte GitHub avec le repo : https://github.com/ManuelRoblez83/APPRANDO.git
2. ✅ Compte Vercel (créez-en un sur https://vercel.com si nécessaire)

## 🔧 Configuration Vercel

### Étape 1 : Connecter Vercel à GitHub

1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"Add New Project"** ou **"Import Project"**
4. Sélectionnez le repo **APPRANDO**

### Étape 2 : Configuration du projet

**Settings importants :**
- **Framework Preset** : Vite
- **Root Directory** : `./` (par défaut)
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

### Étape 3 : Variables d'environnement (CRUCIAL ⚠️)

1. Dans les paramètres du projet Vercel, allez dans **Settings** > **Environment Variables**
2. Ajoutez les variables suivantes :

```
VITE_SUPABASE_URL = https://khulgddhqmrekyuqrqci.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodWxnZGRocW1yZWt5dXFycWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzUxMjksImV4cCI6MjA4MDg1MTEyOX0.O1662WgL4qTvRooTRRbJ_2v6t-642MAxfnctOLe9DyU
```

3. Sélectionnez tous les environnements : **Production**, **Preview**, et **Development**
4. Cliquez sur **Save**

### Étape 4 : Activer le déploiement automatique

1. Allez dans **Settings** > **Git**
2. Vérifiez que **"Automatically deploy on push"** est activé
3. Sélectionnez la branche **main** (ou **master** selon votre configuration)

## ✅ Vérification

Après avoir poussé votre code sur GitHub :
1. Vercel détectera automatiquement le push
2. Un build commencera automatiquement
3. Vous recevrez une notification une fois le déploiement terminé
4. Votre site sera accessible sur l'URL fournie par Vercel

## 🔍 Troubleshooting

### Le build échoue
- Vérifiez que les variables d'environnement sont bien configurées
- Vérifiez les logs de build dans Vercel Dashboard
- Assurez-vous que `package.json` contient bien le script `build`

### Les variables d'environnement ne fonctionnent pas
- Vérifiez que les noms commencent par `VITE_`
- Redéployez manuellement après avoir ajouté les variables
- Vérifiez que vous avez sélectionné tous les environnements

### Le site fonctionne mais Supabase ne se connecte pas
- Vérifiez les variables d'environnement dans Vercel
- Vérifiez que la table `hikes` existe dans Supabase
- Vérifiez les logs du navigateur (Console) pour les erreurs

## 📝 Commandes utiles

**Déployer manuellement depuis Vercel CLI** (optionnel) :
```bash
npm install -g vercel
vercel login
vercel
```

## 🔗 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)





