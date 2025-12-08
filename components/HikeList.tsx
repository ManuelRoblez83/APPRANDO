import React from 'react';
import { HikeData } from '../types';
import { MapPin, Clock, Ruler, Calendar, Trash2 } from 'lucide-react';

interface HikeListProps {
  hikes: HikeData[];
  onDelete: (id: string) => void;
}

export const HikeList: React.FC<HikeListProps> = ({ hikes, onDelete }) => {
  if (hikes.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-stone-300">
        <p className="text-stone-400">Aucune randonnée enregistrée pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hikes.map((hike) => (
        <div key={hike.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 p-4 border-b border-stone-100 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-emerald-900 truncate">{hike.name}</h3>
              <div className="flex items-center text-xs text-emerald-700 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(hike.date).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <button 
              onClick={() => onDelete(hike.id)}
              className="text-stone-400 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 text-sm space-y-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <div className="w-0.5 h-6 bg-stone-200"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-xs">Départ</span>
                  <span className="font-medium truncate max-w-[150px]">{hike.startLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 text-xs">Arrivée</span>
                  <span className="font-medium truncate max-w-[150px]">{hike.endLocation}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-stone-100 flex justify-between">
              <div className="flex items-center gap-1 text-stone-600">
                <Ruler className="w-4 h-4 text-stone-400" />
                <span>{hike.distance} km</span>
              </div>
              <div className="flex items-center gap-1 text-stone-600">
                <Clock className="w-4 h-4 text-stone-400" />
                <span>{hike.duration}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};