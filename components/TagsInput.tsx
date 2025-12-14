import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { X, Tag } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

const DEFAULT_TAGS = [
  'Montagne',
  'Lac',
  'Forêt',
  'Rivière',
  'Vallée',
  'Sommet',
  'Cascade',
  'Prairie',
  'Désert',
  'Plage',
  'Grotte',
  'Vue panoramique',
];

export const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  onChange,
  placeholder = 'Ajouter un tag...',
  suggestions = DEFAULT_TAGS,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrer les suggestions en excluant les tags déjà sélectionnés
  const updateFilteredSuggestions = (value: string, currentTags: string[]) => {
    if (value.trim()) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase()) &&
          !currentTags.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      // Si pas de texte, montrer toutes les suggestions non sélectionnées
      const available = suggestions.filter(s => !currentTags.includes(s));
      setFilteredSuggestions(available);
      setShowSuggestions(available.length > 0);
    }
  };

  // Mettre à jour les suggestions filtrées quand les tags changent
  useEffect(() => {
    if (showSuggestions) {
      updateFilteredSuggestions(inputValue, tags);
    }
  }, [tags, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    updateFilteredSuggestions(value, tags);
  };

  const addTag = (tag: string, keepSuggestionsOpen = false) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
      // Garder les suggestions ouvertes si demandé (quand on clique sur une suggestion)
      if (keepSuggestionsOpen) {
        // Mettre à jour les suggestions pour exclure le tag ajouté
        setTimeout(() => {
          updateFilteredSuggestions('', [...tags, trimmedTag]);
        }, 0);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue, false);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase mb-2 flex items-center gap-1">
        <Tag className="w-3 h-3" /> Tags
      </label>
      
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-white dark:bg-stone-700 min-h-[3rem]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5 transition-colors"
                aria-label={`Retirer le tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // Afficher les suggestions disponibles quand on focus l'input
              updateFilteredSuggestions(inputValue, tags);
            }}
            onBlur={(e) => {
              // Ne fermer que si on ne clique pas sur les suggestions
              if (suggestionsRef.current && !suggestionsRef.current.contains(e.relatedTarget as Node)) {
                setTimeout(() => setShowSuggestions(false), 200);
              }
            }}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-lg max-h-48 overflow-y-auto"
            onMouseDown={(e) => {
              // Empêcher le blur de l'input quand on clique dans les suggestions
              e.preventDefault();
            }}
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  addTag(suggestion, true); // Garder les suggestions ouvertes
                  // Remettre le focus sur l'input pour continuer à sélectionner
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }}
                className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-2"
              >
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-stone-800 dark:text-stone-200">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Tags suggérés rapides */}
      {tags.length === 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs text-stone-500 dark:text-stone-400">Suggestions rapides :</span>
          {suggestions.slice(0, 6).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion, false)}
              className="px-2 py-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
