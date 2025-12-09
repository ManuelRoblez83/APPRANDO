# RandoTrack 🏔️

RandoTrack est une application web moderne pour planifier et enregistrer vos randonnées. Elle permet de visualiser des itinéraires pédestres précis sur une carte interactive et de conserver un historique de vos aventures avec toutes les statistiques.

## ✨ Fonctionnalités

*   **Planification intelligente** : Saisissez un point de départ et d'arrivée avec autocomplétion d'adresses
*   **Sélection sur carte** : Choisissez vos points directement en cliquant sur la carte
*   **Visualisation précise** : Carte interactive (OpenStreetMap / Leaflet) affichant l'itinéraire pédestre détaillé
*   **Géocodage** : Conversion automatique des adresses en coordonnées GPS via l'API Nominatim
*   **Calcul automatique** : Distance, durée et dénivelé calculés automatiquement
*   **Statistiques détaillées** : Dénivelé positif/négatif, altitude min/max pour chaque randonnée
*   **Historique persistant** : Liste visuelle de vos randonnées sauvegardées dans Supabase
*   **Édition** : Modifiez et supprimez vos randonnées enregistrées
*   **Interface moderne** : Design élégant et responsive avec Tailwind CSS

## 🛠️ Technologies utilisées

*   React 19
*   TypeScript
*   Vite
*   Tailwind CSS
*   Leaflet & React-Leaflet (cartes interactives)
*   Supabase (base de données)
*   OpenStreetMap Nominatim (géocodage)
*   OSRM (routage pédestre)
*   OpenElevation (profil d'élévation)
*   Lucide React (Icônes)

## 📦 Installation et Lancement

1.  **Installer les dépendances** :
    ```bash
    npm install
    ```

2.  **Configurer Supabase** :
    - Créez un fichier `.env` à la racine
    - Ajoutez vos clés Supabase (voir `SUPABASE_SETUP.md`)
    - Exécutez le script SQL dans `supabase/schema.sql`

3.  **Lancer le projet** :
    ```bash
    npm run dev
    ```

4.  Ouvrir le navigateur sur l'adresse indiquée (généralement `http://localhost:3000`).

## 🚀 Déploiement

L'application est configurée pour se déployer automatiquement sur Vercel lors d'un push sur GitHub.

Pour déployer manuellement :
```bash
vercel
```

## 📚 Configuration Supabase

Consultez le fichier `SUPABASE_SETUP.md` pour les instructions complètes de configuration de la base de données.

## Licence

MIT
