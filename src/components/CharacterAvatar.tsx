import React from 'react';
import { Appearance } from '../types';

interface CharacterAvatarProps {
  appearance: Appearance;
  gender: string;
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ appearance, gender, className }) => {
  const getSkinColor = (skin: string) => {
    switch (skin) {
      case 'Fair': return '#fce3d5';
      case 'Light': return '#f5d0bb';
      case 'Medium': return '#e8b89e';
      case 'Tan': return '#c68e65';
      case 'Dark': return '#8d5524';
      default: return '#fce3d5';
    }
  };

  const getHairColor = (hair: string) => {
    switch (hair) {
      case 'Black': return '#1a1a1a';
      case 'Brown': return '#4d2600';
      case 'Blonde': return '#e6c300';
      case 'Red': return '#cc3300';
      case 'Bald': return 'transparent';
      case 'Grey': return '#d1d1d1';
      default: return '#1a1a1a';
    }
  };

  const getEyeColor = (eyes: string) => {
    switch (eyes) {
      case 'Blue': return '#4a90e2';
      case 'Green': return '#7ed321';
      case 'Brown': return '#8b572a';
      case 'Hazel': return '#b8e986';
      case 'Grey': return '#9b9b9b';
      default: return '#4a90e2';
    }
  };

  const skin = getSkinColor(appearance.skin);
  const hairColor = getHairColor(appearance.hair);
  const eyeColor = getEyeColor(appearance.eyes);

  return (
    <div className={className}>
      <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-2xl">
        {/* Base Body - Minimalist Silhouette */}
        <path d="M60,400 L140,400 L140,250 L160,180 L130,100 L70,100 L40,180 L60,250 Z" fill="#222" />
        
        {/* Skin - Simple Rectangular limbs for modern look */}
        {/* Neck */}
        <rect x="90" y="90" width="20" height="20" fill={skin} />
        
        {/* Head */}
        <rect x="75" y="40" width="50" height="60" rx="15" fill={skin} />
        
        {/* Facial Features */}
        {/* Brows */}
        <path 
           d={appearance.brows === 'Thick' ? "M80,55 L95,55 M105,55 L120,55" : "M82,56 L93,56 M107,56 L118,56"} 
           stroke="#000" 
           strokeWidth={appearance.brows === 'Thick' ? "2" : "1"} 
        />
        
        {/* Eyes */}
        <circle cx="88" cy="65" r="3" fill="white" />
        <circle cx="88" cy="65" r="1.5" fill={eyeColor} />
        <circle cx="112" cy="65" r="3" fill="white" />
        <circle cx="112" cy="65" r="1.5" fill={eyeColor} />
        
        {/* Mouth */}
        <path d="M92,85 Q100,88 108,85" stroke="#000" strokeWidth="1" fill="none" />
        
        {/* Facial Hair */}
        {appearance.facialHair !== 'None' && (
          <path 
            d={appearance.facialHair === 'Beard' ? "M75,75 Q75,100 100,100 Q125,100 125,75 Z" : "M90,80 L110,80"} 
            fill={appearance.facialHair === 'Beard' ? "#000" : "none"}
            stroke="#000"
            strokeWidth={appearance.facialHair === 'Mustache' ? "2" : "0"}
            opacity="0.3"
          />
        )}

        {/* Hair */}
        {appearance.hair !== 'Bald' && (
           <path 
             d={gender === 'Female' ? "M70,40 Q70,0 100,0 Q130,0 130,40 L135,100 L65,100 Z" : "M75,40 Q75,20 100,20 Q125,20 125,40 Z"} 
             fill={hairColor} 
           />
        )}
      </svg>
    </div>
  );
};
