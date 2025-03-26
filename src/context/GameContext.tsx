import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Territory, Agent, Player, GameEvent } from '../types/gameTypes';
import gameService from '../services/gameService';
import { updateExtractedResources } from '../utils/resourceUtils';
import authService from '../services/authService';
import firestoreService from '../services/firestoreService';
import { RESOURCE_UPDATE_EVENT } from '../utils/resourceUtils';
import multiplayerService from '../services/multiplayerService';

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
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [isMultiplayerConnected, setIsMultiplayerConnected] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<any>(null);

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

            // Connect to multiplayer service with user data
            if (user && !isMultiplayerConnected) {
              connectToMultiplayerService(user);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data for GameContext:', error);
      }
    };
    
    fetchUserData();
  }, [isMultiplayerConnected]);

  // Connect to multiplayer service
  const connectToMultiplayerService = async (user: any) => {
    try {
      console.log('Connecting to multiplayer service...');
      const connected = await multiplayerService.connect({
        id: user.id,
        username: user.username || 'Anonymous',
        walletAddress: user.walletAddress || ''
      });

      if (connected) {
        console.log('Connected to multiplayer service successfully');
        setIsMultiplayerConnected(true);
        setupMultiplayerEventListeners();
      } else {
        console.error('Failed to connect to multiplayer service');
      }
    } catch (error) {
      console.error('Error connecting to multiplayer service:', error);
    }
  };

  // Setup multiplayer event listeners
  const setupMultiplayerEventListeners = () => {
    // Listen for game state updates
    multiplayerService.on('game_state_updated', (gameState: any) => {
      console.log('Game state updated from multiplayer:', gameState);
      if (gameState.territories) setTerritories(gameState.territories);
      if (gameState.agents) setAgents(gameState.agents);
      if (gameState.players) {
        setPlayers(gameState.players);
        // Update current player if it's in the updated list
        const updatedCurrentPlayer = gameState.players.find((p: Player) => p.id === currentPlayer?.id);
        if (updatedCurrentPlayer) {
          setCurrentPlayer(updatedCurrentPlayer);
        }
      }
      if (gameState.gameEvents) setGameEvents(gameState.gameEvents);
    });

    // Listen for session events
    multiplayerService.on('session_created', (session: any) => {
      console.log('Session created:', session);
      setActiveSession(session);
    });

    multiplayerService.on('session_joined', (session: any) => {
      console.log('Session joined:', session);
      setActiveSession(session);
    });

    multiplayerService.on('session_updated', (session: any) => {
      console.log('Session updated:', session);
      setActiveSession(session);
    });

    multiplayerService.on('player_joined', (data: any) => {
      console.log('Player joined:', data);
      // You might want to add a notification here
    });

    multiplayerService.on('player_left', (data: any) => {
      console.log('Player left:', data);
      // You might want to add a notification here
    });

    multiplayerService.on('error', (error: any) => {
      console.error('Multiplayer error:', error);
      // You might want to add an error notification here
    });
  };
  
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

        // Update Firebase with the new resources
        if (currentPlayer.id) {
          firestoreService.updateUserResources(currentPlayer.id, resources)
            .then(() => console.log('Firebase resources updated after resource event'))
            .catch(error => console.error('Error updating Firebase resources:', error));
        }
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

  // Create a new multiplayer session
  const createMultiplayerSession = (sessionData: any) => {
    if (!isMultiplayerConnected || !currentPlayer) {
      console.error('Cannot create session: not connected to multiplayer or no current player');
      return;
    }

    multiplayerService.createSession({
      hostId: currentPlayer.id,
      hostName: currentPlayer.name,
      ...sessionData,
      territories
    });
  };

  // Join an existing multiplayer session
  const joinMultiplayerSession = (sessionCode: string) => {
    if (!isMultiplayerConnected) {
      console.error('Cannot join session: not connected to multiplayer');
      return;
    }

    multiplayerService.joinSession(sessionCode);
  };

  // Claim territory
  const claimTerritory = (territoryId: number) => {
    if (activeSession) {
      // Use multiplayer service if in a session
      multiplayerService.claimTerritory(territoryId);
    } else {
      // Use local game service if not in a multiplayer session
      const updatedTerritories = gameService.claimTerritory(territoryId, territories);
      setTerritories(updatedTerritories);
      
      // Update territory ownership in Firebase
      const territory = updatedTerritories.find(t => t.id === territoryId);
      if (territory && currentPlayer) {
        firestoreService.updateTerritory(territoryId, {
          owner: currentPlayer.id,
          status: 'owned',
          lastCaptureTime: Date.now()
        })
        .then(() => {
          console.log(`Territory ${territoryId} ownership updated in Firebase`);
        })
        .catch(error => {
          console.error('Error updating territory ownership in Firebase:', error);
        });
      }
    }
  };

  // Attack territory
  const attackTerritory = (territoryId: number) => {
    if (activeSession) {
      // Implement multiplayer attack logic here
      console.log('Multiplayer attack not implemented yet');
    } else {
      const updatedTerritories = gameService.attackTerritory(territoryId, territories);
      setTerritories(updatedTerritories);
    }
  };

  // Deploy agent
  const deployAgent = (agentType: string, territoryId: number, task: string) => {
    if (activeSession) {
      // Use multiplayer service if in a session
      multiplayerService.deployAgent(agentType, territoryId, task);
    } else {
      // Use local game service if not in a multiplayer session
      const updatedAgents = gameService.deployAgent(agentType, territoryId, task, agents, territories);
      setAgents(updatedAgents);
    }
  };

  // Extract resources
  const extractResources = (territoryId: number) => {
    // Get resource gains before calling gameService
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return;
    
    // Only allow extraction if the player owns the territory or if it's unclaimed
    if (territory.owner && territory.owner !== currentPlayer?.id && territory.owner !== 'unclaimed') {
      console.log('Cannot extract: territory owned by another player');
      return;
    }
    
    // Calculate resource gains
    const resourceGains: Record<string, number> = {};
    territory.resources.forEach(resource => {
      const resourceType = resource.toLowerCase();
      resourceGains[resourceType] = Math.floor(Math.random() * 10) + 5; // Random resource gain
    });
    
    if (activeSession) {
      // Use multiplayer service if in a session
      multiplayerService.extractResources(territoryId, resourceGains);
    } else {
      // Use local game service and update Firebase
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
    }
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
