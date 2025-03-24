import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Territory, Agent, Player, GameEvent } from '../types/gameTypes';
import gameService from '../services/gameService';
import { updateExtractedResources } from '../utils/resourceUtils';
import authService from '../services/authService';
import firestoreService from '../services/firestoreService';
import { RESOURCE_UPDATE_EVENT } from '../utils/resourceUtils';

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
  addNotification: (type: "info" | "success" | "warning" | "error", message: string, autoClose?: boolean, timeout?: number) => void;
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
  addNotification: () => {},
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

  // Fetch user data from Firebase and update currentPlayer
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = authService.getUser();
        if (user && user.id) {
          console.log('Fetching user data for GameContext:', user.id);
          
          // Get the latest user data from Firebase
          const userData = await firestoreService.getUserById(user.id);
          
          if (userData) {
            // Create a player object from the user data
            const userPlayer: Player = {
              id: userData.id || 'player1',
              name: userData.username || 'Your Syndicate',
              faction: userData.faction || 'Netrunners',
              resources: {
                credits: userData.resources?.credits || 0,
                dataShards: userData.resources?.dataShards || 0,
                syntheticAlloys: userData.resources?.syntheticAlloys || 0,
                quantumCores: userData.resources?.quantumCores || 0
              }
            };
            
            console.log('Updated player from Firebase:', userPlayer);
            
            // Update the current player
            setCurrentPlayer(userPlayer);
            
            // Also update the player in the players array
            setPlayers(prevPlayers => {
              const updatedPlayers = [...prevPlayers];
              const playerIndex = updatedPlayers.findIndex(p => p.id === 'player1');
              if (playerIndex !== -1) {
                updatedPlayers[playerIndex] = userPlayer;
              }
              return updatedPlayers;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data for GameContext:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Listen for resource update events
  useEffect(() => {
    const handleResourceUpdate = (event: CustomEvent) => {
      console.log('Resource update event received in GameContext:', event.detail);
      const { resources } = event.detail;
      
      if (resources && currentPlayer) {
        // Update the current player with the new resources
        const updatedPlayer = {
          ...currentPlayer,
          resources: {
            credits: resources.credits || 0,
            dataShards: resources.dataShards || 0,
            syntheticAlloys: resources.syntheticAlloys || 0,
            quantumCores: resources.quantumCores || 0
          }
        };
        
        setCurrentPlayer(updatedPlayer);
        
        // Also update the player in the players array
        setPlayers(prevPlayers => {
          const updatedPlayers = [...prevPlayers];
          const playerIndex = updatedPlayers.findIndex(p => p.id === currentPlayer.id);
          if (playerIndex !== -1) {
            updatedPlayers[playerIndex] = updatedPlayer;
          }
          return updatedPlayers;
        });
      }
    };
    
    // Add event listener
    document.addEventListener(
      RESOURCE_UPDATE_EVENT, 
      handleResourceUpdate as EventListener
    );
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener(
        RESOURCE_UPDATE_EVENT, 
        handleResourceUpdate as EventListener
      );
    };
  }, [currentPlayer]);

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
    // Get resource gains before calling gameService
    const territory = territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== 'player') return;
    
    // Calculate resource gains (similar to what gameService does)
    const resourceGains: Record<string, number> = {};
    territory.resources.forEach(resource => {
      resourceGains[resource] = Math.floor(Math.random() * 10) + 5; // Random resource gain
    });
    
    // Call game service to update game state
    gameService.extractResources(territoryId, territories);
    
    // Update Firebase with the same resource gains
    console.log('Updating Firebase with extracted resources:', resourceGains);
    updateExtractedResources(resourceGains)
      .then(success => {
        if (success) {
          console.log('Firebase resources updated successfully after extraction');
        } else {
          console.error('Failed to update Firebase resources after extraction');
        }
      })
      .catch(error => {
        console.error('Error updating Firebase resources after extraction:', error);
      });
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

  // Add notification
  const addNotification = (type: "info" | "success" | "warning" | "error", message: string, autoClose?: boolean, timeout?: number) => {
    // TO DO: implement notification logic
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
        addNotification,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => useContext(GameContext);
