import React, { useState } from 'react';

// Mock syndicate data
const mockSyndicates = [
  { id: 1, name: 'DataWraiths', relationship: 'hostile', territory: 'Shadow Market', strength: 75 },
  { id: 2, name: 'CyberHunters', relationship: 'neutral', territory: 'Neon District', strength: 60 },
  { id: 3, name: 'NetStalkers', relationship: 'allied', territory: 'Synthetic Labs', strength: 80 },
  { id: 4, name: 'QuantumVanguard', relationship: 'neutral', territory: 'Quantum Fields', strength: 90 },
  { id: 5, name: 'SiliconSyndicate', relationship: 'hostile', territory: 'Digital Wastes', strength: 65 },
];

// Mock governance proposals
const mockProposals = [
  { 
    id: 1, 
    title: 'Alliance with NetStalkers', 
    description: 'Form a strategic alliance with NetStalkers for mutual defense and resource sharing.',
    votes: { for: 65, against: 35 },
    status: 'active',
    timeRemaining: '12 hours'
  },
  { 
    id: 2, 
    title: 'Expand to Quantum Fields', 
    description: 'Allocate resources to expand our territory into the Quantum Fields region.',
    votes: { for: 80, against: 20 },
    status: 'active',
    timeRemaining: '6 hours'
  },
  { 
    id: 3, 
    title: 'Increase AI Agent Production', 
    description: 'Invest in facilities to increase our AI agent production capacity by 50%.',
    votes: { for: 45, against: 55 },
    status: 'active',
    timeRemaining: '24 hours'
  },
  { 
    id: 4, 
    title: 'Trade Embargo on DataWraiths', 
    description: 'Implement a trade embargo against DataWraiths due to recent hostilities.',
    votes: { for: 70, against: 30 },
    status: 'completed',
    result: 'passed'
  },
];

// Mock missions
const mockMissions = [
  { 
    id: 1, 
    title: 'Infiltrate DataWraiths', 
    type: 'espionage',
    difficulty: 'high',
    rewards: ['1500 Credits', '50 Data Shards', 'Territory Intel'],
    requirements: ['Level 3 Hacker Agent', '2000 Credits Investment'],
    timeToComplete: '8 hours'
  },
  { 
    id: 2, 
    title: 'Secure Supply Routes', 
    type: 'defense',
    difficulty: 'medium',
    rewards: ['800 Credits', '30 Synthetic Alloys', 'Increased Trade Efficiency'],
    requirements: ['Level 2 Defender Agent', '1000 Credits Investment'],
    timeToComplete: '4 hours'
  },
  { 
    id: 3, 
    title: 'Market Manipulation', 
    type: 'economic',
    difficulty: 'medium',
    rewards: ['2000 Credits', 'Market Price Influence', 'Reputation Increase'],
    requirements: ['Level 3 Trader Agent', '3000 Credits Investment'],
    timeToComplete: '12 hours'
  },
];

