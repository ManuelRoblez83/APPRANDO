# Correction de Sécurité : Search Path Mutable

## 🔒 Problème Identifié

La fonction `update_updated_at_column()` a un `search_path` mutable, ce qui représente un risque de sécurité (vulnérabilité d'injection SQL potentielle).

**Erreur détectée** : "Function public.update_updated_at_column has a role mutable search_path"

## ✅ Solution

Un script de correction a été créé pour sécuriser la fonction en définissant explicitement le `search_path`.

## 📋 Instructions de Correction

### Étape 1 : Exécuter le Script de Correction

1. Connectez-vous à votre projet Supabase : [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Allez dans **SQL Editor** (dans le menu de gauche)
3. Cliquez sur **"New query"**
4. Copiez-collez le contenu du fichier `supabase/fix-search-path-security.sql`
5. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

### Étape 2 : Vérifier la Correction

1. Allez dans **Database** > **Functions** dans Supabase
2. Recherchez la fonction `update_updated_at_column`
3. Vérifiez que le `search_path` est maintenant défini sur `public`

## 🔍 Ce que fait le Script

Le script :
1. ✅ Supprime l'ancienne fonction (et ses dépendances)
2. ✅ Recrée la fonction avec `SET search_path = public` pour sécuriser l'exécution
3. ✅ Ajoute `SECURITY DEFINER` pour garantir l'exécution avec les bonnes permissions
4. ✅ Recrée tous les triggers qui utilisent cette fonction

## 📝 Changements Apportés

### Avant (Non sécurisé)
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Après (Sécurisé)
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;
```

## 🔐 Pourquoi c'est Important

- **Sécurité** : Empêche les attaques d'injection SQL via manipulation du search_path
- **Conformité** : Respecte les meilleures pratiques de sécurité PostgreSQL
- **Stabilité** : Garantit que la fonction utilise toujours le bon schéma

## ✅ Vérification Post-Correction

Après avoir exécuté le script, vérifiez que :

1. ✅ La fonction existe toujours
2. ✅ Les triggers fonctionnent toujours (testez une mise à jour)
3. ✅ Aucune erreur dans les logs Supabase
4. ✅ L'alerte de sécurité disparaît dans le dashboard Supabase

## 📚 Ressources

- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [Supabase Security Guidelines](https://supabase.com/docs/guides/database/security)

## ⚠️ Important

- Le script est **idempotent** : vous pouvez l'exécuter plusieurs fois sans problème
- Les triggers seront recréés automatiquement
- Aucune perte de données : seules les métadonnées de la fonction sont modifiées

