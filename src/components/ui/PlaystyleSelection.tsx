import React, { useState } from 'react';
import { UIPlaystyle, DEFAULT_PLAYSTYLES } from '../../services/gameDataTypes';

interface PlaystyleSelectionProps {
  onSelect: (playstyle: UIPlaystyle) => void;
  selectedPlaystyleId?: string;
}

const PlaystyleSelection: React.FC<PlaystyleSelectionProps> = ({ onSelect, selectedPlaystyleId }) => {
  const [hoveredPlaystyle, setHoveredPlaystyle] = useState<string | null>(null);
  const playstyles = DEFAULT_PLAYSTYLES;

  return (
    <div className="w-full">
      <h3 className="text-xl font-cyber mb-4 text-neon-blue">Select Your Playstyle</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playstyles.map((playstyle) => {
          const isSelected = selectedPlaystyleId === playstyle.id;
          const isHovered = hoveredPlaystyle === playstyle.id;
          
          return (
            <div 
              key={playstyle.id}
              className={`cyber-panel cursor-pointer transition-all duration-300 ${
                isSelected ? 'border-neon-green shadow-neon-green' : ''
              } ${isHovered ? 'scale-105' : 'scale-100'} relative`}
              onClick={() => onSelect(playstyle)}
              onMouseEnter={() => setHoveredPlaystyle(playstyle.id)}
              onMouseLeave={() => setHoveredPlaystyle(null)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-neon-green text-dark-blue rounded-full w-6 h-6 flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-md bg-dark-gray flex items-center justify-center text-2xl border-2 border-neon-blue">
                  {playstyle.icon}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-neon-blue font-cyber text-lg">{playstyle.name}</h4>
                  <p className="text-sm text-light-gray">{playstyle.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaystyleSelection;
