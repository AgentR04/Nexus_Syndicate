import React, { useEffect, useState } from "react";
import AllianceSystem from "../components/multiplayer/AllianceSystem";
import CooperativeMissions from "../components/multiplayer/CooperativeMissions";
import ResourcePooling from "../components/multiplayer/ResourcePooling";
import SyndicateLeaderboards from "../components/multiplayer/SyndicateLeaderboards";
// import MultiplayerChat from "../components/multiplayer/MultiplayerChat";
import multiplayerService, { 
  Session, 
  InviteData, 
  MessageData,
  Mission
} from "../services/multiplayerService";
import { useGame } from "../context/GameContext";

interface Friend {
  id: string;
  username: string;
  walletAddress: string;
  faction: string;
  isOnline: boolean;
  lastActive: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: number;
  autoClose?: boolean;
}

const Multiplayer: React.FC = () => {
  // Game context
  const { currentPlayer, addNotification: addGameNotification } = useGame();
  const [activeTab, setActiveTab] = useState<
    "missions" | "leaderboards" | "resources" | "alliances"
  >("missions");

  // Session management state
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionCode, setSessionCode] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [inviteSent, setInviteSent] = useState<{ [key: string]: boolean }>({});

  // Form state for creating a session
  const [sessionForm, setSessionForm] = useState({
    activityType: "mission" as "mission" | "alliance" | "resource" | "custom",
    privacy: "friends" as "public" | "friends" | "private",
    maxPlayers: 4,
  });

  // New state for multiplayer functionality
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [pendingInvites, setPendingInvites] = useState<InviteData[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [joiningSession, setJoiningSession] = useState(false);

  // Initialize multiplayer connection
  useEffect(() => {
    if (currentPlayer && currentPlayer.id && !isConnected && !isConnecting) {
      connectToMultiplayer();
    }
  }, [currentPlayer]);

  // Connect to multiplayer server
  const connectToMultiplayer = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Use player data to connect
      const connected = await multiplayerService.connect({
        id: currentPlayer?.id || "guest-" + Date.now(),
        username: currentPlayer?.username || "Guest",
        walletAddress: currentPlayer?.walletAddress || ""
      });

      if (connected) {
        setIsConnected(true);
        addGameNotification("success", "Connected to multiplayer server");

        // Load available sessions and missions
        const mockSessions = multiplayerService.getMockSessions();
        setAvailableSessions(mockSessions);

        const mockMissions = multiplayerService.getMockMissions();
        setAvailableMissions(mockMissions);

        // Check if in demo mode and show notification
        if (multiplayerService.isDemoMode()) {
          addGameNotification(
            "info",
            "Running in demo mode. Multiplayer features are simulated.",
            true,
            10000
          );
        }
      }
    } catch (error) {
      console.error("Failed to connect to multiplayer server:", error);
      setConnectionError(
        error instanceof Error ? error.message : "Unknown error"
      );
      addGameNotification("error", "Failed to connect to multiplayer server");
    } finally {
      setIsConnecting(false);
    }
  };

  // Setup event listeners for multiplayer events
  useEffect(() => {
    // Session events
    const sessionCreatedHandler = (session: Session) => {
      console.log("Session created event received:", session);
      setActiveSession(session);
      setSessionCode(session.code);
      addGameNotification("success", `Session created: ${session.code}`);
    };
    
    const sessionJoinedHandler = (session: Session) => {
      console.log("Session joined event received:", session);
      setActiveSession(session);
      addGameNotification("success", `Joined session: ${session.code}`);
    };
    
    const sessionLeftHandler = (data: { sessionId: string; playerId: string }) => {
      console.log("Session left event received:", data);
      if (activeSession && activeSession.id === data.sessionId) {
        if (data.playerId === currentPlayer?.id) {
          setActiveSession(null);
          setSessionCode("");
          addGameNotification("info", "You left the session");
        } else {
          // Update the active session to reflect the player leaving
          const updatedSession = { ...activeSession };
          updatedSession.currentPlayers = updatedSession.currentPlayers.filter(
            (player) => player.id !== data.playerId
          );
          setActiveSession(updatedSession);

          const playerName =
            activeSession.currentPlayers.find((p) => p.id === data.playerId)
              ?.username || "A player";
          addGameNotification("info", `${playerName} left the session`);
        }
      }
    };
    
    const sessionUpdatedHandler = (session: Session) => {
      console.log("Session updated event received:", session);
      if (activeSession && activeSession.id === session.id) {
        setActiveSession(session);
      }
    };

    const handleSessionSynced = (session: Session) => {
      console.log('Session synced:', session);
      setActiveSession(session);
    };

    multiplayerService.on("session_created", sessionCreatedHandler);
    multiplayerService.on("session_joined", sessionJoinedHandler);
    multiplayerService.on("session_left", sessionLeftHandler);
    multiplayerService.on("session_updated", sessionUpdatedHandler);
    multiplayerService.on("session_synced", handleSessionSynced);

    // Invite events
    multiplayerService.on("invite_received", handleInviteReceived);
    multiplayerService.on("invite_accepted", handleInviteAccepted);
    multiplayerService.on("invite_declined", handleInviteDeclined);

    // Chat events
    multiplayerService.on("message_received", handleMessageReceived);

    // Mission events
    multiplayerService.on("mission_started", handleMissionStarted);
    multiplayerService.on("mission_progress", handleMissionProgress);
    multiplayerService.on("mission_completed", handleMissionCompleted);
    multiplayerService.on("mission_failed", handleMissionFailed);
    
    return () => {
      // Remove event listeners
      multiplayerService.off("session_created", sessionCreatedHandler);
      multiplayerService.off("session_joined", sessionJoinedHandler);
      multiplayerService.off("session_left", sessionLeftHandler);
      multiplayerService.off("session_updated", sessionUpdatedHandler);
      multiplayerService.off("session_synced", handleSessionSynced);

      multiplayerService.off("invite_received", handleInviteReceived);
      multiplayerService.off("invite_accepted", handleInviteAccepted);
      multiplayerService.off("invite_declined", handleInviteDeclined);

      multiplayerService.off("message_received", handleMessageReceived);

      multiplayerService.off("mission_started", handleMissionStarted);
      multiplayerService.off("mission_progress", handleMissionProgress);
      multiplayerService.off("mission_completed", handleMissionCompleted);
      multiplayerService.off("mission_failed", handleMissionFailed);
    };
  }, [isConnected, activeSession, currentPlayer]);

  // Set up periodic session sync to ensure data consistency
  useEffect(() => {
    if (activeSession) {
      // Request initial sync when joining a session
      multiplayerService.requestSessionSync();
      
      // Set up periodic sync every 10 seconds
      const syncInterval = setInterval(() => {
        multiplayerService.requestSessionSync();
      }, 10000);
      
      return () => {
        clearInterval(syncInterval);
      };
    }
  }, [activeSession]);

  // Disconnect from multiplayer server when component unmounts
  useEffect(() => {
    return () => {
      if (isConnected) {
        multiplayerService.disconnect();
      }
    };
  }, [isConnected]);

  // Function to add a notification
  const addNotification = (type: "info" | "success" | "warning" | "error", message: string, autoClose: boolean = true, timeout: number = 5000) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
      autoClose,
    };
    setNotifications((prev) => [...prev, newNotification]);
    
    if (autoClose) {
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== newNotification.id)
        );
      }, timeout);
    }
  };

  const handleCreateSession = () => {
    if (!currentPlayer || !isConnected) {
      addGameNotification("error", "You must be connected to create a session");
      return;
    }

    // Create session data
    const sessionData: Partial<Session> = {
      hostId: currentPlayer.id || "player1",
      hostName: currentPlayer.username || "Player",
      activityType: sessionForm.activityType,
      privacy: sessionForm.privacy,
      maxPlayers: sessionForm.maxPlayers,
      currentPlayers: [
        {
          id: currentPlayer.id || "player1",
          username: currentPlayer.username || "Player",
          faction: currentPlayer.faction || "Netrunners",
          role: "Host",
          walletAddress: currentPlayer.walletAddress || "",
        },
      ],
    };

    console.log("Creating session with data:", sessionData);
    
    // Use multiplayerService to create session
    multiplayerService.createSession(sessionData);
    setShowCreateModal(false);
    addGameNotification("info", "Creating session...");
  };

  const handleInviteReceived = (invite: InviteData) => {
    setPendingInvites((prev) => [...prev, invite]);
    addGameNotification("info", `Invite received from ${invite.fromName}`, false);
  };

  const handleInviteAccepted = (invite: InviteData) => {
    // Remove from pending invites
    setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));

    // If this is an invite we sent, show notification
    if (invite.fromId === currentPlayer?.id) {
      addGameNotification("success", `${invite.fromName} accepted your invite`);
    }
  };

  const handleInviteDeclined = (invite: InviteData) => {
    // Remove from pending invites
    setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));

    // If this is an invite we sent, show notification
    if (invite.fromId === currentPlayer?.id) {
      addGameNotification("info", `${invite.fromName} declined your invite`);
    }
  };

  const handleMessageReceived = (message: MessageData) => {
    if (activeSession && activeSession.id === message.sessionId) {
      const newChatMessage: ChatMessage = {
        id: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        timestamp: message.timestamp,
      };

      setChatMessages((prev) => [...prev, newChatMessage]);
    }
  };

  const handleMissionStarted = (mission: Mission) => {
    addGameNotification("info", `Mission started: ${mission.name}`);
  };

  const handleMissionProgress = (data: {
    missionId: string;
    progress: number;
  }) => {
    // Update mission progress in UI
  };

  const handleMissionCompleted = (mission: Mission) => {
    addGameNotification("success", `Mission completed: ${mission.name}`);
  };

  const handleMissionFailed = (mission: Mission) => {
    addGameNotification("error", `Mission failed: ${mission.name}`);
  };

  // Mock data for friends
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    const mockFriends: Friend[] = [
      {
        id: "friend1",
        username: "CyberNinja",
        walletAddress: "0x1234...5678",
        faction: "Netrunners",
        isOnline: true,
        lastActive: "Now",
      },
      {
        id: "friend2",
        username: "QuantumHacker",
        walletAddress: "0x8765...4321",
        faction: "Quantum Collective",
        isOnline: true,
        lastActive: "Now",
      },
      {
        id: "friend3",
        username: "ChromeHunter",
        walletAddress: "0x2468...1357",
        faction: "Chrome Jackals",
        isOnline: false,
        lastActive: "2 hours ago",
      },
      {
        id: "friend4",
        username: "SynthMaster",
        walletAddress: "0x1357...2468",
        faction: "Synth Lords",
        isOnline: false,
        lastActive: "1 day ago",
      },
    ];

    setFriends(mockFriends);
  }, []);

  const generateSessionCode = (): string => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
    let result = "NS-";
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const joinSession = (sessionCode: string) => {
    if (!isConnected) {
      addGameNotification(
        "error",
        "You must be connected to join a session",
        true
      );
      return;
    }

    console.log("Joining session with code:", sessionCode);
    setJoiningSession(true);
    multiplayerService.joinSession(sessionCode);
    
    // In demo mode, show a notification that we're creating a mock session
    if (multiplayerService.isDemoMode()) {
      addGameNotification(
        "info",
        `Creating a demo session with code: ${sessionCode}`,
        true,
        8000
      );
    }
  };

  const handleJoinSession = () => {
    if (!currentPlayer || !isConnected) {
      addGameNotification("error", "You must be connected to join a session");
      return;
    }

    if (!joinCode) {
      addGameNotification("error", "Please enter a session code");
      return;
    }

    // Use multiplayerService to join session
    joinSession(joinCode);
    setShowJoinModal(false);
    addGameNotification("info", "Joining session...");
  };

  const handleLeaveSession = () => {
    if (!activeSession || !isConnected) {
      return;
    }

    // Use multiplayerService to leave session
    multiplayerService.leaveSession(activeSession.id);
    addGameNotification("info", "Leaving session...");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        addGameNotification("success", "Session code copied to clipboard");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        addGameNotification("error", "Failed to copy session code");
      }
    );
  };

  const sendInvite = (friendId: string) => {
    if (!activeSession || !isConnected) {
      addGameNotification("error", "You must be in a session to send invites");
      return;
    }

    // Use multiplayerService to send invite
    multiplayerService.sendInvite(activeSession.id, friendId);

    // Update UI to show invite sent
    setInviteSent((prev) => ({
      ...prev,
      [friendId]: true,
    }));

    addGameNotification("info", "Invitation sent");
  };

  const acceptInvite = (inviteId: string) => {
    if (!isConnected) {
      addGameNotification("error", "You must be connected to accept invites");
      return;
    }

    // Use multiplayerService to accept invite
    multiplayerService.acceptInvite(inviteId);

    // Remove from pending invites
    setPendingInvites((prev) =>
      prev.filter((invite) => invite.id !== inviteId)
    );

    addGameNotification("info", "Accepting invitation...");
  };

  const declineInvite = (inviteId: string) => {
    if (!isConnected) {
      addGameNotification("error", "You must be connected to decline invites");
      return;
    }

    // Use multiplayerService to decline invite
    multiplayerService.declineInvite(inviteId);

    // Remove from pending invites
    setPendingInvites((prev) =>
      prev.filter((invite) => invite.id !== inviteId)
    );

    addGameNotification("info", "Invitation declined");
  };

  const sendChatMessage = () => {
    if (!activeSession || !isConnected || !newMessage.trim()) {
      return;
    }

    // Use multiplayerService to send message
    multiplayerService.sendMessage(activeSession.id, newMessage.trim());

    // Clear input field
    setNewMessage("");
  };

  const startMission = (missionId: string) => {
    if (!activeSession || !isConnected) {
      addGameNotification("error", "You must be in a session to start a mission");
      return;
    }

    multiplayerService.startMission(activeSession.id, missionId);
    addGameNotification("info", "Starting mission...");
  };

  const contributeResources = (resources: Record<string, number>) => {
    if (!activeSession || !isConnected) {
      addGameNotification(
        "error",
        "You must be in a session to contribute resources"
      );
      return;
    }

    // Use multiplayerService to contribute resources
    multiplayerService.contributeResources(activeSession.id, resources);

    addGameNotification("info", "Contributing resources...");
  };

  const getFactionColor = (faction: string): string => {
    switch (faction) {
      case "Netrunners":
        return "text-neon-blue";
      case "Synth Lords":
        return "text-neon-purple";
      case "Chrome Jackals":
        return "text-neon-pink";
      case "Quantum Collective":
        return "text-neon-yellow";
      default:
        return "text-neon-green";
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case "mission":
        return "🎯";
      case "alliance":
        return "🤝";
      case "resource":
        return "💎";
      case "custom":
        return "🎮";
      default:
        return "🎮";
    }
  };

  return (
    <div className="multiplayer-container">
      <div className="page-header">
        <h1>Multiplayer</h1>
        {isConnected ? (
          <span className="connection-status connected">
            <span className="status-dot"></span> Connected
            {multiplayerService.isDemoMode() && (
              <span className="demo-mode-badge">DEMO MODE</span>
            )}
          </span>
        ) : isConnecting ? (
          <span className="connection-status connecting">
            <span className="status-dot"></span> Connecting...
          </span>
        ) : (
          <span className="connection-status disconnected">
            <span className="status-dot"></span> Disconnected
            {connectionError && (
              <span className="error-message"> - {connectionError}</span>
            )}
            <button
              className="reconnect-button"
              onClick={connectToMultiplayer}
            >
              Reconnect
            </button>
          </span>
        )}
      </div>

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification notification-${notification.type}`}
          >
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={() =>
                setNotifications((prev) =>
                  prev.filter((n) => n.id !== notification.id)
                )
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="pending-invites-container">
          <h3>Pending Invites</h3>
          <div className="invites-list">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="invite-item">
                <div className="invite-info">
                  <span className="invite-from">{invite.fromName}</span>
                  <span className="invite-session">
                    Session: {invite.sessionCode}
                  </span>
                </div>
                <div className="invite-actions">
                  <button
                    className="accept-invite-button"
                    onClick={() => acceptInvite(invite.id)}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-invite-button"
                    onClick={() => declineInvite(invite.id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Session Display */}
      {activeSession ? (
        <div className="active-session">
          <div className="session-header">
            <h2>Active Session: {activeSession.code}</h2>
            <div className="session-actions">
              <button
                className="copy-code-button"
                onClick={() => copyToClipboard(activeSession.code)}
              >
                {copySuccess ? "Copied!" : "Copy Code"}
              </button>
              <button
                className="leave-session-button"
                onClick={handleLeaveSession}
              >
                Leave Session
              </button>
            </div>
          </div>

          <div className="session-details">
            <div className="session-info">
              <p>
                <strong>Host:</strong> {activeSession.hostName}
              </p>
              <p>
                <strong>Activity:</strong> {activeSession.activityType}
              </p>
              <p>
                <strong>Players:</strong> {activeSession.currentPlayers.length}/
                {activeSession.maxPlayers}
              </p>
            </div>

            <div className="session-players">
              <h3>Players</h3>
              <ul className="players-list">
                {activeSession.currentPlayers.map((player) => (
                  <li key={player.id} className="player-item">
                    <span className="player-name">{player.username}</span>
                    <span
                      className="player-faction"
                      style={{ color: getFactionColor(player.faction) }}
                    >
                      {player.faction}
                    </span>
                    {player.role && (
                      <span className="player-role">{player.role}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="session-content">
            <div className="tabs">
              <button
                className={`tab-button ${
                  activeTab === "missions" ? "active" : ""
                }`}
                onClick={() => setActiveTab("missions")}
              >
                Missions
              </button>
              <button
                className={`tab-button ${
                  activeTab === "leaderboards" ? "active" : ""
                }`}
                onClick={() => setActiveTab("leaderboards")}
              >
                Leaderboards
              </button>
              <button
                className={`tab-button ${
                  activeTab === "resources" ? "active" : ""
                }`}
                onClick={() => setActiveTab("resources")}
              >
                Resources
              </button>
              <button
                className={`tab-button ${
                  activeTab === "alliances" ? "active" : ""
                }`}
                onClick={() => setActiveTab("alliances")}
              >
                Alliances
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "missions" && (
                <CooperativeMissions
                  sessionId={activeSession?.id || ''}
                  isHost={activeSession?.hostId === currentPlayer?.id}
                />
              )}
              {activeTab === "leaderboards" && <SyndicateLeaderboards />}
              {activeTab === "resources" && (
                <ResourcePooling 
                  onContributeResources={contributeResources}
                />
              )}
              {activeTab === "alliances" && <AllianceSystem />}
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <h3>Session Chat</h3>
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <p className="no-messages">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-message ${
                      message.senderId === currentPlayer?.id
                        ? "own-message"
                        : ""
                    }`}
                  >
                    <div className="message-header">
                      <span className="sender-name">{message.senderName}</span>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
              />
              <button
                className="send-button"
                onClick={sendChatMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-active-session">
          <h2>No Active Session</h2>
          <p>
            Create a new session or join an existing one to play with friends.
          </p>

          <div className="session-buttons">
            <button
              className="create-session-button"
              onClick={() => setShowCreateModal(true)}
              disabled={!isConnected}
            >
              Create Session
            </button>
            <button
              className="join-session-button"
              onClick={() => setShowJoinModal(true)}
              disabled={!isConnected}
            >
              Join Session
            </button>
          </div>

          {/* Available Public Sessions */}
          {availableSessions.length > 0 && (
            <div className="available-sessions">
              <h3>Available Sessions</h3>
              <div className="sessions-list">
                {availableSessions
                  .filter((session) => session.privacy === "public")
                  .map((session) => (
                    <div key={session.id} className="session-item">
                      <div className="session-item-info">
                        <span className="session-code">{session.code}</span>
                        <span className="session-host">
                          Host: {session.hostName}
                        </span>
                        <span className="session-activity">
                          Activity: {session.activityType}
                        </span>
                        <span className="session-players">
                          Players: {session.currentPlayers.length}/
                          {session.maxPlayers}
                        </span>
                      </div>
                      <button
                        className="join-button"
                        onClick={() => {
                          setJoinCode(session.code);
                          handleJoinSession();
                        }}
                        disabled={
                          !isConnected ||
                          session.currentPlayers.length >= session.maxPlayers
                        }
                      >
                        Join
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="friends-section">
            <h3>Friends</h3>
            <div className="friends-list">
              {friends.length === 0 ? (
                <p>No friends found. Add friends to play together!</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="friend-item">
                    <div className="friend-info">
                      <span
                        className={`status-indicator ${
                          friend.isOnline ? "online" : "offline"
                        }`}
                      ></span>
                      <span className="friend-name">{friend.username}</span>
                      <span
                        className="friend-faction"
                        style={{ color: getFactionColor(friend.faction) }}
                      >
                        {friend.faction}
                      </span>
                      {!friend.isOnline && (
                        <span className="last-active">
                          Last active: {friend.lastActive}
                        </span>
                      )}
                    </div>
                    <div className="friend-actions">
                      {activeSession && (
                        <button
                          className={`invite-button ${
                            inviteSent[friend.id] ? "invited" : ""
                          }`}
                          onClick={() => sendInvite(friend.id)}
                          disabled={!friend.isOnline || inviteSent[friend.id]}
                        >
                          {inviteSent[friend.id] ? "Invited" : "Invite"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug section - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h3>Debug Panel</h3>
          <button
            onClick={() => {
              const debugInfo = multiplayerService.getDebugInfo();
              console.log("Multiplayer Service Debug Info:", debugInfo);
              addGameNotification("info", "Debug info logged to console");
              
              // Force a session creation for testing
              if (debugInfo.demoMode && !debugInfo.activeSession) {
                console.log("Forcing session creation in demo mode");
                const testSessionData: Partial<Session> = {
                  hostId: "debug-user",
                  hostName: "Debug User",
                  activityType: "mission" as "mission",
                  privacy: "public" as "public",
                  maxPlayers: 4,
                  currentPlayers: [
                    {
                      id: "debug-user",
                      username: "Debug User",
                      faction: "Netrunners",
                      role: "Host",
                      walletAddress: "",
                    },
                  ],
                };
                multiplayerService.createSession(testSessionData);
              }
            }}
          >
            Debug Multiplayer
          </button>
          
          {activeSession ? (
            <div className="active-session-debug">
              <p>Active Session: {activeSession.code}</p>
              <p>Players: {activeSession.currentPlayers.length}</p>
            </div>
          ) : (
            <p>No active session</p>
          )}
        </div>
      )}
      
      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Session</h2>
            <div className="form-group">
              <label>Activity Type:</label>
              <select
                value={sessionForm.activityType}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    activityType: e.target.value as
                      | "mission"
                      | "alliance"
                      | "resource"
                      | "custom",
                  }))
                }
              >
                <option value="mission">Cooperative Mission</option>
                <option value="alliance">Alliance Formation</option>
                <option value="resource">Resource Pooling</option>
                <option value="custom">Custom Activity</option>
              </select>
            </div>

            <div className="form-group">
              <label>Privacy:</label>
              <select
                value={sessionForm.privacy}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    privacy: e.target.value as "public" | "friends" | "private",
                  }))
                }
              >
                <option value="public">Public (Anyone can join)</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private (Invite only)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Max Players:</label>
              <select
                value={sessionForm.maxPlayers}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    maxPlayers: parseInt(e.target.value),
                  }))
                }
              >
                <option value="2">2 Players</option>
                <option value="4">4 Players</option>
                <option value="6">6 Players</option>
                <option value="8">8 Players</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button className="create-button" onClick={handleCreateSession}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Join Session</h2>
            <div className="form-group">
              <label>Session Code:</label>
              <input
                type="text"
                placeholder="Enter session code (e.g., NS-ABC12)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>
              <button
                className="join-button"
                onClick={handleJoinSession}
                disabled={!joinCode}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        .multiplayer-container {
          padding: 20px;
          color: #e0e0e0;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .connection-status {
          display: flex;
          align-items: center;
          font-size: 14px;
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .connected {
          background-color: rgba(0, 255, 0, 0.1);
        }
        
        .connected .status-dot {
          background-color: #00ff00;
          box-shadow: 0 0 5px #00ff00;
        }
        
        .connecting {
          background-color: rgba(255, 165, 0, 0.1);
        }
        
        .connecting .status-dot {
          background-color: #ffa500;
          box-shadow: 0 0 5px #ffa500;
          animation: pulse 1s infinite;
        }
        
        .disconnected {
          background-color: rgba(255, 0, 0, 0.1);
        }
        
        .disconnected .status-dot {
          background-color: #ff0000;
          box-shadow: 0 0 5px #ff0000;
        }
        
        .reconnect-button {
          margin-left: 10px;
          padding: 2px 8px;
          background-color: #2a2a2a;
          border: 1px solid #555;
          color: #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .reconnect-button:hover {
          background-color: #3a3a3a;
        }
        
        .notifications-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 300px;
        }
        
        .notification {
          padding: 10px 15px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideIn 0.3s ease-out;
        }
        
        .notification-info {
          background-color: rgba(0, 120, 255, 0.2);
          border-left: 4px solid #0078ff;
        }
        
        .notification-success {
          background-color: rgba(0, 255, 0, 0.2);
          border-left: 4px solid #00ff00;
        }
        
        .notification-warning {
          background-color: rgba(255, 165, 0, 0.2);
          border-left: 4px solid #ffa500;
        }
        
        .notification-error {
          background-color: rgba(255, 0, 0, 0.2);
          border-left: 4px solid #ff0000;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: #e0e0e0;
          font-size: 18px;
          cursor: pointer;
          margin-left: 10px;
        }
        
        .pending-invites-container {
          background-color: rgba(0, 120, 255, 0.1);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .invites-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .invite-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(42, 42, 42, 0.5);
          padding: 10px;
          border-radius: 4px;
        }
        
        .invite-actions {
          display: flex;
          gap: 10px;
        }
        
        .accept-invite-button {
          background-color: rgba(0, 255, 0, 0.2);
          border: 1px solid #00ff00;
          color: #e0e0e0;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .decline-invite-button {
          background-color: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff0000;
          color: #e0e0e0;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .active-session {
          background-color: rgba(42, 42, 42, 0.5);
          border-radius: 8px;
          padding: 20px;
        }
        
        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .session-actions {
          display: flex;
          gap: 10px;
        }
        
        .copy-code-button, .leave-session-button {
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .copy-code-button {
          background-color: #2a2a2a;
          border: 1px solid #555;
          color: #e0e0e0;
        }
        
        .leave-session-button {
          background-color: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff0000;
          color: #e0e0e0;
        }
        
        .session-details {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
        }
        
        .session-info, .session-players {
          flex: 1;
        }
        
        .players-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .player-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .player-role {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
        }
        
        .tabs {
          display: flex;
          gap: 5px;
          margin-bottom: 15px;
        }
        
        .tab-button {
          padding: 8px 15px;
          background-color: #2a2a2a;
          border: 1px solid #555;
          color: #e0e0e0;
          border-radius: 4px 4px 0 0;
          cursor: pointer;
        }
        
        .tab-button.active {
          background-color: #3a3a3a;
          border-bottom: 1px solid #3a3a3a;
        }
        
        .tab-content {
          background-color: #3a3a3a;
          border-radius: 0 4px 4px 4px;
          padding: 20px;
          min-height: 300px;
        }
        
        .chat-section {
          margin-top: 20px;
        }
        
        .chat-messages {
          height: 250px;
          overflow-y: auto;
          background-color: #2a2a2a;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
        }
        
        .no-messages {
          color: #888;
          text-align: center;
          margin-top: 100px;
        }
        
        .chat-message {
          margin-bottom: 10px;
          padding: 8px 12px;
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.05);
          max-width: 80%;
        }
        
        .own-message {
          margin-left: auto;
          background-color: rgba(0, 120, 255, 0.1);
        }
        
        .message-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .sender-name {
          font-weight: bold;
        }
        
        .message-time {
          color: #888;
        }
        
        .chat-input {
          display: flex;
          gap: 10px;
        }
        
        .chat-input input {
          flex: 1;
          padding: 10px;
          background-color: #2a2a2a;
          border: 1px solid #555;
          color: #e0e0e0;
          border-radius: 4px;
        }
        
        .send-button {
          padding: 10px 20px;
          background-color: #0078ff;
          border: none;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .send-button:disabled {
          background-color: #2a2a2a;
          color: #888;
          cursor: not-allowed;
        }
        
        .no-active-session {
          text-align: center;
          padding: 40px 0;
        }
        
        .session-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 30px 0;
        }
        
        .create-session-button, .join-session-button {
          padding: 12px 25px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }
        
        .create-session-button {
          background-color: #0078ff;
          border: none;
          color: white;
        }
        
        .join-session-button {
          background-color: #2a2a2a;
          border: 1px solid #555;
          color: #e0e0e0;
        }
        
        .create-session-button:disabled, .join-session-button:disabled {
          background-color: #2a2a2a;
          color: #888;
          border: 1px solid #555;
          cursor: not-allowed;
        }
        
        .available-sessions, .friends-section {
          margin-top: 40px;
          text-align: left;
        }
        
        .sessions-list, .friends-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .session-item, .friend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(42, 42, 42, 0.5);
          padding: 15px;
          border-radius: 4px;
        }
        
        .session-item-info, .friend-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .join-button {
          padding: 8px 15px;
          background-color: #0078ff;
          border: none;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .join-button:disabled {
          background-color: #2a2a2a;
          color: #888;
          cursor: not-allowed;
        }
        
        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
        }
        
        .online {
          background-color: #00ff00;
          box-shadow: 0 0 5px #00ff00;
        }
        
        .offline {
          background-color: #888;
        }
        
        .invite-button {
          padding: 5px 10px;
          background-color: #0078ff;
          border: none;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .invite-button.invited {
          background-color: #2a2a2a;
          color: #888;
        }
        
        .invite-button:disabled {
          background-color: #2a2a2a;
          color: #888;
          cursor: not-allowed;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: #2a2a2a;
          border-radius: 8px;
          padding: 25px;
          width: 400px;
          max-width: 90%;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          background-color: #1a1a1a;
          border: 1px solid #555;
          color: #e0e0e0;
          border-radius: 4px;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .cancel-button, .create-button, .join-button {
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .cancel-button {
          background-color: transparent;
          border: 1px solid #555;
          color: #e0e0e0;
        }
        
        .create-button, .join-button {
          background-color: #0078ff;
          border: none;
          color: white;
        }
        
        .demo-mode-badge {
          display: inline-block;
          margin-left: 10px;
          padding: 2px 8px;
          background-color: #ff9800;
          color: #000;
          font-size: 0.8em;
          font-weight: bold;
          border-radius: 4px;
          animation: pulse 2s infinite;
        }
        
        .debug-panel {
          margin-top: 20px;
          padding: 10px;
          background-color: #1e1e1e;
          border: 1px solid #444;
          border-radius: 4px;
        }
        
        .debug-panel button {
          background-color: #ff5722;
          color: white;
          border: none;
          padding: 5px 10px;
          margin: 5px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .debug-panel button:hover {
          background-color: #e64a19;
        }
        
        .active-session-debug {
          margin-top: 10px;
          padding: 5px;
          background-color: #2d2d2d;
          border-radius: 4px;
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        `}
      </style>
    </div>
  );
};

export default Multiplayer;
