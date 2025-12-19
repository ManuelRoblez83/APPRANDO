# Protection contre les Mots de Passe Compromis

Ce guide explique comment activer la protection contre les mots de passe compromis (Leaked Password Protection) dans Supabase Auth.

## 🔒 Problème de Sécurité

**Leaked Password Protection** est actuellement **désactivé** dans votre instance Supabase Auth. Cette fonctionnalité vérifie les nouveaux mots de passe contre la base de données "Have I Been Pwned" pour empêcher l'utilisation de mots de passe qui ont été exposés dans des fuites de données.

### Pourquoi c'est important

- ✅ **Réduit les risques de prise de compte** : Empêche l'utilisation de mots de passe déjà compromis
- ✅ **Protection contre les attaques** : Réduit les attaques de credential stuffing et de réutilisation de mots de passe
- ✅ **Meilleure pratique de sécurité** : Aligné avec les recommandations de sécurité modernes
- ✅ **Faible effort, grand impact** : Configuration simple avec un bénéfice significatif

## 📋 Solution : Activer la Protection

### ⚠️ Prérequis : Plan Supabase

**Important** : Cette fonctionnalité est disponible uniquement sur les plans **Pro** et supérieurs. Si vous êtes sur le plan **Free**, vous devrez passer à un plan payant pour activer cette fonctionnalité.

### Étape 1 : Accéder aux Paramètres d'Authentification

