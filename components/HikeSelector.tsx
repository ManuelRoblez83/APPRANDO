import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Calendar, Ruler, Search, User, BookOpen } from 'lucide-react';
import { HikeData } from '../types';

interface HikeSelectorProps {
  hikes: HikeData[];
  onSelect: (hike: HikeData) => void;
  placeholder?: string;
}

// Liste des randonnées d'exemple (les 20 randonnées du script SQL)
const SAMPLE_HIKES: Omit<HikeData, 'id'>[] = [
  { name: 'Tour du Mont-Blanc - Étape 1 : Chamonix - Les Contamines', date: '2024-06-15', startLocation: 'Chamonix-Mont-Blanc', endLocation: 'Les Contamines-Montjoie', distance: 16.5, duration: '5h 30m', startCoords: { lat: 45.9237, lng: 6.8694 }, endCoords: { lat: 45.8194, lng: 6.7186 }, elevationProfile: { minElevation: 1050, maxElevation: 1717, totalAscent: 667, totalDescent: 500 } },
  { name: 'GR34 - Cap Fréhel à Fort la Latte', date: '2024-05-20', startLocation: 'Cap Fréhel', endLocation: 'Fort la Latte', distance: 8.2, duration: '2h 45m', startCoords: { lat: 48.6847, lng: -2.3167 }, endCoords: { lat: 48.6708, lng: -2.2858 }, elevationProfile: { minElevation: 0, maxElevation: 70, totalAscent: 250, totalDescent: 180 } },
  { name: 'GR70 - Le Monastier à Pradelles', date: '2024-07-10', startLocation: 'Le Monastier-sur-Gazeille', endLocation: 'Pradelles', distance: 22.0, duration: '7h 15m', startCoords: { lat: 44.9386, lng: 4.0031 }, endCoords: { lat: 44.7697, lng: 3.8831 }, elevationProfile: { minElevation: 850, maxElevation: 1385, totalAscent: 850, totalDescent: 315 } },
  { name: 'Sentier Blanc-Martel - Gorges du Verdon', date: '2024-08-05', startLocation: 'La Palud-sur-Verdon', endLocation: 'Point Sublime', distance: 13.5, duration: '6h 00m', startCoords: { lat: 43.9158, lng: 6.3425 }, endCoords: { lat: 43.9056, lng: 6.3953 }, elevationProfile: { minElevation: 450, maxElevation: 950, totalAscent: 500, totalDescent: 500 } },
  { name: 'GR65 - Saint-Jean-Pied-de-Port à Roncevaux', date: '2024-09-01', startLocation: 'Saint-Jean-Pied-de-Port', endLocation: 'Roncevaux', distance: 25.0, duration: '8h 30m', startCoords: { lat: 43.1639, lng: -1.2375 }, endCoords: { lat: 43.0133, lng: -1.3197 }, elevationProfile: { minElevation: 180, maxElevation: 1430, totalAscent: 1250, totalDescent: 0 } },
  { name: 'Calanque de Sormiou à Calanque de Morgiou', date: '2024-06-25', startLocation: 'Calanque de Sormiou', endLocation: 'Calanque de Morgiou', distance: 6.8, duration: '2h 20m', startCoords: { lat: 43.2164, lng: 5.4031 }, endCoords: { lat: 43.2086, lng: 5.4358 }, elevationProfile: { minElevation: 0, maxElevation: 200, totalAscent: 350, totalDescent: 350 } },
  { name: 'GR5 - Le Hohneck au Grand Ballon', date: '2024-07-18', startLocation: 'Hohneck', endLocation: 'Grand Ballon', distance: 18.5, duration: '6h 00m', startCoords: { lat: 48.0375, lng: 7.0181 }, endCoords: { lat: 47.9014, lng: 7.1003 }, elevationProfile: { minElevation: 1180, maxElevation: 1424, totalAscent: 600, totalDescent: 356 } },
  { name: 'GR65 - Rocamadour à Cahors', date: '2024-05-12', startLocation: 'Rocamadour', endLocation: 'Cahors', distance: 32.0, duration: '9h 30m', startCoords: { lat: 44.7994, lng: 1.6189 }, endCoords: { lat: 44.4486, lng: 1.4347 }, elevationProfile: { minElevation: 110, maxElevation: 420, totalAscent: 650, totalDescent: 520 } },
  { name: 'Toulouse à Montgiscard le long du Canal du Midi', date: '2024-04-30', startLocation: 'Toulouse', endLocation: 'Montgiscard', distance: 15.0, duration: '4h 00m', startCoords: { lat: 43.6047, lng: 1.4442 }, endCoords: { lat: 43.4625, lng: 1.5792 }, elevationProfile: { minElevation: 130, maxElevation: 180, totalAscent: 50, totalDescent: 0 } },
  { name: 'Ascension du Puy de Dôme', date: '2024-08-20', startLocation: 'Col de Ceyssat', endLocation: 'Sommet du Puy de Dôme', distance: 5.5, duration: '2h 15m', startCoords: { lat: 45.7781, lng: 2.9397 }, endCoords: { lat: 45.7725, lng: 2.9644 }, elevationProfile: { minElevation: 1050, maxElevation: 1465, totalAscent: 415, totalDescent: 0 } },
  { name: 'GR11 - Tour de la Forêt de Fontainebleau', date: '2024-05-08', startLocation: 'Barbizon', endLocation: 'Fontainebleau', distance: 12.5, duration: '3h 45m', startCoords: { lat: 48.4458, lng: 2.6028 }, endCoords: { lat: 48.4075, lng: 2.7028 }, elevationProfile: { minElevation: 65, maxElevation: 140, totalAscent: 200, totalDescent: 125 } },
  { name: 'Traversée de la Baie du Mont-Saint-Michel', date: '2024-06-30', startLocation: 'Genêts', endLocation: 'Mont-Saint-Michel', distance: 10.0, duration: '3h 30m', startCoords: { lat: 48.6844, lng: -1.4758 }, endCoords: { lat: 48.6358, lng: -1.5114 }, elevationProfile: { minElevation: 0, maxElevation: 0, totalAscent: 0, totalDescent: 0 } },
  { name: 'GR5 - Mouthe à Métabief', date: '2024-07-22', startLocation: 'Mouthe', endLocation: 'Métabief', distance: 20.0, duration: '6h 45m', startCoords: { lat: 46.7125, lng: 6.1931 }, endCoords: { lat: 46.7711, lng: 6.3358 }, elevationProfile: { minElevation: 950, maxElevation: 1460, totalAscent: 700, totalDescent: 190 } },
  { name: 'GR20 - Calenzana à Bonifatu', date: '2024-09-10', startLocation: 'Calenzana', endLocation: 'Bonifatu', distance: 14.0, duration: '5h 00m', startCoords: { lat: 42.5072, lng: 8.8553 }, endCoords: { lat: 42.5797, lng: 8.8625 }, elevationProfile: { minElevation: 140, maxElevation: 1250, totalAscent: 1110, totalDescent: 0 } },
  { name: "Lac d'Allos via le Col de la Petite Cayolle", date: '2024-08-15', startLocation: 'Colmars-les-Alpes', endLocation: "Lac d'Allos", distance: 17.5, duration: '6h 30m', startCoords: { lat: 44.1778, lng: 6.6261 }, endCoords: { lat: 44.2397, lng: 6.6972 }, elevationProfile: { minElevation: 1420, maxElevation: 2227, totalAscent: 807, totalDescent: 0 } },
  { name: 'Château de Chambord à Blois', date: '2024-04-15', startLocation: 'Chambord', endLocation: 'Blois', distance: 18.0, duration: '4h 30m', startCoords: { lat: 47.6147, lng: 1.5169 }, endCoords: { lat: 47.5867, lng: 1.3322 }, elevationProfile: { minElevation: 70, maxElevation: 110, totalAscent: 80, totalDescent: 40 } },
  { name: 'Gavarnie au Cirque et à la Brèche de Roland', date: '2024-08-25', startLocation: 'Gavarnie', endLocation: 'Brèche de Roland', distance: 22.0, duration: '9h 00m', startCoords: { lat: 42.7333, lng: -0.0167 }, endCoords: { lat: 42.6933, lng: -0.0150 }, elevationProfile: { minElevation: 1365, maxElevation: 2807, totalAscent: 1442, totalDescent: 0 } },
  { name: 'GR4 - Meymac à Ussel', date: '2024-06-05', startLocation: 'Meymac', endLocation: 'Ussel', distance: 19.0, duration: '5h 45m', startCoords: { lat: 45.5350, lng: 2.1461 }, endCoords: { lat: 45.5486, lng: 2.3103 }, elevationProfile: { minElevation: 680, maxElevation: 950, totalAscent: 420, totalDescent: 150 } },
  { name: "Pic de l'Ours dans le Massif de l'Estérel", date: '2024-07-05', startLocation: 'Théoule-sur-Mer', endLocation: "Pic de l'Ours", distance: 11.0, duration: '4h 00m', startCoords: { lat: 43.5067, lng: 6.9417 }, endCoords: { lat: 43.4881, lng: 6.8767 }, elevationProfile: { minElevation: 0, maxElevation: 492, totalAscent: 492, totalDescent: 492 } },
  { name: "Tour du Lac d'Annecy", date: '2024-08-10', startLocation: 'Annecy (rive ouest)', endLocation: 'Duingt (rive est)', distance: 40.0, duration: '12h 00m', startCoords: { lat: 45.8992, lng: 6.1294 }, endCoords: { lat: 45.8300, lng: 6.2000 }, elevationProfile: { minElevation: 446, maxElevation: 510, totalAscent: 300, totalDescent: 300 } },
];

