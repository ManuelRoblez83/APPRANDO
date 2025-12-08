import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon, LatLngTuple } from 'leaflet';
import { Coordinates } from '../types';
import { MapPin } from 'lucide-react';

// This sub-component handles fitting the map bounds when coordinates change
const MapUpdater: React.FC<{ start?: Coordinates; end?: Coordinates }> = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (start && end) {
      const bounds = [
        [start.lat, start.lng] as LatLngTuple,
        [end.lat, end.lng] as LatLngTuple,
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (start) {
      map.setView([start.lat, start.lng], 13);
    }
  }, [start, end, map]);

  return null;
};

interface MapDisplayProps {
  startCoords?: Coordinates;
  endCoords?: Coordinates;
  startName: string;
  endName: string;
}

// Custom SVG icon for markers to avoid Leaflet default asset issues
const createCustomIcon = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `;
  
  return divIcon({
    className: 'bg-transparent',
    html: svg,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const startIcon = createCustomIcon('#10b981'); // Emerald-500
const endIcon = createCustomIcon('#ef4444'); // Red-500

export const MapDisplay: React.FC<MapDisplayProps> = ({ startCoords, endCoords, startName, endName }) => {
  const defaultCenter: LatLngTuple = [46.603354, 1.888334]; // Center of France
  
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-stone-200 z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater start={startCoords} end={endCoords} />

        {startCoords && (
          <Marker position={[startCoords.lat, startCoords.lng]} icon={startIcon}>
            <Popup>
              <strong>Départ:</strong> {startName}
            </Popup>
          </Marker>
        )}

        {endCoords && (
          <Marker position={[endCoords.lat, endCoords.lng]} icon={endIcon}>
            <Popup>
              <strong>Arrivée:</strong> {endName}
            </Popup>
          </Marker>
        )}

        {startCoords && endCoords && (
          <Polyline 
            positions={[
              [startCoords.lat, startCoords.lng],
              [endCoords.lat, endCoords.lng]
            ]}
            pathOptions={{ color: '#059669', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
          />
        )}
      </MapContainer>
    </div>
  );
};