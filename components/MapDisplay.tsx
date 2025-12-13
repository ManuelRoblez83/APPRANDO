import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import { divIcon, LatLngTuple, Icon, LeafletMouseEvent } from 'leaflet';
import * as L from 'leaflet';
import { Coordinates } from '../types';
import { RouteData, formatDistance, formatDuration } from '../services/routingService';
import { formatElevation, formatElevationDifference } from '../services/elevationService';
import { Maximize2, Minimize2, Layers, ChevronDown, ChevronUp, BarChart3, X } from 'lucide-react';
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

// Custom SVG icon for markers with better design
const createCustomIcon = (color: string, isStart: boolean = false) => {
  // Simple and reliable SVG icons - using unique IDs to avoid conflicts
  const uniqueId = Math.random().toString(36).substring(7);
  const shadowId = `shadow-${uniqueId}`;
  
  // Pin shape path (standard map pin)
  const pinPath = 'M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z';
  
  const startIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="${pinPath}" fill="${color}" filter="url(#${shadowId})"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
      <line x1="16" y1="10" x2="16" y2="22" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="10" y1="16" x2="22" y2="16" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `;
  
  const endIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="${pinPath}" fill="${color}" filter="url(#${shadowId})"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
      <circle cx="16" cy="16" r="5" fill="${color}"/>
    </svg>
  `;
  
  const svg = isStart ? startIconSvg : endIconSvg;
  
  return divIcon({
    className: 'custom-marker-icon',
    html: svg,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

// Create direction arrow marker
const createDirectionIcon = (angle: number) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#059669" opacity="0.8" transform="rotate(${angle})">
      <path d="M12 2L2 12l10 10 10-10L12 2z" stroke="white" stroke-width="1.5"/>
    </svg>
  `;
  
  return divIcon({
    className: 'direction-marker-icon',
    html: svg,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Calculate angle between two points for direction arrows
const calculateAngle = (point1: LatLngTuple, point2: LatLngTuple): number => {
  const lat1 = point1[0] * Math.PI / 180;
  const lat2 = point2[0] * Math.PI / 180;
  const dLon = (point2[1] - point1[1]) * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  const angle = Math.atan2(y, x) * 180 / Math.PI;
  return (angle + 360) % 360;
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [showElevationProfile, setShowElevationProfile] = useState(false);
  
  // Memoize icons to prevent recreation on every render
  const startIcon = useMemo(() => createCustomIcon('#10b981', true), []);
  const endIcon = useMemo(() => createCustomIcon('#ef4444', false), []);
  
  // Prepare route coordinates for Polyline
  const routePositions = useMemo<LatLngTuple[]>(() => {
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      return routeData.coordinates.map((coord) => [coord.lat, coord.lng] as LatLngTuple);
    }
    return [];
  }, [routeData]);

  // Calculate direction markers along the route (optimized - fewer markers for better performance)
  const directionMarkers = useMemo(() => {
    if (routePositions.length < 3) return [];
    const markers: Array<{ position: LatLngTuple; angle: number; icon: ReturnType<typeof createDirectionIcon> }> = [];
    // Reduce number of markers for better performance - show every 15% instead of 10%
    const step = Math.max(1, Math.floor(routePositions.length / 7));
    
    for (let i = step; i < routePositions.length - step; i += step) {
      const angle = calculateAngle(routePositions[i - 1], routePositions[i + 1]);
      const icon = createDirectionIcon(angle);
      markers.push({ position: routePositions[i], angle, icon });
    }
    return markers;
  }, [routePositions]);

  // Get tile layer URL based on selected layer
  const getTileLayerUrl = () => {
    switch (mapLayer) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileLayerAttribution = () => {
    switch (mapLayer) {
      case 'satellite':
        return '&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
      case 'terrain':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : 'h-[500px] w-full rounded-3xl'} overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 relative bg-stone-100 dark:bg-stone-900 transition-all duration-300 hover:shadow-xl`}>
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* Layer Selector */}
        <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
          <button
            onClick={() => setMapLayer(mapLayer === 'standard' ? 'satellite' : mapLayer === 'satellite' ? 'terrain' : 'standard')}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            title="Changer le type de carte"
          >
            <Layers className="w-5 h-5 text-stone-700 dark:text-stone-300" />
          </button>
        </div>
        
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 p-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-stone-700 dark:text-stone-300" />
          ) : (
            <Maximize2 className="w-5 h-5 text-stone-700 dark:text-stone-300" />
          )}
        </button>

        {/* Elevation Profile Toggle - only show if route has elevation data */}
        {routeData && routeData.elevationProfile && routePositions.length > 0 && (
          <button
            onClick={() => setShowElevationProfile(!showElevationProfile)}
            className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 p-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            title={showElevationProfile ? 'Masquer le profil d\'élévation' : 'Afficher le profil d\'élévation'}
          >
            <BarChart3 className={`w-5 h-5 text-stone-700 dark:text-stone-300 ${showElevationProfile ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>
        )}
      </div>

      {/* Selection Mode Indicator */}
      {selectionMode && (
        <div className="absolute top-4 left-20 z-[1000] bg-blue-500 dark:bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-xl font-medium text-sm animate-fade-in-up backdrop-blur-sm border border-blue-400/30">
          {selectionMode === 'start' ? '📍 Cliquez sur la carte pour choisir le point de départ' : '📍 Cliquez sur la carte pour choisir le point d\'arrivée'}
        </div>
      )}
      
      {/* Route Info Overlay - Enhanced with elevation profile visualization */}
      {routeData && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-emerald-200/50 dark:border-emerald-800/50 max-w-[340px] animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
              🚶 Itinéraire pédestre
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
              <span className="text-stone-500 dark:text-stone-400 text-[10px] block mb-1">Distance</span>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-base leading-tight">
                {formattedDistance ? `${formattedDistance} km` : formatDistance(routeData.distance)}
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
              <span className="text-stone-500 dark:text-stone-400 text-[10px] block mb-1">Durée</span>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-base leading-tight">
                {formattedDuration || formatDuration(routeData.duration)}
              </p>
            </div>
          </div>
          {routeData.elevationProfile && (
            <div className="border-t border-emerald-100 dark:border-emerald-800 pt-3 mt-3">
              <div className="mb-2">
                <span className="text-stone-500 dark:text-stone-400 text-[10px] font-semibold uppercase">Profil d'élévation</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg p-2">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px] block mb-1">Montée</span>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm leading-tight">
                    ↗ {formatElevation(routeData.elevationProfile.totalAscent)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-lg p-2">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px] block mb-1">Descente</span>
                  <p className="font-bold text-red-700 dark:text-red-400 text-sm leading-tight">
                    ↘ {formatElevation(routeData.elevationProfile.totalDescent)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/50 rounded-lg p-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Min: {formatElevation(routeData.elevationProfile.minElevation)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Max: {formatElevation(routeData.elevationProfile.maxElevation)}
                </span>
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
          attribution={getTileLayerAttribution()}
          url={getTileLayerUrl()}
          maxZoom={mapLayer === 'satellite' ? 19 : 20}
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

        {/* Display route with enhanced styling - optimized rendering */}
        {routePositions.length > 0 && routeData && (
          <>
            {/* Shadow layer for depth effect - only render if route is visible */}
            {routePositions.length > 1 && (
              <Polyline 
                positions={routePositions}
                pathOptions={{ 
                  color: '#000000', 
                  weight: 8, 
                  opacity: 0.2,
                  lineCap: 'round',
                  lineJoin: 'round',
                  smoothFactor: 1.0,
                }}
              />
            )}
            {/* Main route line with gradient effect */}
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
            {/* Highlight layer for better visibility - only for longer routes */}
            {routePositions.length > 10 && (
              <Polyline 
                positions={routePositions}
                pathOptions={{ 
                  color: '#10b981', 
                  weight: 3, 
                  opacity: 0.6,
                  lineCap: 'round',
                  lineJoin: 'round',
                  smoothFactor: 1.0,
                }}
              />
            )}
            {/* Direction markers along the route - optimized rendering (only for longer routes) */}
            {routePositions.length > 20 && directionMarkers.map((marker, index) => (
              <Marker
                key={`direction-${marker.position[0]}-${marker.position[1]}-${index}`}
                position={marker.position}
                icon={marker.icon}
                interactive={false}
                zIndexOffset={100}
              />
            ))}
          </>
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

      {/* Elevation Profile Visualization - Collapsible and repositioned */}
      {routeData && routeData.elevationProfile && routePositions.length > 0 && showElevationProfile && (
        <div className="absolute top-20 left-4 z-[1000] bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-emerald-200/50 dark:border-emerald-800/50 animate-fade-in-up w-[320px] max-h-[200px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Profil d'élévation
            </span>
            <button
              onClick={() => setShowElevationProfile(false)}
              className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
              title="Masquer le profil d'élévation"
            >
              <X className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-stone-500 dark:text-stone-400 mb-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Min: {formatElevation(routeData.elevationProfile.minElevation)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Max: {formatElevation(routeData.elevationProfile.maxElevation)}
            </span>
          </div>
          <div className="relative h-24 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 rounded-lg p-2 border border-stone-200 dark:border-stone-700">
            {/* Simplified elevation profile visualization */}
            <div className="relative w-full h-full">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={`grid-h-${y}`}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.2"
                    className="text-stone-400 dark:text-stone-600"
                  />
                ))}
                {/* Vertical grid lines */}
                {[0, 25, 50, 75, 100].map((x) => (
                  <line
                    key={`grid-v-${x}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.2"
                    className="text-stone-400 dark:text-stone-600"
                  />
                ))}
                {/* Elevation profile area */}
                <defs>
                  <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {/* Simplified elevation curve - using a smooth curve representation */}
                <path
                  d={`M 0,${100 - ((routeData.elevationProfile.minElevation - routeData.elevationProfile.minElevation) / (routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation || 1)) * 100} Q 25,${100 - ((routeData.elevationProfile.minElevation + routeData.elevationProfile.totalAscent * 0.3 - routeData.elevationProfile.minElevation) / (routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation || 1)) * 100} 50,${100 - ((routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation) / (routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation || 1)) * 100} T 100,${100 - ((routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation) / (routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation || 1)) * 100} L 100,100 L 0,100 Z`}
                  fill="url(#elevationGradient)"
                  stroke="#059669"
                  strokeWidth="2"
                  opacity="0.8"
                />
                {/* Elevation line */}
                <path
                  d={`M 0,${100 - ((routeData.elevationProfile.minElevation - routeData.elevationProfile.minElevation) / (routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation || 1)) * 100} Q 25,${100 - ((routeData.elevationProfile.minElevation + routeData.elevationProfile.totalAscent * 0.3 - routeData.elevationProfile.minElevation) / (routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation || 1)) * 100} 50,${100 - ((routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation) / (routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation || 1)) * 100} T 100,${100 - ((routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation) / (routeData.elevationProfile.maxElevation - routeData.elevationProfile.minElevation || 1)) * 100}`}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              {/* Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-stone-500 dark:text-stone-400 px-1">
                <span>Départ</span>
                <span>Milieu</span>
                <span>Arrivée</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};