import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { getLocationSuggestions, LocationSuggestion } from '../services/geocodingService';

interface AutocompleteInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  name,
  value,
  onChange,
  onSelect,
  placeholder = "Ville ou lieu",
  label,
  icon,
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const justSelectedRef = useRef<boolean>(false); // Track if user just selected a suggestion
  const isFocusedRef = useRef<boolean>(false); // Track if input has focus

  // Debounced search for suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      // Don't show suggestions if user just selected one
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getLocationSuggestions(value);
        setSuggestions(results);
        // Only show suggestions if user is actively typing (not after a selection) AND input has focus
        if (!justSelectedRef.current && isFocusedRef.current) {
          setShowSuggestions(results.length > 0 && value.length >= 2);
        } else {
          setShowSuggestions(false);
          if (justSelectedRef.current) {
            justSelectedRef.current = false;
          }
        }
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    // Use 'click' instead of 'mousedown' to avoid closing before button click is processed
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSelect = (suggestion: LocationSuggestion) => {
    // Mark that we just selected a suggestion to prevent auto-showing suggestions
    justSelectedRef.current = true;
    
    // Update input value
    const syntheticEvent = {
      target: {
        name,
        value: suggestion.displayName,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]); // Clear suggestions after selection
    
    // Reset the flag after a short delay to allow for future typing
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 500);
    
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatSuggestionParts = (suggestion: LocationSuggestion) => {
    // Split the full address into parts for better display
    const parts = suggestion.displayName.split(',').map(p => p.trim());
    if (parts.length > 1) {
      return {
        primary: parts[0], // First part (street name, place name)
        secondary: parts.slice(1).join(', '), // Rest of the address
      };
    }
    return {
      primary: suggestion.displayName,
      secondary: null,
    };
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => {
            isFocusedRef.current = true;
            // Show suggestions on focus only if user hasn't just selected one
            if (!justSelectedRef.current && (suggestions.length > 0 || value.length >= 2)) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay to allow clicking on suggestions
            setTimeout(() => {
              isFocusedRef.current = false;
            }, 200);
          }}
          onClick={() => {
            isFocusedRef.current = true;
            // Show suggestions when clicking on input, but not if just selected
            if (!justSelectedRef.current && (suggestions.length > 0 || value.length >= 2)) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-12 px-3 py-3 border border-stone-300 dark:border-stone-600 rounded-3xl focus:rounded-3xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all duration-200 pr-10 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader className="w-4 h-4 text-stone-400 dark:text-stone-500 animate-spin" />
          ) : (
            icon || <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          )}
        </div>
      </div>

      {/* Suggestions dropdown - Agrandi pour afficher les adresses complètes */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-3xl shadow-xl max-h-80 overflow-y-auto"
          style={{ minWidth: '100%', maxWidth: '100%' }}
        >
          {suggestions.map((suggestion, index) => {
            const parts = formatSuggestionParts(suggestion);
            return (
              <button
                key={`${suggestion.lat}-${suggestion.lng}-${index}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(suggestion);
                }}
                onMouseDown={(e) => {
                  // Prevent input from losing focus when clicking on suggestion
                  e.preventDefault();
                }}
                className={`w-full text-left px-4 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-stone-100 dark:border-stone-700 last:border-b-0 ${
                  index === selectedIndex ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 break-words overflow-wrap-anywhere">
                    {parts.secondary ? (
                      <>
                        <div className="font-semibold text-stone-900 dark:text-stone-100 text-base leading-tight mb-1">
                          {parts.primary}
                        </div>
                        <div className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-normal">
                          {parts.secondary}
                        </div>
                      </>
                    ) : (
                      <div className="font-medium text-stone-800 dark:text-stone-200 text-sm leading-relaxed whitespace-normal">
                        {parts.primary}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

