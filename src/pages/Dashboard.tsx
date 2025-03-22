import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayerOverview,
  SyndicateManagement,
  MarketHub,
  AIAgentControl,
  StrategicDecisions,
  QuickActions,
  Leaderboard,
  Notifications,
  Achievements
} from '../components/dashboard';
import AptosWalletConnect from '../components/common/AptosWalletConnect';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  
  // Mock player data
  const [playerData, setPlayerData] = useState({
    name: "NeonHunter",
    level: 42,
    faction: "Quantum Syndicate",
    credits: 15750,
    dataShards: 8920,
    influence: 6540,
    territories: 7,
    agents: 12,
    nextLevelXP: 75000,
    currentXP: 62500,
    notifications: [
      {
        id: 1,
        type: 'alert',
        message: 'Your territory in Sector 7 is under attack!',
        time: '10 minutes ago'
      },
      {
        id: 2,
        type: 'info',
        message: 'Market prices for Quantum Cores have increased by 15%',
        time: '1 hour ago'
      },
      {
        id: 3,
        type: 'success',
        message: 'Agent deployment in Sector 12 successful',
        time: '3 hours ago'
      },
      {
        id: 4,
        type: 'info',
        message: 'New governance proposal available for voting',
        time: '5 hours ago'
      }
    ],
    achievements: [
      {
        id: 1,
        title: 'Territory Dominator',
        description: 'Control 10 territories simultaneously',
        progress: 80,
        reward: '500 Credits + Unique Badge',
        completed: false,
        category: 'territory'
      },
      {
        id: 2,
        title: 'Resource Baron',
        description: 'Accumulate 10,000 Data Shards',
        progress: 65,
        reward: '3 Quantum Cores',
        completed: false,
        category: 'resources'
      },
      {
        id: 3,
        title: 'Master Strategist',
        description: 'Win 50 strategic battles',
        progress: 100,
        reward: 'Legendary AI Agent Blueprint',
        completed: true,
        category: 'combat'
      },
      {
        id: 4,
        title: 'Tech Innovator',
        description: 'Research all Tier 1 technologies',
        progress: 90,
        reward: 'Advanced Research Terminal',
        completed: false,
        category: 'technology'
      },
      {
        id: 5,
        title: 'Syndicate Leader',
        description: 'Lead a syndicate of 20+ members',
        progress: 100,
        reward: 'Unique Syndicate Emblem',
        completed: true,
        category: 'social'
      }
    ]
  });

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const toggleAchievements = () => {
    setShowAchievements(!showAchievements);
  };
  
  const handleQuickAction = (action: string) => {
    console.log('Quick action triggered:', action);
    // Handle different actions based on the action string
    // This would be implemented with actual functionality in a real app
  };

  return (
    <div className="min-h-screen cyber-bg text-light-gray">
      {/* Header */}
      <header className="bg-dark-gray bg-opacity-80 border-b neon-border-blue p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-cyber text-glow-blue">
            NEXUS <span className="text-glow-purple">SYNDICATES</span>
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="cyber-button-small neon-border-green text-glow-green"
            >
              Leaderboard
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(true)}
                className="cyber-button-small neon-border-blue text-glow-blue"
              >
                Notifications
              </button>
              <span className="notification-badge">4</span>
            </div>
            <button 
              onClick={() => setShowAchievements(true)}
              className="cyber-button-small neon-border-purple text-glow-purple"
            >
              Achievements
            </button>
            <div className="w-48">
              <AptosWalletConnect onWalletConnect={handleWalletConnect} />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Actions Bar */}
      <div className="bg-dark-gray bg-opacity-70 border-b neon-border-blue p-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/game-map')}
              className="cyber-button bg-opacity-20 text-glow-green"
            >
              <span className="mr-2">🗺️</span> Game Map
            </button>
            <button 
              onClick={() => navigate('/marketplace')}
              className="cyber-button bg-opacity-20 text-glow-blue"
            >
              <span className="mr-2">💱</span> Marketplace
            </button>
            <button 
              onClick={() => navigate('/syndicate-management')}
              className="cyber-button bg-opacity-20 text-glow-purple"
            >
              <span className="mr-2">👥</span> Syndicates
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="cyber-button bg-opacity-20 text-glow-purple"
            >
              <span className="mr-2">👤</span> Profile
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <span className="text-gray-400">Credits:</span>
              <span className="ml-1 text-glow-green">{playerData.credits}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Data Shards:</span>
              <span className="ml-1 text-glow-blue">{playerData.dataShards}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Influence:</span>
              <span className="ml-1 text-glow-purple">{playerData.influence}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Left Column - Player Overview & Strategic Decisions */}
        <div className="md:col-span-1 space-y-4">
          <div className="cyber-panel cyber-card p-4">
            <h2 className="text-xl font-cyber text-glow-blue mb-4">PLAYER OVERVIEW</h2>
            <div className="scrollable max-h-[30vh]">
              <PlayerOverview playerData={playerData} walletAddress={walletAddress} />
            </div>
          </div>
          
          <div className="cyber-panel cyber-card p-4">
            <h2 className="text-xl font-cyber text-glow-purple mb-4">STRATEGIC DECISIONS</h2>
            <div className="scrollable max-h-[30vh]">
              <StrategicDecisions />
            </div>
          </div>
        </div>
        
        {/* Middle Column - Syndicate Management & Market Hub */}
        <div className="md:col-span-1 lg:col-span-2 space-y-4">
          <div className="cyber-panel cyber-card p-4">
            <h2 className="text-xl font-cyber text-glow-green mb-4">SYNDICATE MANAGEMENT</h2>
            <div className="scrollable max-h-[30vh]">
              <SyndicateManagement />
            </div>
          </div>
          
          <div className="cyber-panel cyber-card p-4">
            <h2 className="text-xl font-cyber text-glow-blue mb-4">MARKET HUB</h2>
            <div className="scrollable max-h-[30vh]">
              <MarketHub />
            </div>
          </div>
        </div>
        
        {/* Right Column - AI Agent Control & Quick Actions */}
        <div className="md:col-span-1 space-y-4">
          <div className="cyber-panel cyber-card p-4">
            <h2 className="text-xl font-cyber text-glow-pink mb-4">AI AGENT CONTROL</h2>
            <div className="scrollable max-h-[30vh]">
              <AIAgentControl />
            </div>
          </div>
          
          <div className="cyber-panel cyber-card p-4">
            <QuickActions onActionClick={handleQuickAction} />
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center">
          <div className="cyber-panel modal-content cyber-glass max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-glow-blue">LEADERBOARD</h2>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="text-neon-blue hover:text-neon-pink transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="scrollable max-h-[70vh]">
              <Leaderboard />
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center">
          <div className="cyber-panel modal-content cyber-glass max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-glow-green">NOTIFICATIONS</h2>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-neon-blue hover:text-neon-pink transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="scrollable max-h-[70vh]">
              <Notifications notifications={playerData.notifications} />
            </div>
          </div>
        </div>
      )}
      
      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center">
          <div className="cyber-panel modal-content cyber-glass max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-glow-purple">ACHIEVEMENTS</h2>
              <button 
                onClick={() => setShowAchievements(false)}
                className="text-neon-blue hover:text-neon-pink transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="scrollable max-h-[70vh]">
              <Achievements achievements={playerData.achievements} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
