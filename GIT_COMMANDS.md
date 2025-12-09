# 🚀 Commandes Git pour publier sur GitHub

Ce guide contient toutes les commandes à exécuter dans l'ordre pour publier votre code sur GitHub.

## 📋 Prérequis

### ⚠️ Git n'est pas installé sur votre système

**Étape 1 : Installer Git**

1. Téléchargez Git pour Windows : https://git-scm.com/download/win
2. Installez-le avec les options par défaut
3. **Important** : Après l'installation, fermez et rouvrez PowerShell/Terminal
4. Vérifiez l'installation :
   ```powershell
   git --version
   ```
   Vous devriez voir quelque chose comme : `git version 2.x.x`

**Étape 2 : Configurer Git (une seule fois)**

Après l'installation de Git, configurez votre identité :
```powershell
git config --global user.name "ManuelRoblez83"
git config --global user.email "votre.email@example.com"
```

## ⚙️ Configuration Git (à faire une seule fois si pas déjà fait)

```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

## 📝 Commandes à exécuter dans l'ordre

### 1. Vérifier l'état actuel
```powershell
git status
```

### 2. Vérifier le remote GitHub
```powershell
git remote -v
```

Si le remote n'existe pas ou est incorrect, configurez-le :
```powershell
git remote remove origin
git remote add origin https://github.com/ManuelRoblez83/APPRANDO.git
```

### 3. Ajouter tous les fichiers modifiés
```powershell
git add .
```

### 4. Créer un commit avec un message descriptif
```powershell
git commit -m "feat: Intégration Supabase pour la persistance des données

- Ajout de la configuration Supabase
- Service de gestion des randonnées (CRUD)
- Calcul automatique du dénivelé
- Sélection de points sur la carte
- Interface améliorée avec statistiques détaillées"
```

### 5. Vérifier la branche actuelle
```powershell
git branch
```

### 6. Pousser vers GitHub
Si vous êtes sur la branche `main` :
```powershell
git push -u origin main
```

Si vous êtes sur une autre branche (ex: `master`) :
```powershell
git push -u origin master
```

Ou pour forcer la branche à s'appeler `main` :
```powershell
git branch -M main
git push -u origin main
```

## ✅ Vérification

Après le push :
1. Vérifiez sur GitHub : https://github.com/ManuelRoblez83/APPRANDO
2. Vérifiez le déploiement Vercel (devrait se déclencher automatiquement)

## 🔄 Commandes pour les futurs commits

Pour les prochains commits, vous n'aurez besoin que de :
```powershell
git add .
git commit -m "Votre message de commit"
git push
```

## 📌 Notes importantes

- ⚠️ Le fichier `.env` est dans `.gitignore` et ne sera PAS commité (c'est normal et sécurisé)
- ✅ Vercel doit être configuré avec les variables d'environnement Supabase
- 🔐 Configurez les variables d'environnement dans Vercel : Settings > Environment Variables

## 🐛 En cas de problème

**Erreur : "Updates were rejected"**
```powershell
git pull origin main --rebase
git push
```

**Erreur : "Branch is behind"**
```powershell
git pull origin main
git push
```

**Vider le cache Git (si fichiers ignorés apparaissent)**
```powershell
git rm -r --cached .
git add .
git commit -m "fix: Nettoyage du cache Git"
```

