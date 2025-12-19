# 🔧 Dépannage des Erreurs de Déploiement Vercel

Ce guide vous aide à identifier et résoudre les erreurs courantes lors du déploiement sur Vercel.

## 🔍 Identifier l'Erreur

### Étape 1 : Consulter les Logs de Build

1. Allez sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans l'onglet **Deployments**
4. Cliquez sur le dernier déploiement (celui qui a échoué)
5. Consultez les **Build Logs** pour voir l'erreur exacte

### Erreurs Courantes et Solutions

## ❌ Erreur 1 : "Build Command Failed"

### Symptômes
```
Error: Build command failed
Exit code: 1
```

### Solutions

#### Solution A : Vérifier les scripts dans package.json
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

#### Solution B : Vérifier que toutes les dépendances sont installées
Le fichier `package.json` doit contenir toutes les dépendances nécessaires.

#### Solution C : Vérifier les erreurs TypeScript
Si vous avez des erreurs TypeScript, corrigez-les avant de déployer :
```bash
npm run build
```

## ❌ Erreur 2 : "Module not found" ou "Cannot find module"

### Symptômes
```
Error: Cannot find module 'xxx'
Module not found: Can't resolve 'xxx'
```

### Solutions

#### Solution A : Vérifier les imports
Assurez-vous que tous les imports sont corrects :
```typescript
// ✅ Correct
import { Component } from './components/Component';

// ❌ Incorrect (chemin relatif manquant)
import { Component } from 'Component';
```

#### Solution B : Vérifier les alias de chemins
Si vous utilisez des alias (`@/`), vérifiez `tsconfig.json` et `vite.config.ts`.

## ❌ Erreur 3 : "Environment Variables Missing"

### Symptômes
```
Error: Variables d'environnement Supabase manquantes
VITE_SUPABASE_URL is not defined
```

### Solutions

1. **Vérifier dans Vercel Dashboard** :
   - Settings > Environment Variables
   - Vérifier que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont présentes
   - Vérifier qu'elles sont activées pour **Production**, **Preview**, et **Development**

2. **Redéployer après ajout des variables** :
   - Les variables ne sont pas appliquées aux builds en cours
   - Vous devez redéployer après avoir ajouté les variables

## ❌ Erreur 4 : "TypeScript Errors"

### Symptômes
```
error TS2307: Cannot find module 'xxx'
error TS2339: Property 'xxx' does not exist
```

### Solutions

#### Solution A : Vérifier localement
```bash
npm run build
```
Corrigez toutes les erreurs TypeScript avant de déployer.

#### Solution B : Vérifier tsconfig.json
Assurez-vous que `tsconfig.json` est correctement configuré.

## ❌ Erreur 5 : "Build Output Not Found"

### Symptômes
```
Error: No Output Directory named 'dist' found after the Build completed
```

### Solutions

#### Solution A : Vérifier vercel.json
Le fichier `vercel.json` doit spécifier le bon répertoire de sortie :
```json
{
  "outputDirectory": "dist"
}
```

#### Solution B : Vérifier vite.config.ts
Vérifiez que Vite génère bien les fichiers dans `dist/`.

## ❌ Erreur 6 : "Out of Memory" ou "Build Timeout"

### Symptômes
```
Error: Build exceeded maximum time limit
Error: JavaScript heap out of memory
```

### Solutions

#### Solution A : Optimiser le build
- Réduire la taille des dépendances
- Utiliser le code splitting
- Vérifier qu'il n'y a pas de dépendances inutiles

#### Solution B : Augmenter le timeout (si possible)
Dans Vercel, certains plans permettent d'augmenter le timeout.

## ⚠️ Avertissement : "Chunk Size Warning"

### Symptômes
```
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

### Solutions

#### Solution A : Augmenter la limite d'avertissement
Dans `vite.config.ts`, ajoutez :
```typescript
build: {
  chunkSizeWarningLimit: 1000, // 1 MB (par défaut: 500 KB)
}
```

#### Solution B : Optimiser avec code splitting
Séparez les dépendances volumineuses :
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'supabase-vendor': ['@supabase/supabase-js'],
        'map-vendor': ['leaflet', 'react-leaflet'],
      },
    },
  },
}
```

**Note** : Cet avertissement n'empêche pas le déploiement, mais il est recommandé d'optimiser pour de meilleures performances.

## ❌ Erreur 7 : "React/ReactDOM Version Mismatch"

### Symptômes
```
Error: Invalid hook call
Error: React version mismatch
```

### Solutions

#### Solution A : Vérifier les versions dans package.json
Toutes les dépendances React doivent avoir la même version :
```json
{
  "dependencies": {
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  }
}
```

#### Solution B : Nettoyer et réinstaller
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Checklist de Vérification

Avant de déployer, vérifiez :

- [ ] ✅ `package.json` contient le script `build`
- [ ] ✅ `vercel.json` est correctement configuré
- [ ] ✅ Toutes les variables d'environnement sont configurées dans Vercel
- [ ] ✅ Le build fonctionne localement : `npm run build`
- [ ] ✅ Aucune erreur TypeScript : `npm run build`
- [ ] ✅ Tous les imports sont corrects
- [ ] ✅ Les versions de React sont cohérentes
- [ ] ✅ Le fichier `index.html` existe et est correct

## 🚀 Commandes de Diagnostic

### Tester le build localement
```bash
npm run build
```

### Vérifier les erreurs TypeScript
```bash
npx tsc --noEmit
```

### Vérifier les dépendances
```bash
npm install
npm audit
```

### Nettoyer et reconstruire
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📝 Fichiers de Configuration Importants

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### package.json
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### vite.config.ts
Doit être correctement configuré pour Vite.

## 🆘 Si Rien Ne Fonctionne

1. **Consultez les logs complets** dans Vercel Dashboard
2. **Copiez l'erreur exacte** et recherchez-la sur Google
3. **Vérifiez la documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
4. **Contactez le support Vercel** si nécessaire

## 📞 Support

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Support](https://vercel.com/support)
