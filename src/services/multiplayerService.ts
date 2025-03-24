import { io, Socket } from 'socket.io-client';
import { Territory, Agent, Player, GameEvent } from '../types/gameTypes';

// WebSocket server URL
const SOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3001';

// Interface for session data
export interface Session {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  activityType: 'mission' | 'alliance' | 'resource' | 'custom';
  privacy: 'public' | 'private' | 'friends';
  maxPlayers: number;
  currentPlayers: {
    id: string;
    username: string;
    faction: string;
    role: string;
    walletAddress?: string;
  }[];
  createdAt: number;
  currentMission?: any;
  resourcePool?: {
    resources: Record<string, number>;
    contributors: {
      id: string;
      username: string;
      faction: string;
      contributions: Record<string, number>;
    }[];
  };
}

// Interface for invite data
export interface InviteData {
  id: string;
  sessionId: string;
  sessionCode: string;
  fromId: string;
  fromName: string;
  toId: string;
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
  rewards: {
    experience: number;
    credits: number;
    resources: Record<string, number>;
  };
  requirements: {
    minPlayers: number;
    recommendedPlayers: number;
    minLevel?: number;
  };
  objectives: {
    id: string;
    description: string;
    completed: boolean;
  }[];
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startedAt?: number;
  completedAt?: number;
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

class MultiplayerService {
  private socket: Socket | null = null;
  private eventListeners: Record<string, Function[]> = {};
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private userId: string = '';
  private username: string = '';
  private walletAddress: string = '';
  private demoMode: boolean = false;
  private mockSessions: Session[] = [];
  private mockInvites: InviteData[] = [];
  private mockMessages: Record<string, MessageData[]> = {};
  private mockMissions: Mission[] = [];
  private activeSession: Session | null = null;

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
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to multiplayer server');
          this.connected = true;
          this.reconnectAttempts = 0;
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
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log(`Failed to connect after ${this.maxReconnectAttempts} attempts, switching to demo mode`);
            this.demoMode = true;
            this.connected = true; // Pretend we're connected in demo mode
            resolve(true);
          }
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
    this.initializeMockData();
  }

  // Initialize mock data for demo mode
  private initializeMockData(): void {
    // Create mock sessions
    this.mockSessions = [
      {
        id: 'session1',
        code: 'NS-ABC12',
        hostId: 'host1',
        hostName: 'CyberHawk',
        activityType: 'mission',
        privacy: 'public',
        maxPlayers: 4,
        currentPlayers: [
          {
            id: 'host1',
            username: 'CyberHawk',
            faction: 'Netrunners',
            role: 'Host'
          },
          {
            id: 'player2',
            username: 'DataWraith',
            faction: 'Quantum Collective',
            role: 'Member'
          }
        ],
        createdAt: Date.now() - 3600000 // 1 hour ago
      },
      {
        id: 'session2',
        code: 'NS-DEF34',
        hostId: 'host2',
        hostName: 'NeonShadow',
        activityType: 'alliance',
        privacy: 'public',
        maxPlayers: 6,
        currentPlayers: [
          {
            id: 'host2',
            username: 'NeonShadow',
            faction: 'Chrome Jackals',
            role: 'Host'
          }
        ],
        createdAt: Date.now() - 1800000 // 30 minutes ago
      }
    ];

    // Create mock missions
    this.mockMissions = [
      {
        id: 'mission1',
        name: 'Corporate Data Heist',
        description: 'Infiltrate Arasaka Corp servers and extract classified project data.',
        difficulty: 'medium',
        rewards: {
          experience: 500,
          credits: 1500,
          resources: {
            dataShards: 75,
            syntheticAlloys: 30,
            quantumCores: 10
          }
        },
        requirements: {
          minPlayers: 3,
          recommendedPlayers: 4
        },
        objectives: [
          {
            id: 'objective1',
            description: 'Infiltrate the server room',
            completed: false
          },
          {
            id: 'objective2',
            description: 'Extract the classified data',
            completed: false
          }
        ],
        status: 'available',
        progress: 0
      },
      {
        id: 'mission2',
        name: 'Quantum Vault Raid',
        description: 'Break into a secure quantum vault in Night City\'s financial district.',
        difficulty: 'hard',
        rewards: {
          experience: 800,
          credits: 2500,
          resources: {
            dataShards: 120,
            syntheticAlloys: 60,
            quantumCores: 25
          }
        },
        requirements: {
          minPlayers: 4,
          recommendedPlayers: 6
        },
        objectives: [
          {
            id: 'objective1',
            description: 'Disable the security systems',
            completed: false
          },
          {
            id: 'objective2',
            description: 'Crack the vault combination',
            completed: false
          }
        ],
        status: 'available',
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

    this.socket.on('player_joined', (data: { sessionId: string; player: any }) => {
      console.log('Player joined:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession.currentPlayers.push(data.player);
        this.emit('session_updated', this.activeSession);
      }
    });

    this.socket.on('player_left', (data: { sessionId: string; playerId: string }) => {
      console.log('Player left:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession.currentPlayers = this.activeSession.currentPlayers.filter(
          (player) => player.id !== data.playerId
        );
        this.emit('session_updated', this.activeSession);
      }
      this.emit('session_left', data);
    });

    this.socket.on('session_left', (data: { sessionId: string; playerId: string }) => {
      console.log('Left session:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession = null;
      }
      this.emit('session_left', data);
    });

    this.socket.on('host_changed', (data: { sessionId: string; hostId: string; hostName: string }) => {
      console.log('Host changed:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession.hostId = data.hostId;
        this.activeSession.hostName = data.hostName;
        this.emit('session_updated', this.activeSession);
      }
    });

    this.socket.on('session_updated', (session: Session) => {
      // Update the current session with the latest data from the server
      if (this.activeSession && this.activeSession.id === session.id) {
        this.activeSession = session;
        this.emit('session_updated', session);
      }
    });

    this.socket.on('session_sync', (session: Session) => {
      // Replace the current session with the synced data from the server
      if (this.activeSession && this.activeSession.id === session.id) {
        this.activeSession = session;
        this.emit('session_synced', session);
      }
    });

    // Chat events
    this.socket.on('message_received', (message: any) => {
      console.log('Message received:', message);
      this.emit('message_received', message);
    });

    // Mission events
    this.socket.on('mission_started', (mission: Mission) => {
      console.log('Mission started:', mission);
      if (this.activeSession) {
        this.activeSession.currentMission = mission;
      }
      this.emit('mission_started', mission);
    });

    this.socket.on('mission_progress', (data: { missionId: string; progress: number }) => {
      console.log('Mission progress:', data);
      if (this.activeSession && this.activeSession.currentMission && this.activeSession.currentMission.id === data.missionId) {
        this.activeSession.currentMission.progress = data.progress;
      }
      this.emit('mission_progress', data);
    });

    this.socket.on('mission_completed', (data: { missionId: string; rewards: any }) => {
      console.log('Mission completed:', data);
      if (this.activeSession && this.activeSession.currentMission && this.activeSession.currentMission.id === data.missionId) {
        this.activeSession.currentMission.status = 'completed';
        this.activeSession.currentMission.completedAt = Date.now();
      }
      this.emit('mission_completed', data);
    });

    // Resource events
    this.socket.on('resource_pool_updated', (data: { sessionId: string; resourcePool: any }) => {
      console.log('Resource pool updated:', data);
      if (this.activeSession && this.activeSession.id === data.sessionId) {
        this.activeSession.resourcePool = data.resourcePool;
        this.emit('session_updated', this.activeSession);
      }
    });

    // Error events
    this.socket.on('error', (error: any) => {
      console.error('Server error:', error);
      this.emit('error', error);
    });
  }

  // Event handling methods
  public on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    console.log(`Added listener for event: ${event}, total listeners: ${this.eventListeners[event].length}`);
  }

  public off(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      return;
    }
    this.eventListeners[event] = this.eventListeners[event].filter(
      (cb) => cb !== callback
    );
    console.log(`Removed listener for event: ${event}, remaining listeners: ${this.eventListeners[event].length}`);
  }

  public emit(event: string, data: any): void {
    console.log(`Emitting event: ${event}`, data);
    if (!this.eventListeners[event]) {
      console.warn(`No listeners for event: ${event}`);
      return;
    }
    
    // Make a copy of the listeners array before iterating to avoid issues if listeners are added/removed during emission
    const listeners = [...this.eventListeners[event]];
    console.log(`Calling ${listeners.length} listeners for event: ${event}`);
    
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Create a new session
  public createSession(sessionData: Partial<Session>): void {
    if (this.demoMode) {
      // Create a mock session in demo mode
      setTimeout(() => {
        const newSession: Session = {
          id: `session-${Date.now()}`,
          code: this.generateSessionCode(),
          hostId: this.userId,
          hostName: this.username,
          activityType: sessionData.activityType || 'mission',
          privacy: sessionData.privacy || 'public',
          maxPlayers: sessionData.maxPlayers || 4,
          currentPlayers: [
            {
              id: this.userId,
              username: this.username,
              faction: 'Netrunners', // Default faction
              role: 'Host'
            }
          ],
          createdAt: Date.now()
        };
        
        this.mockSessions.push(newSession);
        this.activeSession = newSession;
        
        // Make sure to emit the event with the complete session object
        console.log("Emitting session_created event with session:", newSession);
        this.emit('session_created', newSession);
      }, 500);
      return;
    }

    if (!this.socket || !this.connected) {
      console.error('Cannot create session: not connected to server');
      return;
    }

    this.socket.emit('create_session', sessionData);
  }

  // Join an existing session
  public joinSession(sessionCode: string): void {
    if (this.demoMode) {
      // Join a mock session in demo mode
      setTimeout(() => {
        // Try to find existing session
        let session = this.mockSessions.find(s => s.code === sessionCode);
        
        // If session doesn't exist in demo mode, create a mock one
        if (!session) {
          console.log(`Creating mock session for code: ${sessionCode}`);
          const newSession: Session = {
            id: `session-${Date.now()}`,
            code: sessionCode,
            hostId: 'host-demo',
            hostName: 'DemoHost',
            activityType: 'mission',
            privacy: 'public',
            maxPlayers: 4,
            currentPlayers: [
              {
                id: 'host-demo',
                username: 'DemoHost',
                faction: 'Netrunners',
                role: 'Host'
              }
            ],
            createdAt: Date.now() - 600000 // 10 minutes ago
          };
          
          this.mockSessions.push(newSession);
          session = newSession;
        }
        
        // At this point, session is guaranteed to exist
        const currentSession = session as Session;
        
        // Add the current user to the session if not already in it
        const playerExists = currentSession.currentPlayers.some(p => p.id === this.userId);
        
        let updatedSession: Session;
        
        if (!playerExists) {
          // Add the current user to the session
          updatedSession = { ...currentSession };
          updatedSession.currentPlayers.push({
            id: this.userId,
            username: this.username,
            faction: 'Netrunners', // Default faction
            role: 'Member'
          });
          
          // Update the session in mock data
          const index = this.mockSessions.findIndex(s => s.id === currentSession.id);
          if (index !== -1) {
            this.mockSessions[index] = updatedSession;
          }
        } else {
          updatedSession = currentSession;
        }
        
        this.activeSession = updatedSession;
        
        // Make sure to emit the event with the complete session object
        console.log("Emitting session_joined event with session:", updatedSession);
        this.emit('session_joined', updatedSession);
      }, 500);
      return;
    }

    if (!this.socket || !this.connected) {
      console.error('Cannot join session: not connected to server');
      return;
    }

    this.socket.emit('join_session', { sessionCode });
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
  public sendInvite(sessionId: string, playerId: string): void {
    if (this.demoMode) {
      // Send a mock invite in demo mode
      setTimeout(() => {
        const session = this.mockSessions.find(s => s.id === sessionId);
        
        if (session) {
          const invite: InviteData = {
            id: `invite-${Date.now()}`,
            sessionId,
            sessionCode: session.code,
            fromId: this.userId,
            fromName: this.username,
            toId: playerId,
            timestamp: Date.now(),
            status: 'pending'
          };
          
          this.mockInvites.push(invite);
          // In a real scenario, the server would emit this to the target player
        }
      }, 500);
      return;
    }

    if (!this.socket || !this.connected) {
      console.error('Cannot send invite: not connected to server');
      return;
    }

    this.socket.emit('send_invite', { sessionId, playerId });
  }

  // Accept an invite
  public acceptInvite(inviteId: string): void {
    if (this.demoMode) {
      // Accept a mock invite in demo mode
      setTimeout(() => {
        const invite = this.mockInvites.find(i => i.id === inviteId);
        
        if (invite) {
          // Update invite status
          invite.status = 'accepted';
          
          // Join the session
          this.joinSession(invite.sessionCode);
          
          // Emit the event
          this.emit('invite_accepted', invite);
        }
      }, 500);
      return;
    }

    if (!this.socket || !this.connected) {
      console.error('Cannot accept invite: not connected to server');
      return;
    }

    this.socket.emit('accept_invite', { inviteId });
  }

  // Decline an invite
  public declineInvite(inviteId: string): void {
    if (this.demoMode) {
      // Decline a mock invite in demo mode
      setTimeout(() => {
        const invite = this.mockInvites.find(i => i.id === inviteId);
        
        if (invite) {
          // Update invite status
          invite.status = 'declined';
          
          // Emit the event
          this.emit('invite_declined', invite);
        }
      }, 500);
      return;
    }

    if (!this.socket || !this.connected) {
      console.error('Cannot decline invite: not connected to server');
      return;
    }

    this.socket.emit('decline_invite', { inviteId });
  }

  // Send a chat message
  public sendMessage(sessionId: string, content: string): void {
    if (this.demoMode) {
      // Send a mock message in demo mode
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
      return;
    }

    this.socket.emit('send_message', { sessionId, content });
  }

  /**
   * Start a mission in the current session
   * @param sessionId The ID of the session
   * @param missionId The ID of the mission to start
   */
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
}

// Create singleton instance
const multiplayerService = new MultiplayerService();
export default multiplayerService;
