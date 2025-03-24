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
      },
      messages: []
    };

    // Store the session
    sessions.set(sessionId, newSession);

    // Join the session room
    socket.join(sessionId);

    console.log(`Session created: ${sessionCode} by ${sessionData.hostName}`);

    // Notify the creator
    socket.emit("session_created", newSession);

    // Broadcast to all users that a new session is available
    if (newSession.privacy === "public") {
      broadcastSessionsList();
    }
  });

  // Join an existing session
  socket.on("join_session", (data) => {
    const { sessionCode, player } = data;

    // Find session by code
    const sessionEntry = Array.from(sessions.entries()).find(
      ([_, session]) => session.code === sessionCode
    );

    if (!sessionEntry) {
      socket.emit("error", {
        message: `Session with code ${sessionCode} not found`,
      });
      return;
    }

    const [sessionId, session] = sessionEntry;

    // Check if session is full
    if (session.currentPlayers.length >= session.maxPlayers) {
      socket.emit("error", { message: "Session is full" });
      return;
    }

    // Check if player is already in the session
    const existingPlayerIndex = session.currentPlayers.findIndex(
      (p) => p.id === player?.id
    );
    if (existingPlayerIndex === -1 && player) {
      // Add player to session
      session.currentPlayers.push({
        ...player,
        role: "Member",
      });
    }

    // Join the session room
    socket.join(sessionId);

    console.log(`Player joined session: ${sessionCode}`);

    // Update the session
    sessions.set(sessionId, session);

    // Notify the player
    socket.emit("session_joined", session);

    // Notify other players in the session
    socket.to(sessionId).emit("player_joined", {
      sessionId,
      player: player || {
        id: socket.id,
        username: "Anonymous Player",
        faction: "Netrunners",
        role: "Member",
      },
    });

    // Broadcast updated session information to all players in the session
    broadcastSessionUpdate(sessionId);

    // Broadcast updated session list
    broadcastSessionsList();
  });

  // Leave a session
  socket.on("leave_session", (data) => {
    const { sessionId, playerId } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Remove player from session
    session.currentPlayers = session.currentPlayers.filter(
      (p) => p.id !== playerId
    );

    // Leave the session room
    socket.leave(sessionId);

    console.log(`Player left session: ${session.code}`);

    // If session is empty, remove it
    if (session.currentPlayers.length === 0) {
      sessions.delete(sessionId);
      io.emit("session_closed", { sessionId });
      console.log(`Session closed: ${session.code}`);
      
      // Broadcast updated session list
      broadcastSessionsList();
    } else {
      // If host left, assign a new host
      if (playerId === session.hostId && session.currentPlayers.length > 0) {
        const newHost = session.currentPlayers[0];
        session.hostId = newHost.id;
        session.hostName = newHost.username;
        newHost.role = "Host";

        // Notify all players in the session about host change
        io.to(sessionId).emit("host_changed", {
          sessionId,
          hostId: newHost.id,
          hostName: newHost.username,
        });
      }

      // Update the session
      sessions.set(sessionId, session);

      // Notify all players in the session
      io.to(sessionId).emit("player_left", {
        sessionId,
        playerId,
      });

      // Notify the player who left
      socket.emit("session_left", {
        sessionId,
        playerId,
      });
      
      // Broadcast updated session list and session update
      broadcastSessionsList();
      broadcastSessionUpdate(sessionId);
    }
  });

  // Send a chat message
  socket.on("send_message", (messageData) => {
    const { sessionId, message } = messageData;
    const session = sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Add message ID and timestamp
    const newMessage = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    // Store message in session
    if (!session.messages) {
      session.messages = [];
    }
    session.messages.push(newMessage);
    
    // Limit message history to last 100 messages
    if (session.messages.length > 100) {
      session.messages = session.messages.slice(-100);
    }

    // Update the session
    sessions.set(sessionId, session);

    // Broadcast message to all players in the session
    io.to(sessionId).emit("message_received", newMessage);
  });

  // Start a mission
  socket.on("start_mission", (data) => {
    const { sessionId, missionId } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Create a mock mission for now
    const mission = {
      id: missionId,
      name: "Mission " + missionId,
      description: "A cooperative mission for the syndicate",
      difficulty: "medium",
      rewards: {
        experience: 500,
        credits: 1500,
        resources: {
          dataShards: 75,
          syntheticAlloys: 30,
          quantumCores: 10,
        },
      },
      requirements: {
        minPlayers: 2,
        recommendedPlayers: 4,
      },
      objectives: [
        {
          id: "obj1",
          description: "Infiltrate the target location",
          completed: false,
        },
        {
          id: "obj2",
          description: "Hack the mainframe",
          completed: false,
        },
        {
          id: "obj3",
          description: "Extract the data",
          completed: false,
        },
      ],
      status: "in_progress",
      progress: 0,
      startedAt: Date.now(),
    };

    // Add mission to session
    session.currentMission = mission;

    // Update the session
    sessions.set(sessionId, session);

    // Broadcast mission started to all players in the session
    io.to(sessionId).emit("mission_started", mission);
    
    // Broadcast session update
    broadcastSessionUpdate(sessionId);

    // Simulate mission progress (for demo purposes)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      
      if (progress <= 100) {
        // Update mission progress
        session.currentMission.progress = progress;
        
        // Update objective completion
        if (progress >= 30 && !session.currentMission.objectives[0].completed) {
          session.currentMission.objectives[0].completed = true;
        }
        if (progress >= 60 && !session.currentMission.objectives[1].completed) {
          session.currentMission.objectives[1].completed = true;
        }
        if (progress >= 90 && !session.currentMission.objectives[2].completed) {
          session.currentMission.objectives[2].completed = true;
        }
        
        // Update the session
        sessions.set(sessionId, session);
        
        // Broadcast progress update
        io.to(sessionId).emit("mission_progress", {
          missionId,
          progress,
          objectives: session.currentMission.objectives
        });
        
        // Broadcast session update
        broadcastSessionUpdate(sessionId);
        
        if (progress === 100) {
          clearInterval(progressInterval);
          
          // Complete the mission
          session.currentMission.status = "completed";
          session.currentMission.completedAt = Date.now();
          
          // Update the session
          sessions.set(sessionId, session);
          
          // Broadcast mission completed
          io.to(sessionId).emit("mission_completed", {
            missionId,
            rewards: session.currentMission.rewards
          });
          
          // Broadcast session update
          broadcastSessionUpdate(sessionId);
        }
      } else {
        clearInterval(progressInterval);
      }
    }, 5000); // Update every 5 seconds
  });

  // Update mission progress
  socket.on("update_mission_progress", (data) => {
    const { sessionId, missionId, progress, objectiveId } = data;
    const session = sessions.get(sessionId);

    if (!session || !session.currentMission || session.currentMission.id !== missionId) {
      return;
    }

    // Update mission progress
    session.currentMission.progress = progress;

    // Update objective if provided
    if (objectiveId) {
      const objective = session.currentMission.objectives.find(obj => obj.id === objectiveId);
      if (objective) {
        objective.completed = true;
      }
    }

    // Update the session
    sessions.set(sessionId, session);

    // Broadcast progress update
    io.to(sessionId).emit("mission_progress", {
      missionId,
      progress,
      objectives: session.currentMission.objectives
    });
    
    // Broadcast session update
    broadcastSessionUpdate(sessionId);
  });

  // Contribute resources
  socket.on("contribute_resources", (data) => {
    const { sessionId, playerId, playerName, faction, resources } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Initialize resource pool if not exists
    if (!session.resourcePool) {
      session.resourcePool = {
        resources: {},
        contributors: []
      };
    }

    // Update resource pool
    Object.entries(resources).forEach(([resourceType, amount]) => {
      if (!session.resourcePool.resources[resourceType]) {
        session.resourcePool.resources[resourceType] = 0;
      }
      session.resourcePool.resources[resourceType] += amount;
    });

    // Update contributor
    const contributorIndex = session.resourcePool.contributors.findIndex(c => c.id === playerId);
    if (contributorIndex === -1) {
      // Add new contributor
      session.resourcePool.contributors.push({
        id: playerId,
        username: playerName,
        faction,
        contributions: { ...resources }
      });
    } else {
      // Update existing contributor
      const contributor = session.resourcePool.contributors[contributorIndex];
      Object.entries(resources).forEach(([resourceType, amount]) => {
        if (!contributor.contributions[resourceType]) {
          contributor.contributions[resourceType] = 0;
        }
        contributor.contributions[resourceType] += amount;
      });
    }

    // Update the session
    sessions.set(sessionId, session);

    // Broadcast resource pool update
    io.to(sessionId).emit("resource_pool_updated", {
      sessionId,
      resourcePool: session.resourcePool
    });
    
    // Broadcast session update
    broadcastSessionUpdate(sessionId);
  });

  // Request session data sync
  socket.on("request_session_sync", (data) => {
    const { sessionId } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      socket.emit("error", { message: "Session not found" });
      return;
    }

    // Send the latest session data to the requesting client
    socket.emit("session_sync", session);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Find user by socket ID
    const userEntry = Array.from(users.entries()).find(
      ([_, user]) => user.socketId === socket.id
    );

    if (userEntry) {
      const [userId, user] = userEntry;

      // Update user status
      user.isOnline = false;
      user.lastActive = new Date().toISOString();
      users.set(userId, user);

      // Check if user is in any sessions
      for (const [sessionId, session] of sessions.entries()) {
        const playerIndex = session.currentPlayers.findIndex(
          (p) => p.id === userId
        );

        if (playerIndex !== -1) {
          // Remove player from session
          session.currentPlayers.splice(playerIndex, 1);

          // If session is empty, remove it
          if (session.currentPlayers.length === 0) {
            sessions.delete(sessionId);
            io.emit("session_closed", { sessionId });
            console.log(`Session closed: ${session.code}`);
          } else {
            // If host left, assign a new host
            if (userId === session.hostId) {
              const newHost = session.currentPlayers[0];
              session.hostId = newHost.id;
              session.hostName = newHost.username;
              newHost.role = "Host";

              // Notify all players in the session about host change
              io.to(sessionId).emit("host_changed", {
                sessionId,
                hostId: newHost.id,
                hostName: newHost.username,
              });
            }

            // Update the session
            sessions.set(sessionId, session);

            // Notify all players in the session
            io.to(sessionId).emit("player_left", {
              sessionId,
              playerId: userId,
            });
          }
          
          // Broadcast updated session list and session update
          broadcastSessionsList();
          if (sessions.has(sessionId)) {
            broadcastSessionUpdate(sessionId);
          }
        }
      }
    }
  });
});

// Helper function to generate a session code
function generateSessionCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
  let result = "NS-";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Nexus Syndicate Multiplayer Server running on port ${PORT}`);
});
