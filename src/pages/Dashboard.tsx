import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AptosWalletConnect from "../components/common/AptosWalletConnect";
import {
  Achievements,
  AIAgentControl,
  Leaderboard,
  MarketHub,
  Notifications,
  PlayerOverview,
  QuickActions,
  StrategicDecisions,
  SyndicateManagement,
} from "../components/dashboard";

interface PlayerData {
  name: string;
  username?: string;
  avatar?: string;
  level: number;
  reputation?: number;
  syndicate?: string;
  faction: string;
  credits: number;
  dataShards: number;
  influence: number;
  territories: number;
  agents: number;
  nextLevelXP: number;
  currentXP: number;
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
  notifications: {
    id: number;
    message: string;
    timestamp: string;
    read: boolean;
    category: string;
  }[];
  achievements: {
    id: number;
    name: string;
    description: string;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
    category: string;
  }[];
  recentActivity: {
    id: number;
    type: string;
    description: string;
    timestamp: string;
  }[];
  availableMissions: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    reward: number;
  }[];
  miniGames?: {
    smugglersRun: number;
    cryptoMiner: number;
    hackerWars: number;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);

  // Mock player data
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: "NeonHunter",
    username: "NeonHunter_42",
    avatar: "https://via.placeholder.com/150",
    level: 42,
    reputation: 78,
    syndicate: "Quantum Syndicate",
    faction: "Quantum Syndicate",
    credits: 15000,
    dataShards: 750,
    influence: 85,
    territories: 5,
    agents: 12,
    nextLevelXP: 10000,
    currentXP: 8750,
    skills: {
      hacking: 85,
      combat: 65,
      trading: 72
    },
    assets: {
      properties: 3,
      vehicles: 5,
      nfts: 12
    },
    missions: {
      completed: 48,
      failed: 12,
      total: 60
    },
    notifications: [
      {
        id: 1,
        message: "Your territory in Sector 7 is under attack!",
        timestamp: "10 minutes ago",
        read: false,
        category: "alert",
      },
      {
        id: 2,
        message: "Market prices for Quantum Cores have increased by 15%",
        timestamp: "1 hour ago",
        read: false,
        category: "info",
      },
      {
        id: 3,
        message: "Agent deployment in Sector 12 successful",
        timestamp: "3 hours ago",
        read: false,
        category: "success",
      },
      {
        id: 4,
        message: "New governance proposal available for voting",
        timestamp: "5 hours ago",
        read: false,
        category: "info",
      },
    ],
    achievements: [
      {
        id: 1,
        name: "Territory Dominator",
        description: "Control 10 territories simultaneously",
        unlocked: false,
        progress: 80,
        maxProgress: 100,
        category: "territory",
      },
      {
        id: 2,
        name: "Resource Baron",
        description: "Accumulate 10,000 Data Shards",
        unlocked: false,
        progress: 65,
        maxProgress: 100,
        category: "resources",
      },
      {
        id: 3,
        name: "Master Strategist",
        description: "Win 50 strategic battles",
        unlocked: true,
        progress: 100,
        maxProgress: 100,
        category: "combat",
      },
      {
        id: 4,
        name: "Tech Innovator",
        description: "Research all Tier 1 technologies",
        unlocked: false,
        progress: 90,
        maxProgress: 100,
        category: "technology",
      },
      {
        id: 5,
        name: "Syndicate Leader",
        description: "Lead a syndicate of 20+ members",
        unlocked: true,
        progress: 100,
        maxProgress: 100,
        category: "social",
      },
    ],
    recentActivity: [
      {
        id: 1,
        type: "mission",
        description: "Completed mission 'Sector 7 Infiltration'",
        timestamp: "10 minutes ago",
      },
      {
        id: 2,
        type: "transaction",
        description: "Received 1000 credits from syndicate funds",
        timestamp: "1 hour ago",
      },
      {
        id: 3,
        type: "syndicate",
        description: "Promoted to syndicate leader",
        timestamp: "3 hours ago",
      },
    ],
    availableMissions: [
      {
        id: 1,
        title: "Sector 7 Infiltration",
        description: "Infiltrate Sector 7 and gather intel on enemy operations",
        difficulty: "Easy",
        reward: 500,
      },
      {
        id: 2,
        title: "Quantum Core Heist",
        description: "Steal a shipment of Quantum Cores from an enemy convoy",
        difficulty: "Medium",
        reward: 1000,
      },
    ],
    miniGames: {
      smugglersRun: 1000,
      cryptoMiner: 0,
      hackerWars: 0,
    },
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
    console.log("Quick action triggered:", action);
    // Handle different actions based on the action string
    // This would be implemented with actual functionality in a real app
  };

  return (
    <div className="min-h-screen bg-dark-blue p-4">
      <div className="container mx-auto">
        {/* Player Info Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-cyber text-neon-blue mb-4">
            OPERATIVE DASHBOARD
          </h1>
          
          <div className="bg-dark-gray rounded-lg shadow-lg overflow-hidden border border-neon-blue">
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neon-blue bg-opacity-20 border-2 border-neon-blue flex items-center justify-center overflow-hidden">
                  <img 
                    src={playerData.avatar || 'https://via.placeholder.com/150'} 
                    alt="Player Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-grow">
                  <h2 className="text-xl md:text-2xl font-cyber text-neon-purple mb-2">
                    {playerData.username || 'Anonymous Operative'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                    <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                      <p className="text-light-gray text-sm">LEVEL</p>
                      <p className="text-neon-green font-cyber">{playerData.level}</p>
                    </div>
                    
                    <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                      <p className="text-light-gray text-sm">REPUTATION</p>
                      <p className="text-neon-yellow font-cyber">{playerData.reputation}</p>
                    </div>
                    
                    <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                      <p className="text-light-gray text-sm">SYNDICATE</p>
                      <p className="text-neon-blue font-cyber">{playerData.syndicate || 'None'}</p>
                    </div>
                    
                    <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                      <p className="text-light-gray text-sm">CREDITS</p>
                      <p className="text-neon-purple font-cyber">{playerData.credits}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Stats Section */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-cyber text-neon-green mb-4">OPERATIVE STATS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              <h3 className="text-neon-blue font-cyber mb-2">MISSIONS</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-light-gray text-sm">Completed</p>
                  <p className="text-neon-green font-cyber">{playerData.missions?.completed}</p>
                </div>
                <div>
                  <p className="text-light-gray text-sm">Failed</p>
                  <p className="text-neon-red font-cyber">{playerData.missions?.failed}</p>
                </div>
                <div>
                  <p className="text-light-gray text-sm">Success Rate</p>
                  <p className="text-neon-yellow font-cyber">
                    {playerData.missions && playerData.missions.total > 0 
                      ? Math.round((playerData.missions.completed / playerData.missions.total) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              <h3 className="text-neon-blue font-cyber mb-2">ASSETS</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-light-gray text-sm">Properties</p>
                  <p className="text-neon-green font-cyber">{playerData.assets?.properties}</p>
                </div>
                <div>
                  <p className="text-light-gray text-sm">Vehicles</p>
                  <p className="text-neon-purple font-cyber">{playerData.assets?.vehicles}</p>
                </div>
                <div>
                  <p className="text-light-gray text-sm">NFTs</p>
                  <p className="text-neon-yellow font-cyber">{playerData.assets?.nfts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              <h3 className="text-neon-blue font-cyber mb-2">SKILLS</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-light-gray text-sm">Hacking</span>
                    <span className="text-neon-green text-sm">{playerData.skills?.hacking}/100</span>
                  </div>
                  <div className="w-full bg-dark-blue rounded-full h-2">
                    <div 
                      className="bg-neon-green h-2 rounded-full" 
                      style={{ width: `${playerData.skills?.hacking}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-light-gray text-sm">Combat</span>
                    <span className="text-neon-red text-sm">{playerData.skills?.combat}/100</span>
                  </div>
                  <div className="w-full bg-dark-blue rounded-full h-2">
                    <div 
                      className="bg-neon-red h-2 rounded-full" 
                      style={{ width: `${playerData.skills?.combat}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-light-gray text-sm">Trading</span>
                    <span className="text-neon-yellow text-sm">{playerData.skills?.trading}/100</span>
                  </div>
                  <div className="w-full bg-dark-blue rounded-full h-2">
                    <div 
                      className="bg-neon-yellow h-2 rounded-full" 
                      style={{ width: `${playerData.skills?.trading}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mini-Games Section */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-cyber text-neon-green mb-4">MINI-GAMES</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Smugglers Run */}
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue hover:border-neon-green transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-neon-green font-cyber">SMUGGLERS RUN</h3>
                <span className="text-neon-blue font-cyber text-sm">
                  HIGH SCORE: {playerData.miniGames?.smugglersRun || 0}
                </span>
              </div>
              
              <p className="text-light-gray text-sm mb-3">
                Navigate through hazardous cyberpunk routes to deliver illegal goods and unlock hidden trade routes.
              </p>
              
              <div className="bg-black bg-opacity-50 rounded p-2 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-light-gray text-xs">ROUTES UNLOCKED</span>
                  <span className="text-neon-purple text-xs">{playerData.miniGames?.smugglersRun ? Math.floor(playerData.miniGames.smugglersRun / 1000) : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-light-gray text-xs">CRYPTO EARNED</span>
                  <span className="text-neon-yellow text-xs">{playerData.miniGames?.smugglersRun ? Math.floor(playerData.miniGames.smugglersRun / 100) : 0}</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/smugglers-run')}
                className="w-full py-2 bg-neon-green bg-opacity-20 hover:bg-opacity-30 text-neon-green border border-neon-green rounded font-cyber text-sm transition-all"
              >
                PLAY NOW
              </button>
            </div>
            
            {/* Crypto Miner - Locked */}
            <div className="bg-dark-gray rounded-lg p-4 border border-gray-700 opacity-70">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 font-cyber">CRYPTO MINER</h3>
                <span className="text-gray-500 font-cyber text-sm">LOCKED</span>
              </div>
              
              <p className="text-gray-500 text-sm mb-3">
                Solve complex puzzles to mine cryptocurrency and earn passive income for your syndicate.
              </p>
              
              <div className="bg-black bg-opacity-50 rounded p-2 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-500 text-xs">BLOCKS MINED</span>
                  <span className="text-gray-500 text-xs">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">CRYPTO EARNED</span>
                  <span className="text-gray-500 text-xs">0</span>
                </div>
              </div>
              
              <button 
                disabled
                className="w-full py-2 bg-gray-700 text-gray-500 border border-gray-600 rounded font-cyber text-sm cursor-not-allowed"
              >
                UNLOCK AT LEVEL 50
              </button>
            </div>
            
            {/* Hacker Wars - Locked */}
            <div className="bg-dark-gray rounded-lg p-4 border border-gray-700 opacity-70">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 font-cyber">HACKER WARS</h3>
                <span className="text-gray-500 font-cyber text-sm">LOCKED</span>
              </div>
              
              <p className="text-gray-500 text-sm mb-3">
                Compete against other players in a battle of hacking skills to control digital territories.
              </p>
              
              <div className="bg-black bg-opacity-50 rounded p-2 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-500 text-xs">BATTLES WON</span>
                  <span className="text-gray-500 text-xs">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">TERRITORIES</span>
                  <span className="text-gray-500 text-xs">0</span>
                </div>
              </div>
              
              <button 
                disabled
                className="w-full py-2 bg-gray-700 text-gray-500 border border-gray-600 rounded font-cyber text-sm cursor-not-allowed"
              >
                UNLOCK AT LEVEL 60
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Activity and Available Missions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-cyber text-neon-purple mb-4">RECENT ACTIVITY</h2>
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              <ul className="space-y-3">
                {playerData.recentActivity.map((activity, index) => (
                  <li key={index} className="border-b border-gray-700 pb-2 last:border-0">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${
                        activity.type === 'mission' ? 'bg-neon-blue' : 
                        activity.type === 'transaction' ? 'bg-neon-green' : 
                        activity.type === 'syndicate' ? 'bg-neon-purple' : 'bg-neon-yellow'
                      }`}></div>
                      <div>
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl md:text-2xl font-cyber text-neon-yellow mb-4">AVAILABLE MISSIONS</h2>
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              {playerData.availableMissions.length > 0 ? (
                <div className="space-y-4">
                  {playerData.availableMissions.map((mission, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg p-3 hover:border-neon-blue transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-neon-blue font-cyber">{mission.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          mission.difficulty === 'Easy' ? 'bg-green-900 text-green-300' : 
                          mission.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' : 
                          'bg-red-900 text-red-300'
                        }`}>
                          {mission.difficulty}
                        </span>
                      </div>
                      <p className="text-light-gray text-sm mb-2">{mission.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-neon-green text-sm">{mission.reward} credits</span>
                        <button className="px-3 py-1 bg-neon-blue text-xs text-black font-cyber rounded hover:bg-neon-purple transition-colors">
                          ACCEPT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-light-gray text-center py-4">No missions available. Check back later.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
