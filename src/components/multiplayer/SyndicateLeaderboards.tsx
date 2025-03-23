import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

interface LeaderboardEntry {
  id: string;
  name: string;
  faction: string;
  score: number;
  territoriesControlled: number;
  resourcesGenerated: number;
  missionsCompleted: number;
  rank: number;
}

const SyndicateLeaderboards: React.FC = () => {
  const { currentPlayer } = useGame();
  const [activeTab, setActiveTab] = useState<'syndicates' | 'players'>('syndicates');

  // Mock leaderboard data
  const syndicateLeaderboard: LeaderboardEntry[] = [
    {
      id: 'syndicate1',
      name: 'Netrunners',
      faction: 'Netrunners',
      score: 12500,
      territoriesControlled: 12,
      resourcesGenerated: 8750,
      missionsCompleted: 15,
      rank: 1
    },
    {
      id: 'syndicate2',
      name: 'Synth Lords',
      faction: 'Synth Lords',
      score: 11200,
      territoriesControlled: 10,
      resourcesGenerated: 7800,
      missionsCompleted: 12,
      rank: 2
    },
    {
      id: 'syndicate3',
      name: 'Chrome Jackals',
      faction: 'Chrome Jackals',
      score: 9800,
      territoriesControlled: 8,
      resourcesGenerated: 6500,
      missionsCompleted: 10,
      rank: 3
    },
    {
      id: 'syndicate4',
      name: 'Quantum Collective',
      faction: 'Quantum Collective',
      score: 8500,
      territoriesControlled: 7,
      resourcesGenerated: 5200,
      missionsCompleted: 8,
      rank: 4
    }
  ];

  const playerLeaderboard: LeaderboardEntry[] = [
    {
      id: 'player1',
      name: 'CyberHawk',
      faction: 'Netrunners',
      score: 4500,
      territoriesControlled: 5,
      resourcesGenerated: 3200,
      missionsCompleted: 7,
      rank: 1
    },
    {
      id: 'player2',
      name: 'DataWraith',
      faction: 'Netrunners',
      score: 4200,
      territoriesControlled: 4,
      resourcesGenerated: 2800,
      missionsCompleted: 6,
      rank: 2
    },
    {
      id: 'player3',
      name: 'NeonShadow',
      faction: 'Synth Lords',
      score: 3800,
      territoriesControlled: 3,
      resourcesGenerated: 2500,
      missionsCompleted: 5,
      rank: 3
    },
    {
      id: 'player4',
      name: 'QuantumPhase',
      faction: 'Quantum Collective',
      score: 3500,
      territoriesControlled: 3,
      resourcesGenerated: 2200,
      missionsCompleted: 4,
      rank: 4
    },
    {
      id: 'player5',
      name: 'ChromeHunter',
      faction: 'Chrome Jackals',
      score: 3200,
      territoriesControlled: 2,
      resourcesGenerated: 2000,
      missionsCompleted: 4,
      rank: 5
    },
    {
      id: currentPlayer?.id || 'player6',
      name: currentPlayer?.name || 'Your Agent',
      faction: currentPlayer?.faction || 'Netrunners',
      score: 2800,
      territoriesControlled: 2,
      resourcesGenerated: 1800,
      missionsCompleted: 3,
      rank: 6
    }
  ];

  const getFactionColor = (faction: string): string => {
    switch (faction) {
      case 'Netrunners':
        return 'text-neon-blue';
      case 'Synth Lords':
        return 'text-neon-purple';
      case 'Chrome Jackals':
        return 'text-neon-pink';
      case 'Quantum Collective':
        return 'text-neon-yellow';
      default:
        return 'text-neon-green';
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'text-neon-yellow';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-light-gray';
    }
  };

  const getRowHighlight = (id: string): string => {
    return id === currentPlayer?.id || 
           (activeTab === 'syndicates' && currentPlayer?.faction === id) 
      ? 'bg-neon-blue bg-opacity-20 border border-neon-blue' 
      : 'hover:bg-dark-blue hover:bg-opacity-40';
  };

  return (
    <div className="cyber-panel bg-dark-gray p-4">
      <h2 className="text-neon-blue font-cyber text-xl mb-4">SYNDICATE LEADERBOARDS</h2>
      
      <div className="flex border-b border-neon-blue mb-4">
        <button
          className={`px-4 py-2 font-cyber text-sm ${
            activeTab === 'syndicates'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('syndicates')}
        >
          SYNDICATES
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${
            activeTab === 'players'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('players')}
        >
          PLAYERS
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-blue">
              <th className="px-4 py-2 text-left text-xs text-gray-400">RANK</th>
              <th className="px-4 py-2 text-left text-xs text-gray-400">NAME</th>
              <th className="px-4 py-2 text-left text-xs text-gray-400">FACTION</th>
              <th className="px-4 py-2 text-right text-xs text-gray-400">SCORE</th>
              <th className="px-4 py-2 text-right text-xs text-gray-400">TERRITORIES</th>
              <th className="px-4 py-2 text-right text-xs text-gray-400">RESOURCES</th>
              <th className="px-4 py-2 text-right text-xs text-gray-400">MISSIONS</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'syndicates' ? syndicateLeaderboard : playerLeaderboard).map((entry) => (
              <tr 
                key={entry.id}
                className={`border-b border-dark-blue transition-all duration-200 ${getRowHighlight(entry.id)}`}
              >
                <td className="px-4 py-3">
                  <span className={`font-cyber ${getRankColor(entry.rank)}`}>
                    {entry.rank === 1 && '🏆 '}
                    {entry.rank === 2 && '🥈 '}
                    {entry.rank === 3 && '🥉 '}
                    {entry.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-light-gray">
                    {entry.name}
                    {(entry.id === currentPlayer?.id || 
                      (activeTab === 'syndicates' && entry.faction === currentPlayer?.faction)) && 
                      <span className="ml-2 text-neon-green text-xs">(YOU)</span>
                    }
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`${getFactionColor(entry.faction)}`}>
                    {entry.faction}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-neon-green">{entry.score.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-neon-blue">{entry.territoriesControlled}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-neon-purple">{entry.resourcesGenerated.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-neon-yellow">{entry.missionsCompleted}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 bg-dark-blue bg-opacity-30 p-3 rounded">
        <h3 className="text-neon-blue font-cyber text-sm mb-2">LEADERBOARD REWARDS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-gray p-3 rounded border border-neon-yellow">
            <div className="flex items-center mb-2">
              <span className="text-neon-yellow mr-2">🏆</span>
              <span className="text-light-gray font-cyber">1ST PLACE</span>
            </div>
            <ul className="text-xs text-light-gray space-y-1">
              <li>• 5,000 Bonus Credits</li>
              <li>• Exclusive Territory Access</li>
              <li>• Unique Syndicate Upgrade</li>
              <li>• Special Agent Recruitment</li>
            </ul>
          </div>
          
          <div className="bg-dark-gray p-3 rounded border border-gray-400">
            <div className="flex items-center mb-2">
              <span className="text-gray-300 mr-2">🥈</span>
              <span className="text-light-gray font-cyber">2ND PLACE</span>
            </div>
            <ul className="text-xs text-light-gray space-y-1">
              <li>• 2,500 Bonus Credits</li>
              <li>• Premium Resource Node</li>
              <li>• Syndicate Upgrade</li>
            </ul>
          </div>
          
          <div className="bg-dark-gray p-3 rounded border border-amber-600">
            <div className="flex items-center mb-2">
              <span className="text-amber-600 mr-2">🥉</span>
              <span className="text-light-gray font-cyber">3RD PLACE</span>
            </div>
            <ul className="text-xs text-light-gray space-y-1">
              <li>• 1,000 Bonus Credits</li>
              <li>• Resource Node Access</li>
              <li>• Agent Skill Boost</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyndicateLeaderboards;
