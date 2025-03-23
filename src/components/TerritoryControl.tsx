import React from 'react';
import { Territory } from '../types/gameTypes';

interface TerritoryControlProps {
  territory: Territory;
}

const TerritoryControl: React.FC<TerritoryControlProps> = ({ territory }) => {
  // Calculate control percentage
  const controlPercentage = territory.controlPoints || 0;
  
  // Determine color scheme based on territory owner
  const getColorScheme = () => {
    if (territory.owner === 'player') {
      return {
        primary: 'bg-blue-500',
        secondary: 'bg-blue-700',
        text: 'text-blue-100'
      };
    } else if (territory.owner === 'rival') {
      return {
        primary: 'bg-red-500',
        secondary: 'bg-red-700',
        text: 'text-red-100'
      };
    } else {
      return {
        primary: 'bg-gray-500',
        secondary: 'bg-gray-700',
        text: 'text-gray-100'
      };
    }
  };
  
  const colors = getColorScheme();
  
  // Only show control bar for contested territories
  if (territory.status !== 'contested') {
    return null;
  }
  
  return (
    <div className="absolute bottom-0 left-0 w-full px-1 pb-1">
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full ${colors.primary}`}
          style={{ width: `${controlPercentage}%` }}
        ></div>
      </div>
      
      {/* Display last capture time if available */}
      {territory.lastCaptureTime && (
        <div className="text-xs text-center mt-1 text-white opacity-70">
          {new Date(territory.lastCaptureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};

export default TerritoryControl;
