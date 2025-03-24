import React, { useState, useEffect } from 'react';
import gameDataService, { FirestoreFaction } from '../../services/gameDataService';

export interface Faction {
  id: string;
  name: string;
  description: string;
  image: string;
  primaryColor: string;
  secondaryColor: string;
}

interface FactionSelectionProps {
  onSelect: (faction: Faction) => void;
  selectedFactionId?: string;
}

const FactionSelection: React.FC<FactionSelectionProps> = ({ onSelect, selectedFactionId }) => {
  const [hoveredFaction, setHoveredFaction] = useState<string | null>(null);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map Firestore factions to UI factions with color information
  const mapFirestoreFaction = (firestoreFaction: FirestoreFaction): Faction => {
    // Map faction names to colors
    const colorMap: Record<string, { primary: string, secondary: string }> = {
      'Neon Dragons': { primary: 'neon-blue', secondary: 'dark-blue' },
      'Chrome Collective': { primary: 'neon-purple', secondary: 'dark-purple' },
      'Quantum Cartel': { primary: 'neon-pink', secondary: 'dark-gray' },
      'Ghost Protocol': { primary: 'neon-yellow', secondary: 'dark-gray' }
    };

    const colors = colorMap[firestoreFaction.name] || { primary: 'neon-blue', secondary: 'dark-blue' };

    return {
      id: firestoreFaction.id,
      name: firestoreFaction.name,
      description: firestoreFaction.description,
      image: firestoreFaction.imageUrl || `/images/factions/${firestoreFaction.id}.jpg`,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary
    };
  };

  useEffect(() => {
    const fetchFactions = async () => {
      try {
        setLoading(true);
        const firestoreFactions = await gameDataService.getAllFactions();
        const mappedFactions = firestoreFactions.map(mapFirestoreFaction);
        setFactions(mappedFactions);
        setError(null);
      } catch (err) {
        console.error('Error fetching factions:', err);
        setError('Failed to load factions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFactions();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <h3 className="text-xl font-cyber mb-4 text-neon-blue">Select Your Syndicate</h3>
        <div className="cyber-panel p-6 text-center">
          <p className="text-neon-blue animate-pulse">Loading syndicates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-xl font-cyber mb-4 text-neon-blue">Select Your Syndicate</h3>
        <div className="cyber-panel p-6 text-center border-neon-pink">
          <p className="text-neon-pink">{error}</p>
          <button 
            className="cyber-button-small mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
