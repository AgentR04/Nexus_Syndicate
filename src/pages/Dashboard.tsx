import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import {
  Achievements,
  AIAgentControl,
  Leaderboard,
  MarketHub,
  Notifications,
  PlayerOverview,
  StrategicDecisions,
  SyndicateManagement,
} from "../components/dashboard";
import { useGame } from "../context/GameContext";
import gameService from "../services/gameService";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);

  // Get real-time game data from context
  const { currentPlayer, territories, agents, gameEvents, players } = useGame();

  // Initialize player data from game context
  const [playerData, setPlayerData] = useState({
    name: "NeonHunter",
    username: "NeonHunter_42",
    avatar: "https://via.placeholder.com/150",
    level: 42,
    reputation: 78,
    syndicate: "Quantum Syndicate",
    faction: "Quantum Syndicate",
    credits: 15750,
    dataShards: 8920,
    syntheticAlloys: 0,
    quantumCores: 0,
    influence: 6540,
    territories: 7,
    agents: 12,
    nextLevelXP: 75000,
    currentXP: 62500,
    skills: {
      hacking: 85,
      combat: 65,
      trading: 72,
    },
    assets: {
      properties: 3,
      vehicles: 5,
      nfts: 12,
    },
    missions: {
      completed: 48,
      failed: 12,
      total: 60,
    },
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

  // Update player data when game state changes
  useEffect(() => {
    if (currentPlayer) {
      const playerTerritories = territories.filter(
        (t) => t.owner === "player"
      ).length;
      const playerAgents = agents.filter(
        (a) => a.location !== "undeployed"
      ).length;

      // Convert game events to notifications
      const recentNotifications = gameEvents.slice(0, 5).map((event) => ({
        id: parseInt(event.id) || Math.floor(Math.random() * 1000), // Convert string ID to number
        type: event.type.includes("attack")
          ? "alert"
          : event.type.includes("resource")
          ? "success"
          : "info",
        message: event.message || `Event: ${event.type}`,
        time: new Date(event.timestamp).toLocaleTimeString(),
      }));

      setPlayerData((prev) => ({
        ...prev,
        name: currentPlayer.name,
        username: currentPlayer.username || prev.username,
        avatar: currentPlayer.avatar || prev.avatar,
        level: currentPlayer.level || prev.level,
        reputation: currentPlayer.reputation || prev.reputation,
        syndicate: currentPlayer.syndicate || prev.syndicate,
        faction: currentPlayer.faction,
        credits: currentPlayer.resources.credits,
        dataShards: currentPlayer.resources.dataShards,
        syntheticAlloys: currentPlayer.resources.syntheticAlloys,
        quantumCores: currentPlayer.resources.quantumCores,
        territories: playerTerritories,
        agents: playerAgents,
        nextLevelXP: currentPlayer.nextLevelXP || prev.nextLevelXP,
        currentXP: currentPlayer.currentXP || prev.currentXP,
        skills: currentPlayer.skills || prev.skills,
        assets: currentPlayer.assets || prev.assets,
        missions: currentPlayer.missions || prev.missions,
        notifications:
          recentNotifications.length > 0
            ? recentNotifications
            : prev.notifications,
        achievements: prev.achievements, // Keep existing achievements
        recentActivity: prev.recentActivity,
        availableMissions: prev.availableMissions,
        miniGames: prev.miniGames,
      }));
    }
  }, [currentPlayer, territories, agents, gameEvents]);

  // Start game service when dashboard loads
  useEffect(() => {
    gameService.startGameCycle();
    return () => {
      // Don't stop the game cycle when navigating away
      // This ensures game state continues updating
    };
  }, []);

  const handleWalletConnect = (address: string) => {
    console.log("Wallet connected:", address);
    setWalletAddress(address);
  };

  const handleQuickAction = (action: string) => {
    console.log("Quick action triggered:", action);
    // Handle different actions based on the action string
    // This would be implemented with actual functionality in a real app
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

  return (
    <div className="min-h-screen bg-dark-blue text-light-gray">
      <Navbar
        onWalletConnect={handleWalletConnect}
        showGameMapButton={true}
        title="COMMAND"
      />
      <div className="container mx-auto p-4">
        {/* Live Status Bar - NEW */}
        <div className="bg-dark-gray p-3 rounded-lg mb-6 border border-neon-blue">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-neon-green animate-pulse"></div>
              <span className="text-neon-green text-sm">LIVE NETWORK</span>
            </div>
            <div className="flex space-x-4">
              <div className="text-sm">
                <span className="text-gray-400">Territories: </span>
                <span className="text-neon-blue">{playerData.territories}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Agents: </span>
                <span className="text-neon-purple">{playerData.agents}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Last Update: </span>
                <span className="text-light-gray">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Info Section */}
        {/*
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-cyber text-neon-blue mb-4">
            OPERATIVE DASHBOARD
          </h1>

          <div className="bg-dark-gray rounded-lg shadow-lg overflow-hidden border border-neon-blue">
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neon-blue bg-opacity-20 border-2 border-neon-blue flex items-center justify-center overflow-hidden">
                  <img
                    src={playerData.avatar || "https://via.placeholder.com/150"}
                    alt="Player Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-grow">
                  <h2 className="text-xl md:text-2xl font-cyber text-neon-purple mb-2">
                    {playerData.username || "Anonymous Operative"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                    <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                      <p className="text-light-gray text-sm">LEVEL</p>
                      <p className="text-neon-green font-cyber">
                        {playerData.level}
                      </p>
                    </div>

                    <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                      <p className="text-light-gray text-sm">REPUTATION</p>
                      <p className="text-neon-yellow font-cyber">
                        {playerData.reputation}
                      </p>
                    </div>

                    <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                      <p className="text-light-gray text-sm">SYNDICATE</p>
                      <p className="text-neon-blue font-cyber">
                        {playerData.syndicate || "None"}
                      </p>
                    </div>

                    <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                      <p className="text-light-gray text-sm">CREDITS</p>
                      <p className="text-neon-purple font-cyber">
                        {playerData.credits}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Game Stats Section */}
        {/* <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-cyber text-neon-green mb-4">
            OPERATIVE STATS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              <h3 className="text-neon-blue font-cyber mb-2">MISSIONS</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-light-gray text-sm">Completed</p>
                  <p className="text-neon-green font-cyber">
                    {playerData.missions?.completed}
                  </p>
                </div>
                <div>
                  <p className="text-light-gray text-sm">Failed</p>
                  <p className="text-neon-red font-cyber">
                    {playerData.missions?.failed}
                  </p>
                </div>
                <div>
                  <p className="text-light-gray text-sm">Success Rate</p>
                  <p className="text-neon-yellow font-cyber">
                    {playerData.missions && playerData.missions.total > 0
                      ? Math.round(
                          (playerData.missions.completed /
                            playerData.missions.total) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              <h3 className="text-neon-blue font-cyber mb-2">ASSETS</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-light-gray text-sm">Properties</p>
                  <p className="text-neon-green font-cyber">
                    {playerData.assets?.properties}
                  </p>
                </div>
                <div>
                  <p className="text-light-gray text-sm">Vehicles</p>
                  <p className="text-neon-purple font-cyber">
                    {playerData.assets?.vehicles}
                  </p>
                </div>
                <div>
                  <p className="text-light-gray text-sm">NFTs</p>
                  <p className="text-neon-yellow font-cyber">
                    {playerData.assets?.nfts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              <h3 className="text-neon-blue font-cyber mb-2">SKILLS</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-light-gray text-sm">Hacking</span>
                    <span className="text-neon-green text-sm">
                      {playerData.skills?.hacking}/100
                    </span>
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
                    <span className="text-neon-red text-sm">
                      {playerData.skills?.combat}/100
                    </span>
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
                    <span className="text-neon-yellow text-sm">
                      {playerData.skills?.trading}/100
                    </span>
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
        */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PlayerOverview
                playerData={playerData}
                walletAddress={walletAddress}
              />

              {/* Resource Monitor - UPDATED */}
              <div className="cyber-panel p-4">
                <h2 className="text-xl font-cyber text-neon-blue mb-4">
                  Resource Monitor
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-light-gray">Credits</span>
                      <span className="text-neon-green">
                        {playerData.credits}
                      </span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2.5">
                      <div
                        className="bg-neon-green h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (playerData.credits / 2000) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-light-gray">Data Shards</span>
                      <span className="text-neon-blue">
                        {playerData.dataShards}
                      </span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2.5">
                      <div
                        className="bg-neon-blue h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (playerData.dataShards / 100) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-light-gray">Synthetic Alloys</span>
                      <span className="text-neon-purple">
                        {playerData.syntheticAlloys}
                      </span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2.5">
                      <div
                        className="bg-neon-purple h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (playerData.syntheticAlloys / 50) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-light-gray">Quantum Cores</span>
                      <span className="text-neon-yellow">
                        {playerData.quantumCores}
                      </span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2.5">
                      <div
                        className="bg-neon-yellow h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (playerData.quantumCores / 30) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Activity Feed - NEW */}
              <div className="cyber-panel p-4 sm:col-span-2">
                <h2 className="text-xl font-cyber text-neon-purple mb-2">
                  Live Activity Feed
                </h2>
                <div className="max-h-screen overflow-y-auto pr-2">
                  {gameEvents.slice(0, 10).map((event, index) => (
                    <div
                      key={event.id}
                      className={`p-2 my-5 border-l-4 ${
                        event.type === "territory_attack" ||
                        event.type === "alliance_offer"
                          ? "border-neon-pink bg-neon-pink bg-opacity-10"
                          : event.type === "resource_extract"
                          ? "border-neon-green bg-neon-green bg-opacity-10"
                          : "border-neon-blue bg-neon-blue bg-opacity-10"
                      } text-sm`}
                    >
                      <div className="flex justify-between">
                        <span>{event.message}</span>
                        <span className="text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {gameEvents.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No recent activity. Start playing to see updates here!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="grid grid-cols-1 gap-6">
              <SyndicateManagement />
            </div>
          </div>
        </div>
        <div className="md:col-span-1 mt-6">
          <div className="grid grid-cols-3 gap-6">
            <AIAgentControl />
            <MarketHub />
            <StrategicDecisions />
          </div>
        </div>

        {/* Mini-Games Section */}
        <div className="mb-8 mt-6">
          <h2 className="text-xl md:text-2xl font-cyber text-neon-green mb-4">
            MINI-GAMES
          </h2>

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
                Navigate through hazardous cyberpunk routes to deliver illegal
                goods and unlock hidden trade routes.
              </p>

              <div className="bg-black bg-opacity-50 rounded p-2 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-light-gray text-xs">
                    ROUTES UNLOCKED
                  </span>
                  <span className="text-neon-purple text-xs">
                    {playerData.miniGames?.smugglersRun
                      ? Math.floor(playerData.miniGames.smugglersRun / 1000)
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-light-gray text-xs">CRYPTO EARNED</span>
                  <span className="text-neon-yellow text-xs">
                    {playerData.miniGames?.smugglersRun
                      ? Math.floor(playerData.miniGames.smugglersRun / 100)
                      : 0}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/smugglers-run")}
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
                Solve complex puzzles to mine cryptocurrency and earn passive
                income for your syndicate.
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
                Compete against other players in a battle of hacking skills to
                control digital territories.
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
            <h2 className="text-xl md:text-2xl font-cyber text-neon-purple mb-4">
              RECENT ACTIVITY
            </h2>
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              <ul className="space-y-3">
                {playerData.recentActivity.map((activity, index) => (
                  <li
                    key={index}
                    className="border-b border-gray-700 pb-2 last:border-0"
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${
                          activity.type === "mission"
                            ? "bg-neon-blue"
                            : activity.type === "transaction"
                            ? "bg-neon-green"
                            : activity.type === "syndicate"
                            ? "bg-neon-purple"
                            : "bg-neon-yellow"
                        }`}
                      ></div>
                      <div>
                        <p className="text-white text-sm">
                          {activity.description}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
                {playerData.recentActivity.length === 0 && (
                  <li className="text-center text-gray-500 py-4">
                    No recent activity. Start playing to see updates here!
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-cyber text-neon-yellow mb-4">
              AVAILABLE MISSIONS
            </h2>
            <div className="bg-dark-gray rounded-lg p-4 border border-neon-blue">
              {playerData.availableMissions.length > 0 ? (
                <div className="space-y-4">
                  {playerData.availableMissions.map((mission, index) => (
                    <div
                      key={index}
                      className="border border-gray-700 rounded-lg p-3 hover:border-neon-blue transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-neon-blue font-cyber">
                          {mission.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            mission.difficulty === "Easy"
                              ? "bg-green-900 text-green-300"
                              : mission.difficulty === "Medium"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {mission.difficulty}
                        </span>
                      </div>
                      <p className="text-light-gray text-sm mb-2">
                        {mission.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-neon-green text-sm">
                          {mission.reward} credits
                        </span>
                        <button className="px-3 py-1 bg-neon-blue text-xs text-black font-cyber rounded hover:bg-neon-purple transition-colors">
                          ACCEPT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-light-gray text-center py-4">
                  No missions available. Check back later.
                </p>
              )}
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
    </div>
  );
};

export default Dashboard;
