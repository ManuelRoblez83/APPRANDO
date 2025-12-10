import React from 'react';
import { MapPin, Calendar, Clock, Navigation, Search, Save, X, MousePointerClick } from 'lucide-react';
import { HikeFormData, HikeData } from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { HikeSelector } from './HikeSelector';

interface HikeFormProps {
  formData: HikeFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
  onSave: () => void;
  onCancel?: () => void;
  isLoading: boolean;
  canSave: boolean;
  isEditing?: boolean;
  onSelectOnMap?: (mode: 'start' | 'end') => void;
  selectionMode?: 'start' | 'end' | null;
  existingHikes?: HikeData[];
  onLoadHike?: (hike: HikeData) => void;
}

export const HikeForm: React.FC<HikeFormProps> = ({ 
  formData, 
  onChange, 
  onPreview, 
  onSave, 
  onCancel,
  isLoading,
  canSave,
  isEditing = false,
  onSelectOnMap,
  selectionMode,
  existingHikes = [],
  onLoadHike,
}) => {
  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 transition-colors">
      <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
        <Navigation className="w-5 h-5" />
        {isEditing ? 'Modifier la Randonnée' : 'Nouvelle Randonnée'}
      </h2>

      {/* Menu déroulant pour charger une randonnée existante */}
      {!isEditing && onLoadHike && (
        <div className="mb-4">
          <HikeSelector 
            hikes={existingHikes}
            onSelect={onLoadHike}
            placeholder="Charger une randonnée existante..."
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-1 h-5 flex items-center">
            Nom de la randonnée
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Ex: Tour du Mont Blanc"
            className="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100"
            style={{ color: '#1c1917', backgroundColor: '#ffffff' }}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-1 h-5 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={onChange}
            className="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-1 h-5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Point de départ
          </label>
          <div className="relative">
            <AutocompleteInput
              name="startLocation"
              value={formData.startLocation}
              onChange={onChange}
              placeholder="Commencez à taper une adresse..."
              icon={<MapPin className="w-4 h-4 text-stone-400" />}
            />
            {onSelectOnMap && (
              <button
                type="button"
                onClick={() => onSelectOnMap('start')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                  selectionMode === 'start'
                    ? 'bg-blue-500 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                }`}
                title="Choisir sur la carte"
              >
                <MousePointerClick className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-1 h-5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Point d'arrivée
          </label>
          <div className="relative">
            <AutocompleteInput
              name="endLocation"
              value={formData.endLocation}
              onChange={onChange}
              placeholder="Commencez à taper une adresse..."
              icon={<MapPin className="w-4 h-4 text-stone-400" />}
            />
            {onSelectOnMap && (
              <button
                type="button"
                onClick={() => onSelectOnMap('end')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                  selectionMode === 'end'
                    ? 'bg-blue-500 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                }`}
                title="Choisir sur la carte"
              >
                <MousePointerClick className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-1 h-5 flex items-center">
            Distance (km)
          </label>
          <input
            type="number"
            name="distance"
            value={formData.distance}
            onChange={onChange}
            placeholder="Distance en km"
            step="0.1"
            className="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-emerald-50/50 dark:bg-emerald-900/20 text-stone-800 dark:text-stone-100"
            readOnly={false}
            style={{ color: '#1c1917', backgroundColor: '#ecfdf5' }}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-1 h-5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Durée
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={onChange}
            placeholder="Ex: 4h 30m"
            className="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-emerald-50/50 dark:bg-emerald-900/20 text-stone-800 dark:text-stone-100"
            style={{ color: '#1c1917', backgroundColor: '#ecfdf5' }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onPreview}
          disabled={isLoading || !formData.startLocation || !formData.endLocation}
          className="flex-1 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-stone-500 dark:border-stone-300 border-t-transparent"></span>
          ) : (
            <Search className="w-4 h-4" />
          )}
          Prévisualiser sur la carte
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        )}

        <button
          onClick={onSave}
          disabled={!canSave}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:bg-stone-300 dark:disabled:bg-stone-700"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Mettre à jour' : 'Enregistrer la randonnée'}
        </button>
      </div>
    </div>
  );
};