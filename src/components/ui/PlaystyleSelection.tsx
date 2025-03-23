import React from 'react';

export interface Playstyle {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const playstyles: Playstyle[] = [
  {
    id: 'trader',
    name: 'Market Manipulator',
    description: 'Focus on economic domination through trading and market control.',
    icon: '💹'
  },
  {
    id: 'territorial',
    name: 'Territory Controller',
    description: 'Expand your influence by claiming and defending strategic locations.',
    icon: '🏙️'
  },
  {
    id: 'diplomat',
    name: 'Alliance Builder',
    description: 'Form powerful alliances and leverage diplomatic relations.',
    icon: '🤝'
  },
  {
    id: 'technologist',
    name: 'Tech Innovator',
    description: 'Research cutting-edge technologies to gain competitive advantages.',
    icon: '🔬'
  }
];

interface PlaystyleSelectionProps {
  onSelect: (playstyle: Playstyle) => void;
  selectedPlaystyleId?: string;
}

const PlaystyleSelection: React.FC<PlaystyleSelectionProps> = ({ onSelect, selectedPlaystyleId }) => {
  return (
    <div className="w-full">
      <h3 className="text-xl font-cyber mb-4 text-neon-blue">Choose Your Playstyle</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playstyles.map((playstyle) => {
          const isSelected = selectedPlaystyleId === playstyle.id;
          
          return (
            <div 
              key={playstyle.id}
              className={`cyber-panel cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected ? 'border-neon-yellow shadow-neon-yellow' : ''
              } relative`}
              onClick={() => onSelect(playstyle)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-neon-green text-dark-blue rounded-full w-6 h-6 flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex items-center">
                <div className="text-4xl mr-4">{playstyle.icon}</div>
                <div>
                  <h4 className="text-neon-yellow font-cyber">{playstyle.name}</h4>
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
