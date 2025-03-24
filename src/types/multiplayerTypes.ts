import { Territory, Player, Agent, GameEvent, Mission } from './gameTypes';

// Session participant type
export interface SessionParticipant {
  id: string;
  username: string;
  faction: string;
  role: "Host" | "Member";
  walletAddress?: string;
  avatar?: string;
  status?: 'online' | 'away' | 'offline';
  joinedAt?: number;
}

// Resource pool type for collaborative resource sharing
export interface ResourcePool {
  resources: Record<string, number>;
  contributors: {
    playerId: string;
    playerName: string;
    contributions: Record<string, number>;
  }[];
}

// Session type for multiplayer sessions
export interface Session {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  activityType: 'alliance' | 'resource' | 'mission' | 'custom';
  privacy: 'public' | 'private' | 'friends';
  maxPlayers: number;
  currentPlayers: SessionParticipant[];
  resourcePool: ResourcePool;
  createdAt?: number;
  currentMission?: Mission;
  territories?: Territory[];
  gameState?: {
    territories: Territory[];
    players: Player[];
    agents: Agent[];
    gameEvents: GameEvent[];
  };
}

// Invitation type for session invites
export interface Invitation {
  id: string;
  sessionId: string;
  sessionCode: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  message?: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

// Chat message type for session chat
export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

// Invite data interface
export interface InviteData {
  id: string;
  sessionId: string;
  sessionCode: string;
  fromId: string;
  fromName: string;
  toId: string;
  message?: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// Message data interface
export interface MessageData {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

// Session list item for browsing available sessions
export interface SessionListItem {
  id: string;
  code: string;
  hostName: string;
  activityType: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: number;
}
