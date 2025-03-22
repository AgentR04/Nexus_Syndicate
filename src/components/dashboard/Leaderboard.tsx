import React, { useState } from 'react';

// Mock leaderboard data
const mockLeaderboardData = {
  players: [
    { id: 1, username: 'CyberLord', faction: 'NetRunners', score: 12500, territories: 8, rank: 1, change: 0 },
    { id: 2, username: 'QuantumQueen', faction: 'DataWraiths', score: 11200, territories: 7, rank: 2, change: 1 },
    { id: 3, username: 'NeonShadow', faction: 'SiliconSyndicate', score: 10800, territories: 6, rank: 3, change: -1 },
    { id: 4, username: 'ByteMaster', faction: 'NetRunners', score: 9500, territories: 5, rank: 4, change: 2 },
    { id: 5, username: 'SyntaxError', faction: 'QuantumVanguard', score: 8900, territories: 6, rank: 5, change: 0 },
    { id: 6, username: 'DataHunter', faction: 'DataWraiths', score: 8200, territories: 4, rank: 6, change: -2 },
    { id: 7, username: 'CipherPunk', faction: 'SiliconSyndicate', score: 7800, territories: 5, rank: 7, change: 1 },
    { id: 8, username: 'VirtualGhost', faction: 'NetRunners', score: 7500, territories: 4, rank: 8, change: 3 },
    { id: 9, username: 'CodePhantom', faction: 'QuantumVanguard', score: 7200, territories: 3, rank: 9, change: -1 },
    { id: 10, username: 'BitShifter', faction: 'DataWraiths', score: 6800, territories: 4, rank: 10, change: 0 },
  ],
  syndicates: [
    { id: 1, name: 'NetRunners', members: 120, territories: 25, score: 45000, rank: 1, change: 0 },
    { id: 2, name: 'DataWraiths', members: 105, territories: 22, score: 42000, rank: 2, change: 0 },
    { id: 3, name: 'SiliconSyndicate', members: 98, territories: 20, score: 38000, rank: 3, change: 1 },
    { id: 4, name: 'QuantumVanguard', members: 85, territories: 18, score: 35000, rank: 4, change: -1 },
    { id: 5, name: 'CyberHunters', members: 75, territories: 15, score: 30000, rank: 5, change: 0 },
  ]
};

