import React, { useState } from 'react';
import { Share2, Facebook, Instagram, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { HikeData } from '../types';

interface SocialShareProps {
  hike: HikeData;
}

export const SocialShare: React.FC<SocialShareProps> = ({ hike }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Génère le texte de partage
  const generateShareText = () => {
    const elevationText = hike.elevationProfile
      ? ` 📈 +${Math.round(hike.elevationProfile.totalAscent)}m / -${Math.round(hike.elevationProfile.totalDescent)}m`
      : '';
    
    return `🏔️ ${hike.name}\n\n` +
           `📍 De ${hike.startLocation} à ${hike.endLocation}\n` +
           `📏 Distance: ${hike.distance} km\n` +
           `⏱️ Durée: ${hike.duration}${elevationText}\n\n` +
           `Planifiée avec RandoTrack 🥾`;
  };

  // Génère l'URL de partage (on pourrait utiliser l'URL de l'app quand elle sera déployée)
  const generateShareUrl = () => {
    // Pour l'instant, on génère juste le texte. Plus tard, on pourrait créer des URLs partageables
    return window.location.href;
  };

  // Partage natif (Web Share API)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hike.name,
          text: generateShareText(),
          url: generateShareUrl(),
        });
        setIsOpen(false);
      } catch (error) {
        // L'utilisateur a annulé le partage
        if ((error as Error).name !== 'AbortError') {
          console.error('Erreur lors du partage:', error);
        }
      }
    } else {
      // Fallback: copier dans le presse-papiers
      handleCopy();
    }
  };

  // Partage sur Facebook
  const handleFacebookShare = () => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(generateShareUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      '_blank',
      'width=600,height=400'
    );
    setIsOpen(false);
  };

  // Partage sur Twitter/X
  const handleTwitterShare = () => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(generateShareUrl());
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=600,height=400'
    );
    setIsOpen(false);
  };

  // Partage sur WhatsApp
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText() + '\n\n' + generateShareUrl());
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setIsOpen(false);
  };

  // Copier le texte dans le presse-papiers
  const handleCopy = async () => {
    try {
      const textToCopy = generateShareText() + '\n\n' + generateShareUrl();
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      alert('Impossible de copier dans le presse-papiers');
    }
  };

  // Pour Instagram, on copie juste le texte car il n'y a pas d'API de partage directe
  const handleInstagramShare = () => {
    handleCopy();
    alert('Texte copié ! Collez-le dans votre post Instagram avec une photo de votre randonnée 🏔️');
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-stone-400 hover:text-emerald-600 transition-colors p-1.5 rounded-md hover:bg-emerald-50"
        title="Partager"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          
          {/* Menu de partage */}
          <div
            className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-stone-200 p-2 z-50 min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-semibold text-stone-500 px-2 py-1 mb-1 border-b border-stone-100">
              Partager cette randonnée
            </div>
            
            {/* Partage natif (mobile) */}
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-emerald-50 text-sm text-stone-700 transition-colors"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                Partager (natif)
              </button>
            )}

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 text-sm text-stone-700 transition-colors"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </button>

            {/* Twitter/X */}
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sky-50 text-sm text-stone-700 transition-colors"
            >
              <Twitter className="w-4 h-4 text-sky-500" />
              Twitter / X
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 text-sm text-stone-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagramShare}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-pink-50 text-sm text-stone-700 transition-colors"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              Instagram
            </button>

            {/* Copier le lien */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-stone-50 text-sm text-stone-700 transition-colors border-t border-stone-100 mt-1 pt-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-400" />
                  Copier le texte
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};


