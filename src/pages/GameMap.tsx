import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import TerritoryControl from "../components/TerritoryControl";
import { useGame } from "../context/GameContext";
import firestoreService from "../services/firestoreService";
import gameService from "../services/gameService";
import { BattleResult, GameEvent } from "../types/gameTypes";

// Hex grid utility functions
const hexToPixel = (q: number, r: number, size: number) => {
  const x = size * ((3 / 2) * q);
  const y = size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r);
  return { x, y };
};

const GameMap: React.FC = () => {
  const navigate = useNavigate();
  const {
    territories,
    agents,
    players,
    currentPlayer,
    gameEvents,
    setTerritories,
    setAgents,
    setGameEvents,
    setSelectedTerritory,
    setSelectedAgent,
    selectedTerritory,
    selectedAgent,
    claimTerritory,
    attackTerritory,
    deployAgent,
    extractResources,
  } = useGame();

  // State for agent deployment modal
  const [showAgentDeployment, setShowAgentDeployment] =
    useState<boolean>(false);
  const [agentType, setAgentType] = useState<string>("scout");
  const [targetTerritoryId, setTargetTerritoryId] = useState<number>(0);
  const [agentTask, setAgentTask] = useState<string>("gather");

  // State for map controls
  const [mapZoom, setMapZoom] = useState<number>(1.5);
  const [mapOffset, setMapOffset] = useState<{ x: number; y: number }>({
    x: 350,
    y: 220,
  });
  const [activeOverlay, setActiveOverlay] = useState<string>("ownership");

  // Make all territories neutral by default when component loads
  useEffect(() => {
    if (territories.length > 0) {
      makeAllTerritoriesNeutral();
    }
  }, [territories.length]); // Only run when territories are first loaded

  // Center map on initial load
  useEffect(() => {
    // Center the map based on the average position of all territories
    if (territories.length > 0) {
      const centerMap = () => {
        const avgX =
          territories.reduce((sum, t) => {
            const { x } = hexToPixel(t.q, t.r, 30);
            return sum + x;
          }, 0) / territories.length;

        const avgY =
          territories.reduce((sum, t) => {
            const { y } = hexToPixel(t.q, t.r, 30);
            return sum + y;
          }, 0) / territories.length;

        // Adjust vertical position to be higher on the screen
        // setMapOffset({
        //   x: 600 - avgX,
        //   y: 300 - avgY,
        // });
      };

      centerMap();
    }
  }, [territories]);

  // PvP state
  const [battleResult, setBattleResult] = useState<BattleResult | undefined>(
    undefined
  );
  const [showBattleOverlay, setShowBattleOverlay] = useState<boolean>(false);
  const [attackingAgentIds, setAttackingAgentIds] = useState<number[]>([]);

  // Hover state for territories
  const [hoveredTerritory, setHoveredTerritory] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Helper functions for resource and agent display
  const getOwnershipColor = (owner: string): string => {
    switch (owner) {
      case "player":
        return "#4287f5"; // blue
      case "rival":
        return "#f54242"; // red
      case "neutral":
      default:
        return "#a0a0a0"; // gray
    }
  };

  const getResourceColor = (resource: string): string => {
    switch (resource) {
      case "credits":
        return "#f5d742"; // gold
      case "dataShards":
        return "#42c5f5"; // light blue
      case "syntheticAlloys":
        return "#42f56f"; // green
      case "quantumProcessors":
        return "#c842f5"; // purple
      default:
        return "#a0a0a0"; // gray
    }
  };

  const getResourceIcon = (resource: string): string => {
    switch (resource) {
      case "credits":
        return "₵";
      case "dataShards":
        return "D";
      case "syntheticAlloys":
        return "A";
      case "quantumProcessors":
        return "Q";
      default:
        return "?";
    }
  };

  const getAgentIcon = (type: string): string => {
    switch (type) {
      case "scout":
        return "S";
      case "defense":
        return "D";
      case "trader":
        return "T";
      case "resource":
        return "R";
      default:
        return "?";
    }
  };

  // Handle agent deployment
  const handleAgentDeployment = () => {
    if (selectedTerritory) {
      const updatedAgents = gameService.deployAgent(
        agentType,
        selectedTerritory.id,
        agentTask,
        agents,
        territories
      );
      setAgents(updatedAgents);
      setShowAgentDeployment(false);
    }
  };

  // Handle agent recall
  const handleRecallAgent = (agentId: number) => {
    const updatedAgents = gameService.recallAgent(agentId, agents);
    setAgents(updatedAgents);
  };

  // Make all territories neutral
  const makeAllTerritoriesNeutral = async () => {
    const neutralTerritories = territories.map((territory) => ({
      ...territory,
      owner: "neutral",
      controlPoints: 0,
      status: "neutral",
    }));

    // Update each territory in Firebase
    const updatePromises = neutralTerritories.map((territory) =>
      firestoreService.updateTerritory(territory.id, {
        owner: "neutral",
        status: "neutral",
        controlPoints: 0,
        lastCaptureTime: Date.now(),
      })
    );

    try {
      await Promise.all(updatePromises);
      console.log("All territories updated to neutral in Firebase");
    } catch (error) {
      console.error("Error updating territories in Firebase:", error);
    }

    setTerritories(neutralTerritories);

    // If a territory is selected, update it to be neutral as well
    if (selectedTerritory) {
      setSelectedTerritory({
        ...selectedTerritory,
        owner: "neutral",
        controlPoints: 0,
        status: "neutral",
      });
    }

    // Add a game event for this action
    const newEvent: GameEvent = {
      id: `event-${Date.now()}`,
      type: "territory_claim",
      sourcePlayerId: currentPlayer?.id || "system",
      message: "All territories have been reset to neutral status",
      timestamp: Date.now(),
      status: "completed",
    };

    setGameEvents([newEvent, ...gameEvents]);
  };

  // Subscribe to game events
  useEffect(() => {
    // Set up event listeners if needed
    const handleTerritoriesUpdated = (updatedTerritories: any) => {
      setTerritories(updatedTerritories);

      // Update selected territory if it was updated
      if (selectedTerritory) {
        const updatedSelectedTerritory = updatedTerritories.find(
          (t: any) => t.id === selectedTerritory.id
        );
        if (updatedSelectedTerritory) {
          setSelectedTerritory(updatedSelectedTerritory);
        }
      }
    };

    const handleAgentsUpdated = (updatedAgents: any) => {
      setAgents(updatedAgents);

      // Update selected agent if it was updated
      if (selectedAgent) {
        const updatedSelectedAgent = updatedAgents.find(
          (a: any) => a.id === selectedAgent.id
        );
        if (updatedSelectedAgent) {
          setSelectedAgent(updatedSelectedAgent);
        }
      }
    };

    const handleEventsUpdated = (updatedEvents: any) => {
      setGameEvents(updatedEvents);

      // Play notification sound or visual effect for new events
      if (updatedEvents.length > 0 && gameEvents.length > 0) {
        if (updatedEvents[0].id !== gameEvents[0].id) {
          // New event received - could add sound effect here
          console.log("New game event:", updatedEvents[0].message);
        }
      }
    };

    // Handle battle results
    const handleBattleResult = (result: BattleResult) => {
      setBattleResult(result);
      setShowBattleOverlay(true);
    };

    // Start the game cycle if it's not already running
    gameService.startGameCycle();

    // Subscribe to events
    gameService.on("territories_updated", handleTerritoriesUpdated);
    gameService.on("agents_updated", handleAgentsUpdated);
    gameService.on("events_updated", handleEventsUpdated);
    gameService.on("battle_result", handleBattleResult);

    // Return cleanup function
    return () => {
      gameService.off("territories_updated", handleTerritoriesUpdated);
      gameService.off("agents_updated", handleAgentsUpdated);
      gameService.off("events_updated", handleEventsUpdated);
      gameService.off("battle_result", handleBattleResult);
    };
  }, [
    gameEvents,
    selectedTerritory,
    selectedAgent,
    setTerritories,
    setAgents,
    setGameEvents,
    setSelectedTerritory,
    setSelectedAgent,
  ]);

  // Handle territory click
  const handleTerritoryClick = (territory: any) => {
    setSelectedTerritory(territory);
    setSelectedAgent(null);
  };

  // Handle agent click
  const handleAgentClick = (agent: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedAgent(agent);
  };

  // Handle territory claim
  const handleClaimTerritory = () => {
    if (selectedTerritory) {
      const updatedTerritories = gameService.claimTerritory(
        selectedTerritory.id,
        territories
      );
      setTerritories(updatedTerritories);
    }
  };

  // Handle territory attack
  const handleAttackTerritory = () => {
    if (selectedTerritory) {
      // Get agents at this territory that can attack
      const availableAgents = agents.filter(
        (a) =>
          a.location === selectedTerritory.name &&
          a.status === "active" &&
          a.ownerId === currentPlayer?.id &&
          (!a.cooldownUntil || a.cooldownUntil < Date.now())
      );

      if (availableAgents.length === 0) {
        alert(
          "You need at least one active agent in this territory to attack!"
        );
        return;
      }

      // Set the attacking agents
      setAttackingAgentIds(availableAgents.map((a) => a.id));

      // Perform the attack
      const updatedTerritories = gameService.attackTerritory(
        selectedTerritory.id,
        territories,
        agents
      );
      setTerritories(updatedTerritories);
    }
  };

  // Render territory
  const renderTerritory = (territory: any) => {
    const { x, y } = hexToPixel(territory.q, territory.r, 30);
    const adjustedX = x + mapOffset.x;
    const adjustedY = y + mapOffset.y;

    // Determine territory color based on owner and overlay type
    let fillColor = "#555";
    let strokeColor = "#777";
    let resourceIcon = null;

    if (activeOverlay === "ownership") {
      // Ownership view
      if (territory.owner === "player") {
        fillColor = "#3b82f6"; // blue-500
        strokeColor = "#1d4ed8"; // blue-700
      } else if (territory.owner === "rival") {
        fillColor = "#ef4444"; // red-500
        strokeColor = "#b91c1c"; // red-700
      } else {
        fillColor = "#6b7280"; // gray-500
        strokeColor = "#374151"; // gray-700
      }

      // Contested territories have a different appearance
      if (territory.status === "contested") {
        fillColor = "#f59e0b"; // amber-500
        strokeColor = "#d97706"; // amber-600
      }
    } else if (activeOverlay === "resources") {
      // Resources view - show resource types with colors
      fillColor = "#1f2937"; // gray-800
      strokeColor = "#374151"; // gray-700

      const resourceColors: Record<string, string> = {
        credits: "#fbbf24", // amber-400
        dataShards: "#3b82f6", // blue-500
        syntheticAlloys: "#10b981", // emerald-500
        quantumCores: "#8b5cf6", // purple-500
      };

      // Create a circular layout for resources
      if (territory.resources && territory.resources.length > 0) {
        // Find dominant resource for territory coloring
        const dominantResource = territory.resources[0];
        strokeColor = resourceColors[dominantResource] || strokeColor;

        const resourceElements = territory.resources.map(
          (resource: string, index: number) => {
            const angle = (index * 2 * Math.PI) / territory.resources.length;
            const radius = 12;
            const resourceX = radius * Math.cos(angle);
            const resourceY = radius * Math.sin(angle);

            let icon = "●"; // Default icon

            // Set resource-specific icons
            if (resource === "credits") icon = "💰";
            if (resource === "dataShards") icon = "💾";
            if (resource === "syntheticAlloys") icon = "🔩";
            if (resource === "quantumCores") icon = "⚛️";

            return (
              <text
                key={`${territory.id}-${resource}`}
                x={resourceX}
                y={resourceY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fill={resourceColors[resource] || "#fff"}
              >
                {icon}
              </text>
            );
          }
        );

        resourceIcon = <g transform={`translate(0, 0)`}>{resourceElements}</g>;
      }
    }

    // Highlight selected territory - this should override previous stroke colors
    if (selectedTerritory && territory.id === selectedTerritory.id) {
      strokeColor = "#f59e0b"; // amber-500
    }

    // Apply hover effects
    const isHovered = hoveredTerritory && territory.id === hoveredTerritory.id;
    const strokeWidth = isHovered ? 3.5 : 2;
    const glowIntensity = isHovered
      ? 6
      : selectedTerritory && territory.id === selectedTerritory.id
      ? 5
      : territory.owner === "player"
      ? 3
      : 2;

    // Handle mouse enter for territory hover
    const handleMouseEnter = (e: React.MouseEvent) => {
      setHoveredTerritory(territory);
      setShowTooltip(true);

      // Calculate tooltip position - position to the right side of the territory
      const target = e.target as HTMLElement;
      const boundingRect = target.getBoundingClientRect();
      setTooltipPosition({
        x: boundingRect.right + 30,
        y: boundingRect.top + boundingRect.height / 2,
      });
    };

    // Handle mouse leave for territory hover
    const handleMouseLeave = () => {
      setHoveredTerritory(null);
      setShowTooltip(false);
    };

    return (
      <g
        key={territory.id}
        transform={`translate(${adjustedX}, ${adjustedY})`}
        onClick={() => handleTerritoryClick(territory)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: "pointer",
        }}
      >
        {/* Add glow filter for territories */}
        <defs>
          <filter
            id={`glow-${territory.id}`}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation={glowIntensity} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <polygon
          points="15,0 7.5,13 -7.5,13 -15,0 -7.5,-13 7.5,-13"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          filter={`url(#glow-${territory.id})`}
        />

        {/* Add pattern overlay for resource territories */}
        {activeOverlay === "resources" &&
          territory.resources &&
          territory.resources.length > 0 && (
            <polygon
              points="15,0 7.5,13 -7.5,13 -15,0 -7.5,-13 7.5,-13"
              fill="url(#diagonalHatch)"
              stroke="none"
            />
          )}

        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={10}
          fontWeight="bold"
        >
          {territory.name.split(" ")[0]}
        </text>
        {resourceIcon}

        {/* Add Territory Control component for contested territories */}
        {territory.status === "contested" && (
          <foreignObject x={-20} y={10} width={40} height={20}>
            <TerritoryControl territory={territory} />
          </foreignObject>
        )}
      </g>
    );
  };

  // Render agent
  const renderAgent = (agent: any) => {
    // Find the territory where the agent is located
    const territory = territories.find((t) => t.name === agent.location);
    if (!territory) return null;

    const { x, y } = hexToPixel(territory.q, territory.r, 30);
    const adjustedX = x + mapOffset.x;
    const adjustedY = y + mapOffset.y;

    // Calculate position offset based on number of agents in the territory
    const agentsInTerritory = agents.filter(
      (a) => a.location === territory.name
    );
    const agentIndex = agentsInTerritory.findIndex((a) => a.id === agent.id);
    const angleOffset = (agentIndex * 2 * Math.PI) / agentsInTerritory.length;
    const radius = 20;
    const offsetX = radius * Math.cos(angleOffset);
    const offsetY = radius * Math.sin(angleOffset);

    // Determine agent color based on status
    let agentColor = "#ffffff";
    if (agent.status === "active") {
      agentColor = "#4ade80"; // green-400
    } else if (agent.status === "deploying") {
      agentColor = "#facc15"; // yellow-400
    } else if (agent.status === "returning") {
      agentColor = "#60a5fa"; // blue-400
    } else if (agent.status === "cooldown") {
      agentColor = "#f87171"; // red-400
    }

    // Determine agent icon based on type
    let agentIcon = "●";
    switch (agent.type) {
      case "scout":
        agentIcon = "👁️";
        break;
      case "defense":
        agentIcon = "🛡️";
        break;
      case "trader":
        agentIcon = "💼";
        break;
      case "resource":
        agentIcon = "⛏️";
        break;
      default:
        agentIcon = "●";
    }

    return (
      <g
        key={`agent-${agent.id}`}
        transform={`translate(${adjustedX + offsetX}, ${adjustedY + offsetY})`}
        onClick={(e) => handleAgentClick(agent, e)}
        style={{ cursor: "pointer" }}
      >
        <circle r={8} fill={agentColor} stroke="#000" strokeWidth={1} />
        <text textAnchor="middle" dominantBaseline="middle" fontSize={10}>
          {agentIcon}
        </text>
        {selectedAgent && selectedAgent.id === agent.id && (
          <>
            <circle
              r={12}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4,4"
            />
            <foreignObject x={15} y={-40} width={150} height={80}>
              <div className="bg-gray-900 bg-opacity-90 p-2 rounded text-white text-xs">
                <div className="font-bold">{agent.name}</div>
                <div>Type: {agent.type}</div>
                <div>Status: {agent.status}</div>
                <div>Task: {agent.task}</div>
                {agent.status === "active" && (
                  <button
                    className="mt-1 px-2 py-1 bg-red-600 text-white rounded text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecallAgent(agent.id);
                    }}
                  >
                    Recall
                  </button>
                )}
              </div>
            </foreignObject>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-dark-blue text-light-gray flex flex-col scrollable-y">
      {/* Header */}
      <Navbar
        onWalletConnect={(address: string) =>
          console.log("Wallet connected:", address)
        }
        title="TERRITORIES"
      />

      {/* Map Controls */}
      <div className="bg-dark-gray bg-opacity-90 p-2 sticky top-16 z-40 border-b border-neon-blue">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setMapZoom(Math.min(mapZoom * 1.2, 3))}
              className="p-2 bg-dark-blue border border-neon-blue text-neon-blue hover:bg-neon-blue hover:bg-opacity-20 transition-colors rounded"
              title="Zoom In"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
            <button
              onClick={() => setMapZoom(Math.max(mapZoom / 1.2, 0.5))}
              className="p-2 bg-dark-blue border border-neon-blue text-neon-blue hover:bg-neon-blue hover:bg-opacity-20 transition-colors rounded"
              title="Zoom Out"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 12H6"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setMapZoom(1);
                setMapOffset({ x: 0, y: 0 });
              }}
              className="p-2 bg-dark-blue border border-neon-blue text-neon-blue hover:bg-neon-blue hover:bg-opacity-20 transition-colors rounded"
              title="Reset View"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5 5"
                />
              </svg>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveOverlay("ownership")}
              className={`p-2 border rounded ${
                activeOverlay === "ownership"
                  ? "bg-neon-blue bg-opacity-20 border-neon-blue text-neon-blue"
                  : "bg-dark-blue border-gray-600 text-gray-400 hover:text-neon-blue"
              } transition-colors`}
            >
              Ownership
            </button>
            <button
              onClick={() => setActiveOverlay("resources")}
              className={`p-2 border rounded ${
                activeOverlay === "resources"
                  ? "bg-neon-green bg-opacity-20 border-neon-green text-neon-green"
                  : "bg-dark-blue border-gray-600 text-gray-400 hover:text-neon-green"
              } transition-colors`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveOverlay("agents")}
              className={`p-2 border rounded ${
                activeOverlay === "agents"
                  ? "bg-neon-purple bg-opacity-20 border-neon-purple text-neon-purple"
                  : "bg-dark-blue border-gray-600 text-gray-400 hover:text-neon-purple"
              } transition-colors`}
            >
              Agents
            </button>
          </div>

          <button
            onClick={() => setShowAgentDeployment(!showAgentDeployment)}
            className="p-2 bg-neon-yellow bg-opacity-20 border border-neon-yellow text-neon-yellow hover:bg-opacity-30 transition-colors rounded flex items-center gap-2"
          >
            <span className="hidden sm:inline">Deploy Agent</span>
            <span className="inline sm:hidden"></span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 0118 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Game Layout - Split View */}
      <div className="flex flex-col md:flex-row flex-grow h-[calc(100vh-8rem)]">
        {/* Main Map Area */}
        <div className="flex-grow relative overflow-hidden">
          <div
            className="absolute inset-0 cursor-move"
            style={{
              transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
              transformOrigin: "center",
            }}
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startY = e.clientY;
              const startOffsetX = mapOffset.x;
              const startOffsetY = mapOffset.y;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                setMapOffset({
                  x: startOffsetX + dx,
                  y: startOffsetY + dy,
                });
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
            onWheel={(e) => {
              e.preventDefault();
              // Get cursor position relative to the map container
              const rect = e.currentTarget as HTMLElement;
              const boundingRect = rect.getBoundingClientRect();
              const cursorX = e.clientX - boundingRect.left;
              const cursorY = e.clientY - boundingRect.top;

              // Calculate the cursor position in the scaled/translated coordinate system
              const worldX = (cursorX - mapOffset.x) / mapZoom;
              const worldY = (cursorY - mapOffset.y) / mapZoom;

              // Calculate new zoom level
              const zoomDelta = e.deltaY < 0 ? 1.1 : 0.9;
              const newZoom = Math.min(Math.max(mapZoom * zoomDelta, 0.5), 3);

              // Calculate new offset to keep cursor at the same world position
              const newOffsetX = cursorX / newZoom - worldX;
              const newOffsetY = cursorY / newZoom - worldY;

              setMapZoom(newZoom);
              setMapOffset({ x: newOffsetX, y: newOffsetY });
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1200 800"
              preserveAspectRatio="xMidYMid meet"
              style={{
                transform: `scale(${mapZoom})`,
                transformOrigin: "center",
              }}
            >
              {/* Grid background */}
              <defs>
                <pattern
                  id="grid"
                  width="100"
                  height="100"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 100 0 L 0 0 0 100"
                    fill="none"
                    stroke="#1a2e4a"
                    strokeWidth="0.5"
                  />
                </pattern>

                {/* Diagonal hatch pattern for resource territories */}
                <pattern
                  id="diagonalHatch"
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                </pattern>
              </defs>
              <rect x="0" y="0" width="1200" height="800" fill="url(#grid)" />
              {/* Grid coordinates */}
              <g>
                {Array.from({ length: 10 }, (_, i) => (
                  <React.Fragment key={i.toString()}>
                    <text
                      x={i * 300 - 1000}
                      y="-1050"
                      fill="#3a4a6a"
                      fontSize="40"
                    >
                      {i * 300 - 1000}
                    </text>
                    <text
                      x="-1050"
                      y={i * 300 - 1000}
                      fill="#3a4a6a"
                      fontSize="40"
                    >
                      {i * 300 - 1000}
                    </text>
                  </React.Fragment>
                ))}
              </g>

              {/* Territories */}
              {territories.map((territory) => renderTerritory(territory))}
              {agents.map((agent) => renderAgent(agent))}
            </svg>
          </div>

          {/* Territory Tooltip */}
          {showTooltip && hoveredTerritory && (
            <div
              className="absolute z-10 bg-dark-gray border border-neon-blue rounded p-3 text-sm pointer-events-none"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: "translate(0, -50%)",
                minWidth: "200px",
                opacity: 0.95,
              }}
            >
              <div className="font-bold text-neon-blue text-base mb-1">
                {hoveredTerritory.name}
              </div>
              <div className="text-gray-300 flex justify-between">
                <span>Type:</span>
                <span className="text-neon-green">{hoveredTerritory.type}</span>
              </div>
              {hoveredTerritory.level && (
                <div className="text-gray-300 flex justify-between">
                  <span>Level:</span>
                  <span className="text-neon-yellow">
                    {hoveredTerritory.level}
                  </span>
                </div>
              )}
              <div className="text-gray-300 flex justify-between">
                <span>Status:</span>
                <span
                  className={
                    hoveredTerritory.status === "contested"
                      ? "text-neon-pink"
                      : "text-neon-green"
                  }
                >
                  {hoveredTerritory.status}
                </span>
              </div>
              <div className="text-gray-300 flex justify-between">
                <span>Owner:</span>
                <span
                  className={
                    hoveredTerritory.owner === "player"
                      ? "text-neon-blue"
                      : hoveredTerritory.owner === "rival"
                      ? "text-neon-pink"
                      : "text-neon-green"
                  }
                >
                  {hoveredTerritory.owner === "player"
                    ? "You"
                    : hoveredTerritory.owner === "rival"
                    ? "Rival Syndicate"
                    : "Neutral"}
                </span>
              </div>
              {hoveredTerritory.resources &&
                hoveredTerritory.resources.length > 0 && (
                  <div className="mt-2 border-t border-gray-700 pt-2">
                    <div className="text-gray-300 mb-1">Resources:</div>
                    <div className="flex flex-wrap gap-1">
                      {hoveredTerritory.resources.map(
                        (resource: string, index: number) => (
                          <div
                            key={index}
                            className="bg-dark-blue px-1.5 py-0.5 rounded border border-neon-green"
                          >
                            <span>
                              {getResourceIcon(resource)} {resource}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              <div className="text-gray-400 mt-2 text-xs italic">
                Click to select
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Game Info */}
        <div className="md:w-80 bg-dark-gray bg-opacity-90 border-t md:border-t-0 md:border-l border-neon-blue overflow-y-auto">
          {/* Territory Info Panel */}
          {selectedTerritory ? (
            <div className="p-4 border-b border-neon-blue">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-cyber text-neon-blue">
                  {selectedTerritory.name}
                </h3>
                <button
                  onClick={() => setSelectedTerritory(null)}
                  className="text-neon-blue hover:text-neon-pink"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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

              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="ml-2 text-neon-green">
                    {selectedTerritory.type}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`ml-2 ${
                      selectedTerritory.status === "contested"
                        ? "text-neon-pink"
                        : "text-neon-green"
                    }`}
                  >
                    {selectedTerritory.status}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">Owner:</span>
                  <span
                    className={`ml-2 ${
                      selectedTerritory.owner === "player"
                        ? "text-neon-blue"
                        : selectedTerritory.owner === "rival"
                        ? "text-neon-pink"
                        : "text-neon-green"
                    }`}
                  >
                    {selectedTerritory.owner === "player"
                      ? "You"
                      : selectedTerritory.owner === "rival"
                      ? "Rival Syndicate"
                      : "Neutral"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">Resources:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedTerritory.resources.map((resource, index) => (
                      <div
                        key={index}
                        className="bg-dark-blue p-1 rounded border border-neon-green"
                      >
                        <span>
                          {getResourceIcon(resource)} {resource}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex flex-col gap-2">
                  {selectedTerritory.owner === "player" ? (
                    <>
                      <button
                        onClick={() => extractResources(selectedTerritory.id)}
                        className="w-full p-2 bg-neon-green bg-opacity-20 border border-neon-green text-neon-green hover:bg-opacity-30 transition-colors rounded"
                      >
                        Extract Resources
                      </button>
                      <button
                        onClick={() => handleAgentDeployment()}
                        className="w-full p-2 bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30 transition-colors rounded"
                      >
                        Deploy Agent
                      </button>
                    </>
                  ) : selectedTerritory.owner === "neutral" ? (
                    <button
                      onClick={() => handleClaimTerritory()}
                      className="w-full p-2 bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30 transition-colors rounded"
                    >
                      Claim Territory
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAttackTerritory()}
                      className="w-full p-2 bg-neon-pink bg-opacity-20 border border-neon-pink text-neon-pink hover:bg-opacity-30 transition-colors rounded"
                    >
                      Attack Territory
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center border-b border-neon-blue">
              <p className="text-gray-400">
                Select a territory to view details
              </p>
            </div>
          )}

          {/* Game Events Feed */}
          <div className="p-4">
            <h3 className="text-lg font-cyber text-neon-purple mb-3">
              Recent Events
            </h3>
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
              {gameEvents.length > 0 ? (
                gameEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-2 border-l-4 ${
                      event.type === "territory_attack" ||
                      event.type === "alliance_offer"
                        ? "border-neon-pink bg-neon-pink bg-opacity-10"
                        : event.type === "resource_extract"
                        ? "border-neon-green bg-neon-green bg-opacity-10"
                        : "border-neon-blue bg-neon-blue bg-opacity-10"
                    } text-sm`}
                  >
                    <div className="flex justify-between">
                      <span className="text-light-gray">{event.message}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No recent events</p>
              )}
            </div>
          </div>

          {/* Agent Info */}
          {selectedAgent && (
            <div className="p-4 border-t border-neon-blue">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-cyber text-neon-purple">
                  Agent Details
                </h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-neon-blue hover:text-neon-pink"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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

              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    {getAgentIcon(selectedAgent.type)}
                  </span>
                  <div>
                    <div className="text-neon-blue">{selectedAgent.name}</div>
                    <div className="text-xs text-gray-400">
                      {selectedAgent.type} agent
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400">Location:</span>
                  <span className="ml-2 text-light-gray">
                    {selectedAgent.location}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">Task:</span>
                  <span className="ml-2 text-neon-green">
                    {selectedAgent.task}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`ml-2 ${
                      selectedAgent.status === "active"
                        ? "text-neon-blue"
                        : selectedAgent.status === "deploying"
                        ? "text-neon-yellow"
                        : "text-neon-red"
                    }`}
                  >
                    {selectedAgent.status}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    className="w-full p-2 bg-neon-red bg-opacity-20 border border-neon-red text-neon-red hover:bg-opacity-30 transition-colors rounded font-cyber"
                    onClick={() => handleRecallAgent(selectedAgent.id)}
                    disabled={selectedAgent.status === "recalling"}
                  >
                    {selectedAgent.status === "recalling"
                      ? "Recalling..."
                      : "Recall Agent"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Deployment Modal */}
      {showAgentDeployment && selectedTerritory && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-gray border-2 border-neon-blue rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-cyber text-neon-blue">
                Deploy Agent
              </h3>
              <button
                onClick={() => setShowAgentDeployment(false)}
                className="text-neon-blue hover:text-neon-pink"
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

            <div className="space-y-4">
              <div>
                <label className="block text-light-gray mb-2">
                  Target Territory
                </label>
                <div className="p-2 border border-neon-blue rounded bg-dark-blue">
                  {selectedTerritory.name}
                </div>
              </div>

              <div>
                <label className="block text-light-gray mb-2">Agent Type</label>
                <select
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                  className="w-full p-2 bg-dark-blue border border-neon-blue rounded text-light-gray focus:outline-none focus:ring-2 focus:ring-neon-purple"
                >
                  <option value="scout">
                    Scout (50 credits, 5 data shards)
                  </option>
                  <option value="defense">
                    Defense (100 credits, 10 synthetic alloys)
                  </option>
                  <option value="trader">
                    Trader (150 credits, 5 quantum cores)
                  </option>
                  <option value="resource">
                    Resource (200 credits, 10 data shards, 5 alloys)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-light-gray mb-2">Task</label>
                <select
                  value={agentTask}
                  onChange={(e) => setAgentTask(e.target.value)}
                  className="w-full p-2 bg-dark-blue border border-neon-blue rounded text-light-gray focus:outline-none focus:ring-2 focus:ring-neon-purple"
                >
                  <option value="gather">Gather Intelligence</option>
                  <option value="defend">Defend Territory</option>
                  <option value="sabotage">Sabotage Operations</option>
                  <option value="extract">Extract Resources</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  className="w-full p-3 bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30 transition-colors rounded font-cyber"
                  onClick={() => handleAgentDeployment()}
                >
                  DEPLOY AGENT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMap;
