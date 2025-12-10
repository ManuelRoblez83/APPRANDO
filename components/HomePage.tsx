import React from 'react';
import { Mountain, ArrowRight, Trees, Compass, Footprints } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HomePageProps {
  onEnterApp: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onEnterApp }) => {
  const quotes = [
    {
      text: "La randonnée, c'est partir à la rencontre de soi-même en se perdant dans la nature.",
      icon: Trees,
    },
    {
      text: "Chaque sentier raconte une histoire, chaque sommet offre une nouvelle perspective.",
      icon: Mountain,
    },
    {
      text: "En plein air, nous retrouvons notre rythme naturel et notre connexion à la terre.",
      icon: Footprints,
    },
    {
      text: "L'aventure commence là où l'asphalte se termine et où le sentier commence.",
      icon: Compass,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-100 dark:from-stone-900 dark:via-stone-800 dark:to-emerald-900 flex flex-col transition-colors">
      {/* Header avec le titre */}
      <header className="px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="w-10 h-10 text-emerald-700 dark:text-emerald-400" />
            <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">RandoTrack</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full space-y-12">
          {/* Titre principal */}
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-stone-800 dark:text-stone-100 leading-tight">
              L'aventure vous attend
            </h2>
            <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-300 font-light">
              Planifiez vos randonnées et vivez pleinement chaque balade en plein air
            </p>
          </div>

          {/* Citations inspirantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            {quotes.map((quote, index) => {
              const Icon = quote.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-stone-200 dark:border-stone-700 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-stone-700 dark:text-stone-200 text-lg leading-relaxed italic">
                      "{quote.text}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bouton d'entrée */}
          <div className="text-center pt-8">
            <button
              onClick={onEnterApp}
              className="group inline-flex items-center gap-3 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Commencer l'aventure</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Section informative discrète */}
          <div className="pt-8 text-center">
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Créez votre itinéraire • Suivez votre progression • Partagez vos découvertes
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimaliste */}
      <footer className="px-6 py-6 border-t border-stone-200/50 dark:border-stone-700/50">
        <div className="max-w-7xl mx-auto text-center text-stone-500 dark:text-stone-400 text-sm">
          <p>RandoTrack - Votre compagnon de randonnée</p>
        </div>
      </footer>
    </div>
  );
};

