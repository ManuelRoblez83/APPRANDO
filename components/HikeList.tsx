import React from 'react';
import { HikeData } from '../types';
import { MapPin, Clock, Ruler, Calendar, Trash2, Edit2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { SocialShare } from './SocialShare';

interface HikeListProps {
  hikes: HikeData[];
  onDelete: (id: string) => void;
  onEdit: (hike: HikeData) => void;
  onShowOnMap: (hike: HikeData) => void;
}

export const HikeList: React.FC<HikeListProps> = ({ hikes, onDelete, onEdit, onShowOnMap }) => {
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
        <div 
          key={hike.id} 
          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onShowOnMap(hike)}
        >
          <div className="bg-emerald-50 p-4 border-b border-stone-100 flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-emerald-900 truncate">{hike.name}</h3>
              <div className="flex items-center text-xs text-emerald-700 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(hike.date).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
              <SocialShare hike={hike} />
              <button 
                onClick={() => onEdit(hike)}
                className="text-stone-400 hover:text-emerald-600 transition-colors p-1"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(hike.id)}
                className="text-stone-400 hover:text-red-500 transition-colors p-1"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
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
            
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="flex items-center gap-4 text-stone-600 text-xs">
                <div className="flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-stone-400" />
                  <span>{hike.distance} km</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>{hike.duration}</span>
                </div>
              </div>
              {hike.elevationProfile && (
                <div className="flex items-center gap-3 text-stone-600 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-700 font-medium">+{Math.round(hike.elevationProfile.totalAscent)} m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-red-700 font-medium">-{Math.round(hike.elevationProfile.totalDescent)} m</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium pt-1">
                <Eye className="w-3 h-3" />
                <span>Cliquer pour voir sur la carte</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};