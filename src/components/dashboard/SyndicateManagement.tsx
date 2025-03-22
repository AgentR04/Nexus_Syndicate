import React, { useState } from 'react';

// Mock data for territories
const mockTerritories = [
  { id: 1, name: 'Neon District', type: 'urban', status: 'secure', resources: ['credits', 'dataShards'] },
  { id: 2, name: 'Quantum Fields', type: 'research', status: 'contested', resources: ['quantumCores', 'syntheticAlloys'] },
  { id: 3, name: 'Digital Wastes', type: 'industrial', status: 'secure', resources: ['dataShards', 'syntheticAlloys'] },
  { id: 4, name: 'Cyber Nexus', type: 'commercial', status: 'secure', resources: ['credits', 'dataShards'] },
  { id: 5, name: 'Shadow Market', type: 'black-market', status: 'contested', resources: ['credits', 'quantumCores'] },
  { id: 6, name: 'Tech Haven', type: 'residential', status: 'secure', resources: ['dataShards', 'credits'] },
  { id: 7, name: 'Synthetic Labs', type: 'research', status: 'contested', resources: ['syntheticAlloys', 'quantumCores'] },
];

// Mock data for AI agents
const mockAgents = [
  { id: 1, name: 'Scout-X1', type: 'scout', status: 'active', location: 'Neon District', task: 'Gathering intelligence' },
  { id: 2, name: 'Defender-D3', type: 'defense', status: 'active', location: 'Quantum Fields', task: 'Protecting territory' },
  { id: 3, name: 'Trader-T7', type: 'trader', status: 'active', location: 'Cyber Nexus', task: 'Market analysis' },
];

// Mock syndicate activity
const mockActivity = [
  { id: 1, time: '10 min ago', actor: 'DataWraiths', action: 'attacked your territory in Shadow Market', outcome: 'Defense successful' },
  { id: 2, time: '45 min ago', actor: 'CyberHunter', action: 'proposed a trade alliance', outcome: 'Pending response' },
  { id: 3, time: '2 hours ago', actor: 'Your syndicate', action: 'completed resource extraction in Tech Haven', outcome: '+120 Data Shards' },
  { id: 4, time: '5 hours ago', actor: 'NetStalkers', action: 'secured a new territory', outcome: 'Synthetic Labs acquired' },
];

const SyndicateManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'resources' | 'agents' | 'activity'>('map');

  // Function to determine the color of a territory based on its status
  const getTerritoryColor = (status: string): string => {
    switch (status) {
      case 'secure':
        return 'border-neon-green';
      case 'contested':
        return 'border-neon-pink';
      default:
        return 'border-neon-blue';
    }
  };

  // Function to determine the color of an agent based on its type
  const getAgentColor = (type: string): string => {
    switch (type) {
      case 'scout':
        return 'text-neon-blue';
      case 'defense':
        return 'text-neon-purple';
      case 'trader':
        return 'text-neon-green';
      default:
        return 'text-neon-yellow';
    }
  };

  return (
    <div className="cyber-panel p-4">
      <h2 className="text-xl font-cyber text-neon-blue mb-4">SYNDICATE MANAGEMENT</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-neon-blue mb-4">
        <button
          className={`px-4 py-2 font-cyber text-sm ${activeTab === 'map' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('map')}
        >
          TERRITORY MAP
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${activeTab === 'resources' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('resources')}
        >
          RESOURCES
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${activeTab === 'agents' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('agents')}
        >
          AI AGENTS
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${activeTab === 'activity' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('activity')}
        >
          ACTIVITY
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Territory Map */}
        {activeTab === 'map' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-cyber text-neon-purple">CONTROLLED TERRITORIES</h3>
              <div className="flex space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-dark-blue border border-neon-green mr-1"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-dark-blue border border-neon-pink mr-1"></div>
                  <span>Contested</span>
                </div>
              </div>
            </div>
            
            <div className="hex-grid-container">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {mockTerritories.map((territory) => (
                  <div 
                    key={territory.id}
                    className={`hex-territory bg-dark-blue border-2 ${getTerritoryColor(territory.status)} p-2 rounded-lg h-24 flex flex-col justify-between hover:bg-dark-gray transition-colors cursor-pointer`}
                  >
                    <div className="text-xs font-cyber">{territory.name}</div>
                    <div className="text-xs text-light-gray">{territory.type}</div>
                    <div className="flex space-x-1 mt-1">
                      {territory.resources.includes('credits') && (
                        <div className="w-3 h-3 rounded-full bg-neon-blue opacity-70"></div>
                      )}
                      {territory.resources.includes('dataShards') && (
                        <div className="w-3 h-3 rounded-full bg-neon-green opacity-70"></div>
                      )}
                      {territory.resources.includes('syntheticAlloys') && (
                        <div className="w-3 h-3 rounded-full bg-neon-purple opacity-70"></div>
                      )}
                      {territory.resources.includes('quantumCores') && (
                        <div className="w-3 h-3 rounded-full bg-neon-pink opacity-70"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Resource Production */}
        {activeTab === 'resources' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="cyber-panel bg-dark-gray p-3">
                <h3 className="text-sm font-cyber text-neon-green mb-2">RESOURCE PRODUCTION</h3>
                <div className="space-y-3">
                  <div className="resource-bar">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Credits</span>
                      <span>+1,250/hr</span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div className="bg-neon-blue h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  
                  <div className="resource-bar">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Data Shards</span>
                      <span>+85/hr</span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div className="bg-neon-green h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div className="resource-bar">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Synthetic Alloys</span>
                      <span>+12/hr</span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div className="bg-neon-purple h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  
                  <div className="resource-bar">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Quantum Cores</span>
                      <span>+3/hr</span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div className="bg-neon-pink h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="cyber-panel bg-dark-gray p-3">
                <h3 className="text-sm font-cyber text-neon-pink mb-2">RESOURCE CONSUMPTION</h3>
                <div className="space-y-3">
                  <div className="resource-bar">
                    <div className="flex justify-between text-xs mb-1">
                      <span>AI Agent Maintenance</span>
                      <span>-350/hr</span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div className="bg-neon-pink h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  
                  <div className="resource-bar">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Territory Defense</span>
                      <span>-25/hr</span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div className="bg-neon-purple h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div className="resource-bar">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Research & Development</span>
                      <span>-8/hr</span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div className="bg-neon-blue h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div className="resource-bar">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Infrastructure</span>
                      <span>-2/hr</span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2">
                      <div className="bg-neon-green h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-dark-gray rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-cyber text-neon-blue">NET RESOURCE FLOW</h3>
                  <p className="text-xs text-light-gray">Projected growth over next 24 hours</p>
                </div>
                <div className="text-right">
                  <div className="text-neon-blue">+21,600 Credits</div>
                  <div className="text-neon-green">+1,440 Data Shards</div>
                  <div className="text-neon-purple">+96 Synthetic Alloys</div>
                  <div className="text-neon-pink">+24 Quantum Cores</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Agents */}
        {activeTab === 'agents' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-cyber text-neon-purple">ACTIVE AI AGENTS</h3>
              <button className="text-xs text-neon-blue hover:text-neon-purple transition-colors">
                Deploy New Agent
              </button>
            </div>
            
            <div className="space-y-3">
              {mockAgents.map((agent) => (
                <div key={agent.id} className="bg-dark-gray p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full bg-${agent.status === 'active' ? 'neon-green' : 'neon-yellow'} mr-2`}></div>
                      <h4 className={`font-cyber ${getAgentColor(agent.type)}`}>{agent.name}</h4>
                    </div>
                    <div className="text-xs text-light-gray mt-1">
                      {agent.task} in {agent.location}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-xs text-neon-blue hover:text-neon-purple transition-colors">
                      Reassign
                    </button>
                    <button className="text-xs text-neon-blue hover:text-neon-purple transition-colors">
                      Recall
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-dark-gray rounded">
              <h3 className="text-sm font-cyber text-neon-blue mb-2">AGENT PERFORMANCE</h3>
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
                  <div className="text-xs text-light-gray">Territories Secured</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Syndicate Activity */}
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-sm font-cyber text-neon-purple mb-3">RECENT ACTIVITY</h3>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {mockActivity.map((activity) => (
                <div key={activity.id} className="bg-dark-gray p-3 rounded relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue"></div>
                  <div className="pl-2">
                    <div className="text-xs text-light-gray opacity-70">{activity.time}</div>
                    <div className="mt-1">
                      <span className="text-neon-purple">{activity.actor}</span>
                      <span className="text-light-gray"> {activity.action}</span>
                    </div>
                    <div className="text-xs text-neon-green mt-1">{activity.outcome}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyndicateManagement;
