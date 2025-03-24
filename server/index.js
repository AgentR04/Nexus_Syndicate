const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active sessions and users
const sessions = new Map();
const users = new Map();
const gameStates = new Map(); // Store game states for different sessions
const userTerritories = new Map(); // Track which territories are owned by which users

// Helper function to broadcast session updates to all players in a session
const broadcastSessionUpdate = (sessionId) => {
  const session = sessions.get(sessionId);
  if (session) {
    io.to(sessionId).emit('session_updated', session);
    console.log(`Session update broadcast to all players in session: ${session.code}`);
  }
};

// Helper function to broadcast global session list updates
const broadcastSessionsList = () => {
  const publicSessions = Array.from(sessions.values())
    .filter(session => session.privacy === 'public')
    .map(session => ({
      id: session.id,
      code: session.code,
      hostName: session.hostName,
      activityType: session.activityType,
      playerCount: session.currentPlayers.length,
      maxPlayers: session.maxPlayers,
    }));
  
  io.emit('sessions_list', publicSessions);
  console.log(`Sessions list broadcast to all connected users`);
};

// Helper function to broadcast game state updates to all players in a session
const broadcastGameStateUpdate = (sessionId) => {
  const gameState = gameStates.get(sessionId);
  if (gameState) {
    io.to(sessionId).emit('game_state_updated', gameState);
    console.log(`Game state update broadcast to all players in session: ${sessionId}`);
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("Nexus Syndicate Multiplayer Server is running");
});

