import React, { useState, useEffect } from 'react';
import { Player } from '../types/gameTypes';
import gameService from '../services/gameService';

interface PlayersLeaderboardProps {
  players: Player[];
  currentPlayerId: string;
}

const PlayersLeaderboard: React.FC<PlayersLeaderboardProps> = ({ players, currentPlayerId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by online status first
    if (a.online && !b.online) return -1;
    if (!a.online && b.online) return 1;
    
    // Then by score
    return (b.score || 0) - (a.score || 0);
  });
  
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-gray-900 bg-opacity-90 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
        <div 
          className="flex justify-between items-center p-3 cursor-pointer bg-gray-800"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-white font-bold">Syndicate Leaderboard</h3>
          <span className="text-gray-400">
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </div>
        
        {isExpanded && (
          <div className="p-3">
            <div className="grid grid-cols-12 text-xs text-gray-400 mb-2 px-2">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Syndicate</div>
              <div className="col-span-3">Faction</div>
              <div className="col-span-3 text-right">Score</div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {sortedPlayers.map((player, index) => (
                <div 
                  key={player.id}
                  className={`grid grid-cols-12 py-2 px-2 text-sm rounded ${
                    player.id === currentPlayerId 
                      ? 'bg-blue-900 bg-opacity-50' 
                      : index % 2 === 0 
                        ? 'bg-gray-800' 
                        : ''
                  }`}
                >
                  <div className="col-span-1 text-gray-400">{index + 1}</div>
                  <div className="col-span-5 flex items-center">
                    {player.online && (
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    )}
                    <span className={player.id === currentPlayerId ? 'text-blue-300 font-medium' : 'text-white'}>
                      {player.name}
                    </span>
                  </div>
                  <div className="col-span-3 text-gray-400">{player.faction}</div>
                  <div className="col-span-3 text-right text-yellow-400 font-medium">{player.score || 0}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <span>Online Players: {players.filter(p => p.online).length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersLeaderboard;