// Faction colors
const factionColors: Record<string, string> = {
  'NetRunners': 'text-neon-blue',
  'DataWraiths': 'text-neon-purple',
  'SiliconSyndicate': 'text-neon-green',
  'QuantumVanguard': 'text-neon-pink',
  'CyberHunters': 'text-neon-yellow',
};

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'players' | 'syndicates'>('players');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'all-time'>('weekly');
  
  // Function to format large numbers
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Function to render rank change indicator
  const renderRankChange = (change: number) => {
    if (change === 0) {
      return <span className="text-light-gray">-</span>;
    } else if (change > 0) {
      return <span className="text-neon-green">↑{change}</span>;
    } else {
      return <span className="text-neon-pink">↓{Math.abs(change)}</span>;
    }
  };
  
  return (
    <div className="cyber-panel p-4">
      <h2 className="text-xl font-cyber text-neon-blue mb-4">LEADERBOARD</h2>
      
      {/* Tabs */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex border-b border-neon-blue">
          <button
            className={`px-4 py-2 font-cyber text-sm ${activeTab === 'players' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
            onClick={() => setActiveTab('players')}
          >
            PLAYERS
          </button>
          <button
            className={`px-4 py-2 font-cyber text-sm ${activeTab === 'syndicates' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
            onClick={() => setActiveTab('syndicates')}
          >
            SYNDICATES
          </button>
        </div>
        
        <div className="flex text-xs">
          <button
            className={`px-2 py-1 ${timeRange === 'daily' ? 'text-neon-blue' : 'text-light-gray'}`}
            onClick={() => setTimeRange('daily')}
          >
            DAILY
          </button>
          <button
            className={`px-2 py-1 ${timeRange === 'weekly' ? 'text-neon-blue' : 'text-light-gray'}`}
            onClick={() => setTimeRange('weekly')}
          >
            WEEKLY
          </button>
          <button
            className={`px-2 py-1 ${timeRange === 'all-time' ? 'text-neon-blue' : 'text-light-gray'}`}
            onClick={() => setTimeRange('all-time')}
          >
            ALL TIME
          </button>
        </div>
      </div>
      
      {/* Players Leaderboard */}
      {activeTab === 'players' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-light-gray text-xs border-b border-neon-blue border-opacity-30">
                <th className="py-2 text-left pl-2">RANK</th>
                <th className="py-2 text-left">PLAYER</th>
                <th className="py-2 text-right">FACTION</th>
                <th className="py-2 text-right">TERRITORIES</th>
                <th className="py-2 text-right pr-2">SCORE</th>
              </tr>
            </thead>
            <tbody>
              {mockLeaderboardData.players.map((player) => (
                <tr 
                  key={player.id} 
                  className="border-b border-dark-gray hover:bg-dark-gray cursor-pointer transition-colors"
                >
                  <td className="py-3 pl-2 flex items-center">
                    <span className={`mr-2 ${
                      player.rank <= 3 ? 'text-neon-yellow font-cyber' : 'text-light-gray'
                    }`}>
                      {player.rank}
                    </span>
                    <span className="text-xs">{renderRankChange(player.change)}</span>
                  </td>
                  <td className="py-3 font-cyber">{player.username}</td>
                  <td className={`py-3 text-right ${factionColors[player.faction] || 'text-light-gray'}`}>
                    {player.faction}
                  </td>
                  <td className="py-3 text-right text-neon-blue">{player.territories}</td>
                  <td className="py-3 text-right pr-2 font-mono">{formatNumber(player.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-center">
            <span className="text-xs text-light-gray">Your Rank: </span>
            <span className="text-sm text-neon-blue font-cyber">42</span>
            <span className="text-xs text-neon-green ml-2">↑3 this week</span>
          </div>
        </div>
      )}
      
      {/* Syndicates Leaderboard */}
      {activeTab === 'syndicates' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-light-gray text-xs border-b border-neon-blue border-opacity-30">
                <th className="py-2 text-left pl-2">RANK</th>
                <th className="py-2 text-left">SYNDICATE</th>
                <th className="py-2 text-right">MEMBERS</th>
                <th className="py-2 text-right">TERRITORIES</th>
                <th className="py-2 text-right pr-2">SCORE</th>
              </tr>
            </thead>
            <tbody>
              {mockLeaderboardData.syndicates.map((syndicate) => (
                <tr 
                  key={syndicate.id} 
                  className="border-b border-dark-gray hover:bg-dark-gray cursor-pointer transition-colors"
                >
                  <td className="py-3 pl-2 flex items-center">
                    <span className={`mr-2 ${
                      syndicate.rank <= 3 ? 'text-neon-yellow font-cyber' : 'text-light-gray'
                    }`}>
                      {syndicate.rank}
                    </span>
                    <span className="text-xs">{renderRankChange(syndicate.change)}</span>
                  </td>
                  <td className={`py-3 font-cyber ${factionColors[syndicate.name] || 'text-light-gray'}`}>
                    {syndicate.name}
                  </td>
                  <td className="py-3 text-right">{syndicate.members}</td>
                  <td className="py-3 text-right text-neon-blue">{syndicate.territories}</td>
                  <td className="py-3 text-right pr-2 font-mono">{formatNumber(syndicate.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-center">
            <span className="text-xs text-light-gray">Your Syndicate Rank: </span>
            <span className="text-sm text-neon-blue font-cyber">2</span>
            <span className="text-xs text-light-gray ml-2">No change</span>
          </div>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-dark-blue rounded">
        <h3 className="text-sm font-cyber text-neon-purple mb-2">TOP ACHIEVEMENTS</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Most Territories Captured</span>
            <span className="text-neon-blue">NetRunners (25)</span>
          </div>
          <div className="flex justify-between">
            <span>Highest Resource Production</span>
            <span className="text-neon-purple">DataWraiths (+8,500/hr)</span>
          </div>
          <div className="flex justify-between">
            <span>Most Successful Raids</span>
            <span className="text-neon-green">SiliconSyndicate (42)</span>
          </div>
          <div className="flex justify-between">
            <span>Best Market Traders</span>
            <span className="text-neon-pink">QuantumVanguard (+15% profit)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
