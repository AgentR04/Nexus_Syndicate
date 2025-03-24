import React, { useState } from 'react';
import { UIAvatar, DEFAULT_AVATARS } from '../../services/gameDataTypes';

export interface Avatar {
  id: string;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Color mapping for rarity
const rarityColors = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400'
};

interface AvatarSelectionProps {
  onSelect: (avatar: UIAvatar) => void;
  selectedAvatarId?: string;
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onSelect, selectedAvatarId }) => {
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
  const avatars = DEFAULT_AVATARS;

  return (
    <div className="w-full">
      <h3 className="text-xl font-cyber mb-4 text-neon-blue">Select Your Avatar</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {avatars.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          const isHovered = hoveredAvatar === avatar.id;
          const rarityColor = rarityColors[avatar.rarity] || 'text-gray-400';
          
          return (
            <div 
              key={avatar.id}
              className={`cyber-panel cursor-pointer transition-all duration-300 ${
                isSelected ? 'border-neon-green shadow-neon-green' : ''
              } ${isHovered ? 'scale-105' : 'scale-100'} relative`}
              onClick={() => onSelect(avatar)}
              onMouseEnter={() => setHoveredAvatar(avatar.id)}
              onMouseLeave={() => setHoveredAvatar(null)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-neon-green text-dark-blue rounded-full w-6 h-6 flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              <div className="flex flex-col items-center p-2">
                <div className="w-20 h-20 rounded-full bg-dark-gray flex items-center justify-center overflow-hidden border-2 border-neon-blue mb-2">
                  <img 
                    src={avatar.image} 
                    alt={avatar.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for missing images
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/80';
                    }}
                  />
                </div>
                
                <h4 className="text-neon-blue font-cyber text-center">{avatar.name}</h4>
                <span className={`text-xs ${rarityColor} uppercase`}>{avatar.rarity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelection;
