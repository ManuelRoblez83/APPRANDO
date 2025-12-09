import React from 'react';
import { MapPin, Calendar, Clock, Navigation, Search, Save, X, MousePointerClick } from 'lucide-react';
import { HikeFormData } from '../types';
import { AutocompleteInput } from './AutocompleteInput';

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
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
      <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
        <Navigation className="w-5 h-5" />
        {isEditing ? 'Modifier la Randonnée' : 'Nouvelle Randonnée'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase">Nom de la randonnée</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Ex: Tour du Mont Blanc"
            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={onChange}
            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase flex items-center gap-1">
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
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
                title="Choisir sur la carte"
              >
                <MousePointerClick className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase flex items-center gap-1">
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
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
                title="Choisir sur la carte"
              >
                <MousePointerClick className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase">
            Distance (km)
          </label>
          <input
            type="number"
            name="distance"
            value={formData.distance}
            onChange={onChange}
            placeholder="Distance en km"
            step="0.1"
            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-emerald-50/50"
            readOnly={false}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Durée
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={onChange}
            placeholder="Ex: 4h 30m"
            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-emerald-50/50"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onPreview}
          disabled={isLoading || !formData.startLocation || !formData.endLocation}
          className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-stone-500 border-t-transparent"></span>
          ) : (
            <Search className="w-4 h-4" />
          )}
          Prévisualiser sur la carte
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        )}

        <button
          onClick={onSave}
          disabled={!canSave}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:bg-stone-300"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Mettre à jour' : 'Enregistrer la randonnée'}
        </button>
      </div>
    </div>
  );
};