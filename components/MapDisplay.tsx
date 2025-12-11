import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon, LatLngTuple, Icon, LeafletMouseEvent } from 'leaflet';
import * as L from 'leaflet';
import { Coordinates } from '../types';
import { RouteData, formatDistance, formatDuration } from '../services/routingService';
import { formatElevation, formatElevationDifference } from '../services/elevationService';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// This sub-component handles fitting the map bounds when coordinates change
const MapUpdater: React.FC<{ start?: Coordinates; end?: Coordinates; routeData?: RouteData | null }> = ({ start, end, routeData }) => {
  const map = useMap();

  useEffect(() => {
    // Small delay to ensure map is fully rendered
    const timer = setTimeout(() => {
      if (routeData && routeData.coordinates.length > 0) {
        // Fit bounds to show entire route
        const lats = routeData.coordinates.map(c => c.lat);
        const lngs = routeData.coordinates.map(c => c.lng);
        const bounds: LatLngTuple[] = [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)]
        ];
        map.fitBounds(bounds, { padding: [80, 80] });
      } else if (start && end) {
        const bounds = [
          [start.lat, start.lng] as LatLngTuple,
          [end.lat, end.lng] as LatLngTuple,
        ];
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (start) {
        map.setView([start.lat, start.lng], 13);
      } else if (end) {
        map.setView([end.lat, end.lng], 13);
      }
      // Force map to recalculate its size
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [start, end, routeData, map]);

  return null;
};

// Component to handle map clicks
const MapClickHandler: React.FC<{ 
  onMapClick?: (coordinates: Coordinates) => void;
  selectionMode?: 'start' | 'end' | null;
}> = ({ onMapClick, selectionMode }) => {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick || !selectionMode) return;

    const handleMapClick = (e: LeafletMouseEvent) => {
      onMapClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    };

    map.on('click', handleMapClick);
    // Change cursor to indicate clickable mode
    map.getContainer().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleMapClick);
      map.getContainer().style.cursor = '';
    };
  }, [map, onMapClick, selectionMode]);

  return null;
};

interface MapDisplayProps {
  startCoords?: Coordinates;
  endCoords?: Coordinates;
  startName: string;
  endName: string;
  routeData?: RouteData | null;
  isRouteLoading?: boolean;
  onMapClick?: (coordinates: Coordinates) => void;
  selectionMode?: 'start' | 'end' | null;
  formattedDistance?: string;
  formattedDuration?: string;
}

