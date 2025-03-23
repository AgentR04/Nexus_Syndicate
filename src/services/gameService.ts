import { Territory, Agent, Player, BattleResult } from '../types/gameTypes';
import battleService from './battleService';

// Mock players for demonstration
const mockPlayers: Player[] = [
  { id: 'player1', name: 'Your Syndicate', faction: 'Netrunners', resources: { credits: 1000, dataShards: 50, syntheticAlloys: 30, quantumCores: 15 }, online: true, score: 100 },
  { id: 'player2', name: 'Rival Syndicate', faction: 'Corporates', resources: { credits: 1200, dataShards: 40, syntheticAlloys: 35, quantumCores: 20 }, online: false, score: 90 },
  { id: 'player3', name: 'Shadow Syndicate', faction: 'Outcasts', resources: { credits: 800, dataShards: 60, syntheticAlloys: 25, quantumCores: 10 }, online: false, score: 80 },
];

// Game events
interface GameEvent {
  id: string;
  type: 'territory_claim' | 'territory_attack' | 'agent_deploy' | 'resource_extract' | 'trade_offer' | 'alliance_offer' | 'player_join' | 'player_leave' | 'agent_action';
  sourcePlayerId: string;
  targetPlayerId?: string;
  territoryId?: number;
  agentId?: number;
  resources?: Record<string, number>;
  message?: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  expiresAt?: number; // For events that expire (like offers)
}

// Mock game events
let gameEvents: GameEvent[] = [];

// WebSocket connection simulation
class GameService {
  private listeners: Record<string, Function[]> = {};
  private currentPlayerId: string = 'player1'; // Default to player1 for demo
  private gameInterval: NodeJS.Timeout | null = null;
  private gameSpeed: number = 5000; // 5 seconds per game cycle

  constructor() {
    // Initialize game cycle
    this.startGameCycle();
  }

  // Set current player
  setCurrentPlayer(playerId: string) {
    this.currentPlayerId = playerId;
    this.emit('player_updated', this.getCurrentPlayer());
  }

  // Get current player
  getCurrentPlayer(): Player | undefined {
    return mockPlayers.find(p => p.id === this.currentPlayerId);
  }

  // Get all players
  getAllPlayers(): Player[] {
    return mockPlayers;
  }

  // Get player by ID
  getPlayerById(playerId: string): Player | undefined {
    return mockPlayers.find(p => p.id === playerId);
  }

  // Get territories owned by a player
  getPlayerTerritories(playerId: string, territories: Territory[]): Territory[] {
    const playerIdToOwner: Record<string, string> = {
      'player1': 'player',
      'player2': 'rival',
      'player3': 'neutral'
    };
    
    return territories.filter(t => t.owner === playerIdToOwner[playerId]);
  }

  // Claim territory
  claimTerritory(territoryId: number, territories: Territory[]): Territory[] {
    const updatedTerritories = [...territories];
    const territoryIndex = updatedTerritories.findIndex(t => t.id === territoryId);
    
    if (territoryIndex !== -1) {
      // Only neutral territories can be claimed
      if (updatedTerritories[territoryIndex].owner === 'neutral') {
        updatedTerritories[territoryIndex] = {
          ...updatedTerritories[territoryIndex],
          owner: 'player',
          status: 'secure'
        };
        
        // Create game event
        this.createGameEvent({
          type: 'territory_claim',
          sourcePlayerId: this.currentPlayerId,
          territoryId: territoryId,
          message: `${this.getCurrentPlayer()?.name} claimed ${updatedTerritories[territoryIndex].name}`
        });
        
        // Update player resources (claiming costs resources)
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer) {
          const updatedPlayers = mockPlayers.map(player => {
            if (player.id === this.currentPlayerId) {
              return {
                ...player,
                resources: {
                  ...player.resources,
                  credits: player.resources.credits - 100 // Cost to claim territory
                }
              };
            }
            return player;
          });
          
          // Update players array
          mockPlayers.splice(0, mockPlayers.length, ...updatedPlayers);
          
          // Emit player updates
          this.emit('players_updated', mockPlayers);
          
          // Update current player specifically
          const updatedCurrentPlayer = mockPlayers.find(p => p.id === this.currentPlayerId);
          if (updatedCurrentPlayer) {
            this.emit('player_updated', updatedCurrentPlayer);
          }
        }
        
        // Simulate rival response after delay
        setTimeout(() => {
          this.simulateRivalResponse(territoryId, updatedTerritories);
        }, 30000); // Rival responds after 30 seconds
      }
    }
    
