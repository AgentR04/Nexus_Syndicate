import React, { useState } from "react";

// Mock agent types
const agentTypes = [
  {
    id: "scout",
    name: "Scout",
    description: "Gathers intelligence and explores new territories",
    cost: 500,
    maintenanceCost: 50,
  },
  {
    id: "defender",
    name: "Defender",
    description: "Protects territories from enemy attacks",
    cost: 750,
    maintenanceCost: 75,
  },
  {
    id: "trader",
    name: "Trader",
    description:
      "Automates market transactions and finds arbitrage opportunities",
    cost: 1000,
    maintenanceCost: 100,
  },
  {
    id: "hacker",
    name: "Hacker",
    description: "Infiltrates enemy systems and steals resources",
    cost: 1250,
    maintenanceCost: 125,
  },
  {
    id: "researcher",
    name: "Researcher",
    description: "Accelerates technology research and development",
    cost: 1500,
    maintenanceCost: 150,
  },
];

// Mock deployed agents
const mockDeployedAgents = [
  {
    id: 1,
    name: "Scout-X1",
    type: "scout",
    level: 3,
    status: "active",
    location: "Neon District",
    task: "Gathering intelligence",
    performance: 87,
    lastReport: "10 min ago",
    health: 92,
  },
  {
    id: 2,
    name: "Defender-D3",
    type: "defender",
    level: 2,
    status: "active",
    location: "Quantum Fields",
    task: "Protecting territory",
    performance: 76,
    lastReport: "5 min ago",
    health: 65,
  },
  {
    id: 3,
    name: "Trader-T7",
    type: "trader",
    level: 4,
    status: "active",
    location: "Cyber Nexus",
    task: "Market analysis",
    performance: 93,
    lastReport: "2 min ago",
    health: 100,
  },
  {
    id: 4,
    name: "Hacker-H2",
    type: "hacker",
    level: 1,
    status: "inactive",
    location: "Base",
    task: "Awaiting orders",
    performance: 0,
    lastReport: "2 hours ago",
    health: 100,
  },
];

// Mock territories for deployment
const mockTerritories = [
  { id: 1, name: "Neon District", type: "urban", status: "secure" },
  { id: 2, name: "Quantum Fields", type: "research", status: "contested" },
  { id: 3, name: "Digital Wastes", type: "industrial", status: "secure" },
  { id: 4, name: "Cyber Nexus", type: "commercial", status: "secure" },
  { id: 5, name: "Shadow Market", type: "black-market", status: "contested" },
];

// Mock tasks
const mockTasks = [
  { id: "gather", name: "Gather Intelligence", compatibleTypes: ["scout"] },
  { id: "defend", name: "Defend Territory", compatibleTypes: ["defender"] },
  { id: "trade", name: "Analyze Market", compatibleTypes: ["trader"] },
  { id: "hack", name: "Infiltrate Systems", compatibleTypes: ["hacker"] },
  {
    id: "research",
    name: "Accelerate Research",
    compatibleTypes: ["researcher"],
  },
  { id: "patrol", name: "Patrol Area", compatibleTypes: ["scout", "defender"] },
  {
    id: "sabotage",
    name: "Sabotage Enemy",
    compatibleTypes: ["hacker", "scout"],
  },
  { id: "arbitrage", name: "Find Arbitrage", compatibleTypes: ["trader"] },
];

const AIAgentControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"deployed" | "create" | "upgrade">(
    "deployed"
  );
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [selectedAgentType, setSelectedAgentType] = useState<string | null>(
    null
  );
  const [newAgentName, setNewAgentName] = useState<string>("");
  const [selectedTerritory, setSelectedTerritory] = useState<number | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Function to get the color for an agent type
  const getAgentTypeColor = (type: string): string => {
    switch (type) {
      case "scout":
        return "text-neon-blue";
      case "defender":
        return "text-neon-purple";
      case "trader":
        return "text-neon-green";
      case "hacker":
        return "text-neon-pink";
      case "researcher":
        return "text-neon-yellow";
      default:
        return "text-light-gray";
    }
  };

  // Function to get the color for agent health
  const getHealthColor = (health: number): string => {
    if (health >= 80) return "bg-neon-green";
    if (health >= 50) return "bg-neon-yellow";
    if (health >= 30) return "bg-neon-orange";
    return "bg-neon-pink";
  };

  // Function to get the color for agent performance
  const getPerformanceColor = (performance: number): string => {
    if (performance >= 80) return "text-neon-green";
    if (performance >= 60) return "text-neon-blue";
    if (performance >= 40) return "text-neon-yellow";
    return "text-neon-pink";
  };

  // Function to handle agent deployment
  const handleDeployAgent = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would deploy the agent
    alert(
      `Agent ${newAgentName} of type ${selectedAgentType} deployed to ${
        mockTerritories.find((t) => t.id === selectedTerritory)?.name
      } with task ${mockTasks.find((t) => t.id === selectedTask)?.name}`
    );
    setNewAgentName("");
    setSelectedAgentType(null);
    setSelectedTerritory(null);
    setSelectedTask(null);
    setActiveTab("deployed");
  };

  return (
    <div className="cyber-panel p-4">
      <h2 className="text-xl font-cyber text-neon-blue mb-4">
        AI AGENT CONTROL
      </h2>

      {/* Tabs */}
      <div className="flex border-b border-neon-blue mb-4">
        <button
          className={`px-4 py-2 font-cyber text-sm ${
            activeTab === "deployed"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-light-gray"
          }`}
          onClick={() => setActiveTab("deployed")}
        >
          DEPLOYED
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${
            activeTab === "create"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-light-gray"
          }`}
          onClick={() => setActiveTab("create")}
        >
          CREATE
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${
            activeTab === "upgrade"
              ? "text-neon-blue border-b-2 border-neon-blue"
              : "text-light-gray"
          }`}
          onClick={() => setActiveTab("upgrade")}
        >
          UPGRADE
        </button>
      </div>

      {/* Deployed Agents */}
      {activeTab === "deployed" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-cyber text-neon-purple">
              ACTIVE AI AGENTS
            </h3>
            <button
              className="text-xs text-neon-blue hover:text-neon-purple transition-colors"
              onClick={() => setActiveTab("create")}
            >
              Deploy New Agent
            </button>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {mockDeployedAgents.map((agent) => (
              <div
                key={agent.id}
                className={`bg-dark-gray p-3 rounded cursor-pointer transition-colors ${
                  selectedAgent === agent.id
                    ? "border border-neon-blue"
                    : "hover:bg-medium-gray"
                }`}
                onClick={() =>
                  setSelectedAgent(agent.id === selectedAgent ? null : agent.id)
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          agent.status === "active"
                            ? "bg-neon-green"
                            : "bg-neon-yellow"
                        } mr-2`}
                      ></div>
                      <h4
                        className={`font-cyber ${getAgentTypeColor(
                          agent.type
                        )}`}
                      >
                        {agent.name}
                      </h4>
                      <span className="ml-2 text-xs text-light-gray">
                        Lvl {agent.level}
                      </span>
                    </div>
                    <div className="text-xs text-light-gray mt-1">
                      {agent.task} in {agent.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm ${getPerformanceColor(
                        agent.performance
                      )}`}
                    >
                      {agent.performance}%
                    </div>
                    <div className="text-xs text-light-gray">Performance</div>
                  </div>
                </div>

                {selectedAgent === agent.id && (
                  <div className="mt-3 pt-3 border-t border-neon-blue border-opacity-30">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-light-gray mb-1">
                          Health
                        </div>
                        <div className="w-full bg-dark-blue rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHealthColor(
                              agent.health
                            )}`}
                            style={{ width: `${agent.health}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-light-gray mb-1">
                          Last Report
                        </div>
                        <div className="text-xs">{agent.lastReport}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 py-1 text-xs bg-dark-blue hover:bg-neon-blue hover:bg-opacity-20 transition-colors">
                        Reassign
                      </button>
                      <button className="flex-1 py-1 text-xs bg-dark-blue hover:bg-neon-blue hover:bg-opacity-20 transition-colors">
                        Repair
                      </button>
                      <button className="flex-1 py-1 text-xs bg-dark-blue hover:bg-neon-pink hover:bg-opacity-20 transition-colors">
                        Recall
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-dark-gray rounded">
            <h3 className="text-sm font-cyber text-neon-blue mb-2">
              AGENT NETWORK PERFORMANCE
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-neon-green text-lg font-cyber">87%</div>
                <div className="text-xs text-light-gray">Success Rate</div>
              </div>
              <div>
                <div className="text-neon-blue text-lg font-cyber">+5,230</div>
                <div className="text-xs text-light-gray">Credits Generated</div>
              </div>
              <div>
                <div className="text-neon-purple text-lg font-cyber">3</div>
                <div className="text-xs text-light-gray">
                  Territories Secured
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Agent */}
      {activeTab === "create" && (
        <div>
          <h3 className="text-sm font-cyber text-neon-purple mb-3">
            CREATE NEW AGENT
          </h3>

          <form onSubmit={handleDeployAgent}>
            <div className="mb-4">
              <label className="block text-xs text-light-gray mb-1">
                AGENT TYPE
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {agentTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedAgentType === type.id
                        ? "bg-neon-blue bg-opacity-20 border border-neon-blue"
                        : "bg-dark-gray hover:bg-medium-gray"
                    }`}
                    onClick={() => {
                      setSelectedAgentType(type.id);
                      setSelectedTask(null); // Reset task when agent type changes
                    }}
                  >
                    <div
                      className={`text-sm font-cyber ${getAgentTypeColor(
                        type.id
                      )}`}
                    >
                      {type.name}
                    </div>
                    <div className="text-xs text-light-gray mt-1">
                      Cost: {type.cost}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedAgentType && (
              <>
                <div className="mb-4">
                  <label className="block text-xs text-light-gray mb-1">
                    AGENT NAME
                  </label>
                  <input
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    className="w-full bg-dark-blue border border-neon-blue p-2 rounded text-light-gray focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    placeholder={`${
                      agentTypes.find((t) => t.id === selectedAgentType)?.name
                    }-${Math.floor(Math.random() * 100)}`}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-light-gray mb-1">
                    DEPLOYMENT LOCATION
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {mockTerritories.map((territory) => (
                      <div
                        key={territory.id}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedTerritory === territory.id
                            ? "bg-neon-blue bg-opacity-20 border border-neon-blue"
                            : "bg-dark-gray hover:bg-medium-gray"
                        }`}
                        onClick={() => setSelectedTerritory(territory.id)}
                      >
                        <div className="text-sm">{territory.name}</div>
                        <div className="text-xs text-light-gray mt-1">
                          {territory.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs text-light-gray mb-1">
                    INITIAL TASK
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {mockTasks
                      .filter((task) =>
                        task.compatibleTypes.includes(selectedAgentType)
                      )
                      .map((task) => (
                        <div
                          key={task.id}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            selectedTask === task.id
                              ? "bg-neon-blue bg-opacity-20 border border-neon-blue"
                              : "bg-dark-gray hover:bg-medium-gray"
                          }`}
                          onClick={() => setSelectedTask(task.id)}
                        >
                          <div className="text-sm">{task.name}</div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-cyber text-neon-purple mb-2">
                    DEPLOYMENT SUMMARY
                  </h3>
                  <div className="bg-dark-gray p-3 rounded">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-light-gray">
                          Agent Type
                        </div>
                        <div className="text-sm">
                          {
                            agentTypes.find((t) => t.id === selectedAgentType)
                              ?.name
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-light-gray">
                          Initial Cost
                        </div>
                        <div className="text-sm">
                          {
                            agentTypes.find((t) => t.id === selectedAgentType)
                              ?.cost
                          }{" "}
                          Credits
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-light-gray">
                          Maintenance
                        </div>
                        <div className="text-sm">
                          {
                            agentTypes.find((t) => t.id === selectedAgentType)
                              ?.maintenanceCost
                          }
                          /hr
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-light-gray">
                          Deployment Time
                        </div>
                        <div className="text-sm">Immediate</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    !selectedAgentType || !selectedTerritory || !selectedTask
                  }
                  className={`w-full py-2 font-cyber ${
                    selectedAgentType && selectedTerritory && selectedTask
                      ? "bg-neon-green bg-opacity-20 border border-neon-green text-neon-green hover:bg-opacity-30"
                      : "bg-dark-gray text-light-gray cursor-not-allowed"
                  } transition-colors`}
                >
                  DEPLOY AGENT
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {/* Upgrade Agents */}
      {activeTab === "upgrade" && (
        <div>
          <h3 className="text-sm font-cyber text-neon-purple mb-3">
            UPGRADE AGENTS
          </h3>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {mockDeployedAgents.map((agent) => (
              <div key={agent.id} className="bg-dark-gray p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <h4
                        className={`font-cyber ${getAgentTypeColor(
                          agent.type
                        )}`}
                      >
                        {agent.name}
                      </h4>
                      <span className="ml-2 text-xs text-light-gray">
                        Lvl {agent.level}
                      </span>
                    </div>
                    <div className="text-xs text-light-gray mt-1">
                      {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}{" "}
                      Type
                    </div>
                  </div>
                  <div>
                    <button
                      className="text-xs bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30 transition-colors px-3 py-1 rounded"
                      onClick={() =>
                        alert(
                          `Upgrading ${agent.name} to level ${agent.level + 1}`
                        )
                      }
                    >
                      Upgrade ({agent.level * 500} Credits)
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-light-gray mb-1">
                      Current Level: {agent.level}
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div
                        className="bg-neon-purple h-2 rounded-full"
                        style={{ width: `${(agent.level / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-light-gray mb-1">
                      Next Level: {agent.level + 1}
                    </div>
                    <div className="text-xs">+15% Performance</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-dark-blue rounded">
            <h3 className="text-sm font-cyber text-neon-yellow mb-2">
              UPGRADE BENEFITS
            </h3>
            <div className="text-xs text-light-gray space-y-1">
              <p>• Each level increases agent performance by 15%</p>
              <p>• Higher levels unlock special abilities</p>
              <p>• Improved resource gathering efficiency</p>
              <p>• Enhanced territory control capabilities</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentControl;
