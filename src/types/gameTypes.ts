// Territory type definition
export interface Territory {
  id: number;
  q: number;
  r: number;
  name: string;
  type: string;
  owner: string;
  status: string;
  resources: string[];
  controlPoints?: number; // Control points for contested territories
  lastCaptureTime?: number; // Timestamp of last capture attempt
}

// Agent type definition
export interface Agent {
  id: number;
  name: string;
  type: string;
  status: string;
  location: string;
  task: string;
  ownerId: string; // ID of the player who owns this agent
  power: number; // Agent's power/effectiveness
  cooldownUntil?: number; // Timestamp until agent can act again
}

// Player type definition
export interface Player {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  level?: number;
  reputation?: number;
  syndicate?: string;
  faction: string;
  resources: {
    credits: number;
    dataShards: number;
    syntheticAlloys: number;
    quantumCores: number;
  };
  nextLevelXP?: number;
  currentXP?: number;
  skills?: {
    hacking: number;
    combat: number;
    trading: number;
  };
  assets?: {
    properties: number;
    vehicles: number;
    nfts: number;
  };
  missions?: {
    completed: number;
    failed: number;
    total: number;
  };
  online?: boolean; // Whether the player is currently online
  lastActive?: number; // Timestamp of last activity
  walletAddress?: string; // Blockchain wallet address
  score?: number; // Player's score/ranking
}

// Game event type
export interface GameEvent {
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

// PvP Battle Result
export interface BattleResult {
  id: string;
  territoryId: number;
  attackerId: string;
  defenderId: string;
  attackerAgents: number[];
  defenderAgents: number[];
  outcome: 'attacker_won' | 'defender_won' | 'draw';
  territoryControlChange: number;
  timestamp: number;
  details: string;
}

// Player Action
export interface PlayerAction {
  id: string;
  playerId: string;
  actionType: 'claim' | 'attack' | 'deploy' | 'extract' | 'trade' | 'alliance';
  targetId?: string | number; // Territory ID, player ID, etc.
  timestamp: number;
  cooldownUntil?: number;
  cost?: Record<string, number>;
}
