import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-stone-900 dark:to-stone-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 text-center border border-stone-200 dark:border-stone-700">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
          Oups ! Une erreur est survenue
        </h1>
        
        <p className="text-stone-600 dark:text-stone-400 mb-6">
          Nous sommes désolés, quelque chose s'est mal passé. 
          Ne vous inquiétez pas, vos données sont en sécurité.
        </p>

        {error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 mb-2">
              Détails techniques
            </summary>
            <pre className="mt-2 p-3 bg-stone-50 dark:bg-stone-900 rounded text-xs overflow-auto text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
              {error.toString()}
              {error.stack && (
                <>
                  {'\n\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}

        <div className="flex gap-3">
          <button
            onClick={resetError}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
};
