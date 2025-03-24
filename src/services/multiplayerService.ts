import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { Territory, Agent, Player, GameEvent } from '../types/gameTypes';
import { Session } from '../types/multiplayerTypes';
import authService from './authService';

// Constants
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3001';
export const RESOURCE_UPDATE_EVENT = 'resource_update_event';

// WebSocket server URL
const SOCKET_URL = WEBSOCKET_URL;

// Interface for invite data
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

// Interface for message data
export interface MessageData {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

// Interface for cooperative mission data
export interface Mission {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: {
    credits: number;
    dataShards: number;
    syntheticAlloys: number;
    quantumCores: number;
  };
  objectives: {
    id: string;
    description: string;
    completed: boolean;
  }[];
  progress: number;
}

// Interface for alliance data
export interface AllianceData {
  id: string;
  name: string;
  syndicates: string[]; // syndicate IDs
  territories: number[]; // territory IDs
  resourcePool: Record<string, number>;
  createdAt: number;
  status: 'active' | 'dissolved';
}

class MultiplayerService extends EventEmitter {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private userId: string = '';
  private username: string = '';
  private walletAddress: string = '';
  private activeSession: Session | null = null;
  private mockSessions: Session[] = [
    {
      id: 'session-1',
      code: 'ABC123',
      hostId: 'player1',
      hostName: 'Player 1',
      activityType: 'mission',
      privacy: 'public',
      maxPlayers: 4,
      currentPlayers: [
        {
          id: 'player1',
          username: 'Player 1',
          faction: 'Netrunners',
          role: 'Host' as 'Host',
          walletAddress: '0x123'
        }
      ],
      createdAt: Date.now() - 3600000,
      resourcePool: {
        resources: {},
        contributors: []
      }
    },
    {
      id: 'session-2',
      code: 'DEF456',
      hostId: 'player2',
      hostName: 'Player 2',
      activityType: 'alliance',
      privacy: 'public',
      maxPlayers: 6,
      currentPlayers: [
        {
          id: 'player2',
          username: 'Player 2',
          faction: 'Corporates',
          role: 'Host' as 'Host'
        }
      ],
      createdAt: Date.now() - 7200000,
      resourcePool: {
        resources: {},
        contributors: []
      }
    }
  ];
  private demoMode: boolean = true;
  private gameState: any = null;
  private eventListeners: Record<string, Function[]> = {};
  private mockInvites: InviteData[] = [];
  private mockMessages: Record<string, MessageData[]> = {};
  private mockMissions: Mission[] = [];
  private onlineUsers: Map<string, {id: string, username: string, faction: string}> = new Map();

  // Connect to the multiplayer server
  public connect(userData: { id: string; username: string; walletAddress: string }): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.userId = userData.id;
        this.username = userData.username;
        this.walletAddress = userData.walletAddress;

        console.log(`Attempting to connect to multiplayer server at ${SOCKET_URL}`);
        
        this.socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to multiplayer server');
          this.connected = true;
          this.demoMode = false;

          // Register user with the server
          if (this.socket) {
            this.socket.emit('register_user', {
              id: this.userId,
              username: this.username,
              walletAddress: this.walletAddress,
            });

            // Setup event listeners for server events
            this.setupServerEventListeners();
          }
          
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          
          // Fall back to demo mode after first connection error
          this.enableDemoMode();
          
          // Disconnect socket to prevent further reconnection attempts
          if (this.socket) {
            this.socket.disconnect();
          }
          
