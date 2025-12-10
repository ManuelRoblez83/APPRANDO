# Guide de Déploiement sur Vercel via GitHub

Ce guide explique comment mettre à jour votre application RandoTrack sur Vercel en utilisant Git et GitHub.

## 📋 Prérequis

- ✅ Compte GitHub créé et configuré
- ✅ Dépôt GitHub créé : https://github.com/ManuelRoblez83/APPRANDO.git
- ✅ Vercel connecté à votre dépôt GitHub (déploiement automatique activé)

## 🚀 Processus de Déploiement

### Étape 1 : Vérifier les fichiers modifiés

Vérifiez quels fichiers ont été modifiés ou ajoutés :

```bash
git status
```

### Étape 2 : Ajouter tous les fichiers modifiés

Ajoutez tous les fichiers modifiés à la zone de staging :

```bash
git add .
```

Ou pour ajouter tous les fichiers (y compris les nouveaux) :

```bash
git add -A
```

### Étape 3 : Créer un commit

Créez un commit avec un message descriptif :

```bash
git commit -m "Ajout de l'authentification et du système de partage social"
```

**Exemples de messages de commit :**
- `"Ajout authentification utilisateur"`
- `"Système de partage sur réseaux sociaux"`
- `"Correction erreur Tailwind CSS"`
- `"Mise à jour schéma Supabase"`

### Étape 4 : Envoyer sur GitHub

Poussez vos modifications sur GitHub :

```bash
git push origin main
```

Si c'est votre premier push ou si vous avez changé de branche :

```bash
git push -u origin main
```

### Étape 5 : Vérifier le déploiement sur Vercel

1. **Vercel détecte automatiquement** le push sur GitHub
2. Le déploiement commence automatiquement (vous recevrez une notification si configurée)
3. Allez sur votre **tableau de bord Vercel** pour suivre le déploiement
4. Une fois terminé, votre application sera mise à jour avec les dernières modifications

## 📝 Commandes Complètes (Copier-Coller)

Pour un déploiement rapide, exécutez ces commandes dans l'ordre :

```bash
# 1. Vérifier l'état
git status

# 2. Ajouter tous les fichiers
git add -A

# 3. Créer un commit
git commit -m "Description de vos modifications"

# 4. Envoyer sur GitHub
git push origin main
```

## 🔄 Workflow Recommandé

Pour chaque modification importante :

1. **Tester localement** avec `npm run dev`
2. **Vérifier** qu'il n'y a pas d'erreurs
3. **Commit** avec un message clair
4. **Push** sur GitHub
5. **Vérifier** le déploiement sur Vercel

## ⚠️ Variables d'Environnement sur Vercel

**Important** : Si vous ajoutez de nouvelles variables d'environnement (comme les clés Supabase), vous devez les ajouter dans Vercel :

1. Allez sur votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Cliquez sur **Redeploy** pour appliquer les changements

## 🐛 Résolution de Problèmes

### Erreur : "Your branch is ahead of 'origin/main'"

Solution : Poussez vos commits :
```bash
git push origin main
```

### Erreur : "Please tell me who you are"

Configuration Git :
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"
```

### Erreur : "Permission denied"

Vérifiez que vous êtes authentifié sur GitHub :
```bash
git remote -v
```

### Le déploiement Vercel échoue

1. Vérifiez les logs dans le tableau de bord Vercel
2. Assurez-vous que toutes les variables d'environnement sont configurées
3. Vérifiez que `package.json` contient le script `build`

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Git](https://git-scm.com/doc)
- [Guide GitHub](https://guides.github.com/)

---

**Note** : Avec Vercel, chaque push sur `main` déclenche automatiquement un nouveau déploiement. C'est la méthode la plus simple pour mettre à jour votre application en production ! 🚀





