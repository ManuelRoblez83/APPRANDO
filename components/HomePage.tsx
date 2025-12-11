import React, { useEffect, useState } from 'react';
import { Mountain, ArrowRight, Trees, Compass, Footprints, MapPin, Route, BarChart3, Share2, Sparkles, Menu, X, UserPlus, CheckCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AuthButton } from './AuthButton';

interface HomePageProps {
  onEnterApp: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onEnterApp }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Détecter le scroll pour ajuster l'opacité du header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gestion du scroll pour détecter la section active
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['accueil', 'a-propos', 'fonctionnalites', 'citations', 'commencer'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const header = document.querySelector('header');
    if (element && header) {
      // Calculer la hauteur réelle du header
      const headerHeight = header.offsetHeight + 20; // +20 pour un peu d'espace
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - headerHeight);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

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

  const features = [
    {
      icon: MapPin,
      title: "Itinéraires précis",
      description: "Calcul d'itinéraires pédestres détaillés",
      color: "emerald"
    },
    {
      icon: Route,
      title: "Planification facile",
      description: "Créez et gérez vos randonnées en quelques clics",
      color: "blue"
    },
    {
      icon: BarChart3,
      title: "Statistiques détaillées",
      description: "Distance, durée, dénivelé et bien plus",
      color: "purple"
    },
    {
      icon: Share2,
      title: "Partagez vos aventures",
      description: "Partagez vos randonnées avec vos proches",
      color: "orange"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-100 dark:from-stone-900 dark:via-stone-800 dark:to-emerald-900 flex flex-col transition-colors duration-500 relative overflow-hidden">
      {/* Éléments décoratifs animés en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 dark:bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/10 dark:bg-purple-700/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header avec navigation */}
      <header className={`sticky top-0 z-[100] transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl shadow-lg' 
          : 'bg-white/30 dark:bg-stone-900/30 backdrop-blur-md'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('accueil')}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <Mountain className="w-10 h-10 text-emerald-700 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-300 tracking-tight">RandoTrack</h1>
            </button>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => scrollToSection('accueil')}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeSection === 'accueil'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Accueil
              </button>
              <button
                onClick={() => scrollToSection('a-propos')}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeSection === 'a-propos'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                À propos
              </button>
              <button
                onClick={() => scrollToSection('fonctionnalites')}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeSection === 'fonctionnalites'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection('citations')}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeSection === 'citations'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Inspiration
              </button>
              <button
                onClick={() => scrollToSection('commencer')}
                className="ml-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-2xl text-sm font-medium transition-all duration-200 hover:shadow-md"
              >
                Commencer
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {/* Menu Mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-2xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Menu Mobile */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
              <button
                onClick={() => scrollToSection('accueil')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeSection === 'accueil'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Accueil
              </button>
              <button
                onClick={() => scrollToSection('a-propos')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeSection === 'a-propos'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                À propos
              </button>
              <button
                onClick={() => scrollToSection('fonctionnalites')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeSection === 'fonctionnalites'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection('citations')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  activeSection === 'citations'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                Inspiration
              </button>
              <button
                onClick={() => scrollToSection('commencer')}
                className="w-full text-left px-4 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-2xl text-sm font-medium transition-all duration-200"
              >
                Commencer l'aventure
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-6xl w-full space-y-16">
          {/* Hero Section */}
          <div id="accueil" className={`text-center space-y-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} scroll-mt-32`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/80 dark:bg-emerald-900/30 backdrop-blur-sm rounded-full border border-emerald-200/50 dark:border-emerald-800/50 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Votre compagnon de randonnée</span>
            </div>
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-stone-800 dark:text-stone-100 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-400 bg-clip-text text-transparent animate-gradient inline-block">
                L'aventure
              </span>
              <br />
              <span className="bg-gradient-to-r from-stone-700 via-stone-600 to-stone-500 dark:from-stone-300 via-stone-200 dark:to-stone-100 bg-clip-text text-transparent inline-block">
                vous attend
              </span>
            </h2>
            
            {/* Description de l'application */}
            <div id="a-propos" className="max-w-4xl mx-auto space-y-6 scroll-mt-32">
              <p className="text-xl md:text-2xl text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                Planifiez vos randonnées et vivez pleinement chaque balade en plein air
              </p>
              
              <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-stone-200/50 dark:border-stone-700/50 shadow-xl mt-8">
                <div className="space-y-6 text-left">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-3">
                      <Mountain className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      Qu'est-ce que RandoTrack ?
                    </h3>
                    <p className="text-stone-700 dark:text-stone-200 text-lg leading-relaxed">
                      <strong className="text-emerald-700 dark:text-emerald-400">RandoTrack</strong> est une application web moderne conçue pour les passionnés de randonnée. 
                      Créez, planifiez et gérez vos itinéraires pédestres avec précision, en obtenant des informations détaillées 
                      sur la distance, la durée, le dénivelé et bien plus encore.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-stone-200 dark:border-stone-700">
                    <div className="space-y-3">
                      <h4 className="font-bold text-stone-800 dark:text-stone-200 text-lg flex items-center gap-2">
                        <Route className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Planification intelligente
                      </h4>
                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        Entrez simplement votre point de départ et d'arrivée. Notre système calcule automatiquement 
                        l'itinéraire pédestre optimal, en utilisant uniquement les sentiers et chemins accessibles à pied.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-bold text-stone-800 dark:text-stone-200 text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Statistiques complètes
                      </h4>
                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        Obtenez des informations précises sur votre randonnée : distance totale, durée estimée, 
                        dénivelé positif et négatif, altitude minimale et maximale.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-bold text-stone-800 dark:text-stone-200 text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Visualisation interactive
                      </h4>
                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        Visualisez votre itinéraire sur une carte interactive avec tous les détails. 
                        Choisissez vos points de départ et d'arrivée directement sur la carte pour une expérience intuitive.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-bold text-stone-800 dark:text-stone-200 text-lg flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Sauvegarde et partage
                      </h4>
                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        Enregistrez vos randonnées favorites et partagez-les facilement avec vos proches. 
                        Gardez une trace de toutes vos aventures en un seul endroit.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                    <p className="text-stone-600 dark:text-stone-400 italic text-center">
                      "Que vous soyez randonneur débutant ou expérimenté, RandoTrack vous accompagne dans toutes vos aventures en plein air."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section des fonctionnalités */}
          <div id="fonctionnalites" className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} scroll-mt-32`}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const getColorClasses = (color: string) => {
                switch(color) {
                  case 'emerald':
                    return {
                      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
                      text: 'text-emerald-600 dark:text-emerald-400'
                    };
                  case 'blue':
                    return {
                      bg: 'bg-blue-100 dark:bg-blue-900/30',
                      text: 'text-blue-600 dark:text-blue-400'
                    };
                  case 'purple':
                    return {
                      bg: 'bg-purple-100 dark:bg-purple-900/30',
                      text: 'text-purple-600 dark:text-purple-400'
                    };
                  case 'orange':
                    return {
                      bg: 'bg-orange-100 dark:bg-orange-900/30',
                      text: 'text-orange-600 dark:text-orange-400'
                    };
                  default:
                    return {
                      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
                      text: 'text-emerald-600 dark:text-emerald-400'
                    };
                }
              };
              const colors = getColorClasses(feature.color);
              return (
                <div
                  key={index}
                  className="group relative bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-stone-200/50 dark:border-stone-700/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className="font-bold text-stone-800 dark:text-stone-200 mb-2 text-sm">{feature.title}</h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Citations inspirantes */}
          <div id="citations" className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} scroll-mt-32`}>
            {quotes.map((quote, index) => {
              const Icon = quote.icon;
              return (
                <div
                  key={index}
                  className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-stone-200/50 dark:border-stone-700/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group cursor-default"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/30 transition-colors">
                        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
                      </div>
                    </div>
                    <p className="text-stone-700 dark:text-stone-200 text-lg leading-relaxed italic">
                      "{quote.text}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bouton d'entrée amélioré */}
          <div id="commencer" className={`text-center transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} scroll-mt-32`}>
            <button
              onClick={onEnterApp}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 text-white font-bold text-lg px-12 py-5 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden border-2 border-emerald-500/20 hover:border-emerald-400/40"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>Commencer l'aventure</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <p className="mt-4 text-stone-500 dark:text-stone-400 text-sm flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Créez votre itinéraire
              </span>
              <span>•</span>
              <span>Suivez votre progression</span>
              <span>•</span>
              <span>Partagez vos découvertes</span>
            </p>
          </div>
        </div>
      </main>

      {/* Section Call-to-Action pour s'inscrire */}
      <section className={`relative z-10 px-6 py-16 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-500/20 relative overflow-hidden">
            {/* Éléments décoratifs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Prêt à commencer votre aventure ?
              </h2>
              
              <p className="text-lg text-emerald-50 max-w-2xl mx-auto leading-relaxed">
                Rejoignez RandoTrack dès aujourd'hui et commencez à planifier vos randonnées en quelques clics. 
                C'est gratuit et sans engagement !
              </p>

              <div className="grid md:grid-cols-3 gap-4 my-8">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <CheckCircle className="w-5 h-5 text-emerald-200 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">Gratuit</p>
                    <p className="text-emerald-100 text-xs">Aucun coût caché</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <CheckCircle className="w-5 h-5 text-emerald-200 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">Rapide</p>
                    <p className="text-emerald-100 text-xs">Inscription en 30 secondes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <CheckCircle className="w-5 h-5 text-emerald-200 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">Sécurisé</p>
                    <p className="text-emerald-100 text-xs">Vos données protégées</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    if ((window as any).openSignUpModal) {
                      (window as any).openSignUpModal();
                    } else {
                      onEnterApp();
                    }
                  }}
                  className="group relative inline-flex items-center gap-3 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-lg px-10 py-4 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/30"
                >
                  <UserPlus className="w-6 h-6" />
                  <span>S'inscrire gratuitement</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onEnterApp}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-3xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <span>Découvrir sans inscription</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-emerald-100 text-sm pt-4">
                Déjà un compte ?{' '}
                <button 
                  onClick={() => {
                    if ((window as any).openSignInModal) {
                      (window as any).openSignInModal();
                    } else {
                      onEnterApp();
                    }
                  }}
                  className="font-semibold underline hover:text-white transition-colors"
                >
                  Connectez-vous
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer amélioré */}
      <footer className="relative z-10 px-6 py-8 border-t border-stone-200/50 dark:border-stone-700/50 bg-white/30 dark:bg-stone-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mountain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-stone-700 dark:text-stone-300 font-semibold">RandoTrack</p>
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Votre compagnon de randonnée • Planifiez • Explorez • Partagez</p>
        </div>
      </footer>
    </div>
  );
};

