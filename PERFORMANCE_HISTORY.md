# Historique des Performances

Ce document décrit le système d'historique des performances avec évolution dans le temps et comparaison avec la moyenne communautaire.

## 📋 Fonctionnalités Implémentées

### 1. Historique des Performances
- ✅ Évolution dans le temps (graphiques mensuels)
- ✅ Visualisation de la distance, dénivelé et nombre de randonnées
- ✅ Statistiques globales (totaux, moyennes)
- ✅ Identification du meilleur mois

### 2. Comparaison avec la Communauté
- ✅ Comparaison des moyennes (distance, dénivelé, fréquence)
- ✅ Indicateurs visuels de performance
- ✅ Barres de comparaison
- ✅ Pourcentages de différence

## 🎯 Utilisation

### Accéder à l'historique

1. Cliquez sur votre profil (icône utilisateur en haut à droite)
2. Allez dans l'onglet **"Statistiques"**
3. Faites défiler pour voir :
   - **Historique des Performances** : Graphiques d'évolution mensuelle
   - **Comparaison avec la Communauté** : Vos performances vs la moyenne

### Graphiques d'évolution

Les graphiques affichent l'évolution de vos performances par mois. Vous pouvez basculer entre :
- **Distance** : Distance totale parcourue par mois (en km)
- **Dénivelé** : Dénivelé positif total par mois (en mètres)
- **Nombre** : Nombre de randonnées par mois

### Statistiques affichées

#### Historique des Performances
- Distance totale : Somme de toutes vos randonnées
- Dénivelé total : Somme de tous les dénivelés positifs
- Total randonnées : Nombre total de randonnées
- Moyenne : Distance moyenne par randonnée
- Meilleur mois : Le mois avec la plus grande distance parcourue

#### Comparaison Communautaire
- **Distance par randonnée** : Votre moyenne vs moyenne communautaire
- **Dénivelé par randonnée** : Votre moyenne vs moyenne communautaire
- **Randonnées par mois** : Votre fréquence vs moyenne communautaire
- **Distance par mois** : Votre distance mensuelle vs moyenne communautaire

### Indicateurs de performance

- 🟢 **Vert** : Vous êtes au-dessus de la moyenne
- 🔴 **Rouge** : Vous êtes en dessous de la moyenne
- Le pourcentage indique l'écart par rapport à la moyenne communautaire

## 📊 Calculs

### Historique des Performances

Les données sont groupées par mois (année-mois) et incluent :
- Distance totale du mois
- Dénivelé positif total du mois
- Nombre de randonnées du mois
- Moyennes calculées automatiquement

### Moyennes Communautaires

Les moyennes sont calculées à partir de :
- Toutes les randonnées publiques de la communauté
- Groupement par utilisateur pour éviter les biais
- Calcul des moyennes mensuelles par utilisateur
- Agrégation des moyennes pour obtenir les statistiques globales

## 📁 Structure des Fichiers

### Service
- `services/performanceService.ts` : 
  - `calculatePerformanceHistory()` : Calcule l'historique de l'utilisateur
  - `calculateCommunityAverages()` : Calcule les moyennes communautaires
  - `compareWithCommunity()` : Compare l'utilisateur avec la communauté

### Composants
- `components/PerformanceHistory.tsx` : 
  - Affiche les graphiques d'évolution
  - Statistiques globales
  - Meilleur mois
  
- `components/CommunityComparison.tsx` : 
  - Comparaisons détaillées
  - Barres de progression
  - Résumé global

### Types
Les types sont définis dans `services/performanceService.ts` :
- `PerformanceDataPoint` : Point de données mensuel
- `PerformanceHistory` : Historique complet
- `CommunityAverages` : Moyennes communautaires

## 🎨 Graphiques

Les graphiques sont créés avec SVG natif (pas de dépendances externes) :
- Ligne de tendance
- Points de données
- Grille de référence
- Labels des axes
- Tooltips au survol

## 📝 Notes

- Les données sont calculées en temps réel à partir de vos randonnées
- Seules les randonnées publiques sont utilisées pour les moyennes communautaires
- Les graphiques s'adaptent automatiquement au nombre de mois de données
- Les statistiques sont mises à jour automatiquement lors du chargement

## 🔄 Mise à jour

Les données sont recalculées à chaque ouverture de l'onglet Statistiques. Pour forcer une mise à jour :
1. Fermez et rouvrez l'onglet Statistiques
2. Les données seront recalculées automatiquement

