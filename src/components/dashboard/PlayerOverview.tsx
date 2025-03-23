import React, { useState } from "react";

interface PlayerData {
  name: string;
  level: number;
  faction: string;
  credits: number;
  dataShards: number;
  influence: number;
  territories: number;
  agents: number;
  nextLevelXP: number;
  currentXP: number;
  notifications: {
    id: number;
    type: string;
    message: string;
    time: string;
  }[];
  achievements: {
    id: number;
    title: string;
    description: string;
    progress: number;
    reward: string;
    completed: boolean;
    category: string;
  }[];
}

interface PlayerOverviewProps {
  playerData: PlayerData;
  walletAddress: string;
}

const PlayerOverview: React.FC<PlayerOverviewProps> = ({
  playerData,
  walletAddress,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "trade":
        return (
          <svg
            className="w-4 h-4 text-neon-green"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case "attack":
        return (
          <svg
            className="w-4 h-4 text-neon-pink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case "syndicate":
        return (
          <svg
            className="w-4 h-4 text-neon-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-neon-yellow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getReputationColor = (rep: number): string => {
    if (rep >= 80) return "text-neon-green";
    if (rep >= 50) return "text-neon-blue";
    if (rep >= 30) return "text-neon-yellow";
    return "text-neon-pink";
  };

  return (
    <div className="cyber-panel p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple opacity-10 rounded-bl-full"></div>

      <h2 className="text-xl font-cyber text-neon-blue mb-4">
        PLAYER OVERVIEW
      </h2>

      <div>
        {/* Player Identity */}
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neon-purple">
              <img
                src={"https://placehold.co/600x400"}
                alt={playerData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/600x400";
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-dark-gray rounded-full border border-neon-blue flex items-center justify-center">
              <span className="text-xs font-cyber text-neon-blue">★</span>
            </div>
          </div>

          <div className="ml-4">
            <h3 className="text-lg font-cyber text-neon-purple">
              {playerData.name}
            </h3>
            <div className="flex items-center">
              <span className="text-xs text-light-gray">
                {playerData.faction}
              </span>
              <span className="mx-2">•</span>
              <span className="text-xs font-bold text-neon-blue">
                LEVEL {playerData.level}
              </span>
            </div>
            <div className="text-xs text-light-gray mt-1 truncate max-w-[200px]">
              {walletAddress
                ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
                : "Wallet not connected"}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto mt-5">
          <div className="cyber-resource-box">
            <div className="text-xs text-light-gray">CREDITS</div>
            <div className="text-neon-blue font-mono">
              {formatNumber(playerData.credits)}
            </div>
          </div>
          <div className="cyber-resource-box">
            <div className="text-xs text-light-gray">DATA SHARDS</div>
            <div className="text-neon-green font-mono">
              {formatNumber(playerData.dataShards)}
            </div>
          </div>
          <div className="cyber-resource-box">
            <div className="text-xs text-light-gray">INFLUENCE</div>
            <div className="text-neon-purple font-mono">
              {formatNumber(playerData.influence)}
            </div>
          </div>
          <div className="cyber-resource-box">
            <div className="text-xs text-light-gray">TERRITORIES</div>
            <div className="text-neon-pink font-mono">
              {formatNumber(playerData.territories)}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {/* <div className="relative">
          <button
            className="cyber-button flex items-center"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="text-sm">{playerData.notifications.length}</span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 cyber-panel z-10">
              <div className="p-2">
                <h4 className="text-sm font-cyber text-neon-blue mb-2">
                  NOTIFICATIONS
                </h4>
                {playerData.notifications.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {playerData.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex p-2 bg-dark-blue bg-opacity-50 rounded"
                      >
                        <div className="mr-2 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <div className="text-xs">{notification.message}</div>
                          <div className="text-xs text-light-gray opacity-70">
                            {notification.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-light-gray">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div> */}
      </div>

      {/* XP Progress Bar */}
      <div className="mt-4 w-full">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-light-gray">XP Progress</span>
          <span className="font-mono text-neon-blue">
            {playerData.currentXP} / {playerData.nextLevelXP}
          </span>
        </div>
        <div className="h-2 bg-dark-gray rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
            style={{
              width: `${
                (playerData.currentXP / playerData.nextLevelXP) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Player Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="cyber-stat-box">
          <div className="text-xs text-light-gray">AGENTS</div>
          <div className="text-neon-yellow font-mono">{playerData.agents}</div>
        </div>
        <div className="cyber-stat-box">
          <div className="text-xs text-light-gray">TERRITORIES</div>
          <div className="text-neon-green font-mono">
            {playerData.territories}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerOverview;
