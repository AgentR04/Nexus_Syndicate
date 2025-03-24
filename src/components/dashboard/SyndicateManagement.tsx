import React, { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";

// Activity type for syndicate events
interface SyndicateActivity {
  id: number;
  time: string;
  actor: string;
  action: string;
  outcome: string;
}

const SyndicateManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "map" | "resources" | "agents" | "activity"
  >("map");

  // Get game data from context
  const { territories, agents, gameEvents, currentPlayer } = useGame();

  // Derived state for syndicate activities from game events
  const [syndicateActivities, setSyndicateActivities] = useState<
    SyndicateActivity[]
  >([]);

  // Update syndicate activities when game events change
  useEffect(() => {
    if (gameEvents.length > 0) {
      const activities: SyndicateActivity[] = gameEvents
        .slice(0, 10)
        .map((event, index) => {
          let outcome = "";

          if (event.type.includes("resource")) {
            outcome = "+Resources extracted";
          } else if (event.type.includes("claim")) {
            outcome = "Territory acquired";
          } else if (event.type.includes("attack")) {
            outcome = "Territory contested";
          } else if (event.type.includes("agent")) {
            outcome = "Agent deployed";
          }

          return {
            id: index + 1,
            time: new Date(event.timestamp).toLocaleTimeString(),
            actor: event.sourcePlayerId ? "Your syndicate" : "Rival syndicate",
            action: event.message || event.type,
            outcome: outcome,
          };
        });

      setSyndicateActivities(activities);
    }
  }, [gameEvents]);

  // Function to determine the color of a territory based on its status
  const getTerritoryColor = (status: string): string => {
    switch (status) {
      case "secure":
        return "border-neon-green";
      case "contested":
        return "border-neon-pink";
      default:
        return "border-neon-blue";
    }
  };

  // Function to determine the color of an agent based on its type
  const getAgentColor = (type: string): string => {
    switch (type) {
      case "scout":
        return "text-neon-blue";
      case "defense":
        return "text-neon-purple";
      case "trader":
        return "text-neon-green";
      default:
        return "text-neon-yellow";
    }
  };

  // Function to get glow shadow class based on color
  const getGlowShadow = (color: string): string => {
    switch (color) {
      case "blue":
        return "shadow-[0_0_10px_rgba(0,170,255,0.7)]";
      case "green":
        return "shadow-[0_0_10px_rgba(0,255,170,0.7)]";
      case "purple":
        return "shadow-[0_0_10px_rgba(170,0,255,0.7)]";
      case "pink":
        return "shadow-[0_0_10px_rgba(255,0,170,0.7)]";
      case "yellow":
        return "shadow-none";
      default:
        return "shadow-none";
    }
  };

  // Get player-owned territories
  const playerTerritories = territories.filter((t) => t.owner === "player");

  // Get player agents
  const playerAgents = agents.filter((a) => a.location !== "undeployed");

  return (
    <div className="h-full overflow-y-auto flex flex-col p-2">
      {/* Tabs */}
      <div className="flex border-b border-neon-blue mb-3">
        <button
          className={`px-3 py-1 font-cyber text-xs ${
            activeTab === "map"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-light-gray hover:text-neon-blue transition duration-200"
          }`}
          onClick={() => setActiveTab("map")}
        >
          TERRITORY MAP
        </button>
        <button
          className={`px-3 py-1 font-cyber text-xs ${
            activeTab === "resources"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-light-gray hover:text-neon-blue transition duration-200"
          }`}
          onClick={() => setActiveTab("resources")}
        >
          RESOURCES
        </button>
        <button
          className={`px-3 py-1 font-cyber text-xs ${
            activeTab === "agents"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-light-gray hover:text-neon-blue transition duration-200"
          }`}
          onClick={() => setActiveTab("agents")}
        >
          AI AGENTS
        </button>
        <button
          className={`px-3 py-1 font-cyber text-xs ${
            activeTab === "activity"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-light-gray hover:text-neon-blue transition duration-200"
          }`}
          onClick={() => setActiveTab("activity")}
        >
          ACTIVITY
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="flex-grow overflow-y-auto pr-1">
        {/* Territory Map Tab */}
        {activeTab === "map" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-neon-blue">Controlled Territories</h3>
              <span className="text-xs text-light-gray">
                {playerTerritories.length} / {territories.length}
              </span>
            </div>

            {playerTerritories.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No territories controlled. Claim territories on the game map!
              </div>
            ) : (
              playerTerritories.map((territory) => (
                <div
                  key={territory.id}
                  className={`border ${getTerritoryColor(
                    territory.status
                  )} bg-dark-gray bg-opacity-50 p-2 rounded flex justify-between items-center`}
                >
                  <div>
                    <div className="text-sm font-cyber">{territory.name}</div>
                    <div className="text-xs text-gray-400">
                      {territory.type} | {territory.status}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {territory.resources.map((resource, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-1 rounded ${
                          resource === "credits"
                            ? "text-neon-green"
                            : resource === "dataShards"
                            ? "text-neon-blue"
                            : resource === "quantumCores"
                            ? "text-neon-yellow"
                            : "text-neon-purple"
                        }`}
                      >
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-neon-blue">Resource Production</h3>
              <span className="text-xs text-light-gray">
                {playerTerritories.length} sources
              </span>
            </div>

            {currentPlayer && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-light-gray">Credits</span>
                    <span className="text-xs text-neon-green">
                      {currentPlayer.resources.credits} (+
                      {Math.floor(playerTerritories.length * 12.5)}/hr)
                    </span>
                  </div>
                  <div className="w-full bg-dark-blue rounded-full h-1.5">
                    <div
                      className="bg-neon-green h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentPlayer.resources.credits / 2000) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-light-gray">Data Shards</span>
                    <span className="text-xs text-neon-blue">
                      {currentPlayer.resources.dataShards} (+
                      {Math.floor(
                        playerTerritories.filter((t) =>
                          t.resources.includes("dataShards")
                        ).length * 5
                      )}
                      /hr)
                    </span>
                  </div>
                  <div className="w-full bg-dark-blue rounded-full h-1.5">
                    <div
                      className="bg-neon-blue h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentPlayer.resources.dataShards / 1000) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-light-gray">
                      Synthetic Alloys
                    </span>
                    <span className="text-xs text-neon-purple">
                      {currentPlayer.resources.syntheticAlloys} (+
                      {Math.floor(
                        playerTerritories.filter((t) =>
                          t.resources.includes("syntheticAlloys")
                        ).length * 3
                      )}
                      /hr)
                    </span>
                  </div>
                  <div className="w-full bg-dark-blue rounded-full h-1.5">
                    <div
                      className="bg-neon-purple h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentPlayer.resources.syntheticAlloys / 500) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-light-gray">
                      Quantum Cores
                    </span>
                    <span className="text-xs text-neon-yellow">
                      {currentPlayer.resources.quantumCores} (+
                      {Math.floor(
                        playerTerritories.filter((t) =>
                          t.resources.includes("quantumCores")
                        ).length * 2
                      )}
                      /hr)
                    </span>
                  </div>
                  <div className="w-full bg-dark-blue rounded-full h-1.5">
                    <div
                      className="bg-neon-yellow h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentPlayer.resources.quantumCores / 200) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === "agents" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-neon-blue">Deployed Agents</h3>
              <span className="text-xs text-light-gray">
                {playerAgents.length} active
              </span>
            </div>

            {playerAgents.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No agents deployed. Deploy agents on the game map!
              </div>
            ) : (
              playerAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="border border-neon-blue bg-dark-gray bg-opacity-50 p-2 rounded"
                >
                  <div className="flex justify-between items-center">
                    <div
                      className={`text-sm font-cyber ${getAgentColor(
                        agent.type
                      )}`}
                    >
                      {agent.name}
                    </div>
                    <div className="text-xs text-light-gray">
                      {agent.status}
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="text-xs text-gray-400">
                      {agent.type} | {agent.location}
                    </div>
                    <div className="text-xs text-neon-green">{agent.task}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-neon-blue">Recent Activity</h3>
              <span className="text-xs text-light-gray">
                {syndicateActivities.length} events
              </span>
            </div>

            {syndicateActivities.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No recent activity. Start playing to see updates here!
              </div>
            ) : (
              syndicateActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="border-l-2 border-neon-blue pl-2 py-1"
                >
                  <div className="flex justify-between">
                    <div className="text-sm">{activity.actor}</div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                  <div className="text-xs text-light-gray">
                    {activity.action}
                  </div>
                  <div className="text-xs text-neon-green">
                    {activity.outcome}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyndicateManagement;
