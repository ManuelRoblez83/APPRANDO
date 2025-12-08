import React, { useState, useCallback } from 'react';
import { Mountain, Map as MapIcon, List } from 'lucide-react';
import { HikeForm } from './components/HikeForm';
import { MapDisplay } from './components/MapDisplay';
import { HikeList } from './components/HikeList';
import { HikeData, HikeFormData, Coordinates } from './types';
import { getCoordinates } from './services/geocodingService';

const App: React.FC = () => {
  // State for the list of saved hikes
  const [hikes, setHikes] = useState<HikeData[]>([]);

  // State for the form
  const [formData, setFormData] = useState<HikeFormData>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    startLocation: '',
    endLocation: '',
    distance: '',
    duration: '',
  });

  // State for the current preview on map
  const [previewCoords, setPreviewCoords] = useState<{
    start?: Coordinates;
    end?: Coordinates;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [isFormValidForSave, setIsFormValidForSave] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Reset save validity if critical location data changes without re-previewing
    if (name === 'startLocation' || name === 'endLocation') {
      setIsFormValidForSave(false);
    }
  };

  // Handle geocoding preview
  const handlePreview = async () => {
    if (!formData.startLocation || !formData.endLocation) return;
    
    setIsLoading(true);
    try {
      const [start, end] = await Promise.all([
        getCoordinates(formData.startLocation),
        getCoordinates(formData.endLocation),
      ]);

      if (start && end) {
        setPreviewCoords({ start, end });
        setIsFormValidForSave(true);
      } else {
        alert("Impossible de trouver l'une des localisations. Veuillez vérifier l'orthographe.");
        setIsFormValidForSave(false);
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      alert("Erreur de connexion lors de la recherche des lieux.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving the hike
  const handleSave = () => {
    if (!isFormValidForSave || !previewCoords.start || !previewCoords.end) return;

    const newHike: HikeData = {
      id: Date.now().toString(),
      name: formData.name || `Randonnée du ${formData.date}`,
      date: formData.date,
      startLocation: formData.startLocation,
      endLocation: formData.endLocation,
      distance: parseFloat(formData.distance) || 0,
      duration: formData.duration,
      startCoords: previewCoords.start,
      endCoords: previewCoords.end,
    };

    setHikes((prev) => [newHike, ...prev]);
    
    // Reset form
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      startLocation: '',
      endLocation: '',
      distance: '',
      duration: '',
    });
    setPreviewCoords({});
    setIsFormValidForSave(false);
  };

  const handleDelete = (id: string) => {
    setHikes((prev) => prev.filter(h => h.id !== id));
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="w-8 h-8 text-emerald-300" />
            <h1 className="text-2xl font-bold tracking-tight">RandoTrack</h1>
          </div>
          <div className="text-emerald-200 text-sm hidden sm:block">
            Planifiez votre prochaine aventure
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Top Section: Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 space-y-4">
            <HikeForm 
              formData={formData}
              onChange={handleInputChange}
              onPreview={handlePreview}
              onSave={handleSave}
              isLoading={isLoading}
              canSave={isFormValidForSave}
            />
            
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm text-emerald-800">
              <h3 className="font-bold flex items-center gap-2 mb-1">
                <MapIcon className="w-4 h-4" /> Comment ça marche ?
              </h3>
              <p>
                Entrez les lieux de départ et d'arrivée, puis cliquez sur <strong>Prévisualiser</strong> pour tracer la ligne.
                Ensuite, <strong>Enregistrez</strong> pour garder une trace dans votre historique.
              </p>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-7">
            <MapDisplay 
              startCoords={previewCoords.start}
              endCoords={previewCoords.end}
              startName={formData.startLocation}
              endName={formData.endLocation}
            />
          </div>
        </div>

        {/* Bottom Section: List */}
        <div className="pt-8 border-t border-stone-200">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <List className="w-6 h-6" />
            Vos Randonnées Enregistrées
          </h2>
          <HikeList hikes={hikes} onDelete={handleDelete} />
        </div>

      </main>
    </div>
  );
};

export default App;