import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Territory, Agent, Player, GameEvent } from '../types/gameTypes';
import gameService from '../services/gameService';

// Initial mock data
import { mockTerritories, mockAgents } from '../data/mockData';

// Define context type
interface GameContextType {
  territories: Territory[];
  agents: Agent[];
  players: Player[];
  currentPlayer: Player | null;
  gameEvents: GameEvent[];
  setTerritories: React.Dispatch<React.SetStateAction<Territory[]>>;
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  setGameEvents: React.Dispatch<React.SetStateAction<GameEvent[]>>;
  selectedTerritory: Territory | null;
  selectedAgent: Agent | null;
  setSelectedTerritory: (territory: Territory | null) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  claimTerritory: (territoryId: number) => void;
  attackTerritory: (territoryId: number) => void;
  deployAgent: (agentType: string, territoryId: number, task: string) => void;
  extractResources: (territoryId: number) => void;
  createTradeOffer: (targetPlayerId: string, offerResources: Record<string, number>, requestResources: Record<string, number>) => void;
  createAllianceOffer: (targetPlayerId: string, message: string) => void;
  switchPlayer: (playerId: string) => void;
}

// Create context
const GameContext = createContext<GameContextType>({
  territories: [],
  agents: [],
  players: [],
  currentPlayer: null,
  gameEvents: [],
  setTerritories: () => {},
  setAgents: () => {},
  setPlayers: () => {},
  setCurrentPlayer: () => {},
  setGameEvents: () => {},
  selectedTerritory: null,
  selectedAgent: null,
  setSelectedTerritory: () => {},
  setSelectedAgent: () => {},
  claimTerritory: () => {},
  attackTerritory: () => {},
  deployAgent: () => {},
  extractResources: () => {},
  createTradeOffer: () => {},
  createAllianceOffer: () => {},
  switchPlayer: () => {},
});

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for territories, agents, and players
  const [territories, setTerritories] = useState<Territory[]>(mockTerritories);
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [players, setPlayers] = useState<Player[]>([
    { id: 'player1', name: 'Your Syndicate', faction: 'Netrunners', resources: { credits: 1000, dataShards: 50, syntheticAlloys: 30, quantumCores: 15 } },
    { id: 'player2', name: 'Rival Syndicate', faction: 'Corporates', resources: { credits: 1200, dataShards: 40, syntheticAlloys: 35, quantumCores: 20 } },
    { id: 'player3', name: 'Shadow Syndicate', faction: 'Outcasts', resources: { credits: 800, dataShards: 60, syntheticAlloys: 25, quantumCores: 10 } },
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(players[0]);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Initialize game service
  useEffect(() => {
    // Subscribe to game events
    gameService.on('territories_updated', (updatedTerritories: Territory[]) => {
      setTerritories(updatedTerritories);
    });

    gameService.on('agents_updated', (updatedAgents: Agent[]) => {
      setAgents(updatedAgents);
    });

    gameService.on('events_updated', (updatedEvents: GameEvent[]) => {
      setGameEvents(updatedEvents);
    });

    gameService.on('players_updated', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
      // Update current player if it's in the updated list
      const updatedCurrentPlayer = updatedPlayers.find(p => p.id === currentPlayer?.id);
      if (updatedCurrentPlayer) {
        setCurrentPlayer(updatedCurrentPlayer);
      }
    });

    gameService.on('player_updated', (updatedPlayer: Player) => {
      setCurrentPlayer(updatedPlayer);
    });

    // Set current player
    gameService.setCurrentPlayer('player1');

    return () => {
      // Cleanup subscriptions
      gameService.cleanup();
    };
  }, []);

  // Claim territory
  const claimTerritory = (territoryId: number) => {
    const updatedTerritories = gameService.claimTerritory(territoryId, territories);
    setTerritories(updatedTerritories);
  };

  // Attack territory
  const attackTerritory = (territoryId: number) => {
    const updatedTerritories = gameService.attackTerritory(territoryId, territories);
    setTerritories(updatedTerritories);
  };

  // Deploy agent
  const deployAgent = (agentType: string, territoryId: number, task: string) => {
    const updatedAgents = gameService.deployAgent(agentType, territoryId, task, agents, territories);
    setAgents(updatedAgents);
  };

  // Extract resources
  const extractResources = (territoryId: number) => {
    gameService.extractResources(territoryId, territories);
  };

  // Create trade offer
  const createTradeOffer = (targetPlayerId: string, offerResources: Record<string, number>, requestResources: Record<string, number>) => {
    gameService.createTradeOffer(targetPlayerId, offerResources, requestResources);
  };

  // Create alliance offer
  const createAllianceOffer = (targetPlayerId: string, message: string) => {
    gameService.createAllianceOffer(targetPlayerId, message);
  };

  // Switch current player (for testing)
  const switchPlayer = (playerId: string) => {
    gameService.setCurrentPlayer(playerId);
  };

  return (
    <GameContext.Provider 
      value={{ 
        territories, 
        agents, 
        players, 
        currentPlayer, 
        gameEvents,
        setTerritories,
        setAgents,
        setPlayers,
        setCurrentPlayer,
        setGameEvents,
        selectedTerritory,
        selectedAgent,
        setSelectedTerritory,
        setSelectedAgent,
        claimTerritory,
        attackTerritory,
        deployAgent,
        extractResources,
        createTradeOffer,
        createAllianceOffer,
        switchPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => useContext(GameContext);
