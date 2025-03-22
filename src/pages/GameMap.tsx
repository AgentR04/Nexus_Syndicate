import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AptosWalletConnect from '../components/common/AptosWalletConnect';

// Hex grid utility functions
const hexToPixel = (q: number, r: number, size: number) => {
  const x = size * (3/2 * q);
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
};

// Territory type definition
interface Territory {
  id: number;
  q: number;
  r: number;
  name: string;
  type: string;
  owner: string;
  status: string;
  resources: string[];
}

// Agent type definition
interface Agent {
  id: number;
  name: string;
  type: string;
  status: string;
  location: string;
  task: string;
}

// Mock data for territories
const mockTerritories: Territory[] = [
  { id: 1, q: 0, r: 0, name: 'Neon District', type: 'urban', owner: 'player', status: 'secure', resources: ['credits', 'dataShards'] },
  { id: 2, q: 1, r: -1, name: 'Quantum Fields', type: 'research', owner: 'player', status: 'contested', resources: ['quantumCores', 'syntheticAlloys'] },
  { id: 3, q: 0, r: -1, name: 'Digital Wastes', type: 'industrial', owner: 'player', status: 'secure', resources: ['dataShards', 'syntheticAlloys'] },
  { id: 4, q: -1, r: 0, name: 'Cyber Nexus', type: 'commercial', owner: 'player', status: 'secure', resources: ['credits', 'dataShards'] },
  { id: 5, q: -1, r: 1, name: 'Shadow Market', type: 'black-market', owner: 'rival', status: 'contested', resources: ['credits', 'quantumCores'] },
  { id: 6, q: 0, r: 1, name: 'Tech Haven', type: 'residential', owner: 'neutral', status: 'secure', resources: ['dataShards', 'credits'] },
  { id: 7, q: 1, r: 0, name: 'Synthetic Labs', type: 'research', owner: 'rival', status: 'contested', resources: ['syntheticAlloys', 'quantumCores'] },
  { id: 8, q: 2, r: -2, name: 'Quantum Nexus', type: 'research', owner: 'neutral', status: 'secure', resources: ['quantumCores'] },
  { id: 9, q: 2, r: -1, name: 'Data Haven', type: 'digital', owner: 'neutral', status: 'secure', resources: ['dataShards'] },
  { id: 10, q: 2, r: 0, name: 'Neural Network', type: 'digital', owner: 'rival', status: 'secure', resources: ['dataShards', 'quantumCores'] },
  { id: 11, q: 1, r: 1, name: 'Cybernetic Outpost', type: 'military', owner: 'rival', status: 'secure', resources: ['syntheticAlloys'] },
  { id: 12, q: 0, r: 2, name: 'Neon Wasteland', type: 'industrial', owner: 'neutral', status: 'contested', resources: ['credits', 'syntheticAlloys'] },
  { id: 13, q: -1, r: 2, name: 'Synthetic Forge', type: 'industrial', owner: 'neutral', status: 'secure', resources: ['syntheticAlloys'] },
  { id: 14, q: -2, r: 2, name: 'Credit Exchange', type: 'financial', owner: 'rival', status: 'secure', resources: ['credits'] },
  { id: 15, q: -2, r: 1, name: 'Black Market Hub', type: 'black-market', owner: 'neutral', status: 'contested', resources: ['credits', 'quantumCores'] },
  { id: 16, q: -2, r: 0, name: "Hacker's Den", type: 'digital', owner: 'player', status: 'secure', resources: ['dataShards'] },
  { id: 17, q: -1, r: -1, name: 'Quantum Vault', type: 'financial', owner: 'player', status: 'secure', resources: ['credits', 'quantumCores'] },
  { id: 18, q: 0, r: -2, name: 'Synthetic Research', type: 'research', owner: 'neutral', status: 'secure', resources: ['syntheticAlloys', 'dataShards'] },
  { id: 19, q: 1, r: -2, name: 'Digital Fortress', type: 'military', owner: 'player', status: 'secure', resources: ['dataShards', 'syntheticAlloys'] },
];

// Mock data for AI agents
const mockAgents: Agent[] = [
  { id: 1, name: 'Scout-X1', type: 'scout', status: 'active', location: 'Neon District', task: 'Gathering intelligence' },
  { id: 2, name: 'Defender-D3', type: 'defense', status: 'active', location: 'Quantum Fields', task: 'Protecting territory' },
  { id: 3, name: 'Trader-T7', type: 'trader', status: 'active', location: 'Cyber Nexus', task: 'Market analysis' },
  { id: 4, name: 'Infiltrator-I9', type: 'scout', status: 'moving', location: 'En route to Shadow Market', task: 'Infiltration' },
  { id: 5, name: 'Harvester-H2', type: 'resource', status: 'active', location: 'Digital Wastes', task: 'Resource extraction' },
];

