import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        strictPort: false, // Si le port est occupé, essayer un autre port
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Augmenter la limite d'avertissement pour les chunks volumineux (par défaut: 500 KB)
        chunkSizeWarningLimit: 1000, // 1 MB
        // Optimisation du code splitting
        rollupOptions: {
          output: {
            // Séparer les dépendances vendor dans un chunk séparé
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'supabase-vendor': ['@supabase/supabase-js'],
              'map-vendor': ['leaflet', 'react-leaflet'],
            },
          },
        },
        // Optimiser les assets
        assetsInlineLimit: 4096, // 4 KB - inline les petits assets
        // Source maps pour le debugging (désactivé en production pour réduire la taille)
        sourcemap: false,
      },
    };
});
