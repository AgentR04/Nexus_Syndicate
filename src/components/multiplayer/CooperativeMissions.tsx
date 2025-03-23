import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

interface Mission {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requiredRoles: string[];
  rewards: {
    credits: number;
    dataShards: number;
    syntheticAlloys: number;
    quantumCores: number;
  };
  participants: {
    playerId: string;
    playerName: string;
    role: string;
    status: 'pending' | 'ready' | 'active';
  }[];
  status: 'recruiting' | 'preparing' | 'active' | 'completed' | 'failed';
  timeRemaining?: number;
}

const CooperativeMissions: React.FC = () => {
  const { currentPlayer, players } = useGame();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Mock missions data
  const missions: Mission[] = [
    {
      id: 'mission1',
      name: 'Corporate Data Heist',
      description: 'Infiltrate Arasaka Corp servers and extract classified project data. Requires coordination between hackers, enforcers, and smugglers.',
      difficulty: 'medium',
      requiredRoles: ['Hacker', 'Enforcer', 'Smuggler'],
      rewards: {
        credits: 1500,
        dataShards: 75,
        syntheticAlloys: 30,
        quantumCores: 10
      },
      participants: [
        {
          playerId: 'player2',
          playerName: 'CyberHawk',
          role: 'Hacker',
          status: 'ready'
        }
      ],
      status: 'recruiting'
    },
    {
      id: 'mission2',
      name: 'Quantum Vault Raid',
      description: 'Break into a secure quantum vault in Night City\'s financial district. Requires technical expertise and combat support.',
      difficulty: 'hard',
      requiredRoles: ['Hacker', 'Enforcer', 'Techie', 'Smuggler'],
      rewards: {
        credits: 2500,
        dataShards: 120,
        syntheticAlloys: 60,
        quantumCores: 25
      },
      participants: [
        {
          playerId: 'player3',
          playerName: 'DataWraith',
          role: 'Hacker',
          status: 'ready'
        },
        {
          playerId: 'player4',
          playerName: 'NeonShadow',
          role: 'Enforcer',
          status: 'ready'
        }
      ],
      status: 'recruiting'
    },
    {
      id: 'mission3',
      name: 'Syndicate Alliance',
      description: 'Form a temporary alliance with a rival syndicate to take down a common enemy. Diplomatic skills required.',
      difficulty: 'easy',
      requiredRoles: ['Negotiator', 'Hacker', 'Smuggler'],
      rewards: {
        credits: 1000,
        dataShards: 50,
        syntheticAlloys: 25,
        quantumCores: 5
      },
      participants: [],
      status: 'recruiting'
    }
  ];

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'text-neon-green';
      case 'medium':
        return 'text-neon-yellow';
      case 'hard':
        return 'text-neon-pink';
      default:
        return 'text-light-gray';
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'Hacker':
        return 'text-neon-blue';
      case 'Enforcer':
        return 'text-neon-pink';
      case 'Smuggler':
        return 'text-neon-green';
      case 'Techie':
        return 'text-neon-yellow';
      case 'Negotiator':
        return 'text-neon-purple';
      default:
        return 'text-light-gray';
    }
  };

  const joinMission = (mission: Mission, role: string) => {
    if (!currentPlayer) return;
    
    // In a real implementation, this would send a request to a backend service
    // missionService.joinMission(mission.id, currentPlayer.id, role);
    
    // For demo purposes, we'll just update the local state
    const updatedMission = { ...mission };
    updatedMission.participants.push({
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      role: role,
      status: 'pending'
    });
    
    setSelectedMission(updatedMission);
    
    // In a real implementation, this would trigger a state update from the backend
  };

  const renderMissionDetails = (mission: Mission) => {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-neon-blue font-cyber text-lg">{mission.name}</h3>
            <p className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
              Difficulty: {mission.difficulty.toUpperCase()}
            </p>
          </div>
          <div className="bg-dark-blue px-2 py-1 rounded text-xs text-light-gray">
            {mission.status.toUpperCase()}
          </div>
        </div>
        
        <p className="text-sm text-light-gray">{mission.description}</p>
        
        <div>
          <h4 className="text-neon-blue text-sm mb-2">Required Roles:</h4>
          <div className="flex flex-wrap gap-2">
            {mission.requiredRoles.map((role) => {
              const isFilled = mission.participants.some(p => p.role === role);
              return (
                <div 
                  key={role}
                  className={`px-2 py-1 rounded text-xs border ${
                    isFilled 
                      ? 'border-neon-green bg-neon-green bg-opacity-10' 
                      : 'border-gray-600'
                  }`}
                >
                  <span className={getRoleColor(role)}>{role}</span>
                  {isFilled && (
                    <span className="ml-1 text-neon-green">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <h4 className="text-neon-blue text-sm mb-2">Participants:</h4>
          {mission.participants.length === 0 ? (
            <p className="text-xs text-gray-500">No participants yet. Be the first to join!</p>
          ) : (
            <div className="space-y-2">
              {mission.participants.map((participant) => (
                <div key={participant.playerId} className="flex justify-between items-center bg-dark-blue bg-opacity-30 p-2 rounded">
                  <div>
                    <span className="text-sm text-light-gray">{participant.playerName}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      ({participant.status})
                    </span>
                  </div>
                  <span className={`text-xs ${getRoleColor(participant.role)}`}>
                    {participant.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-neon-blue text-sm mb-2">Rewards:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <span className="text-neon-green text-xs mr-1">💰</span>
              <span className="text-xs text-light-gray">{mission.rewards.credits} Credits</span>
            </div>
            <div className="flex items-center">
              <span className="text-neon-blue text-xs mr-1">💾</span>
              <span className="text-xs text-light-gray">{mission.rewards.dataShards} Data Shards</span>
            </div>
            <div className="flex items-center">
              <span className="text-neon-purple text-xs mr-1">🔩</span>
              <span className="text-xs text-light-gray">{mission.rewards.syntheticAlloys} Synthetic Alloys</span>
            </div>
            <div className="flex items-center">
              <span className="text-neon-yellow text-xs mr-1">⚛️</span>
              <span className="text-xs text-light-gray">{mission.rewards.quantumCores} Quantum Cores</span>
            </div>
          </div>
        </div>
        
        {currentPlayer && !mission.participants.some(p => p.playerId === currentPlayer.id) && (
          <div className="mt-4">
            <h4 className="text-neon-blue text-sm mb-2">Join Mission:</h4>
            <div className="flex space-x-2">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-dark-blue text-light-gray text-sm p-2 rounded outline-none flex-grow"
              >
                <option value="">Select a role...</option>
                {mission.requiredRoles
                  .filter(role => !mission.participants.some(p => p.role === role))
                  .map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))
                }
              </select>
              <button 
                onClick={() => joinMission(mission, selectedRole)}
                disabled={!selectedRole}
                className={`px-3 py-1 rounded font-cyber text-sm ${
                  selectedRole 
                    ? 'bg-neon-blue text-black' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                JOIN
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cyber-panel bg-dark-gray p-4">
      <h2 className="text-neon-blue font-cyber text-xl mb-4">COOPERATIVE MISSIONS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-neon-blue font-cyber text-sm mb-2">AVAILABLE MISSIONS</h3>
          
          {missions.map((mission) => (
            <div 
              key={mission.id}
              onClick={() => setSelectedMission(mission)}
              className={`p-3 rounded cursor-pointer transition-all duration-200 ${
                selectedMission?.id === mission.id
                  ? 'bg-neon-blue bg-opacity-20 border border-neon-blue'
                  : 'bg-dark-blue bg-opacity-30 hover:bg-opacity-40'
              }`}
            >
              <div className="flex justify-between">
                <h4 className="text-sm font-cyber text-light-gray">{mission.name}</h4>
                <span className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
                  {mission.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {mission.participants.length}/{mission.requiredRoles.length} members
                </span>
                <span className="text-xs text-gray-400">
                  {mission.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="md:col-span-2 bg-dark-blue bg-opacity-30 rounded">
          {selectedMission ? (
            renderMissionDetails(selectedMission)
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Select a mission to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CooperativeMissions;