          resolve(true); // Resolve the promise to continue app initialization
        });

        this.socket.on('disconnect', (reason) => {
          console.log(`Disconnected from multiplayer server: ${reason}`);
          this.connected = false;
          
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            this.socket?.connect();
          }
        });
      } catch (error) {
        console.error('Error connecting to multiplayer server:', error);
        this.demoMode = true;
        this.connected = true; // Pretend we're connected in demo mode
        resolve(true);
      }
    });
  }

  // Enable demo mode with mock data
  private enableDemoMode(): void {
    console.log('Enabling demo mode for multiplayer');
    this.demoMode = true;
    this.connected = true;
    this.initMockData();
  }

  // Initialize mock data for demo mode
  private initMockData(): void {
    // Create mock sessions
    this.mockSessions = [
      {
        id: 'session-1',
        code: 'ABC123',
        hostId: 'player1',
        hostName: 'Player 1',
        activityType: 'mission',
        privacy: 'public',
        maxPlayers: 4,
        currentPlayers: [
          {
            id: 'player1',
            username: 'Player 1',
            faction: 'Netrunners',
            role: 'Host' as 'Host',
            walletAddress: '0x123'
          }
        ],
        createdAt: Date.now() - 3600000,
        resourcePool: {
          resources: {},
          contributors: []
        }
      },
      {
        id: 'session-2',
        code: 'DEF456',
        hostId: 'player2',
        hostName: 'Player 2',
        activityType: 'alliance',
        privacy: 'public',
        maxPlayers: 6,
        currentPlayers: [
          {
            id: 'player2',
            username: 'Player 2',
            faction: 'Corporates',
            role: 'Host' as 'Host'
          }
        ],
        createdAt: Date.now() - 7200000,
        resourcePool: {
          resources: {},
          contributors: []
        }
      }
    ];

    // Create mock missions
    this.mockMissions = [
      {
        id: 'mission-1',
        name: 'Corporate Data Heist',
        description: 'Infiltrate Arasaka Corp servers and extract classified project data.',
        difficulty: 'medium',
        reward: {
          credits: 500,
          dataShards: 20,
          syntheticAlloys: 10,
          quantumCores: 5
        },
        objectives: [
          {
            id: 'objective-1',
            description: 'Infiltrate the server room',
            completed: false
          },
          {
            id: 'objective-2',
            description: 'Extract the classified data',
            completed: false
          }
        ],
        progress: 0
      },
      {
        id: 'mission-2',
        name: 'Quantum Vault Raid',
        description: 'Break into a secure quantum vault in Night City\'s financial district.',
        difficulty: 'hard',
        reward: {
          credits: 1000,
          dataShards: 30,
          syntheticAlloys: 15,
          quantumCores: 10
        },
        objectives: [
          {
            id: 'objective-1',
            description: 'Disable the security systems',
            completed: false
          },
          {
            id: 'objective-2',
            description: 'Crack the vault combination',
            completed: false
          }
        ],
        progress: 0
      }
    ];
  }

  // Disconnect from socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.demoMode = false;
    this.userId = '';
    this.username = '';
    this.walletAddress = '';
    console.log('Disconnected from multiplayer server');
  }

  // Setup event listeners for server events
  private setupServerEventListeners(): void {
    if (!this.socket) return;

    // Session events
    this.socket.on('session_created', (session: Session) => {
      console.log('Session created:', session);
      this.activeSession = session;
      this.emit('session_created', session);
    });

    this.socket.on('session_joined', (session: Session) => {
      console.log('Session joined:', session);
      this.activeSession = session;
      this.emit('session_joined', session);
    });

    this.socket.on('session_updated', (session: Session) => {
      console.log('Session updated:', session);
      this.activeSession = session;
      this.emit('session_updated', session);
    });

    this.socket.on('sessions_list', (sessions: Session[]) => {
      console.log('Sessions list:', sessions);
      this.emit('sessions_list', sessions);
    });

    this.socket.on('player_joined', (data: { sessionId: string; player: any }) => {
      console.log('Player joined:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession.currentPlayers.push(data.player);
        this.emit('session_updated', this.activeSession);
      }
      this.emit('player_joined', data);
    });

    this.socket.on('player_left', (data: { sessionId: string; playerId: string }) => {
      console.log('Player left:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession.currentPlayers = this.activeSession.currentPlayers.filter(p => p.id !== data.playerId);
        this.emit('session_updated', this.activeSession);
      }
      this.emit('player_left', data);
    });

    this.socket.on('host_changed', (data: { sessionId: string; hostId: string; hostName: string }) => {
      console.log('Host changed:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession.hostId = data.hostId;
        this.activeSession.hostName = data.hostName;
      }
      this.emit('host_changed', data);
    });

    this.socket.on('session_closed', (data: { sessionId: string }) => {
      console.log('Session closed:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession = null;
      }
      this.emit('session_closed', data);
    });

    this.socket.on('session_left', (data: { sessionId: string; playerId: string }) => {
      console.log('Left session:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession = null;
      }
      this.emit('session_left', data);
    });

    // Game state events
    this.socket.on('game_state_updated', (gameState: any) => {
      console.log('Game state updated:', gameState);
      this.gameState = gameState;
      this.emit('game_state_updated', gameState);
      
      // If the current player's resources have changed, emit a resource update event
      if (gameState.players) {
        const currentPlayer = gameState.players.find((p: Player) => p.id === this.userId);
        if (currentPlayer && currentPlayer.resources) {
          // Dispatch a custom event to update resources in the UI
          const event = new CustomEvent(RESOURCE_UPDATE_EVENT, {
            detail: { resources: currentPlayer.resources }
          });
          document.dispatchEvent(event);
        }
      }
    });

    // User presence events
    this.socket.on('user_online', (userData: {id: string, username: string, faction: string}) => {
      console.log('User online:', userData);
      this.onlineUsers.set(userData.id, userData);
      this.emit('user_online', userData);
    });

    this.socket.on('user_offline', (userData: {id: string}) => {
      console.log('User offline:', userData);
      this.onlineUsers.delete(userData.id);
      this.emit('user_offline', userData);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  // Event handling methods
  public on(event: string, callback: Function): this {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    return this;
  }
  
  public off(event: string, callback: Function): this {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
    return this;
  }
  
  public emit(event: string, data: any): boolean {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        callback(data);
      });
    }
    return true;
  }

  // Create a new session
  public createSession(sessionData: Partial<Session>): void {
    if (!this.userId) {
      console.error('Cannot create session: not logged in');
      this.emit('error', { message: 'Not logged in' });
      return;
    }
    
    if (this.demoMode) {
      // Create a mock session in demo mode
      const sessionId = `session-${Date.now()}`;
      const newSession: Session = {
        id: sessionId,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        hostId: sessionData.hostId || this.userId,
        hostName: sessionData.hostName || this.username,
        activityType: sessionData.activityType || 'mission',
        privacy: sessionData.privacy || 'public',
        maxPlayers: sessionData.maxPlayers || 4,
        currentPlayers: sessionData.currentPlayers || [],
        createdAt: Date.now(),
        resourcePool: {
          resources: {},
          contributors: []
        }
      };
      
      this.mockSessions.push(newSession);
      this.activeSession = newSession;
      
      setTimeout(() => {
        this.emit('session_created', newSession);
      }, 500);
      
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot create session: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    // Initialize game state with current territories
    const initialGameState = {
      territories: sessionData.territories || [],
      players: [
        {
          id: this.userId,
          name: this.username,
          faction: authService.getUser()?.faction || 'Netrunners',
          resources: {
            credits: 1000,
            dataShards: 50,
            syntheticAlloys: 30,
            quantumCores: 15
          }
        }
      ],
      agents: [],
      gameEvents: []
    };
    
    // Add the current player to the session
    const currentPlayers = sessionData.currentPlayers || [];
    if (!currentPlayers.some(p => p.id === this.userId)) {
      currentPlayers.push({
        id: this.userId,
        username: this.username,
        faction: authService.getUser()?.faction || 'Netrunners',
        role: 'Host' as 'Host',
        walletAddress: this.walletAddress
      });
    }
    
    this.socket.emit('create_session', {
      ...sessionData,
      currentPlayers,
      territories: sessionData.territories || []
    });
  }

  // Join an existing session
  public joinSession(sessionCode: string): void {
    if (this.demoMode) {
      // Find mock session in demo mode
      const sessionIndex = this.mockSessions.findIndex(s => s.code === sessionCode);
      
      if (sessionIndex === -1) {
        console.error('Session not found with code:', sessionCode);
        this.emit('error', { message: 'Session not found' });
        return;
      }
      
      const session = { ...this.mockSessions[sessionIndex] };
      
      // Add current player to the session
      const player = {
        id: this.userId,
        username: this.username,
        faction: 'Netrunners', // Default faction
        role: 'Member' as 'Member',
        walletAddress: this.walletAddress
      };
      
      if (!session.currentPlayers.some(p => p.id === player.id)) {
        session.currentPlayers.push(player);
      }
      
      this.activeSession = session;
      this.mockSessions[sessionIndex] = session;
      
      this.emit('session_joined', session);
      this.emit('session_updated', session);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot join session: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    const player = {
      id: this.userId,
      username: this.username,
      faction: authService.getUser()?.faction || 'Netrunners',
      role: 'Member',
      walletAddress: this.walletAddress
    };
    
    this.socket.emit('join_session', {
      sessionCode,
      player
    });
  }

  // Leave the current session
  public leaveSession(sessionId: string): void {
    if (this.demoMode) {
      // Leave a mock session in demo mode
      setTimeout(() => {
        if (this.activeSession && this.activeSession.id === sessionId) {
          // Remove the current user from the session
          const updatedSession = { ...this.activeSession };
          updatedSession.currentPlayers = updatedSession.currentPlayers.filter(
            player => player.id !== this.userId
          );
          
          // Update the session in mock data
          const index = this.mockSessions.findIndex(s => s.id === sessionId);
          if (index !== -1) {
            this.mockSessions[index] = updatedSession;
          }
          
          this.emit('session_left', { sessionId, playerId: this.userId });
          this.activeSession = null;
        }
      }, 500);
      return;
    }

    if (!this.socket || !this.connected) {
      console.error('Cannot leave session: not connected to server');
      return;
    }

    this.socket.emit('leave_session', { sessionId });
  }

  // Send an invite to a player
  public sendInvite(targetPlayerId: string, message?: string): void {
    if (!this.activeSession) {
      console.error('Cannot send invite: no active session');
      this.emit('error', { message: 'No active session' });
      return;
    }
    
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        const invite: InviteData = {
          id: `invite-${Date.now()}`,
          sessionId: this.activeSession!.id,
          sessionCode: this.activeSession!.code,
          fromId: this.userId,
          fromName: this.username,
          toId: targetPlayerId,
          message: message || `Join my session: ${this.activeSession!.code}`,
          timestamp: Date.now(),
          status: 'pending'
        };
        
        this.mockInvites.push(invite);
        this.emit('invite_sent', invite);
      }, 500);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot send invite: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('send_invite', {
      sessionId: this.activeSession.id,
      targetPlayerId,
      message: message || `Join my session: ${this.activeSession.code}`
    });
  }

  // Accept an invite
  public acceptInvite(inviteId: string): void {
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        const inviteIndex = this.mockInvites.findIndex((i: InviteData) => i.id === inviteId);
        if (inviteIndex !== -1) {
          const invite = this.mockInvites[inviteIndex];
          invite.status = 'accepted';
          this.joinSession(invite.sessionCode);
          this.mockInvites.splice(inviteIndex, 1);
          this.emit('invite_accepted', invite);
        }
      }, 500);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot accept invite: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('accept_invite', { inviteId });
  }

  // Decline an invite
  public declineInvite(inviteId: string): void {
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        const inviteIndex = this.mockInvites.findIndex((i: InviteData) => i.id === inviteId);
        if (inviteIndex !== -1) {
          const invite = this.mockInvites[inviteIndex];
          invite.status = 'declined';
          this.mockInvites.splice(inviteIndex, 1);
          this.emit('invite_declined', invite);
        }
      }, 500);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot decline invite: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('decline_invite', { inviteId });
  }

  // Send a chat message
  public sendMessage(sessionId: string, content: string): void {
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        if (!this.mockMessages[sessionId]) {
          this.mockMessages[sessionId] = [];
        }
        
        const message: MessageData = {
          id: `msg-${Date.now()}`,
          sessionId,
          senderId: this.userId,
          senderName: this.username,
          content,
          timestamp: Date.now()
        };
        
        this.mockMessages[sessionId].push(message);
        this.emit('message_received', message);
      }, 200);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot send message: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('send_message', {
      sessionId,
      content
    });
  }

  // Start a mission in the current session
  public startMission(sessionId: string, missionId: string): void {
    if (!this.socket) {
      console.warn('Cannot start mission: No active socket connection');
      return;
    }

    this.socket.emit('start_mission', { sessionId, missionId });
  }

  // Contribute resources to the pool
  public contributeResources(sessionId: string, resources: Record<string, number>): void {
    if (this.demoMode) {
      // Simulate resource contribution in demo mode
      setTimeout(() => {
        console.log('Resources contributed:', resources);
        // In a real implementation, this would update the resource pool
      }, 500);
      return;
    }

    if (!this.socket || !this.connected) {
      console.error('Cannot contribute resources: not connected to server');
      return;
    }

    this.socket.emit('contribute_resources', { sessionId, resources });
  }

  // Generate a random session code
  private generateSessionCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = 'NS-';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Get mock sessions (for demo purposes)
  public getMockSessions(): Session[] {
    return this.mockSessions;
  }

  // Get mock missions (for demo purposes)
  public getMockMissions(): Mission[] {
    return this.mockMissions;
  }

  // Check if connected to server
  public isConnected(): boolean {
    return this.connected;
  }

  // Check if in demo mode
  public isDemoMode(): boolean {
    return this.demoMode;
  }

  // Debug helper method
  public getDebugInfo(): any {
    return {
      connected: this.connected,
      demoMode: this.demoMode,
      userId: this.userId,
      username: this.username,
      activeSession: this.activeSession,
      mockSessions: this.mockSessions,
      eventListenerCounts: Object.fromEntries(
        Object.entries(this.eventListeners).map(([event, listeners]) => [
          event,
          listeners.length
        ])
      )
    };
  }

  // Request a full sync of the current session data from the server
  public requestSessionSync(): void {
    if (!this.socket || !this.activeSession) {
      console.warn('Cannot request session sync: No active socket or session');
      return;
    }

    this.socket.emit('request_session_sync', { sessionId: this.activeSession.id });
  }

  /**
   * Get the current active session
   * @returns The current active session or null if no session is active
   */
  public getActiveSession(): Session | null {
    return this.activeSession;
  }

  // Claim a territory
  public claimTerritory(territoryId: number): void {
    if (!this.activeSession) {
      console.error('Cannot claim territory: no active session');
      this.emit('error', { message: 'No active session' });
      return;
    }
    
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        if (this.gameState) {
          const territoryIndex = this.gameState.territories.findIndex((t: Territory) => t.id === territoryId);
          if (territoryIndex !== -1) {
            const territory = this.gameState.territories[territoryIndex];
            
            // Only allow claiming if territory is unclaimed or owned by the player already
            if (territory.owner && territory.owner !== this.userId && territory.owner !== 'unclaimed') {
              console.log('Cannot claim: territory owned by another player');
              this.emit('error', { message: 'Territory owned by another player' });
              return;
            }
            
            territory.owner = this.userId;
            territory.status = 'owned';
            this.gameState.territories[territoryIndex] = territory;
            
            // Add a game event
            this.gameState.gameEvents.push({
              id: `event-${Date.now()}`,
              type: 'territory_claim',
              sourcePlayerId: this.userId,
              territoryId: territoryId,
              timestamp: Date.now(),
              status: 'completed'
            });
            
            this.emit('game_state_updated', this.gameState);
          }
        }
      }, 500);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot claim territory: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('claim_territory', {
      sessionId: this.activeSession.id,
      playerId: this.userId,
      territoryId
    });
  }
  
  // Extract resources from a territory
  public extractResources(territoryId: number, resources: Record<string, number>): void {
    if (!this.activeSession) {
      console.error('Cannot extract resources: no active session');
      this.emit('error', { message: 'No active session' });
      return;
    }
    
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        if (this.gameState) {
          const playerIndex = this.gameState.players.findIndex((p: { id: string }) => p.id === this.userId);
          if (playerIndex !== -1) {
            const player = this.gameState.players[playerIndex];
            const typedResources = player.resources as Record<string, number>;
            Object.keys(resources).forEach(resourceType => {
              typedResources[resourceType] = (typedResources[resourceType] || 0) + resources[resourceType];
            });
            this.gameState.players[playerIndex] = player;
            
            // Add a game event
            this.gameState.gameEvents.push({
              id: `event-${Date.now()}`,
              type: "resource_extract",
              sourcePlayerId: this.userId,
              territoryId: territoryId,
              resources: resources,
              timestamp: Date.now(),
              status: 'completed'
            });
            
            this.emit('game_state_updated', this.gameState);
            
            // Dispatch a custom event to update resources in the UI
            const event = new CustomEvent(RESOURCE_UPDATE_EVENT, {
              detail: { resources: player.resources }
            });
            document.dispatchEvent(event);
          }
        }
      }, 500);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot extract resources: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('extract_resources', {
      sessionId: this.activeSession.id,
      playerId: this.userId,
      territoryId,
      resources
    });
  }
  
  // Deploy an agent
  public deployAgent(agentType: string, territoryId: number, task: string): void {
    if (!this.activeSession) {
      console.error('Cannot deploy agent: no active session');
      this.emit('error', { message: 'No active session' });
      return;
    }
    
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        if (this.gameState) {
          const newAgent: Agent = {
            id: Date.now(), 
            name: `Agent ${Math.floor(Math.random() * 1000)}`,
            type: agentType,
            status: 'active',
            location: territoryId.toString(), 
            task: task,
            ownerId: this.userId,
            power: 10
          };
          
          this.gameState.agents.push(newAgent);
          
          // Add a game event
          this.gameState.gameEvents.push({
            id: `event-${Date.now()}`,
            type: "agent_deploy",
            sourcePlayerId: this.userId,
            agentId: newAgent.id,
            territoryId: territoryId,
            timestamp: Date.now(),
            status: 'completed'
          });
          
          this.emit('game_state_updated', this.gameState);
        }
      }, 500);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot deploy agent: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('deploy_agent', {
      sessionId: this.activeSession.id,
      playerId: this.userId,
      agentType,
      territoryId,
      task
    });
  }
  
  // Update game state
  public updateGameState(gameState: any): void {
    if (!this.activeSession) {
      console.error('Cannot update game state: no active session');
      this.emit('error', { message: 'No active session' });
      return;
    }
    
    if (this.demoMode) {
      // Handle in demo mode
      this.gameState = gameState;
      this.emit('game_state_updated', gameState);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot update game state: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('update_game_state', {
      sessionId: this.activeSession.id,
      gameState
    });
  }
  
  // Get current game state
  public getGameState(): any {
    return this.gameState;
  }
  
  // Get online users
  public getOnlineUsers(): {id: string, username: string, faction: string}[] {
    if (this.demoMode) {
      return Array.from(this.onlineUsers.values());
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot get online users: not connected to server');
      return [];
    }
    
    return Array.from(this.onlineUsers.values());
  }

  // Get list of available sessions
  public getAvailableSessions(): Promise<Session[]> {
    return new Promise((resolve) => {
      if (this.demoMode) {
        // Return mock sessions in demo mode
        setTimeout(() => {
          resolve(this.mockSessions);
        }, 500);
        return;
      }
      
      if (!this.socket || !this.connected) {
        console.error('Cannot get sessions: not connected to server');
        resolve([]);
        return;
      }
      
      this.socket.emit('get_sessions', {});
      
      // Set up a one-time listener for the response
      const handleSessions = (sessions: Session[]) => {
        this.off('sessions_list', handleSessions);
        resolve(sessions);
      };
      
      this.on('sessions_list', handleSessions);
    });
  }

  // Add a player to a session
  public addPlayerToSession(sessionId: string, player: { id: string; username: string; faction: string; walletAddress?: string }): void {
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        const sessionIndex = this.mockSessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex !== -1) {
          const session = this.mockSessions[sessionIndex];
          
          // Add player with proper role type
          const sessionPlayer = {
            ...player,
            role: "Member" as "Host" | "Member" // Explicitly type as union type
          };
          
          if (!session.currentPlayers.some(p => p.id === player.id)) {
            session.currentPlayers.push(sessionPlayer);
          }
          
          this.activeSession = session;
          this.emit('player_joined', { sessionId, playerId: player.id });
          this.emit('session_updated', session);
        }
      }, 500);
      return;
    }
    
    if (!this.socket || !this.connected) {
      console.error('Cannot add player to session: not connected to server');
      this.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    this.socket.emit('add_player_to_session', {
      sessionId,
      player
    });
  }

  // Update player resources in game state
  public updatePlayerResources(resources: Record<string, number>): void {
    if (!this.gameState) {
      console.error('Cannot update resources: no game state');
      return;
    }
    
    if (this.demoMode) {
      // Handle in demo mode
      setTimeout(() => {
        if (this.gameState) {
          const playerIndex = this.gameState.players.findIndex((p: { id: string }) => p.id === this.userId);
          if (playerIndex !== -1) {
            const player = this.gameState.players[playerIndex];
            const typedResources = player.resources as Record<string, number>;
            
            // Update resources
            Object.keys(resources).forEach(key => {
              if (typedResources[key] !== undefined) {
                typedResources[key] += resources[key];
              } else {
                typedResources[key] = resources[key];
              }
            });
            
            player.resources = typedResources;
            this.gameState.players[playerIndex] = player;
            
            this.emit('game_state_updated', this.gameState);
          }
        }
      }, 500);
      return;
    }
  }
}

// Create singleton instance
const multiplayerService = new MultiplayerService();
export default multiplayerService;