const GameMap: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapOffset, setMapOffset] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [activeOverlay, setActiveOverlay] = useState<string>('ownership');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDeployment, setShowAgentDeployment] = useState<boolean>(false);
  
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };
  
  const handleTerritorySelect = (territory: Territory) => {
    setSelectedTerritory(territory);
  };
  
  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };
  
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 0.2, 0.6));
  };
  
  const handleMapDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    // Implement map dragging functionality
  };
  
  const handleOverlayChange = (overlay: string) => {
    setActiveOverlay(overlay);
  };
  
  const handleAgentDeployment = () => {
    setShowAgentDeployment(!showAgentDeployment);
  };
  
  const getOwnershipColor = (owner: string) => {
    switch(owner) {
      case 'player':
        return 'border-neon-blue';
      case 'rival':
        return 'border-neon-pink';
      default:
        return 'border-neon-green';
    }
  };
  
  const getResourceIcon = (resource: string) => {
    switch(resource) {
      case 'credits':
        return '💰';
      case 'dataShards':
        return '💾';
      case 'syntheticAlloys':
        return '🔩';
      case 'quantumCores':
        return '⚛️';
      default:
        return '❓';
    }
  };
  
  const getAgentIcon = (type: string) => {
    switch(type) {
      case 'scout':
        return '🔍';
      case 'defense':
        return '🛡️';
      case 'trader':
        return '💹';
      case 'resource':
        return '⛏️';
      default:
        return '🤖';
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-blue text-light-gray flex flex-col scrollable-y">
      {/* Header */}
      <div className="bg-dark-gray p-4 border-b border-neon-blue">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-cyber text-neon-blue">NEXUS SYNDICATES: GAME MAP</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-neon-green hover:text-neon-blue transition-colors"
            >
              Back to Dashboard
            </button>
            <AptosWalletConnect onWalletConnect={handleWalletConnect} />
          </div>
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="bg-dark-gray bg-opacity-70 p-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              onClick={handleZoomIn}
              className="p-2 bg-dark-blue border border-neon-blue text-neon-blue hover:bg-neon-blue hover:bg-opacity-20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-2 bg-dark-blue border border-neon-blue text-neon-blue hover:bg-neon-blue hover:bg-opacity-20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => handleOverlayChange('ownership')}
              className={`p-2 border ${activeOverlay === 'ownership' ? 'bg-neon-blue bg-opacity-20 border-neon-blue text-neon-blue' : 'bg-dark-blue border-gray-600 text-gray-400 hover:text-neon-blue'} transition-colors`}
            >
              Ownership
            </button>
            <button 
              onClick={() => handleOverlayChange('resources')}
              className={`p-2 border ${activeOverlay === 'resources' ? 'bg-neon-green bg-opacity-20 border-neon-green text-neon-green' : 'bg-dark-blue border-gray-600 text-gray-400 hover:text-neon-green'} transition-colors`}
            >
              Resources
            </button>
            <button 
              onClick={() => handleOverlayChange('agents')}
              className={`p-2 border ${activeOverlay === 'agents' ? 'bg-neon-purple bg-opacity-20 border-neon-purple text-neon-purple' : 'bg-dark-blue border-gray-600 text-gray-400 hover:text-neon-purple'} transition-colors`}
            >
              Agents
            </button>
          </div>
          
          <button 
            onClick={handleAgentDeployment}
            className="p-2 bg-neon-yellow bg-opacity-20 border border-neon-yellow text-neon-yellow hover:bg-opacity-30 transition-colors"
          >
            Deploy Agent
          </button>
        </div>
      </div>
      
      {/* Main Map Area */}
      <div className="flex-grow relative overflow-hidden scrollable-x">
        <div 
          className="absolute inset-0 scrollable-x scrollable"
          style={{
            transform: `scale(${mapZoom}) translate(${mapOffset.x}px, ${mapOffset.y}px)`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* Hex Grid */}
          <svg width="100%" height="100%" viewBox="-500 -500 1000 1000">
            {/* Grid background */}
            <rect x="-500" y="-500" width="1000" height="1000" fill="#0a0a1b" />
            
            {/* Territories */}
            {mockTerritories.map(territory => {
              const { x, y } = hexToPixel(territory.q, territory.r, 50);
              const ownerColor = territory.owner === 'player' ? '#00ffff' : territory.owner === 'rival' ? '#ff00ff' : '#00ff00';
              
              return (
                <g 
                  key={territory.id} 
                  transform={`translate(${x}, ${y})`}
                  onClick={() => handleTerritorySelect(territory)}
                  style={{ cursor: 'pointer' }}
                >
                  <polygon 
                    points="30,0 15,26 -15,26 -30,0 -15,-26 15,-26" 
                    fill={territory.status === 'contested' ? '#3a2a3a' : '#1a1a2a'} 
                    stroke={ownerColor}
                    strokeWidth="2"
                  />
                  
                  {activeOverlay === 'resources' && (
                    <g>
                      {territory.resources.map((resource, index) => (
                        <text 
                          key={index} 
                          x={index * 15 - 15} 
                          y="5" 
                          fontSize="12"
                          textAnchor="middle"
                        >
                          {getResourceIcon(resource)}
                        </text>
                      ))}
                    </g>
                  )}
                  
                  {activeOverlay === 'ownership' && (
                    <text 
                      x="0" 
                      y="5" 
                      fontSize="10"
                      fill={ownerColor}
                      textAnchor="middle"
                    >
                      {territory.owner === 'player' ? 'YOU' : territory.owner === 'rival' ? 'RIVAL' : 'NEUTRAL'}
                    </text>
                  )}
                  
                  {activeOverlay === 'agents' && mockAgents.some(agent => agent.location === territory.name) && (
                    <g>
                      {mockAgents
                        .filter(agent => agent.location === territory.name)
                        .map((agent, index) => (
                          <text 
                            key={agent.id} 
                            x={index * 15 - 15} 
                            y="5" 
                            fontSize="12"
                            textAnchor="middle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAgentSelect(agent);
                            }}
                          >
                            {getAgentIcon(agent.type)}
                          </text>
                        ))}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Territory Info Panel */}
        {selectedTerritory && (
          <div className="absolute top-4 right-4 cyber-panel p-4 w-80 scrollable max-h-[50vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-cyber text-neon-blue">{selectedTerritory.name}</h3>
              <button 
                onClick={() => setSelectedTerritory(null)}
                className="text-neon-blue hover:text-neon-pink"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="ml-2 text-neon-green">{selectedTerritory.type}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 ${selectedTerritory.status === 'contested' ? 'text-neon-pink' : 'text-neon-green'}`}>
                  {selectedTerritory.status}
                </span>
              </div>
              
              <div>
                <span className="text-gray-400">Owner:</span>
                <span className={`ml-2 ${
                  selectedTerritory.owner === 'player' 
                    ? 'text-neon-blue' 
                    : selectedTerritory.owner === 'rival' 
                      ? 'text-neon-pink' 
                      : 'text-neon-green'
                }`}>
                  {selectedTerritory.owner === 'player' ? 'You' : selectedTerritory.owner === 'rival' ? 'Rival Syndicate' : 'Neutral'}
                </span>
              </div>
              
              <div>
                <span className="text-gray-400">Resources:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedTerritory.resources.map(resource => (
                    <span 
                      key={resource} 
                      className="px-2 py-1 bg-dark-blue border border-neon-green text-neon-green text-xs rounded"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-700 flex space-x-2">
                {selectedTerritory.owner === 'player' ? (
                  <>
                    <button className="cyber-button-small bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30">
                      Deploy Agent
                    </button>
                    <button className="cyber-button-small bg-neon-green bg-opacity-20 border border-neon-green text-neon-green hover:bg-opacity-30">
                      Extract Resources
                    </button>
                  </>
                ) : selectedTerritory.owner === 'neutral' ? (
                  <button className="cyber-button-small w-full bg-neon-purple bg-opacity-20 border border-neon-purple text-neon-purple hover:bg-opacity-30">
                    Claim Territory
                  </button>
                ) : (
                  <button className="cyber-button-small w-full bg-neon-pink bg-opacity-20 border border-neon-pink text-neon-pink hover:bg-opacity-30">
                    Attack Territory
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Agent Info Panel */}
        {selectedAgent && (
          <div className="absolute bottom-4 left-4 cyber-panel p-4 w-80 scrollable max-h-[50vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-cyber text-neon-purple">{selectedAgent.name}</h3>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="text-neon-blue hover:text-neon-pink"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="ml-2 text-neon-green">{selectedAgent.type}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Status:</span>
                <span className="ml-2 text-neon-blue">{selectedAgent.status}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Location:</span>
                <span className="ml-2 text-neon-yellow">{selectedAgent.location}</span>
              </div>
              
              <div>
                <span className="text-gray-400">Current Task:</span>
                <span className="ml-2 text-neon-green">{selectedAgent.task}</span>
              </div>
              
              <div className="pt-3 border-t border-gray-700 flex space-x-2">
                <button className="cyber-button-small bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30">
                  Reassign
                </button>
                <button className="cyber-button-small bg-neon-green bg-opacity-20 border border-neon-green text-neon-green hover:bg-opacity-30">
                  Upgrade
                </button>
                <button className="cyber-button-small bg-neon-pink bg-opacity-20 border border-neon-pink text-neon-pink hover:bg-opacity-30">
                  Recall
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Agent Deployment Modal */}
      {showAgentDeployment && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center">
          <div className="cyber-panel max-w-2xl w-full max-h-[80vh] modal-content p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-neon-purple">DEPLOY AGENT</h2>
              <button 
                onClick={handleAgentDeployment}
                className="text-neon-blue hover:text-neon-pink"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="scrollable">
              {/* Agent deployment form would go here */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">Agent Type</label>
                  <select className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded">
                    <option value="scout">Scout</option>
                    <option value="defense">Defense</option>
                    <option value="trader">Trader</option>
                    <option value="resource">Resource Extractor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">Target Territory</label>
                  <select className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded">
                    {mockTerritories
                      .filter(t => t.owner === 'player')
                      .map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">Primary Task</label>
                  <select className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded">
                    <option value="gather">Gather Intelligence</option>
                    <option value="defend">Defend Territory</option>
                    <option value="trade">Establish Trade Routes</option>
                    <option value="extract">Extract Resources</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button 
                    className="cyber-button bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30"
                    onClick={handleAgentDeployment}
                  >
                    Deploy Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMap;
