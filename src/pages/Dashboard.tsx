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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>("");
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
        type: "alert",
        message: "Your territory in Sector 7 is under attack!",
        time: "10 minutes ago",
      },
      {
        id: 2,
        type: "info",
        message: "Market prices for Quantum Cores have increased by 15%",
        time: "1 hour ago",
      },
      {
        id: 3,
        type: "success",
        message: "Agent deployment in Sector 12 successful",
        time: "3 hours ago",
      },
      {
        id: 4,
        type: "info",
        message: "New governance proposal available for voting",
        time: "5 hours ago",
      },
    ],
    achievements: [
      {
        id: 1,
        title: "Territory Dominator",
        description: "Control 10 territories simultaneously",
        progress: 80,
        reward: "500 Credits + Unique Badge",
        completed: false,
        category: "territory",
      },
      {
        id: 2,
        title: "Resource Baron",
        description: "Accumulate 10,000 Data Shards",
        progress: 65,
        reward: "3 Quantum Cores",
        completed: false,
        category: "resources",
      },
      {
        id: 3,
        title: "Master Strategist",
        description: "Win 50 strategic battles",
        progress: 100,
        reward: "Legendary AI Agent Blueprint",
        completed: true,
        category: "combat",
      },
      {
        id: 4,
        title: "Tech Innovator",
        description: "Research all Tier 1 technologies",
        progress: 90,
        reward: "Advanced Research Terminal",
        completed: false,
        category: "technology",
      },
      {
        id: 5,
        title: "Syndicate Leader",
        description: "Lead a syndicate of 20+ members",
        progress: 100,
        reward: "Unique Syndicate Emblem",
        completed: true,
        category: "social",
      },
    ],
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
    <div className="min-h-screen cyber-bg text-light-gray">
      {/* Header */}
      <header className="bg-dark-gray bg-opacity-80 border-b neon-border-blue p-4 sticky top-0 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl font-cyber text-glow-blue mb-4 sm:mb-0">
            NEXUS <span className="text-glow-purple">SYNDICATES</span>
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
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
            <div className="w-full sm:w-48 mt-3 sm:mt-0">
              <AptosWalletConnect onWalletConnect={handleWalletConnect} />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Actions Bar */}
      <div className="bg-dark-gray bg-opacity-70 border-b neon-border-blue p-2 sticky top-16 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-2 sm:mb-0">
            <button
              onClick={() => navigate("/map")}
              className="cyber-button bg-opacity-20 text-glow-green text-sm sm:text-base"
            >
              <span className="mr-1">🗺️</span> Game Map
            </button>
            <button
              onClick={() => navigate("/marketplace")}
              className="cyber-button bg-opacity-20 text-glow-blue text-sm sm:text-base"
            >
              <span className="mr-1">💱</span> Marketplace
            </button>
            <button
              onClick={() => navigate("/syndicate-management")}
              className="cyber-button bg-opacity-20 text-glow-purple text-sm sm:text-base"
            >
              <span className="mr-1">👥</span> Syndicates
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="cyber-button bg-opacity-20 text-glow-purple text-sm sm:text-base"
            >
              <span className="mr-1">👤</span> Profile
            </button>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-end gap-3">
            <div className="text-sm">
              <span className="text-gray-400">Credits:</span>
              <span className="ml-1 text-glow-green">{playerData.credits}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Data Shards:</span>
              <span className="ml-1 text-glow-blue">
                {playerData.dataShards}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Influence:</span>
              <span className="ml-1 text-glow-purple">
                {playerData.influence}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto p-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Left Column - Large Player Overview */}
          <div className="lg:col-span-1 h-full">
            <div
              className="cyber-panel cyber-card p-4 w-full h-full"
              style={{
                minHeight: "calc(100vh - 200px)",
              }}
            >
              <h2 className="text-xl font-cyber text-glow-blue mb-4">
                PLAYER OVERVIEW
              </h2>
              <PlayerOverview
                playerData={playerData}
                walletAddress={walletAddress}
              />
            </div>
          </div>

          {/* Right Column - 4 cards in a grid */}
          <div className="lg:col-span-3 h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              {/* Syndicate Management */}
              <div
                className="cyber-panel cyber-card p-4 h-full"
                style={{
                  minHeight: "calc((100vh - 200px) / 2)",
                }}
              >
                <h2 className="text-xl font-cyber text-glow-green mb-4">
                  SYNDICATE MANAGEMENT
                </h2>
                <SyndicateManagement />
              </div>

              {/* AI Agent Control */}
              <div
                className="cyber-panel cyber-card p-4 h-full"
                style={{
                  minHeight: "calc((100vh - 200px) / 2)",
                }}
              >
                <h2 className="text-xl font-cyber text-glow-pink mb-4">
                  AI AGENT CONTROL
                </h2>
                <AIAgentControl />
              </div>

              {/* Market Hub */}
              <div
                className="cyber-panel cyber-card p-4 h-full"
                style={{
                  minHeight: "calc((100vh - 200px) / 2)",
                }}
              >
                <h2 className="text-xl font-cyber text-glow-blue mb-4">
                  MARKET HUB
                </h2>
                <MarketHub />
              </div>

              {/* Strategic Decisions */}
              <div
                className="cyber-panel cyber-card p-4 h-full"
                style={{
                  minHeight: "calc((100vh - 200px) / 2)",
                }}
              >
                <h2 className="text-xl font-cyber text-glow-purple mb-4">
                  STRATEGIC DECISIONS
                </h2>
                <StrategicDecisions />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Fixed to bottom right */}
        <div className="fixed bottom-4 right-4 z-10">
          <div className="cyber-card p-4 shadow-lg">
            <QuickActions onActionClick={handleQuickAction} />
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="cyber-panel modal-content cyber-glass w-full max-w-4xl max-h-[90vh] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-glow-blue">
                LEADERBOARD
              </h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-neon-blue hover:text-neon-pink transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 100px)" }}
            >
              <Leaderboard />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="cyber-panel modal-content cyber-glass w-full max-w-4xl max-h-[90vh] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-glow-green">
                NOTIFICATIONS
              </h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-neon-blue hover:text-neon-pink transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 100px)" }}
            >
              <Notifications notifications={playerData.notifications} />
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="cyber-panel modal-content cyber-glass w-full max-w-4xl max-h-[90vh] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-glow-purple">
                ACHIEVEMENTS
              </h2>
              <button
                onClick={() => setShowAchievements(false)}
                className="text-neon-blue hover:text-neon-pink transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 100px)" }}
            >
              <Achievements achievements={playerData.achievements} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