// Custom SVG icon for markers
const createCustomIcon = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `;
  
  return divIcon({
    className: 'custom-marker-icon',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const MapDisplay: React.FC<MapDisplayProps> = ({ 
  startCoords, 
  endCoords, 
  startName, 
  endName,
  routeData,
  isRouteLoading = false,
  onMapClick,
  selectionMode,
  formattedDistance,
  formattedDuration,
}) => {
  const defaultCenter: LatLngTuple = [46.603354, 1.888334]; // Center of France
  
  // Memoize icons to prevent recreation on every render
  const startIcon = useMemo(() => createCustomIcon('#10b981'), []);
  const endIcon = useMemo(() => createCustomIcon('#ef4444'), []);
  
  // Prepare route coordinates for Polyline
  const routePositions = useMemo<LatLngTuple[]>(() => {
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      return routeData.coordinates.map((coord) => [coord.lat, coord.lng] as LatLngTuple);
    }
    return [];
  }, [routeData]);
  
  // Calculate center based on coordinates if available
  const mapCenter: LatLngTuple = useMemo(() => {
    if (routeData && routeData.coordinates.length > 0) {
      const midIndex = Math.floor(routeData.coordinates.length / 2);
      const mid = routeData.coordinates[midIndex];
      return [mid.lat, mid.lng];
    }
    if (startCoords && endCoords) {
      return [
        (startCoords.lat + endCoords.lat) / 2,
        (startCoords.lng + endCoords.lng) / 2
      ];
    } else if (startCoords) {
      return [startCoords.lat, startCoords.lng];
    } else if (endCoords) {
      return [endCoords.lat, endCoords.lng];
    }
    return defaultCenter;
  }, [routeData, startCoords, endCoords]);
  
  const mapZoom = useMemo(() => {
    // Adjust zoom based on route distance for better precision
    if (routeData && routeData.coordinates.length > 0) {
      const distance = routeData.distance;
      if (distance < 1000) return 16; // Very close routes: high zoom
      if (distance < 5000) return 15; // Short routes: high zoom
      if (distance < 20000) return 14; // Medium routes: medium-high zoom
      return 13; // Long routes: medium zoom
    }
    if (startCoords || endCoords) return 14;
    return 6;
  }, [startCoords, endCoords, routeData]);
  
  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 relative bg-stone-100 dark:bg-stone-900 transition-all duration-300 hover:shadow-xl">
      {/* Selection Mode Indicator */}
      {selectionMode && (
        <div className="absolute top-4 left-4 z-[1000] bg-blue-500 dark:bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-xl font-medium text-sm animate-fade-in-up backdrop-blur-sm border border-blue-400/30">
          {selectionMode === 'start' ? '📍 Cliquez sur la carte pour choisir le point de départ' : '📍 Cliquez sur la carte pour choisir le point d\'arrivée'}
        </div>
      )}
      
      {/* Route Info Overlay - Compact en haut à droite avec détails du dénivelé */}
      {routeData && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-emerald-200/50 dark:border-emerald-800/50 max-w-[320px] animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
              🚶 Itinéraire pédestre
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div>
              <span className="text-stone-500 dark:text-stone-400 text-[10px]">Distance</span>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm leading-tight">
                {formattedDistance ? `${formattedDistance} km` : formatDistance(routeData.distance)}
              </p>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400 text-[10px]">Durée (à pied)</span>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm leading-tight">
                {formattedDuration || formatDuration(routeData.duration)}
              </p>
            </div>
          </div>
          {routeData.elevationProfile && (
            <div className="border-t border-emerald-100 dark:border-emerald-800 pt-2 mt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500 dark:text-stone-400 text-[10px]">Dénivelé +</span>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm leading-tight">
                    {formatElevation(routeData.elevationProfile.totalAscent)}
                  </p>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400 text-[10px]">Dénivelé -</span>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm leading-tight">
                    {formatElevation(routeData.elevationProfile.totalDescent)}
                  </p>
                </div>
                <div className="col-span-2 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-600 dark:text-stone-400">
                    <span>Altitude min: {formatElevation(routeData.elevationProfile.minElevation)}</span>
                    <span>Alt. max: {formatElevation(routeData.elevationProfile.maxElevation)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isRouteLoading && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-stone-200/50 dark:border-stone-700/50 animate-fade-in">
          <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300 font-medium">
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></span>
            Calcul de l'itinéraire pédestre...
          </div>
        </div>
      )}
      
      <MapContainer 
        key={`${startCoords?.lat}-${endCoords?.lat}-${routeData?.distance || 0}`}
        center={mapCenter} 
        zoom={mapZoom} 
        scrollWheelZoom={true}
        zoomControl={true}
        doubleClickZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        className="z-10"
        minZoom={3}
        maxZoom={20}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={20}
          zoomOffset={0}
          tileSize={256}
        />
        
        <MapUpdater start={startCoords} end={endCoords} routeData={routeData} />
        <MapClickHandler onMapClick={onMapClick} selectionMode={selectionMode} />

        {startCoords && (
          <Marker position={[startCoords.lat, startCoords.lng]} icon={startIcon}>
            <Popup>
              <div className="space-y-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-400">📍 Départ</div>
                <div className="text-sm text-stone-800 dark:text-stone-200">{startName}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {startCoords.lat.toFixed(6)}, {startCoords.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {endCoords && (
          <Marker position={[endCoords.lat, endCoords.lng]} icon={endIcon}>
            <Popup>
              <div className="space-y-1">
                <div className="font-bold text-red-700 dark:text-red-400">🎯 Arrivée</div>
                <div className="text-sm text-stone-800 dark:text-stone-200">{endName}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {endCoords.lat.toFixed(6)}, {endCoords.lng.toFixed(6)}
                </div>
                {routeData && (
                  <>
                    <div className="border-t border-stone-200 dark:border-stone-700 mt-2 pt-2">
                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        <strong>Distance:</strong> {formattedDistance ? `${formattedDistance} km` : formatDistance(routeData.distance)}
                      </div>
                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        <strong>Durée:</strong> {formattedDuration || formatDuration(routeData.duration)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Display route */}
        {routePositions.length > 0 && routeData && (
          <Polyline 
            positions={routePositions}
            pathOptions={{ 
              color: '#059669', 
              weight: 6, 
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
              smoothFactor: 1.0,
            }}
          />
        )}
        
        {/* Show message if no pedestrian route found but coordinates are available */}
        {startCoords && endCoords && !routeData && !isRouteLoading && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-amber-50/95 dark:bg-amber-900/30 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-amber-200/50 dark:border-amber-800/50 animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200 font-medium">
              <span className="text-amber-600 dark:text-amber-400">⚠️</span>
              <span>Aucun itinéraire pédestre trouvé entre ces points</span>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
};