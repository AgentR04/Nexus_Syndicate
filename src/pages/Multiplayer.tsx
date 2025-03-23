import React, { useState, useEffect } from 'react';
import SyndicateChat from '../components/multiplayer/SyndicateChat';
import CooperativeMissions from '../components/multiplayer/CooperativeMissions';
import SyndicateLeaderboards from '../components/multiplayer/SyndicateLeaderboards';
import ResourcePooling from '../components/multiplayer/ResourcePooling';
import AllianceSystem from '../components/multiplayer/AllianceSystem';
import { useGame } from '../context/GameContext';

// Session types
interface Session {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  activityType: 'mission' | 'alliance' | 'resource' | 'custom';
  privacy: 'public' | 'friends' | 'private';
  maxPlayers: number;
  currentPlayers: {
    id: string;
    username: string;
    faction: string;
    role?: string;
  }[];
  createdAt: number;
}

interface Friend {
  id: string;
  username: string;
  walletAddress: string;
  faction: string;
  isOnline: boolean;
  lastActive: string;
}

const Multiplayer: React.FC = () => {
  const { currentPlayer } = useGame();
  const [activeTab, setActiveTab] = useState<
    'missions' | 'leaderboards' | 'resources' | 'alliances'
  >('missions');
  
  // Session management state
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [inviteSent, setInviteSent] = useState<{[key: string]: boolean}>({});
  
  // Form state for creating a session
  const [sessionForm, setSessionForm] = useState({
    activityType: 'mission' as 'mission' | 'alliance' | 'resource' | 'custom',
    privacy: 'friends' as 'public' | 'friends' | 'private',
    maxPlayers: 4
  });

  // Mock data for friends
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    const mockFriends: Friend[] = [
      {
        id: 'friend1',
        username: 'CyberNinja',
        walletAddress: '0x1234...5678',
        faction: 'Netrunners',
        isOnline: true,
        lastActive: 'Now'
      },
      {
        id: 'friend2',
        username: 'QuantumHacker',
        walletAddress: '0x8765...4321',
        faction: 'Quantum Collective',
        isOnline: true,
        lastActive: 'Now'
      },
      {
        id: 'friend3',
        username: 'ChromeHunter',
        walletAddress: '0x2468...1357',
        faction: 'Chrome Jackals',
        isOnline: false,
        lastActive: '2 hours ago'
      },
      {
        id: 'friend4',
        username: 'SynthMaster',
        walletAddress: '0x1357...2468',
        faction: 'Synth Lords',
        isOnline: false,
        lastActive: '1 day ago'
      }
    ];
    
    setFriends(mockFriends);
  }, []);

  const generateSessionCode = (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = 'NS-';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleCreateSession = () => {
    if (!currentPlayer) return;
    
    const code = generateSessionCode();
    
    // Create a new session
    const newSession: Session = {
      id: `session-${Date.now()}`,
      code,
      hostId: currentPlayer.id || 'player1',
      hostName: currentPlayer.username || 'Player',
      activityType: sessionForm.activityType,
      privacy: sessionForm.privacy,
      maxPlayers: sessionForm.maxPlayers,
      currentPlayers: [
        {
          id: currentPlayer.id || 'player1',
          username: currentPlayer.username || 'Player',
          faction: currentPlayer.faction || 'Netrunners',
          role: 'Host'
        }
      ],
      createdAt: Date.now()
    };
    
    setActiveSession(newSession);
    setSessionCode(code);
    setShowCreateModal(false);
    
    // In a real implementation, this would send a request to a backend service
    // sessionService.createSession(newSession);
  };

  const handleJoinSession = () => {
    if (!joinCode) return;
    
    // In a real implementation, this would send a request to a backend service
    // sessionService.joinSession(joinCode);
    
    // Mock joining a session
    const mockSession: Session = {
      id: `session-${Date.now()}`,
      code: joinCode,
      hostId: 'friend1',
      hostName: 'CyberNinja',
      activityType: 'mission',
      privacy: 'friends',
      maxPlayers: 4,
      currentPlayers: [
        {
          id: 'friend1',
          username: 'CyberNinja',
          faction: 'Netrunners',
          role: 'Host'
        },
        {
          id: currentPlayer?.id || 'player1',
          username: currentPlayer?.username || 'Player',
          faction: currentPlayer?.faction || 'Netrunners',
          role: 'Member'
        }
      ],
      createdAt: Date.now() - 1000 * 60 * 5 // 5 minutes ago
    };
    
    setActiveSession(mockSession);
    setShowJoinModal(false);
  };

  const handleLeaveSession = () => {
    // In a real implementation, this would send a request to a backend service
    // sessionService.leaveSession(activeSession.id);
    
    setActiveSession(null);
    setSessionCode('');
    setInviteSent({});
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  const sendInvite = (friendId: string) => {
    // In a real implementation, this would send a request to a backend service
    // sessionService.sendInvite(activeSession.id, friendId);
    
    setInviteSent(prev => ({
      ...prev,
      [friendId]: true
    }));
    
    setTimeout(() => {
      setInviteSent(prev => ({
        ...prev,
        [friendId]: false
      }));
    }, 5000);
  };

  const getFactionColor = (faction: string): string => {
    switch (faction) {
      case 'Netrunners':
        return 'text-neon-blue';
      case 'Synth Lords':
        return 'text-neon-purple';
      case 'Chrome Jackals':
        return 'text-neon-pink';
      case 'Quantum Collective':
        return 'text-neon-yellow';
      default:
        return 'text-neon-green';
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'mission':
        return '🎯';
      case 'alliance':
        return '🤝';
      case 'resource':
        return '💎';
      case 'custom':
        return '🎮';
      default:
        return '🎮';
    }
  };

  const renderCreateSessionModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="cyber-panel bg-dark-gray p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-neon-blue font-cyber text-lg">CREATE SESSION</h3>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="text-light-gray hover:text-neon-pink"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-light-gray block mb-1">Activity Type</label>
              <select
                value={sessionForm.activityType}
                onChange={(e) => setSessionForm({
                  ...sessionForm,
                  activityType: e.target.value as 'mission' | 'alliance' | 'resource' | 'custom'
                })}
                className="w-full bg-dark-blue text-light-gray text-sm p-2 rounded outline-none border border-dark-gray"
              >
                <option value="mission">Cooperative Mission</option>
                <option value="alliance">Alliance Activity</option>
                <option value="resource">Resource Gathering</option>
                <option value="custom">Custom Session</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-light-gray block mb-1">Privacy Setting</label>
              <select
                value={sessionForm.privacy}
                onChange={(e) => setSessionForm({
                  ...sessionForm,
                  privacy: e.target.value as 'public' | 'friends' | 'private'
                })}
                className="w-full bg-dark-blue text-light-gray text-sm p-2 rounded outline-none border border-dark-gray"
              >
                <option value="public">Public (Anyone can join)</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private (Invite only)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-light-gray block mb-1">Max Players</label>
              <select
                value={sessionForm.maxPlayers}
                onChange={(e) => setSessionForm({
                  ...sessionForm,
                  maxPlayers: parseInt(e.target.value)
                })}
                className="w-full bg-dark-blue text-light-gray text-sm p-2 rounded outline-none border border-dark-gray"
              >
                <option value="2">2 Players</option>
                <option value="4">4 Players</option>
                <option value="6">6 Players</option>
                <option value="8">8 Players</option>
              </select>
            </div>
            
            <button
              onClick={handleCreateSession}
              className="w-full py-2 rounded font-cyber text-sm bg-neon-blue text-black"
            >
              CREATE SESSION
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderJoinSessionModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="cyber-panel bg-dark-gray p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-neon-blue font-cyber text-lg">JOIN SESSION</h3>
            <button 
              onClick={() => setShowJoinModal(false)}
              className="text-light-gray hover:text-neon-pink"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-light-gray block mb-1">Enter Session Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="NS-XXXXX"
                className="w-full bg-dark-blue text-light-gray text-sm p-2 rounded outline-none border border-dark-gray"
              />
            </div>
            
            <button
              onClick={handleJoinSession}
              disabled={!joinCode}
              className={`w-full py-2 rounded font-cyber text-sm ${
                joinCode
                  ? 'bg-neon-blue text-black'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              JOIN SESSION
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveSession = () => {
    if (!activeSession) return null;
    
    return (
      <div className="cyber-panel bg-dark-gray p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center">
              <span className="mr-2">{getActivityIcon(activeSession.activityType)}</span>
              <h3 className="text-neon-blue font-cyber text-lg">
                {activeSession.activityType.toUpperCase()} SESSION
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Hosted by: {activeSession.hostName} • 
              {activeSession.currentPlayers.length}/{activeSession.maxPlayers} players
            </p>
          </div>
          <button
            onClick={handleLeaveSession}
            className="px-3 py-1 rounded font-cyber text-xs bg-neon-pink text-black"
          >
            LEAVE SESSION
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-dark-blue bg-opacity-40 rounded">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-light-gray mb-1">SESSION CODE:</p>
              <p className="text-xl font-cyber text-neon-green tracking-widest">{activeSession.code}</p>
            </div>
            <button
              onClick={() => copyToClipboard(activeSession.code)}
              className="px-3 py-1 rounded font-cyber text-xs bg-neon-green bg-opacity-20 text-neon-green border border-neon-green"
            >
              {copySuccess ? 'COPIED!' : 'COPY CODE'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Share this code with friends to invite them to your session
          </p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-neon-blue text-sm mb-2">CURRENT PLAYERS</h4>
          <div className="space-y-2">
            {activeSession.currentPlayers.map((player) => (
              <div key={player.id} className="flex justify-between items-center bg-dark-blue bg-opacity-30 p-2 rounded">
                <div className="flex items-center">
                  <span className={`text-sm ${getFactionColor(player.faction)}`}>{player.username}</span>
                  {player.id === currentPlayer?.id && (
                    <span className="ml-1 text-neon-green text-xs">(YOU)</span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">{player.role}</span>
                  <span className={`text-xs ${getFactionColor(player.faction)}`}>{player.faction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-neon-blue text-sm mb-2">INVITE FRIENDS</h4>
          <div className="space-y-2">
            {friends.filter(friend => friend.isOnline).map((friend) => (
              <div key={friend.id} className="flex justify-between items-center bg-dark-blue bg-opacity-30 p-2 rounded">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-neon-green mr-2"></div>
                  <span className={`text-sm ${getFactionColor(friend.faction)}`}>{friend.username}</span>
                </div>
                <button
                  onClick={() => sendInvite(friend.id)}
                  disabled={inviteSent[friend.id]}
                  className={`px-3 py-1 rounded font-cyber text-xs ${
                    inviteSent[friend.id]
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-neon-blue text-black'
                  }`}
                >
                  {inviteSent[friend.id] ? 'INVITED' : 'INVITE'}
                </button>
              </div>
            ))}
            
            {friends.filter(friend => friend.isOnline).length === 0 && (
              <p className="text-center text-gray-500 py-2">
                No friends currently online
              </p>
            )}
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => copyToClipboard(`Join my Nexus Syndicates session! Use code: ${activeSession.code}`)}
              className="w-full py-2 rounded font-cyber text-sm bg-dark-blue text-light-gray border border-light-gray"
            >
              COPY INVITE MESSAGE
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSessionManager = () => {
    return (
      <div className="mb-6 cyber-panel bg-dark-gray p-4">
        <h2 className="text-neon-blue font-cyber text-xl mb-4">SESSION MANAGEMENT</h2>
        
        {!activeSession ? (
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 py-3 rounded font-cyber text-sm bg-neon-blue text-black"
            >
              CREATE SESSION
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 py-3 rounded font-cyber text-sm bg-dark-blue text-light-gray border border-neon-blue"
            >
              JOIN SESSION
            </button>
          </div>
        ) : (
          renderActiveSession()
        )}
        
        {showCreateModal && renderCreateSessionModal()}
        {showJoinModal && renderJoinSessionModal()}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-neon-blue font-cyber text-3xl mb-2">MULTIPLAYER HUB</h1>
        <p className="text-light-gray">
          Collaborate with other players, form alliances, and compete for territory control in the cyberpunk underworld.
        </p>
      </div>

      {/* Session Manager component is always visible at the top */}
      {renderSessionManager()}

      {/* Chat component is always visible */}
      <div className="mb-6">
        <SyndicateChat />
      </div>

      {/* Tabs for different multiplayer features */}
      <div className="flex border-b border-neon-blue mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-cyber text-sm whitespace-nowrap ${
            activeTab === 'missions'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('missions')}
        >
          COOPERATIVE MISSIONS
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm whitespace-nowrap ${
            activeTab === 'leaderboards'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('leaderboards')}
        >
          SYNDICATE LEADERBOARDS
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm whitespace-nowrap ${
            activeTab === 'resources'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('resources')}
        >
          RESOURCE POOLING
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm whitespace-nowrap ${
            activeTab === 'alliances'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('alliances')}
        >
          ALLIANCE SYSTEM
        </button>
      </div>

      {/* Content based on active tab */}
      <div>
        {activeTab === 'missions' && <CooperativeMissions />}
        {activeTab === 'leaderboards' && <SyndicateLeaderboards />}
        {activeTab === 'resources' && <ResourcePooling />}
        {activeTab === 'alliances' && <AllianceSystem />}
      </div>
    </div>
  );
};

export default Multiplayer;