app.get("/api/sessions", (req, res) => {
  const sessionList = Array.from(sessions.values());
  res.json({ sessions: sessionList });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Store user data when they connect
  socket.on("register_user", (userData) => {
    const userId = userData.id || socket.id;
    users.set(userId, {
      id: userId,
      socketId: socket.id,
      username: userData.username || "Anonymous",
      walletAddress: userData.walletAddress || "",
      faction: userData.faction || "Netrunners",
      isOnline: true,
      lastActive: new Date().toISOString(),
    });

    console.log(`User registered: ${userData.username} (${userId})`);

    // Send list of active sessions to the user
    socket.emit("sessions_list", Array.from(sessions.values()));
    
    // Broadcast user presence to all connected users
    io.emit("user_online", {
      id: userId,
      username: userData.username || "Anonymous",
      faction: userData.faction || "Netrunners"
    });
  });

  // Create a new session
  socket.on("create_session", (sessionData) => {
    const sessionId = uuidv4();
    const sessionCode = generateSessionCode();

    const newSession = {
      id: sessionId,
      code: sessionCode,
      hostId: sessionData.hostId,
      hostName: sessionData.hostName,
      activityType: sessionData.activityType || "mission",
      privacy: sessionData.privacy || "public",
      maxPlayers: sessionData.maxPlayers || 4,
      currentPlayers: sessionData.currentPlayers || [],
      createdAt: Date.now(),
      resourcePool: {
        resources: {},
        contributors: []
      }
    };

    // Initialize game state for this session
    gameStates.set(sessionId, {
      territories: sessionData.territories || [],
      players: [],
      agents: [],
      gameEvents: []
    });

    sessions.set(sessionId, newSession);
    socket.join(sessionId);
    
    console.log(`Session created: ${sessionCode} by ${sessionData.hostName}`);
    
    socket.emit("session_created", newSession);
    broadcastSessionsList();
  });

  // Handle game state synchronization
  socket.on("update_game_state", (data) => {
    const { sessionId, gameState } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      socket.emit("error", { message: "Session not found" });
      return;
    }

    // Update the game state for this session
    gameStates.set(sessionId, gameState);
    
    // Broadcast the updated game state to all players in the session
    broadcastGameStateUpdate(sessionId);
  });

  // Handle territory claiming
  socket.on("claim_territory", (data) => {
    const { sessionId, playerId, territoryId } = data;
    const session = sessions.get(sessionId);
    const gameState = gameStates.get(sessionId);

    if (!session || !gameState) {
      socket.emit("error", { message: "Session or game state not found" });
      return;
    }

    // Find the territory in the game state
    const territoryIndex = gameState.territories.findIndex(t => t.id === territoryId);
    if (territoryIndex === -1) {
      socket.emit("error", { message: "Territory not found" });
      return;
    }

    // Update the territory owner
    gameState.territories[territoryIndex].ownerId = playerId;
    gameState.territories[territoryIndex].lastClaimedAt = Date.now();

    // Track territory ownership
    if (!userTerritories.has(playerId)) {
      userTerritories.set(playerId, []);
    }
    userTerritories.get(playerId).push(territoryId);

    // Update the game state
    gameStates.set(sessionId, gameState);

    // Broadcast the updated game state
    broadcastGameStateUpdate(sessionId);

    console.log(`Territory ${territoryId} claimed by player ${playerId} in session ${sessionId}`);
  });

  // Handle resource extraction
  socket.on("extract_resources", (data) => {
    const { sessionId, playerId, territoryId, resources } = data;
    const session = sessions.get(sessionId);
    const gameState = gameStates.get(sessionId);

    if (!session || !gameState) {
      socket.emit("error", { message: "Session or game state not found" });
      return;
    }

    // Find the player in the game state
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      socket.emit("error", { message: "Player not found" });
      return;
    }

    // Update the player's resources
    const player = gameState.players[playerIndex];
    Object.keys(resources).forEach(resourceType => {
      player.resources[resourceType] = (player.resources[resourceType] || 0) + resources[resourceType];
    });

    // Update the game state
    gameState.players[playerIndex] = player;
    gameStates.set(sessionId, gameState);

    // Add a game event
    gameState.gameEvents.push({
      id: uuidv4(),
      type: "resource_extraction",
      playerId: playerId,
      territoryId: territoryId,
      resources: resources,
      timestamp: Date.now()
    });

    // Broadcast the updated game state
    broadcastGameStateUpdate(sessionId);

    console.log(`Resources extracted by player ${playerId} from territory ${territoryId} in session ${sessionId}`);
  });

  // Handle agent deployment
  socket.on("deploy_agent", (data) => {
    const { sessionId, playerId, agentType, territoryId, task } = data;
    const session = sessions.get(sessionId);
    const gameState = gameStates.get(sessionId);

    if (!session || !gameState) {
      socket.emit("error", { message: "Session or game state not found" });
      return;
    }

    // Create a new agent
    const newAgent = {
      id: uuidv4(),
      type: agentType,
      ownerId: playerId,
      territoryId: territoryId,
      task: task,
      status: "active",
      deployedAt: Date.now()
    };

    // Add the agent to the game state
    gameState.agents.push(newAgent);
    gameStates.set(sessionId, gameState);

    // Add a game event
    gameState.gameEvents.push({
      id: uuidv4(),
      type: "agent_deployed",
      playerId: playerId,
      agentId: newAgent.id,
      territoryId: territoryId,
      timestamp: Date.now()
    });

    // Broadcast the updated game state
    broadcastGameStateUpdate(sessionId);

    console.log(`Agent deployed by player ${playerId} to territory ${territoryId} in session ${sessionId}`);
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    // Find the user associated with this socket
    let disconnectedUserId = null;
    for (const [userId, user] of users.entries()) {
      if (user.socketId === socket.id) {
        disconnectedUserId = userId;
        user.isOnline = false;
        user.lastActive = new Date().toISOString();
        break;
      }
    }

    if (disconnectedUserId) {
      console.log(`User disconnected: ${disconnectedUserId}`);
      
      // Broadcast user offline status
      io.emit("user_offline", { id: disconnectedUserId });
      
      // Check all sessions for this user and update them
      for (const [sessionId, session] of sessions.entries()) {
        const playerIndex = session.currentPlayers.findIndex(p => p.id === disconnectedUserId);
        if (playerIndex !== -1) {
          // Update player status in session
          session.currentPlayers[playerIndex].isOnline = false;
          sessions.set(sessionId, session);
          
          // Broadcast session update
          broadcastSessionUpdate(sessionId);
        }
      }
    } else {
      console.log(`Unknown user disconnected: ${socket.id}`);
    }
  });

  // Store active sessions and users
  const sessions = new Map();
  const users = new Map();

  // Helper function to broadcast session updates to all players in a session
  const broadcastSessionUpdate = (sessionId) => {
    const session = sessions.get(sessionId);
    if (session) {
      io.to(sessionId).emit('session_updated', session);
      console.log(`Session update broadcast to all players in session: ${session.code}`);
    }
  };

  // Helper function to broadcast global session list updates
  const broadcastSessionsList = () => {
    const publicSessions = Array.from(sessions.values())
      .filter(session => session.privacy === 'public')
      .map(session => ({
        id: session.id,
        code: session.code,
        hostName: session.hostName,
        activityType: session.activityType,
        playerCount: session.currentPlayers.length,
        maxPlayers: session.maxPlayers,
      }));
    
    io.emit('sessions_list', publicSessions);
    console.log(`Sessions list broadcast to all connected users`);
  };

  // Helper function to generate a session code
  function generateSessionCode() {
    const prefix = "NS";
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
    let code = prefix + "-";
    
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  // Start the server
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Nexus Syndicate Multiplayer Server running on port ${PORT}`);
  });
});