const StrategicDecisions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diplomacy' | 'governance' | 'missions'>('diplomacy');
  const [selectedSyndicate, setSelectedSyndicate] = useState<number | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [diplomaticAction, setDiplomaticAction] = useState<'alliance' | 'trade' | 'war' | null>(null);
  
  // Function to get color for relationship status
  const getRelationshipColor = (relationship: string): string => {
    switch (relationship) {
      case 'allied':
        return 'text-neon-green';
      case 'neutral':
        return 'text-neon-blue';
      case 'hostile':
        return 'text-neon-pink';
      default:
        return 'text-light-gray';
    }
  };
  
  // Function to get color for mission difficulty
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'low':
        return 'text-neon-green';
      case 'medium':
        return 'text-neon-yellow';
      case 'high':
        return 'text-neon-pink';
      default:
        return 'text-light-gray';
    }
  };
  
  // Function to get color for mission type
  const getMissionTypeColor = (type: string): string => {
    switch (type) {
      case 'espionage':
        return 'text-neon-purple';
      case 'defense':
        return 'text-neon-blue';
      case 'economic':
        return 'text-neon-green';
      default:
        return 'text-light-gray';
    }
  };
  
  return (
    <div className="cyber-panel p-4">
      <h2 className="text-xl font-cyber text-neon-blue mb-4">STRATEGIC DECISIONS</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-neon-blue mb-4">
        <button
          className={`px-4 py-2 font-cyber text-sm ${activeTab === 'diplomacy' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('diplomacy')}
        >
          DIPLOMACY
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${activeTab === 'governance' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('governance')}
        >
          GOVERNANCE
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${activeTab === 'missions' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
          onClick={() => setActiveTab('missions')}
        >
          MISSIONS
        </button>
      </div>
      
      {/* Diplomacy Tab */}
      {activeTab === 'diplomacy' && (
        <div>
          <h3 className="text-sm font-cyber text-neon-purple mb-3">SYNDICATE RELATIONS</h3>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {mockSyndicates.map((syndicate) => (
              <div 
                key={syndicate.id}
                className={`bg-dark-gray p-3 rounded cursor-pointer transition-colors ${
                  selectedSyndicate === syndicate.id ? 'border border-neon-blue' : 'hover:bg-medium-gray'
                }`}
                onClick={() => setSelectedSyndicate(syndicate.id === selectedSyndicate ? null : syndicate.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-cyber text-neon-blue">{syndicate.name}</h4>
                    <div className="text-xs text-light-gray mt-1">
                      Territory: {syndicate.territory}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${getRelationshipColor(syndicate.relationship)}`}>
                      {syndicate.relationship.toUpperCase()}
                    </div>
                    <div className="text-xs text-light-gray">Strength: {syndicate.strength}</div>
                  </div>
                </div>
                
                {selectedSyndicate === syndicate.id && (
                  <div className="mt-3 pt-3 border-t border-neon-blue border-opacity-30">
                    <div className="mb-2">
                      <h4 className="text-xs font-cyber text-neon-purple mb-1">DIPLOMATIC ACTIONS</h4>
                      <div className="flex space-x-2">
                        <button 
                          className={`flex-1 py-1 text-xs ${
                            diplomaticAction === 'alliance' 
                              ? 'bg-neon-green bg-opacity-20 border border-neon-green' 
                              : 'bg-dark-blue hover:bg-neon-blue hover:bg-opacity-20'
                          } transition-colors`}
                          onClick={() => setDiplomaticAction(diplomaticAction === 'alliance' ? null : 'alliance')}
                          disabled={syndicate.relationship === 'hostile'}
                        >
                          Alliance
                        </button>
                        <button 
                          className={`flex-1 py-1 text-xs ${
                            diplomaticAction === 'trade' 
                              ? 'bg-neon-blue bg-opacity-20 border border-neon-blue' 
                              : 'bg-dark-blue hover:bg-neon-blue hover:bg-opacity-20'
                          } transition-colors`}
                          onClick={() => setDiplomaticAction(diplomaticAction === 'trade' ? null : 'trade')}
                          disabled={syndicate.relationship === 'hostile'}
                        >
                          Trade
                        </button>
                        <button 
                          className={`flex-1 py-1 text-xs ${
                            diplomaticAction === 'war' 
                              ? 'bg-neon-pink bg-opacity-20 border border-neon-pink' 
                              : 'bg-dark-blue hover:bg-neon-blue hover:bg-opacity-20'
                          } transition-colors`}
                          onClick={() => setDiplomaticAction(diplomaticAction === 'war' ? null : 'war')}
                          disabled={syndicate.relationship === 'allied'}
                        >
                          War
                        </button>
                      </div>
                    </div>
                    
                    {diplomaticAction && (
                      <div className="bg-dark-blue p-2 rounded">
                        {diplomaticAction === 'alliance' && (
                          <div>
                            <h4 className="text-xs font-cyber text-neon-green mb-1">PROPOSE ALLIANCE</h4>
                            <p className="text-xs text-light-gray mb-2">
                              Forming an alliance with {syndicate.name} will provide mutual defense and resource sharing benefits.
                            </p>
                            <div className="flex space-x-2">
                              <button className="flex-1 py-1 text-xs bg-neon-green bg-opacity-20 border border-neon-green text-neon-green hover:bg-opacity-30 transition-colors">
                                Send Proposal
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {diplomaticAction === 'trade' && (
                          <div>
                            <h4 className="text-xs font-cyber text-neon-blue mb-1">ESTABLISH TRADE</h4>
                            <p className="text-xs text-light-gray mb-2">
                              Establishing trade routes with {syndicate.name} will boost economic growth and resource acquisition.
                            </p>
                            <div className="flex space-x-2">
                              <button className="flex-1 py-1 text-xs bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30 transition-colors">
                                Negotiate Deal
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {diplomaticAction === 'war' && (
                          <div>
                            <h4 className="text-xs font-cyber text-neon-pink mb-1">DECLARE WAR</h4>
                            <p className="text-xs text-light-gray mb-2">
                              Declaring war on {syndicate.name} will allow you to capture their territories but at significant risk.
                            </p>
                            <div className="flex space-x-2">
                              <button className="flex-1 py-1 text-xs bg-neon-pink bg-opacity-20 border border-neon-pink text-neon-pink hover:bg-opacity-30 transition-colors">
                                Declare War
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-dark-blue rounded">
            <h3 className="text-sm font-cyber text-neon-blue mb-2">DIPLOMATIC STATUS</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-neon-green text-lg font-cyber">1</div>
                <div className="text-xs text-light-gray">Alliances</div>
              </div>
              <div>
                <div className="text-neon-blue text-lg font-cyber">2</div>
                <div className="text-xs text-light-gray">Neutral</div>
              </div>
              <div>
                <div className="text-neon-pink text-lg font-cyber">2</div>
                <div className="text-xs text-light-gray">Hostiles</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Governance Tab */}
      {activeTab === 'governance' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-cyber text-neon-purple">ACTIVE PROPOSALS</h3>
            <button className="text-xs text-neon-blue hover:text-neon-purple transition-colors">
              Create Proposal
            </button>
          </div>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {mockProposals
              .filter(proposal => proposal.status === 'active')
              .map((proposal) => (
                <div 
                  key={proposal.id}
                  className={`bg-dark-gray p-3 rounded cursor-pointer transition-colors ${
                    selectedProposal === proposal.id ? 'border border-neon-blue' : 'hover:bg-medium-gray'
                  }`}
                  onClick={() => setSelectedProposal(proposal.id === selectedProposal ? null : proposal.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-cyber text-neon-blue">{proposal.title}</h4>
                      <div className="text-xs text-light-gray mt-1">
                        Time Remaining: {proposal.timeRemaining}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-light-gray">Current Vote</div>
                      <div className="flex items-center space-x-1">
                        <span className="text-neon-green">{proposal.votes.for}%</span>
                        <span>/</span>
                        <span className="text-neon-pink">{proposal.votes.against}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedProposal === proposal.id && (
                    <div className="mt-3 pt-3 border-t border-neon-blue border-opacity-30">
                      <p className="text-xs text-light-gray mb-3">
                        {proposal.description}
                      </p>
                      
                      <div className="mb-3">
                        <div className="text-xs text-light-gray mb-1">Vote Distribution</div>
                        <div className="w-full bg-dark-blue rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-neon-green h-2 rounded-full" 
                            style={{ width: `${proposal.votes.for}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 py-1 text-xs bg-neon-green bg-opacity-20 border border-neon-green text-neon-green hover:bg-opacity-30 transition-colors">
                          Vote For
                        </button>
                        <button className="flex-1 py-1 text-xs bg-neon-pink bg-opacity-20 border border-neon-pink text-neon-pink hover:bg-opacity-30 transition-colors">
                          Vote Against
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            
            <div className="mt-3">
              <h3 className="text-sm font-cyber text-neon-purple mb-2">PAST PROPOSALS</h3>
              {mockProposals
                .filter(proposal => proposal.status === 'completed')
                .map((proposal) => (
                  <div 
                    key={proposal.id}
                    className="bg-dark-gray p-3 rounded mb-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-cyber text-light-gray">{proposal.title}</h4>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs ${proposal.result === 'passed' ? 'text-neon-green' : 'text-neon-pink'}`}>
                          {proposal.result === 'passed' ? 'PASSED' : 'REJECTED'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Missions Tab */}
      {activeTab === 'missions' && (
        <div>
          <h3 className="text-sm font-cyber text-neon-purple mb-3">AVAILABLE MISSIONS</h3>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {mockMissions.map((mission) => (
              <div 
                key={mission.id}
                className={`bg-dark-gray p-3 rounded cursor-pointer transition-colors ${
                  selectedMission === mission.id ? 'border border-neon-blue' : 'hover:bg-medium-gray'
                }`}
                onClick={() => setSelectedMission(mission.id === selectedMission ? null : mission.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-cyber text-neon-blue">{mission.title}</h4>
                    <div className="flex items-center text-xs text-light-gray mt-1">
                      <span className={`mr-2 ${getMissionTypeColor(mission.type)}`}>{mission.type}</span>
                      <span>•</span>
                      <span className={`ml-2 ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty} difficulty
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-light-gray">Time: {mission.timeToComplete}</div>
                  </div>
                </div>
                
                {selectedMission === mission.id && (
                  <div className="mt-3 pt-3 border-t border-neon-blue border-opacity-30">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <h4 className="text-xs font-cyber text-neon-green mb-1">REWARDS</h4>
                        <ul className="text-xs text-light-gray list-disc pl-4 space-y-1">
                          {mission.rewards.map((reward, index) => (
                            <li key={index}>{reward}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-cyber text-neon-pink mb-1">REQUIREMENTS</h4>
                        <ul className="text-xs text-light-gray list-disc pl-4 space-y-1">
                          {mission.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <button className="w-full py-1 text-xs bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30 transition-colors">
                      Launch Mission
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-dark-blue rounded">
            <h3 className="text-sm font-cyber text-neon-yellow mb-2">MISSION STATISTICS</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-neon-green text-lg font-cyber">85%</div>
                <div className="text-xs text-light-gray">Success Rate</div>
              </div>
              <div>
                <div className="text-neon-blue text-lg font-cyber">12</div>
                <div className="text-xs text-light-gray">Completed</div>
              </div>
              <div>
                <div className="text-neon-purple text-lg font-cyber">3</div>
                <div className="text-xs text-light-gray">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategicDecisions;