    this.emit('territories_updated', updatedTerritories);
    return updatedTerritories;
  }

  // Attack territory
  attackTerritory(territoryId: number, territories: Territory[], agents: Agent[] = []): Territory[] {
    const updatedTerritories = [...territories];
    const territoryIndex = updatedTerritories.findIndex(t => t.id === territoryId);
    
    if (territoryIndex === -1) {
      return territories;
    }
    
    const territory = updatedTerritories[territoryIndex];
    
    // Only rival territories can be attacked
    if (territory.owner !== 'rival' && territory.owner !== 'neutral') {
      return territories;
    }
    
    // Get current player
    const attacker = this.getCurrentPlayer();
    if (!attacker) return territories;
    
    // Find defender (rival player)
    const defender = this.getPlayerById('player2'); // Assuming player2 is the rival
    if (!defender) return territories;
    
    // Find agents at the territory location for both players
    const attackerAgents = agents.filter(a => 
      a.location === territory.name && 
      a.ownerId === attacker.id &&
      a.status === 'active' &&
      (!a.cooldownUntil || a.cooldownUntil < Date.now())
    );
    
    const defenderAgents = agents.filter(a => 
      a.location === territory.name && 
      a.ownerId === defender.id &&
      a.status === 'active' &&
      (!a.cooldownUntil || a.cooldownUntil < Date.now())
    );
    
    // Calculate battle outcome
    const battleResult = battleService.calculateBattleOutcome(
      territory,
      attacker,
      defender,
      attackerAgents,
      defenderAgents
    );
    
    // Apply battle results
    const { updatedTerritory, updatedAgents } = battleService.applyBattleResults(
      battleResult,
      updatedTerritories,
      agents
    );
    
    // Update territory
    updatedTerritories[territoryIndex] = updatedTerritory;
    
    // Create game event
    this.createGameEvent({
      type: 'territory_attack',
      sourcePlayerId: this.currentPlayerId,
      targetPlayerId: defender.id,
      territoryId: territoryId,
      message: `${attacker.name} attacked ${territory.name} controlled by ${defender.name}. ${
        battleResult.outcome === 'attacker_won' 
          ? 'Attack successful!' 
          : battleResult.outcome === 'defender_won' 
          ? 'Defense held!' 
          : 'Battle ended in stalemate.'
      }`
    });
    
    // Update agents
    this.emit('agents_updated', updatedAgents);
    
    // Emit battle result
    this.emit('battle_result', battleResult);
    
    return updatedTerritories;
  }

  // Deploy agent
  deployAgent(agentType: string, territoryId: number, task: string, agents: Agent[], territories: Territory[]): Agent[] {
    // Find the territory
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return agents;
    
    // Get current player
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return agents;
    
    // Check if player has enough resources
    const agentCosts: Record<string, Record<string, number>> = {
      'scout': { credits: 50, dataShards: 10 },
      'defense': { credits: 100, syntheticAlloys: 15 },
      'trader': { credits: 150, quantumCores: 5 },
      'resource': { credits: 75, syntheticAlloys: 10, dataShards: 5 }
    };
    
    const cost = agentCosts[agentType] || { credits: 100 };
    
    // Check resources
    for (const [resource, amount] of Object.entries(cost)) {
      if ((currentPlayer.resources as any)[resource] < amount) {
        // Not enough resources
        return agents;
      }
    }
    
    // Deduct resources
    const updatedPlayers = mockPlayers.map(player => {
      if (player.id === this.currentPlayerId) {
        const updatedResources = { ...player.resources };
        
        for (const [resource, amount] of Object.entries(cost)) {
          (updatedResources as any)[resource] -= amount;
        }
        
        return {
          ...player,
          resources: updatedResources
        };
      }
      return player;
    });
    
    // Update players
    mockPlayers.splice(0, mockPlayers.length, ...updatedPlayers);
    
    // Create new agent
    const newAgent: Agent = {
      id: agents.length + 1,
      name: `${agentType.charAt(0).toUpperCase() + agentType.slice(1)}-${Math.floor(Math.random() * 100)}`,
      type: agentType,
      status: 'deploying',
      location: territory.name,
      task: task,
      ownerId: this.currentPlayerId,
      power: this.calculateAgentPower(agentType, task)
    };
    
    const updatedAgents = [...agents, newAgent];
    
    // Create game event
    this.createGameEvent({
      type: 'agent_deploy',
      sourcePlayerId: this.currentPlayerId,
      agentId: newAgent.id,
      territoryId: territoryId,
      message: `${currentPlayer.name} deployed ${newAgent.name} to ${territory.name}`
    });
    
    // Set agent to active after delay
    setTimeout(() => {
      const agentIndex = updatedAgents.findIndex(a => a.id === newAgent.id);
      if (agentIndex !== -1) {
        updatedAgents[agentIndex] = {
          ...updatedAgents[agentIndex],
          status: 'active'
        };
        this.emit('agents_updated', updatedAgents);
      }
    }, 3000);
    
    // Emit updated player
    this.emit('player_updated', this.getCurrentPlayer());
    
    return updatedAgents;
  }

  // Calculate agent power based on type and task
  private calculateAgentPower(agentType: string, task: string): number {
    let basePower = 0;
    
    switch (agentType) {
      case 'scout':
        basePower = 5;
        break;
      case 'defense':
        basePower = 10;
        break;
      case 'trader':
        basePower = 3;
        break;
      case 'resource':
        basePower = 4;
        break;
      default:
        basePower = 5;
    }
    
    // Task-specific bonuses
    if (
      (agentType === 'defense' && task === 'Defend Territory') ||
      (agentType === 'scout' && task === 'Gather Intelligence') ||
      (agentType === 'trader' && task === 'Trade Resources') ||
      (agentType === 'resource' && task === 'Extract Resources')
    ) {
      // Bonus for matching task to agent type
      basePower *= 1.2;
    }
    
    // Add some randomness (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4);
    
    return Math.round(basePower * randomFactor);
  }

  // Recall agent
  recallAgent(agentId: number, agents: Agent[]): Agent[] {
    // Find the agent to recall
    const agentIndex = agents.findIndex(a => a.id === agentId);
    if (agentIndex === -1) return agents;
    
    // Update agent status to recalling
    const updatedAgents = [...agents];
    updatedAgents[agentIndex] = {
      ...updatedAgents[agentIndex],
      status: 'recalling'
    };
    
    // Create game event for agent recall
    this.createGameEvent({
      type: 'agent_deploy',
      sourcePlayerId: this.currentPlayerId,
      agentId: agentId,
      message: `${this.getCurrentPlayer()?.name} recalled agent ${agents[agentIndex].name} from ${agents[agentIndex].location}`
    });
    
    // Emit updated agents
    this.emit('agents_updated', updatedAgents);
    
    // Remove agent after delay
    setTimeout(() => {
      const filteredAgents = updatedAgents.filter(a => a.id !== agentId);
      this.emit('agents_updated', filteredAgents);
    }, 3000);
    
    return updatedAgents;
  }

  // Extract resources
  extractResources(territoryId: number, territories: Territory[]): void {
    const territory = territories.find(t => t.id === territoryId);
    if (!territory || territory.owner !== 'player') return;
    
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;
    
    // Update player resources based on territory resources
    const updatedPlayers = mockPlayers.map(player => {
      if (player.id === this.currentPlayerId) {
        const updatedResources = { ...player.resources };
        
        territory.resources.forEach(resource => {
          const resourceKey = resource as keyof typeof updatedResources;
          if (resourceKey in updatedResources) {
            updatedResources[resourceKey] += Math.floor(Math.random() * 10) + 5; // Random resource gain
          }
        });
        
        return {
          ...player,
          resources: updatedResources
        };
      }
      return player;
    });
    
    // Create game event
    this.createGameEvent({
      type: 'resource_extract',
      sourcePlayerId: this.currentPlayerId,
      territoryId: territoryId,
      message: `${currentPlayer.name} extracted resources from ${territory.name}`
    });
    
    // Update players
    mockPlayers.splice(0, mockPlayers.length, ...updatedPlayers);
    
    // Emit events to update UI immediately
    this.emit('players_updated', mockPlayers);
    
    // Also update the current player specifically
    const updatedCurrentPlayer = mockPlayers.find(p => p.id === this.currentPlayerId);
    if (updatedCurrentPlayer) {
      this.emit('player_updated', updatedCurrentPlayer);
    }
  }

  // Create trade offer
  createTradeOffer(targetPlayerId: string, offerResources: Record<string, number>, requestResources: Record<string, number>): void {
    const sourcePlayer = this.getCurrentPlayer();
    const targetPlayer = this.getPlayerById(targetPlayerId);
    
    if (!sourcePlayer || !targetPlayer) return;
    
    // Create game event for trade offer
    this.createGameEvent({
      type: 'trade_offer',
      sourcePlayerId: this.currentPlayerId,
      targetPlayerId: targetPlayerId,
      resources: { ...offerResources, ...requestResources },
      message: `${sourcePlayer.name} offered a trade to ${targetPlayer.name}`
    });
    
    // Simulate trade response
    setTimeout(() => {
      this.simulateTradeResponse(targetPlayerId, offerResources, requestResources);
    }, 8000); // Response after 8 seconds
  }

  // Create alliance offer
  createAllianceOffer(targetPlayerId: string, message: string): void {
    const sourcePlayer = this.getCurrentPlayer();
    const targetPlayer = this.getPlayerById(targetPlayerId);
    
    if (!sourcePlayer || !targetPlayer) return;
    
    // Create game event for alliance offer
    this.createGameEvent({
      type: 'alliance_offer',
      sourcePlayerId: this.currentPlayerId,
      targetPlayerId: targetPlayerId,
      message: `${sourcePlayer.name} offered an alliance to ${targetPlayer.name}: ${message}`
    });
    
    // Simulate alliance response
    setTimeout(() => {
      this.simulateAllianceResponse(targetPlayerId);
    }, 12000); // Response after 12 seconds
  }

  // Get all game events
  getGameEvents(): GameEvent[] {
    return gameEvents;
  }

  // Get events for current player
  getCurrentPlayerEvents(): GameEvent[] {
    return gameEvents.filter(event => 
      event.sourcePlayerId === this.currentPlayerId || 
      event.targetPlayerId === this.currentPlayerId
    );
  }

  // Create a new game event
  private createGameEvent(eventData: Omit<Partial<GameEvent>, 'id' | 'timestamp'> & Pick<GameEvent, 'type' | 'sourcePlayerId'>): GameEvent {
    const newEvent: GameEvent = {
      id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      status: eventData.status || 'pending',
      ...eventData
    } as GameEvent;
    
    gameEvents = [newEvent, ...gameEvents];
    this.emit('events_updated', this.getCurrentPlayerEvents());
    
    return newEvent;
  }

  // Simulate rival response to territory claim
  private simulateRivalResponse(territoryId: number, territories: Territory[]): void {
    const territoryIndex = territories.findIndex(t => t.id === territoryId);
    if (territoryIndex === -1) return;
    
    // 50% chance rival contests the claim
    if (Math.random() > 0.5) {
      // Rival contests the claim
      this.createGameEvent({
        type: 'territory_attack',
        sourcePlayerId: 'player2', // Rival player
        territoryId: territoryId,
        message: `Rival Syndicate is contesting your claim on ${territories[territoryIndex].name}`
      });
      
      // Territory remains contested
      territories[territoryIndex] = {
        ...territories[territoryIndex],
        status: 'contested'
      };
    } else {
      // Rival accepts the claim
      this.createGameEvent({
        type: 'territory_claim',
        sourcePlayerId: 'player2', // Rival player
        territoryId: territoryId,
        message: `Rival Syndicate acknowledged your claim on ${territories[territoryIndex].name}`
      });
      
      // Territory becomes secure
      territories[territoryIndex] = {
        ...territories[territoryIndex],
        status: 'secure'
      };
    }
    
    this.emit('territories_updated', territories);
  }

  // Simulate battle outcome
  private simulateBattleOutcome(territoryId: number, territories: Territory[]): void {
    const territoryIndex = territories.findIndex(t => t.id === territoryId);
    if (territoryIndex === -1) return;
    
    // 60% chance player wins the battle
    if (Math.random() < 0.6) {
      // Player wins
      territories[territoryIndex] = {
        ...territories[territoryIndex],
        owner: 'player',
        status: 'secure'
      };
      
      this.createGameEvent({
        type: 'territory_attack',
        sourcePlayerId: this.currentPlayerId,
        territoryId: territoryId,
        status: 'completed',
        message: `Your forces have captured ${territories[territoryIndex].name}`
      });
    } else {
      // Player loses
      territories[territoryIndex] = {
        ...territories[territoryIndex],
        owner: 'rival',
        status: 'secure'
      };
      
      this.createGameEvent({
        type: 'territory_attack',
        sourcePlayerId: 'player2', // Rival player
        territoryId: territoryId,
        status: 'completed',
        message: `Your attack on ${territories[territoryIndex].name} was repelled`
      });
    }
    
    this.emit('territories_updated', territories);
  }

  // Simulate trade response
  private simulateTradeResponse(targetPlayerId: string, offerResources: Record<string, number>, requestResources: Record<string, number>): void {
    // 70% chance trade is accepted
    if (Math.random() < 0.7) {
      // Accept trade
      this.createGameEvent({
        type: 'trade_offer',
        sourcePlayerId: targetPlayerId,
        targetPlayerId: this.currentPlayerId,
        resources: { ...offerResources, ...requestResources },
        status: 'accepted',
        message: `${this.getPlayerById(targetPlayerId)?.name} accepted your trade offer`
      });
      
      // Update player resources
      const updatedPlayers = mockPlayers.map(player => {
        if (player.id === this.currentPlayerId) {
          // Current player gives offerResources and receives requestResources
          const updatedResources = { ...player.resources };
          
          Object.entries(offerResources).forEach(([resource, amount]) => {
            updatedResources[resource as keyof typeof updatedResources] -= amount;
          });
          
          Object.entries(requestResources).forEach(([resource, amount]) => {
            updatedResources[resource as keyof typeof updatedResources] += amount;
          });
          
          return {
            ...player,
            resources: updatedResources
          };
        } else if (player.id === targetPlayerId) {
          // Target player gives requestResources and receives offerResources
          const updatedResources = { ...player.resources };
          
          Object.entries(offerResources).forEach(([resource, amount]) => {
            updatedResources[resource as keyof typeof updatedResources] += amount;
          });
          
          Object.entries(requestResources).forEach(([resource, amount]) => {
            updatedResources[resource as keyof typeof updatedResources] -= amount;
          });
          
          return {
            ...player,
            resources: updatedResources
          };
        }
        return player;
      });
      
      this.emit('players_updated', updatedPlayers);
    } else {
      // Reject trade
      this.createGameEvent({
        type: 'trade_offer',
        sourcePlayerId: targetPlayerId,
        targetPlayerId: this.currentPlayerId,
        resources: { ...offerResources, ...requestResources },
        status: 'rejected',
        message: `${this.getPlayerById(targetPlayerId)?.name} rejected your trade offer`
      });
    }
  }

  // Simulate alliance response
  private simulateAllianceResponse(targetPlayerId: string): void {
    // 50% chance alliance is accepted
    if (Math.random() < 0.5) {
      // Accept alliance
      this.createGameEvent({
        type: 'alliance_offer',
        sourcePlayerId: targetPlayerId,
        targetPlayerId: this.currentPlayerId,
        status: 'accepted',
        message: `${this.getPlayerById(targetPlayerId)?.name} accepted your alliance offer`
      });
    } else {
      // Reject alliance
      this.createGameEvent({
        type: 'alliance_offer',
        sourcePlayerId: targetPlayerId,
        targetPlayerId: this.currentPlayerId,
        status: 'rejected',
        message: `${this.getPlayerById(targetPlayerId)?.name} rejected your alliance offer`
      });
    }
  }

  // Start game cycle for periodic updates
  public startGameCycle(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    
    this.gameInterval = setInterval(() => {
      // Simulate random game events
      this.generateRandomGameEvent();
    }, this.gameSpeed);
  }

  // Stop game cycle
  public stopGameCycle(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  // Generate random game events to simulate other players' actions
  private generateRandomGameEvent(): void {
    // Skip if current player is not set
    if (!this.currentPlayerId) return;
    
    const eventTypes = ['territory_claim', 'territory_attack', 'agent_deploy', 'resource_extract'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as GameEvent['type'];
    const randomPlayerId = mockPlayers.find(p => p.id !== this.currentPlayerId)?.id;
    
    if (!randomPlayerId) return;
    
    switch (randomType) {
      case 'territory_claim':
        this.createGameEvent({
          type: randomType,
          sourcePlayerId: randomPlayerId,
          territoryId: Math.floor(Math.random() * 19) + 1,
          message: `${this.getPlayerById(randomPlayerId)?.name} claimed a new territory`
        });
        break;
      case 'territory_attack':
        this.createGameEvent({
          type: randomType,
          sourcePlayerId: randomPlayerId,
          territoryId: Math.floor(Math.random() * 19) + 1,
          message: `${this.getPlayerById(randomPlayerId)?.name} attacked a territory`
        });
        break;
      case 'agent_deploy':
        this.createGameEvent({
          type: randomType,
          sourcePlayerId: randomPlayerId,
          territoryId: Math.floor(Math.random() * 19) + 1,
          message: `${this.getPlayerById(randomPlayerId)?.name} deployed a new agent`
        });
        break;
      case 'resource_extract':
        this.createGameEvent({
          type: randomType,
          sourcePlayerId: randomPlayerId,
          territoryId: Math.floor(Math.random() * 19) + 1,
          message: `${this.getPlayerById(randomPlayerId)?.name} extracted resources`
        });
        break;
    }
  }

  // Event subscription system
  on(event: string, callback: Function): Function {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }
  
  // Event unsubscription
  off(event: string, callback: Function): void {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(
      listener => listener !== callback
    );
  }

  // Event emission
  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Clean up
  cleanup(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.listeners = {};
  }
}

// Create singleton instance
const gameService = new GameService();
export default gameService;
