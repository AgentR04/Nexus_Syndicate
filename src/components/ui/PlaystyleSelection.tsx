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
              }`}
              onClick={() => onSelect(playstyle)}
            >
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