export const HikeSelector: React.FC<HikeSelectorProps> = ({ 
  hikes, 
  onSelect, 
  placeholder = "Charger une randonnée existante..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Convertir les randonnées d'exemple en format complet avec un ID temporaire
  const sampleHikesWithIds: HikeData[] = SAMPLE_HIKES.map((hike, index) => ({
    ...hike,
    id: `sample-${index}`,
  }));

  // Filtrer les randonnées selon la recherche
  const filterHikes = (hikesList: HikeData[]) => {
    if (!searchQuery.trim()) return hikesList;
    const query = searchQuery.toLowerCase();
    return hikesList.filter((hike) => (
      hike.name.toLowerCase().includes(query) ||
      hike.startLocation.toLowerCase().includes(query) ||
      hike.endLocation.toLowerCase().includes(query)
    ));
  };

  const filteredMyHikes = filterHikes(hikes);
  const filteredSampleHikes = filterHikes(sampleHikesWithIds);

  const handleSelect = (hike: HikeData) => {
    onSelect(hike);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Afficher le menu même s'il n'y a pas de randonnées personnelles (pour accéder aux exemples)
  // if (hikes.length === 0 && SAMPLE_HIKES.length === 0) {
  //   return null;
  // }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-medium"
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{placeholder}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-stone-800 rounded-3xl shadow-lg border border-stone-200 dark:border-stone-700 max-h-96 overflow-hidden">
          {/* Barre de recherche dans le menu */}
          <div className="p-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-750">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-2 border border-stone-300 dark:border-stone-600 rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100"
                style={{ color: '#1c1917', backgroundColor: '#ffffff' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Liste des randonnées */}
          <div className="overflow-y-auto max-h-80">
            {filteredMyHikes.length === 0 && filteredSampleHikes.length === 0 ? (
              <div className="p-4 text-center text-sm text-stone-500 dark:text-stone-400">
                Aucune randonnée trouvée
              </div>
            ) : (
              <>
                {/* Section: Mes randonnées */}
                {filteredMyHikes.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">Mes randonnées</h3>
                      <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400">({filteredMyHikes.length})</span>
                    </div>
                    {filteredMyHikes.map((hike) => (
                      <button
                        key={hike.id}
                        type="button"
                        onClick={() => handleSelect(hike)}
                        className="w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-stone-100 dark:border-stone-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-stone-800 dark:text-stone-100 truncate">{hike.name}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-600 dark:text-stone-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(hike.date).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Ruler className="w-3 h-3" />
                                {hike.distance} km
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-stone-500 dark:text-stone-400 truncate">
                              {hike.startLocation} → {hike.endLocation}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Section: Randonnées d'exemple */}
                {filteredSampleHikes.length > 0 && (
                  <div>
                    <div className={`px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 flex items-center gap-2 ${filteredMyHikes.length > 0 ? 'border-t border-stone-200 dark:border-stone-700' : ''}`}>
                      <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Randonnées d'exemple</h3>
                      <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">({filteredSampleHikes.length})</span>
                    </div>
                    {filteredSampleHikes.map((hike) => (
                      <button
                        key={hike.id}
                        type="button"
                        onClick={() => handleSelect(hike)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-stone-100 dark:border-stone-700 last:border-b-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-stone-800 dark:text-stone-100 truncate">{hike.name}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-600 dark:text-stone-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(hike.date).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Ruler className="w-3 h-3" />
                                {hike.distance} km
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-stone-500 dark:text-stone-400 truncate">
                              {hike.startLocation} → {hike.endLocation}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {(filteredMyHikes.length > 0 || filteredSampleHikes.length > 0) && (
            <div className="px-4 py-2 bg-stone-50 dark:bg-stone-750 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400 text-center">
              {filteredMyHikes.length + filteredSampleHikes.length} randonnée{(filteredMyHikes.length + filteredSampleHikes.length) > 1 ? 's' : ''} disponible{(filteredMyHikes.length + filteredSampleHikes.length) > 1 ? 's' : ''}
              {filteredMyHikes.length > 0 && filteredSampleHikes.length > 0 && (
                <span className="ml-2">
                  ({filteredMyHikes.length} personnelle{filteredMyHikes.length > 1 ? 's' : ''}, {filteredSampleHikes.length} exemple{filteredSampleHikes.length > 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

