import React, { useState } from 'react';

export interface Avatar {
  id: string;
  name: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Sample avatars - in a real implementation, these would be loaded from an API
const avatars: Avatar[] = [
  {
    id: 'avatar-1',
    name: 'Neon Ronin',
    image: '/avatar1.png',
    rarity: 'common'
  },
  {
    id: 'avatar-2',
    name: 'Digital Samurai',
    image: '/avatar2.png',
    rarity: 'common'
  },
  {
    id: 'avatar-3',
    name: 'Cyber Huntress',
    image: '/avatar3.png',
    rarity: 'rare'
  },
  {
    id: 'avatar-4',
    name: 'Ghost Protocol',
    image: '/avatar4.png',
    rarity: 'rare'
  },
  {
    id: 'avatar-5',
    name: 'Neural Phantom',
    image: '/avatar5.png',
    rarity: 'epic'
  },
  {
    id: 'avatar-6',
    name: 'Quantum Shadow',
    image: '/avatar6.png',
    rarity: 'legendary'
  }
];

// Color mapping for rarity
const rarityColors = {
  common: 'text-white border-white',
  rare: 'text-neon-blue border-neon-blue',
  epic: 'text-neon-purple border-neon-purple',
  legendary: 'text-neon-yellow border-neon-yellow'
};

interface AvatarSelectionProps {
  onSelect: (avatar: Avatar) => void;
  selectedAvatarId?: string;
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onSelect, selectedAvatarId }) => {
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  return (
    <div className="w-full">
      <h3 className="text-xl font-cyber mb-4 text-neon-blue">Choose Your Avatar</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {avatars.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          const isHovered = hoveredAvatar === avatar.id;
          const rarityColor = rarityColors[avatar.rarity];
          
          return (
            <div 
              key={avatar.id}
              className={`cyber-panel cursor-pointer transition-all duration-300 ${
                isSelected ? rarityColor : ''
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
              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-full bg-dark-blue flex items-center justify-center overflow-hidden border-2 ${rarityColor} mb-2`}>
                  <img 
                    src={avatar.image} 
                    alt={avatar.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for missing images
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/96';
                    }}
                  />
                </div>
                
                <h4 className={`font-cyber text-center ${rarityColor.split(' ')[0]}`}>{avatar.name}</h4>
                <span className={`text-xs uppercase ${rarityColor.split(' ')[0]}`}>{avatar.rarity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelection;