1. Connectez-vous à votre projet Supabase : [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Dans le menu de gauche, allez dans **Authentication** (🔐)
4. Cliquez sur **Settings** (⚙️) (pas "Policies")

### Étape 2 : Activer la Protection contre les Mots de Passe Compromis

1. Dans la page **Settings**, faites défiler jusqu'à la section **"Password Security"**
2. Recherchez l'option **"Prevent leaked passwords"** ou **"Leaked password protection"**
3. Activez le toggle/switch pour cette fonctionnalité
4. La fonctionnalité est automatiquement activée en mode strict (rejet des mots de passe compromis)

### Étape 3 : Vérifier l'Activation

1. Testez avec un mot de passe connu comme compromis (ex: "password123")
2. Vous devriez recevoir une erreur lors de l'inscription ou du changement de mot de passe
3. Le message d'erreur devrait indiquer que le mot de passe a été compromis

## 🔍 Localisation Exacte dans l'Interface Supabase

**Chemin exact** :
```
Authentication → Settings → Password Security → Prevent leaked passwords
```

### Instructions détaillées

1. **Menu de gauche** : Cliquez sur **Authentication** (icône 🔐)
2. **Sous-menu** : Cliquez sur **Settings** (⚙️) - **PAS "Policies"**
3. **Section** : Faites défiler jusqu'à **"Password Security"**
4. **Option** : Trouvez **"Prevent leaked passwords"** ou **"Leaked password protection"**
5. **Activation** : Activez le toggle/switch

### Si vous ne voyez pas l'option

**Causes possibles** :
- ❌ Vous êtes sur le plan **Free** (fonctionnalité disponible uniquement sur Pro+)
- ❌ Votre projet utilise une ancienne version de Supabase
- ❌ L'option est masquée (faites défiler la page complètement)

**Solutions** :
1. Vérifiez votre plan dans **Settings** > **Billing**
2. Si vous êtes sur Free, considérez passer à Pro pour activer cette sécurité
3. Contactez le support Supabase si l'option devrait être visible

## 📝 Configuration Recommandée

### Paramètres Recommandés

- ✅ **Activer** : Leaked Password Protection
- ✅ **Mode** : Strict (rejeter les mots de passe compromis)
- ✅ **Vérification** : À l'inscription ET au changement de mot de passe

### Exemple de Configuration

```json
{
  "password": {
    "leaked_password_protection": {
      "enabled": true,
      "mode": "strict",
      "check_on_signup": true,
      "check_on_password_change": true
    }
  }
}
```

## 🧪 Test de la Protection

### Test 1 : Mot de passe compromis

1. Essayez de créer un compte avec un mot de passe connu comme compromis :
   - `password123`
   - `12345678`
   - `qwerty`
   - `admin123`

2. **Résultat attendu** : Erreur indiquant que le mot de passe a été compromis

### Test 2 : Mot de passe sécurisé

1. Créez un compte avec un mot de passe fort et unique :
   - Au moins 12 caractères
   - Mélange de majuscules, minuscules, chiffres et symboles
   - Exemple : `MyS3cur3P@ssw0rd!2024`

2. **Résultat attendu** : Inscription réussie

## 🔄 Impact sur les Utilisateurs Existants

### Comportement

- ✅ **Nouveaux utilisateurs** : Les mots de passe compromis seront rejetés
- ✅ **Changement de mot de passe** : Les nouveaux mots de passe seront vérifiés
- ⚠️ **Mots de passe existants** : Ne sont PAS vérifiés (seulement les nouveaux)

### Message d'Erreur pour l'Utilisateur

Quand un utilisateur essaie d'utiliser un mot de passe compromis, il verra un message comme :

```
"Ce mot de passe a été compromis dans une fuite de données. 
Veuillez choisir un mot de passe plus sécurisé."
```

## 🛠️ Intégration dans le Code (Optionnel)

Si vous souhaitez personnaliser les messages d'erreur, vous pouvez intercepter l'erreur dans `services/authService.ts` :

```typescript
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Vérifier si c'est une erreur de mot de passe compromis
      if (error.message.includes('compromised') || 
          error.message.includes('breach') ||
          error.message.includes('pwned')) {
        throw new Error(
          'Ce mot de passe a été compromis dans une fuite de données. ' +
          'Veuillez choisir un mot de passe plus sécurisé et unique.'
        );
      }
      throw error;
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Erreur lors de l\'inscription' };
  }
};
```

## 📚 Ressources

- [Documentation Supabase Auth - Password Policies](https://supabase.com/docs/guides/auth/password-security)
- [Have I Been Pwned](https://haveibeenpwned.com/) - Base de données des fuites de données
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## ✅ Checklist de Sécurité

- [ ] Protection contre les mots de passe compromis activée
- [ ] Mode strict activé (rejet automatique)
- [ ] Vérification à l'inscription activée
- [ ] Vérification au changement de mot de passe activée
- [ ] Tests effectués avec des mots de passe compromis
- [ ] Messages d'erreur clairs pour les utilisateurs

## 🚨 Important

⚠️ **Note** : Cette fonctionnalité nécessite une connexion Internet pour vérifier les mots de passe contre la base de données Have I Been Pwned. Assurez-vous que votre instance Supabase a accès à Internet.

## 📞 Support et Dépannage

### Si vous ne trouvez pas l'option "Prevent leaked passwords"

**Vérifications à faire** :

1. ✅ **Vérifiez votre plan** :
   - Allez dans **Settings** > **Billing**
   - Cette fonctionnalité nécessite un plan **Pro** ou supérieur
   - Si vous êtes sur **Free**, vous devrez mettre à niveau

2. ✅ **Vérifiez l'emplacement** :
   - **Authentication** → **Settings** (pas "Policies")
   - Section **"Password Security"** (faites défiler)
   - Option **"Prevent leaked passwords"**

3. ✅ **Vérifiez la version** :
   - Assurez-vous d'utiliser la dernière version de Supabase
   - Certaines fonctionnalités peuvent ne pas être disponibles sur les anciennes instances

### Alternative : Validation côté client (si plan Free)

Si vous êtes sur le plan Free et ne pouvez pas activer cette fonctionnalité, vous pouvez implémenter une validation côté client en utilisant l'API Have I Been Pwned directement. Cependant, cela nécessite une implémentation personnalisée.

### Ressources

- [Documentation Supabase - Password Security](https://supabase.com/docs/guides/auth/password-security)
- [Supabase Pricing](https://supabase.com/pricing)
- [Support Supabase](https://supabase.com/support)
