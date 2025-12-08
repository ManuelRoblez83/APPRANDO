import React from 'react';
import { MapPin, Calendar, Clock, Navigation, Search, Save } from 'lucide-react';
import { HikeFormData } from '../types';

interface HikeFormProps {
  formData: HikeFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreview: () => void;
  onSave: () => void;
  isLoading: boolean;
  canSave: boolean;
}

export const HikeForm: React.FC<HikeFormProps> = ({ 
  formData, 
  onChange, 
  onPreview, 
  onSave, 
  isLoading,
  canSave 
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
      <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
        <Navigation className="w-5 h-5" />
        Nouvelle Randonnée
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
          <input
            type="text"
            name="startLocation"
            value={formData.startLocation}
            onChange={onChange}
            placeholder="Ville ou lieu"
            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Point d'arrivée
          </label>
          <input
            type="text"
            name="endLocation"
            value={formData.endLocation}
            onChange={onChange}
            placeholder="Ville ou lieu"
            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase">Distance (km)</label>
          <input
            type="number"
            name="distance"
            value={formData.distance}
            onChange={onChange}
            placeholder="12.5"
            step="0.1"
            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
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
            className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
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

        <button
          onClick={onSave}
          disabled={!canSave}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:bg-stone-300"
        >
          <Save className="w-4 h-4" />
          Enregistrer la randonnée
        </button>
      </div>
    </div>
  );
};