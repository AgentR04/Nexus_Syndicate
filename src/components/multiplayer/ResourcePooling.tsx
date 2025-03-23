import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

interface ResourcePoolData {
  id: string;
  name: string;
  faction: string;
  totalCredits: number;
  totalDataShards: number;
  totalSyntheticAlloys: number;
  totalQuantumCores: number;
  contributors: {
    playerId: string;
    playerName: string;
    contributions: {
      credits: number;
      dataShards: number;
      syntheticAlloys: number;
      quantumCores: number;
    }
  }[];
  upgrades: {
    id: string;
    name: string;
    description: string;
    cost: {
      credits: number;
      dataShards: number;
      syntheticAlloys: number;
      quantumCores: number;
    };
    progress: number;
    unlocked: boolean;
  }[];
}

const ResourcePooling: React.FC = () => {
  const { currentPlayer } = useGame();
  const [contributionAmounts, setContributionAmounts] = useState({
    credits: 0,
    dataShards: 0,
    syntheticAlloys: 0,
    quantumCores: 0
  });
  
  // Mock resource pool data
  const resourcePool: ResourcePoolData = {
    id: 'pool1',
    name: 'Netrunners Collective',
    faction: 'Netrunners',
    totalCredits: 12500,
    totalDataShards: 750,
    totalSyntheticAlloys: 320,
    totalQuantumCores: 85,
    contributors: [
      {
        playerId: 'player1',
        playerName: 'CyberHawk',
        contributions: {
          credits: 5000,
          dataShards: 300,
          syntheticAlloys: 120,
          quantumCores: 30
        }
      },
      {
        playerId: 'player2',
        playerName: 'DataWraith',
        contributions: {
          credits: 4500,
          dataShards: 250,
          syntheticAlloys: 100,
          quantumCores: 25
        }
      },
      {
        playerId: 'player3',
        playerName: 'NeonShadow',
        contributions: {
          credits: 3000,
          dataShards: 200,
          syntheticAlloys: 100,
          quantumCores: 30
        }
      }
    ],
    upgrades: [
      {
        id: 'upgrade1',
        name: 'Advanced Neural Network',
        description: 'Increases hacking success rate by 15% for all syndicate members',
        cost: {
          credits: 10000,
          dataShards: 500,
          syntheticAlloys: 200,
          quantumCores: 50
        },
        progress: 85,
        unlocked: false
      },
      {
        id: 'upgrade2',
        name: 'Quantum Encryption',
        description: 'Reduces detection chance during missions by 20%',
        cost: {
          credits: 8000,
          dataShards: 400,
          syntheticAlloys: 150,
          quantumCores: 40
        },
        progress: 100,
        unlocked: true
      },
      {
        id: 'upgrade3',
        name: 'Syndicate Territory Shield',
        description: 'Increases defense of all syndicate territories by 25%',
        cost: {
          credits: 15000,
          dataShards: 800,
          syntheticAlloys: 350,
          quantumCores: 100
        },
        progress: 45,
        unlocked: false
      }
    ]
  };

  const handleContributionChange = (resource: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setContributionAmounts({
      ...contributionAmounts,
      [resource]: numValue
    });
  };

  const handleContribute = () => {
    if (!currentPlayer) return;
    
    // In a real implementation, this would send a request to a backend service
    // resourceService.contributeToPool(resourcePool.id, currentPlayer.id, contributionAmounts);
    
    // Reset contribution amounts
    setContributionAmounts({
      credits: 0,
      dataShards: 0,
      syntheticAlloys: 0,
      quantumCores: 0
    });
    
    // In a real implementation, this would trigger a state update from the backend
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'bg-neon-green';
    if (progress >= 75) return 'bg-neon-blue';
    if (progress >= 50) return 'bg-neon-yellow';
    if (progress >= 25) return 'bg-neon-purple';
    return 'bg-neon-pink';
  };

  return (
    <div className="cyber-panel bg-dark-gray p-4">
      <h2 className="text-neon-blue font-cyber text-xl mb-4">SYNDICATE RESOURCE POOL</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resource Pool Overview */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-dark-blue bg-opacity-30 p-4 rounded">
            <h3 className="text-neon-blue font-cyber text-sm mb-3">{resourcePool.name}</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-light-gray">Credits</span>
                  <span className="text-xs text-neon-green">{resourcePool.totalCredits.toLocaleString()}</span>
                </div>
                <div className="w-full bg-dark-blue rounded-full h-1.5">
                  <div
                    className="bg-neon-green h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (resourcePool.totalCredits / 20000) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-light-gray">Data Shards</span>
                  <span className="text-xs text-neon-blue">{resourcePool.totalDataShards.toLocaleString()}</span>
                </div>
                <div className="w-full bg-dark-blue rounded-full h-1.5">
                  <div
                    className="bg-neon-blue h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (resourcePool.totalDataShards / 1000) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-light-gray">Synthetic Alloys</span>
                  <span className="text-xs text-neon-purple">{resourcePool.totalSyntheticAlloys.toLocaleString()}</span>
                </div>
                <div className="w-full bg-dark-blue rounded-full h-1.5">
                  <div
                    className="bg-neon-purple h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (resourcePool.totalSyntheticAlloys / 500) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-light-gray">Quantum Cores</span>
                  <span className="text-xs text-neon-yellow">{resourcePool.totalQuantumCores.toLocaleString()}</span>
                </div>
                <div className="w-full bg-dark-blue rounded-full h-1.5">
                  <div
                    className="bg-neon-yellow h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (resourcePool.totalQuantumCores / 200) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Contributors */}
          <div className="bg-dark-blue bg-opacity-30 p-4 rounded">
            <h3 className="text-neon-blue font-cyber text-sm mb-3">TOP CONTRIBUTORS</h3>
            
            <div className="space-y-2">
              {resourcePool.contributors.map((contributor, index) => (
                <div key={contributor.playerId} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`text-xs ${index === 0 ? 'text-neon-yellow' : index === 1 ? 'text-gray-300' : 'text-amber-600'}`}>
                      {index + 1}.
                    </span>
                    <span className="ml-2 text-sm text-light-gray">
                      {contributor.playerName}
                      {contributor.playerId === currentPlayer?.id && (
                        <span className="ml-1 text-neon-green text-xs">(YOU)</span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-neon-green">
                    {contributor.contributions.credits.toLocaleString()} CR
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contribute Resources */}
          {currentPlayer && (
            <div className="bg-dark-blue bg-opacity-30 p-4 rounded">
              <h3 className="text-neon-blue font-cyber text-sm mb-3">CONTRIBUTE RESOURCES</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-light-gray block mb-1">Credits (Available: {currentPlayer.resources.credits})</label>
                  <div className="flex">
                    <input
                      type="number"
                      min="0"
                      max={currentPlayer.resources.credits}
                      value={contributionAmounts.credits}
                      onChange={(e) => handleContributionChange('credits', e.target.value)}
                      className="w-full bg-dark-gray text-light-gray text-sm p-2 rounded-l outline-none border border-neon-green"
                    />
                    <button 
                      onClick={() => handleContributionChange('credits', currentPlayer.resources.credits.toString())}
                      className="bg-neon-green text-black px-2 py-1 text-xs rounded-r"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-light-gray block mb-1">Data Shards (Available: {currentPlayer.resources.dataShards})</label>
                  <div className="flex">
                    <input
                      type="number"
                      min="0"
                      max={currentPlayer.resources.dataShards}
                      value={contributionAmounts.dataShards}
                      onChange={(e) => handleContributionChange('dataShards', e.target.value)}
                      className="w-full bg-dark-gray text-light-gray text-sm p-2 rounded-l outline-none border border-neon-blue"
                    />
                    <button 
                      onClick={() => handleContributionChange('dataShards', currentPlayer.resources.dataShards.toString())}
                      className="bg-neon-blue text-black px-2 py-1 text-xs rounded-r"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-light-gray block mb-1">Synthetic Alloys (Available: {currentPlayer.resources.syntheticAlloys})</label>
                  <div className="flex">
                    <input
                      type="number"
                      min="0"
                      max={currentPlayer.resources.syntheticAlloys}
                      value={contributionAmounts.syntheticAlloys}
                      onChange={(e) => handleContributionChange('syntheticAlloys', e.target.value)}
                      className="w-full bg-dark-gray text-light-gray text-sm p-2 rounded-l outline-none border border-neon-purple"
                    />
                    <button 
                      onClick={() => handleContributionChange('syntheticAlloys', currentPlayer.resources.syntheticAlloys.toString())}
                      className="bg-neon-purple text-black px-2 py-1 text-xs rounded-r"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-light-gray block mb-1">Quantum Cores (Available: {currentPlayer.resources.quantumCores})</label>
                  <div className="flex">
                    <input
                      type="number"
                      min="0"
                      max={currentPlayer.resources.quantumCores}
                      value={contributionAmounts.quantumCores}
                      onChange={(e) => handleContributionChange('quantumCores', e.target.value)}
                      className="w-full bg-dark-gray text-light-gray text-sm p-2 rounded-l outline-none border border-neon-yellow"
                    />
                    <button 
                      onClick={() => handleContributionChange('quantumCores', currentPlayer.resources.quantumCores.toString())}
                      className="bg-neon-yellow text-black px-2 py-1 text-xs rounded-r"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleContribute}
                  disabled={Object.values(contributionAmounts).every(val => val === 0)}
                  className={`w-full py-2 rounded font-cyber text-sm ${
                    Object.values(contributionAmounts).some(val => val > 0)
                      ? 'bg-neon-blue text-black'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  CONTRIBUTE TO SYNDICATE
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Syndicate Upgrades */}
        <div className="md:col-span-2 bg-dark-blue bg-opacity-30 p-4 rounded">
          <h3 className="text-neon-blue font-cyber text-sm mb-3">SYNDICATE UPGRADES</h3>
          
          <div className="space-y-4">
            {resourcePool.upgrades.map((upgrade) => (
              <div 
                key={upgrade.id}
                className={`p-4 rounded ${
                  upgrade.unlocked 
                    ? 'bg-neon-green bg-opacity-10 border border-neon-green' 
                    : 'bg-dark-gray'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-light-gray font-cyber">
                      {upgrade.name}
                      {upgrade.unlocked && (
                        <span className="ml-2 text-neon-green text-xs">UNLOCKED</span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{upgrade.description}</p>
                  </div>
                  
                  {!upgrade.unlocked && (
                    <button 
                      className={`px-3 py-1 rounded text-xs font-cyber ${
                        upgrade.progress >= 100
                          ? 'bg-neon-green text-black'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={upgrade.progress < 100}
                    >
                      {upgrade.progress >= 100 ? 'UNLOCK' : 'INCOMPLETE'}
                    </button>
                  )}
                </div>
                
                {!upgrade.unlocked && (
                  <>
                    <div className="mt-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-light-gray">Progress</span>
                        <span className="text-xs text-light-gray">{upgrade.progress}%</span>
                      </div>
                      <div className="w-full bg-dark-blue rounded-full h-1.5">
                        <div
                          className={`${getProgressColor(upgrade.progress)} h-1.5 rounded-full`}
                          style={{ width: `${upgrade.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400">Credits</span>
                        <span className="text-xs text-neon-green">{upgrade.cost.credits.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400">Data Shards</span>
                        <span className="text-xs text-neon-blue">{upgrade.cost.dataShards.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400">Synthetic Alloys</span>
                        <span className="text-xs text-neon-purple">{upgrade.cost.syntheticAlloys.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400">Quantum Cores</span>
                        <span className="text-xs text-neon-yellow">{upgrade.cost.quantumCores.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-neon-blue font-cyber text-sm mb-3">SYNDICATE BENEFITS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-gray p-3 rounded">
                <h4 className="text-neon-green text-sm mb-2">Active Benefits</h4>
                <ul className="text-xs text-light-gray space-y-1">
                  <li className="flex items-center">
                    <span className="text-neon-green mr-2">✓</span>
                    <span>+10% Resource Generation</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-neon-green mr-2">✓</span>
                    <span>+15% Territory Defense</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-neon-green mr-2">✓</span>
                    <span>-20% Agent Deployment Cost</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-dark-gray p-3 rounded">
                <h4 className="text-neon-yellow text-sm mb-2">Upcoming Benefits</h4>
                <ul className="text-xs text-light-gray space-y-1">
                  <li className="flex items-center">
                    <span className="text-gray-500 mr-2">○</span>
                    <span>+25% Hacking Success Rate</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-gray-500 mr-2">○</span>
                    <span>Exclusive Territory Access</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-gray-500 mr-2">○</span>
                    <span>Syndicate-wide Resource Sharing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePooling;
