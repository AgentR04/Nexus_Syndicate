import React, { useState } from 'react';

export interface Faction {
  id: string;
  name: string;
  description: string;
  image: string;
  primaryColor: string;
  secondaryColor: string;
}

const factions: Faction[] = [
  {
    id: 'netrunners',
    name: 'NetRunners',
    description: 'Elite hackers who specialize in digital infiltration and market manipulation.',
    image: '/netrunners.png',
    primaryColor: 'neon-blue',
    secondaryColor: 'dark-blue'
  },
  {
    id: 'synth-lords',
    name: 'Synth Lords',
    description: 'Augmentation specialists who excel at resource extraction and territory control.',
    image: '/synthlords.png',
    primaryColor: 'neon-purple',
    secondaryColor: 'dark-purple'
  },
  {
    id: 'chrome-jackals',
    name: 'Chrome Jackals',
    description: 'Mercenary traders who dominate through economic warfare and strategic alliances.',
    image: '/chromejackals.png',
    primaryColor: 'neon-pink',
    secondaryColor: 'dark-gray'
  },
  {
    id: 'quantum-collective',
    name: 'Quantum Collective',
    description: 'Technological visionaries who leverage advanced AI and predictive algorithms.',
    image: '/quantumcollective.png',
    primaryColor: 'neon-yellow',
    secondaryColor: 'dark-gray'
  }
];

interface FactionSelectionProps {
  onSelect: (faction: Faction) => void;
  selectedFactionId?: string;
}

const FactionSelection: React.FC<FactionSelectionProps> = ({ onSelect, selectedFactionId }) => {
  const [hoveredFaction, setHoveredFaction] = useState<string | null>(null);

  return (
    <div className="w-full">
      <h3 className="text-xl font-cyber mb-4 text-neon-blue">Select Your Syndicate</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {factions.map((faction) => {
          const isSelected = selectedFactionId === faction.id;
          const isHovered = hoveredFaction === faction.id;
          
          return (
            <div 
              key={faction.id}
              className={`cyber-panel cursor-pointer transition-all duration-300 ${
                isSelected ? `border-${faction.primaryColor} shadow-${faction.primaryColor}` : ''
              } ${isHovered ? 'scale-105' : 'scale-100'} relative`}
              onClick={() => onSelect(faction)}
              onMouseEnter={() => setHoveredFaction(faction.id)}
              onMouseLeave={() => setHoveredFaction(null)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-neon-green text-dark-blue rounded-full w-6 h-6 flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className={`w-16 h-16 rounded-md bg-${faction.secondaryColor} flex items-center justify-center overflow-hidden border-2 border-${faction.primaryColor}`}>
                  <img 
                    src={faction.image} 
                    alt={faction.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for missing images
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/64';
                    }}
                  />
                </div>
                
                <div className="flex-1">
                  <h4 className={`text-${faction.primaryColor} font-cyber text-lg`}>{faction.name}</h4>
                  <p className="text-sm text-light-gray">{faction.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FactionSelection;
