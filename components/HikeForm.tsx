import React, { useState, useRef } from 'react';
import { MapPin, Calendar, Clock, Navigation, Search, Save, X, MousePointerClick, Image, Upload, Trash2, FileText, Globe } from 'lucide-react';
import { HikeFormData, HikeData } from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { HikeSelector } from './HikeSelector';
import { StarRating } from './StarRating';
import { TagsInput } from './TagsInput';

interface HikeFormProps {
  formData: HikeFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onTagsChange?: (tags: string[]) => void;
  onDifficultyChange?: (difficulty: number) => void;
  onBeautyChange?: (beauty: number) => void;
  onPhotosChange?: (files: File[]) => void;
  onPublicChange?: (isPublic: boolean) => void;
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
  existingPhotos?: string[]; // URLs des photos existantes
  onDeletePhoto?: (photoUrl: string) => void;
}

export const HikeForm: React.FC<HikeFormProps> = ({ 
  formData, 
  onChange,
  onTagsChange,
  onDifficultyChange,
  onBeautyChange,
  onPhotosChange,
  onPublicChange,
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
  existingPhotos = [],
  onDeletePhoto,
}) => {
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Créer des prévisualisations
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newPreviews.push(result);
        if (newPreviews.length === files.length) {
          setPreviewPhotos(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Notifier le parent
    if (onPhotosChange) {
      const currentFiles = formData.photos || [];
      onPhotosChange([...currentFiles, ...files]);
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviewPhotos(prev => prev.filter((_, i) => i !== index));
    if (onPhotosChange && formData.photos) {
      const newFiles = formData.photos.filter((_, i) => i !== index);
      onPhotosChange(newFiles);
    }
  };

  const handleRemoveExistingPhoto = (photoUrl: string) => {
    if (onDeletePhoto) {
      onDeletePhoto(photoUrl);
    }
  };
  return (
    <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl shadow-lg border border-stone-200 dark:border-stone-700 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mb-6 flex items-center gap-2">
        <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
            className="w-full h-12 px-3 py-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus:rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
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
            className="w-full h-12 px-3 py-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus:rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500"
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
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-3xl transition-colors ${
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
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-3xl transition-colors ${
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
            className="w-full h-12 px-3 py-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus:rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 bg-emerald-50/50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 font-medium hover:border-stone-400 dark:hover:border-stone-500 placeholder:text-stone-400 dark:placeholder:text-stone-400"
            readOnly={false}
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
            className="w-full h-12 px-3 py-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus:rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 bg-emerald-50/50 dark:bg-emerald-900/30 text-stone-900 dark:text-stone-100 font-medium hover:border-stone-400 dark:hover:border-stone-500 placeholder:text-stone-400 dark:placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Section Notes/Description */}
      <div className="mt-6">
        <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2 flex items-center gap-1">
          <FileText className="w-3 h-3" /> Notes / Description
        </label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={onChange}
          placeholder="Décrivez votre randonnée, vos impressions, les points d'intérêt..."
          rows={4}
          className="w-full px-3 py-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus:rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y"
        />
      </div>

      {/* Section Tags */}
      <div className="mt-6">
        {onTagsChange && (
          <TagsInput
            tags={formData.tags || []}
            onChange={onTagsChange}
          />
        )}
      </div>

      {/* Section Notations */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {onDifficultyChange && (
          <StarRating
            value={formData.difficulty || 0}
            onChange={onDifficultyChange}
            label="Difficulté"
          />
        )}
        {onBeautyChange && (
          <StarRating
            value={formData.beauty || 0}
            onChange={onBeautyChange}
            label="Beauté du paysage"
          />
        )}
      </div>

      {/* Option Rendre publique */}
      {onPublicChange && (
        <div className="mt-6">
          <label className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
            <input
              type="checkbox"
              checked={formData.isPublic || false}
              onChange={(e) => onPublicChange(e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500 focus:ring-2"
            />
            <div className="flex items-center gap-2 flex-1">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  Rendre cette randonnée publique
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  Les autres utilisateurs pourront voir, liker et commenter votre randonnée
                </p>
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Section Upload de Photos */}
      <div className="mt-6">
        <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2 flex items-center gap-1">
          <Image className="w-3 h-3" /> Photos de la randonnée
        </label>
        <div className="space-y-3">
          {/* Photos existantes */}
          {existingPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {existingPhotos.map((photoUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photoUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                  />
                  {onDeletePhoto && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(photoUrl)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Prévisualisations des nouvelles photos */}
          {previewPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previewPhotos.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Aperçu ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePreview(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Retirer la photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bouton d'upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors flex items-center justify-center gap-2 text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-medium">Ajouter des photos</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
            Formats acceptés: JPG, PNG, WebP (max 5MB par photo)
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onPreview}
          disabled={isLoading || !formData.startLocation || !formData.endLocation}
          className="flex-1 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold py-3 px-4 rounded-3xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
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
            className="bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold py-3 px-4 rounded-3xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md active:scale-95"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        )}

        <button
          onClick={onSave}
          disabled={isLoading || !formData.startLocation || !formData.endLocation}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-3xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Mettre à jour' : 'Enregistrer la randonnée'}
        </button>
      </div>
    </div>
  );
};