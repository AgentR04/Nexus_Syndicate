import React, { useState, useEffect } from 'react';
import { BattleResult } from '../types/gameTypes';
import gameService from '../services/gameService';

interface BattleOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  battleResult?: BattleResult;
}

const BattleOverlay: React.FC<BattleOverlayProps> = ({ isVisible, onClose, battleResult }) => {
  const [animation, setAnimation] = useState<'enter' | 'exit' | null>(null);
  
  useEffect(() => {
    if (isVisible) {
      setAnimation('enter');
    } else {
      setAnimation('exit');
    }
  }, [isVisible]);
  
  if (!battleResult) return null;
  
  const handleAnimationEnd = () => {
    if (animation === 'exit') {
      onClose();
    }
  };
  
  // Format battle details for display
  const formatBattleDetails = (details: string) => {
    return details.split('\n').map((line, index) => (
      <p key={index} className={line.includes('Outcome:') ? 'font-bold text-lg mt-4' : ''}>{line}</p>
    ));
  };
  
  // Determine color scheme based on battle outcome
  const getColorScheme = () => {
    if (battleResult.outcome === 'attacker_won') {
      return {
        background: 'bg-green-800',
        border: 'border-green-500',
        header: 'bg-green-700'
      };
    } else if (battleResult.outcome === 'defender_won') {
      return {
        background: 'bg-red-800',
        border: 'border-red-500',
        header: 'bg-red-700'
      };
    } else {
      return {
        background: 'bg-gray-800',
        border: 'border-yellow-500',
        header: 'bg-gray-700'
      };
    }
  };
  
  const colors = getColorScheme();
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        animation === 'enter' ? 'animate-fadeIn' : 'animate-fadeOut'
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className={`relative ${colors.background} ${colors.border} border-2 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto transform transition-transform ${
        animation === 'enter' ? 'scale-100' : 'scale-95'
      }`}>
        <div className={`${colors.header} p-4 flex justify-between items-center sticky top-0`}>
          <h2 className="text-xl font-bold text-white">Battle Report</h2>
          <button 
            onClick={() => setAnimation('exit')}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 text-white">
          {formatBattleDetails(battleResult.details)}
          
          <div className="mt-6 p-4 bg-black bg-opacity-30 rounded-lg">
            <h3 className="font-bold mb-2">Battle Impact:</h3>
            <p>Territory Control Change: {battleResult.territoryControlChange > 0 ? '+' : ''}{battleResult.territoryControlChange}%</p>
            <p>Agents involved: {battleResult.attackerAgents.length + battleResult.defenderAgents.length}</p>
            <p>Battle Time: {new Date(battleResult.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleOverlay;
