import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

interface Alliance {
  id: string;
  name: string;
  primaryFaction: string;
  alliedFactions: string[];
  members: {
    playerId: string;
    playerName: string;
    faction: string;
    role: string;
  }[];
  territories: {
    id: number;
    name: string;
    controlledBy: string;
  }[];
  agreements: {
    type: 'trade' | 'defense' | 'attack' | 'resource';
    description: string;
  }[];
  status: 'active' | 'pending' | 'expired';
  createdAt: number;
  expiresAt: number;
}

interface AllianceOffer {
  id: string;
  fromFaction: string;
  fromPlayer: string;
  toFaction: string;
  message: string;
  proposedAgreements: {
    type: 'trade' | 'defense' | 'attack' | 'resource';
    description: string;
  }[];
  createdAt: number;
  expiresAt: number;
}

const AllianceSystem: React.FC = () => {
  const { currentPlayer } = useGame();
  const [activeTab, setActiveTab] = useState<'alliances' | 'offers' | 'create'>('alliances');
  const [selectedAlliance, setSelectedAlliance] = useState<Alliance | null>(null);
  const [newOfferData, setNewOfferData] = useState({
    targetFaction: '',
    message: '',
    agreements: {
      trade: false,
      defense: false,
      attack: false,
      resource: false
    }
  });

  // Mock alliances data
  const alliances: Alliance[] = [
    {
      id: 'alliance1',
      name: 'Cyber Coalition',
      primaryFaction: 'Netrunners',
      alliedFactions: ['Synth Lords'],
      members: [
        {
          playerId: 'player1',
          playerName: 'CyberHawk',
          faction: 'Netrunners',
          role: 'Leader'
        },
        {
          playerId: 'player2',
          playerName: 'DataWraith',
          faction: 'Netrunners',
          role: 'Member'
        },
        {
          playerId: 'player3',
          playerName: 'SynthMaster',
          faction: 'Synth Lords',
          role: 'Representative'
        }
      ],
      territories: [
        {
          id: 1,
          name: 'Neon District',
          controlledBy: 'Netrunners'
        },
        {
          id: 2,
          name: 'Synthetic Valley',
          controlledBy: 'Synth Lords'
        }
      ],
      agreements: [
        {
          type: 'trade',
          description: 'Free trade of resources between alliance members'
        },
        {
          type: 'defense',
          description: 'Mutual defense of territories against rival syndicates'
        }
      ],
      status: 'active',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 23 // 23 days from now
    }
  ];

  // Mock alliance offers
  const allianceOffers: AllianceOffer[] = [
    {
      id: 'offer1',
      fromFaction: 'Chrome Jackals',
      fromPlayer: 'ChromeHunter',
      toFaction: currentPlayer?.faction || 'Netrunners',
      message: 'We propose an alliance to control the eastern territories. Our combat specialists will complement your hackers.',
      proposedAgreements: [
        {
          type: 'defense',
          description: 'Mutual defense of eastern territories'
        },
        {
          type: 'resource',
          description: 'Sharing of quantum cores and synthetic alloys'
        }
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
      expiresAt: Date.now() + 1000 * 60 * 60 * 36 // 36 hours from now
    }
  ];

  const getFactionColor = (faction: string): string => {
    switch (faction) {
      case 'Netrunners':
        return 'text-neon-blue';
      case 'Synth Lords':
        return 'text-neon-purple';
      case 'Chrome Jackals':
        return 'text-neon-pink';
      case 'Quantum Collective':
        return 'text-neon-yellow';
      default:
        return 'text-neon-green';
    }
  };

  const getFactionBgColor = (faction: string): string => {
    switch (faction) {
      case 'Netrunners':
        return 'bg-neon-blue bg-opacity-20 border border-neon-blue';
      case 'Synth Lords':
        return 'bg-neon-purple bg-opacity-20 border border-neon-purple';
      case 'Chrome Jackals':
        return 'bg-neon-pink bg-opacity-20 border border-neon-pink';
      case 'Quantum Collective':
        return 'bg-neon-yellow bg-opacity-20 border border-neon-yellow';
      default:
        return 'bg-neon-green bg-opacity-20 border border-neon-green';
    }
  };

  const getAgreementIcon = (type: string): string => {
    switch (type) {
      case 'trade':
        return '💹';
      case 'defense':
        return '🛡️';
      case 'attack':
        return '⚔️';
      case 'resource':
        return '🔄';
      default:
        return '📜';
    }
  };

  const formatTimeRemaining = (timestamp: number): string => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const handleCreateOffer = () => {
    if (!currentPlayer || !newOfferData.targetFaction || !newOfferData.message) return;
    
    const selectedAgreements = Object.entries(newOfferData.agreements)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => ({
        type: type as 'trade' | 'defense' | 'attack' | 'resource',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} agreement between ${currentPlayer.faction} and ${newOfferData.targetFaction}`
      }));
    
    if (selectedAgreements.length === 0) return;
    
    // In a real implementation, this would send a request to a backend service
    // allianceService.createOffer(currentPlayer.id, newOfferData.targetFaction, newOfferData.message, selectedAgreements);
    
    // Reset form
    setNewOfferData({
      targetFaction: '',
      message: '',
      agreements: {
        trade: false,
        defense: false,
        attack: false,
        resource: false
      }
    });
    
    // Switch to offers tab
    setActiveTab('offers');
  };

  const handleAcceptOffer = (offerId: string) => {
    // In a real implementation, this would send a request to a backend service
    // allianceService.acceptOffer(offerId);
  };

  const handleRejectOffer = (offerId: string) => {
    // In a real implementation, this would send a request to a backend service
    // allianceService.rejectOffer(offerId);
  };

  const renderAlliances = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-3">
          <h3 className="text-neon-blue font-cyber text-sm mb-2">ACTIVE ALLIANCES</h3>
          
          {alliances.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No active alliances. Create or join an alliance to strengthen your syndicate!
            </div>
          ) : (
            alliances.map((alliance) => (
              <div 
                key={alliance.id}
                onClick={() => setSelectedAlliance(alliance)}
                className={`p-3 rounded cursor-pointer transition-all duration-200 ${
                  selectedAlliance?.id === alliance.id
                    ? 'bg-neon-blue bg-opacity-20 border border-neon-blue'
                    : 'bg-dark-blue bg-opacity-30 hover:bg-opacity-40'
                }`}
              >
                <div className="flex justify-between">
                  <h4 className="text-sm font-cyber text-light-gray">{alliance.name}</h4>
                  <div className={`px-2 py-0.5 rounded-full text-xs ${getFactionBgColor(alliance.primaryFaction)}`}>
                    <span className={getFactionColor(alliance.primaryFaction)}>
                      {alliance.primaryFaction}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {alliance.members.length} members
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTimeRemaining(alliance.expiresAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="md:col-span-2 bg-dark-blue bg-opacity-30 rounded">
          {selectedAlliance ? (
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-neon-blue font-cyber text-lg">{selectedAlliance.name}</h3>
                  <div className="flex space-x-2 mt-1">
                    <div className={`px-2 py-0.5 rounded-full text-xs ${getFactionBgColor(selectedAlliance.primaryFaction)}`}>
                      <span className={getFactionColor(selectedAlliance.primaryFaction)}>
                        {selectedAlliance.primaryFaction}
                      </span>
                    </div>
                    {selectedAlliance.alliedFactions.map((faction) => (
                      <div key={faction} className={`px-2 py-0.5 rounded-full text-xs ${getFactionBgColor(faction)}`}>
                        <span className={getFactionColor(faction)}>
                          {faction}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-dark-gray px-2 py-1 rounded text-xs text-light-gray">
                  {formatTimeRemaining(selectedAlliance.expiresAt)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-neon-blue text-sm mb-2">Members</h4>
                  <div className="space-y-2">
                    {selectedAlliance.members.map((member) => (
                      <div key={member.playerId} className="flex justify-between items-center bg-dark-gray p-2 rounded">
                        <div className="flex items-center">
                          <span className={`text-sm ${getFactionColor(member.faction)}`}>{member.playerName}</span>
                          {member.playerId === currentPlayer?.id && (
                            <span className="ml-1 text-neon-green text-xs">(YOU)</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-400 mr-2">{member.role}</span>
                          <span className={`text-xs ${getFactionColor(member.faction)}`}>{member.faction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-neon-blue text-sm mb-2">Territories</h4>
                  <div className="space-y-2">
                    {selectedAlliance.territories.map((territory) => (
                      <div key={territory.id} className="flex justify-between items-center bg-dark-gray p-2 rounded">
                        <span className="text-sm text-light-gray">{territory.name}</span>
                        <span className={`text-xs ${getFactionColor(territory.controlledBy)}`}>
                          {territory.controlledBy}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-neon-blue text-sm mb-2">Alliance Agreements</h4>
                <div className="space-y-2">
                  {selectedAlliance.agreements.map((agreement, index) => (
                    <div key={index} className="bg-dark-gray p-3 rounded">
                      <div className="flex items-center mb-1">
                        <span className="mr-2">{getAgreementIcon(agreement.type)}</span>
                        <span className="text-sm font-cyber text-light-gray">
                          {agreement.type.toUpperCase()} AGREEMENT
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{agreement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="px-3 py-1 rounded font-cyber text-sm bg-neon-blue text-black">
                  EXTEND ALLIANCE
                </button>
                <button className="px-3 py-1 rounded font-cyber text-sm bg-dark-gray text-light-gray border border-light-gray">
                  LEAVE ALLIANCE
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Select an alliance to view details</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOffers = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-neon-blue font-cyber text-sm">ALLIANCE OFFERS</h3>
        
        {allianceOffers.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No pending alliance offers. Create a new offer to form an alliance!
          </div>
        ) : (
          <div className="space-y-4">
            {allianceOffers.map((offer) => (
              <div key={offer.id} className="bg-dark-blue bg-opacity-30 p-4 rounded">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center">
                      <div className={`px-2 py-0.5 rounded-full text-xs ${getFactionBgColor(offer.fromFaction)}`}>
                        <span className={getFactionColor(offer.fromFaction)}>
                          {offer.fromFaction}
                        </span>
                      </div>
                      <span className="mx-2 text-gray-400">→</span>
                      <div className={`px-2 py-0.5 rounded-full text-xs ${getFactionBgColor(offer.toFaction)}`}>
                        <span className={getFactionColor(offer.toFaction)}>
                          {offer.toFaction}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">From: {offer.fromPlayer}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatTimeRemaining(offer.expiresAt)}
                  </div>
                </div>
                
                <div className="bg-dark-gray p-3 rounded mb-3">
                  <p className="text-sm text-light-gray">{offer.message}</p>
                </div>
                
                <div className="mb-3">
                  <h4 className="text-neon-blue text-xs mb-2">Proposed Agreements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {offer.proposedAgreements.map((agreement, index) => (
                      <div key={index} className="bg-dark-gray px-2 py-1 rounded text-xs flex items-center">
                        <span className="mr-1">{getAgreementIcon(agreement.type)}</span>
                        <span className="text-light-gray">{agreement.type.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAcceptOffer(offer.id)}
                    className="px-3 py-1 rounded font-cyber text-xs bg-neon-green text-black"
                  >
                    ACCEPT
                  </button>
                  <button 
                    onClick={() => handleRejectOffer(offer.id)}
                    className="px-3 py-1 rounded font-cyber text-xs bg-neon-pink text-black"
                  >
                    REJECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCreateOffer = () => {
    const availableFactions = ['Netrunners', 'Synth Lords', 'Chrome Jackals', 'Quantum Collective'].filter(
      faction => faction !== currentPlayer?.faction
    );
    
    return (
      <div className="space-y-4">
        <h3 className="text-neon-blue font-cyber text-sm">CREATE ALLIANCE OFFER</h3>
        
        <div className="bg-dark-blue bg-opacity-30 p-4 rounded">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-light-gray block mb-1">Target Faction</label>
              <select
                value={newOfferData.targetFaction}
                onChange={(e) => setNewOfferData({ ...newOfferData, targetFaction: e.target.value })}
                className="w-full bg-dark-gray text-light-gray text-sm p-2 rounded outline-none border border-dark-blue"
              >
                <option value="">Select a faction...</option>
                {availableFactions.map(faction => (
                  <option key={faction} value={faction}>{faction}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-light-gray block mb-1">Message</label>
              <textarea
                value={newOfferData.message}
                onChange={(e) => setNewOfferData({ ...newOfferData, message: e.target.value })}
                placeholder="Explain why this alliance would be beneficial..."
                className="w-full bg-dark-gray text-light-gray text-sm p-2 rounded outline-none border border-dark-blue h-24 resize-none"
              />
            </div>
            
            <div>
              <label className="text-xs text-light-gray block mb-2">Proposed Agreements</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="trade-agreement"
                    checked={newOfferData.agreements.trade}
                    onChange={() => setNewOfferData({
                      ...newOfferData,
                      agreements: {
                        ...newOfferData.agreements,
                        trade: !newOfferData.agreements.trade
                      }
                    })}
                    className="bg-dark-gray border border-neon-blue rounded"
                  />
                  <label htmlFor="trade-agreement" className="text-sm text-light-gray flex items-center">
                    <span className="mr-1">💹</span> Trade
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="defense-agreement"
                    checked={newOfferData.agreements.defense}
                    onChange={() => setNewOfferData({
                      ...newOfferData,
                      agreements: {
                        ...newOfferData.agreements,
                        defense: !newOfferData.agreements.defense
                      }
                    })}
                    className="bg-dark-gray border border-neon-blue rounded"
                  />
                  <label htmlFor="defense-agreement" className="text-sm text-light-gray flex items-center">
                    <span className="mr-1">🛡️</span> Defense
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="attack-agreement"
                    checked={newOfferData.agreements.attack}
                    onChange={() => setNewOfferData({
                      ...newOfferData,
                      agreements: {
                        ...newOfferData.agreements,
                        attack: !newOfferData.agreements.attack
                      }
                    })}
                    className="bg-dark-gray border border-neon-blue rounded"
                  />
                  <label htmlFor="attack-agreement" className="text-sm text-light-gray flex items-center">
                    <span className="mr-1">⚔️</span> Attack
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="resource-agreement"
                    checked={newOfferData.agreements.resource}
                    onChange={() => setNewOfferData({
                      ...newOfferData,
                      agreements: {
                        ...newOfferData.agreements,
                        resource: !newOfferData.agreements.resource
                      }
                    })}
                    className="bg-dark-gray border border-neon-blue rounded"
                  />
                  <label htmlFor="resource-agreement" className="text-sm text-light-gray flex items-center">
                    <span className="mr-1">🔄</span> Resource
                  </label>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCreateOffer}
              disabled={!newOfferData.targetFaction || !newOfferData.message || !Object.values(newOfferData.agreements).some(Boolean)}
              className={`w-full py-2 rounded font-cyber text-sm ${
                newOfferData.targetFaction && newOfferData.message && Object.values(newOfferData.agreements).some(Boolean)
                  ? 'bg-neon-blue text-black'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              SEND ALLIANCE OFFER
            </button>
          </div>
        </div>
        
        <div className="bg-dark-blue bg-opacity-30 p-4 rounded">
          <h4 className="text-neon-blue text-sm mb-3">ALLIANCE BENEFITS</h4>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-neon-green mr-2">💹</span>
              <div>
                <h5 className="text-sm text-light-gray">Trade Agreement</h5>
                <p className="text-xs text-gray-400">Reduced marketplace fees between alliance members and priority access to rare resources.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-neon-blue mr-2">🛡️</span>
              <div>
                <h5 className="text-sm text-light-gray">Defense Agreement</h5>
                <p className="text-xs text-gray-400">Mutual territory defense and automatic reinforcement when territories are attacked.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-neon-pink mr-2">⚔️</span>
              <div>
                <h5 className="text-sm text-light-gray">Attack Agreement</h5>
                <p className="text-xs text-gray-400">Coordinated attacks against rival syndicates with shared intelligence and resources.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-neon-yellow mr-2">🔄</span>
              <div>
                <h5 className="text-sm text-light-gray">Resource Agreement</h5>
                <p className="text-xs text-gray-400">Shared resource pools and production bonuses when working together.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cyber-panel bg-dark-gray p-4">
      <h2 className="text-neon-blue font-cyber text-xl mb-4">ALLIANCE SYSTEM</h2>
      
      <div className="flex border-b border-neon-blue mb-4">
        <button
          className={`px-4 py-2 font-cyber text-sm ${
            activeTab === 'alliances'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('alliances')}
        >
          ALLIANCES
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${
            activeTab === 'offers'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('offers')}
        >
          OFFERS {allianceOffers.length > 0 && <span className="ml-1 bg-neon-pink text-black rounded-full px-1.5 text-xs">{allianceOffers.length}</span>}
        </button>
        <button
          className={`px-4 py-2 font-cyber text-sm ${
            activeTab === 'create'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-light-gray hover:text-neon-blue transition duration-200'
          }`}
          onClick={() => setActiveTab('create')}
        >
          CREATE ALLIANCE
        </button>
      </div>
      
      {activeTab === 'alliances' && renderAlliances()}
      {activeTab === 'offers' && renderOffers()}
      {activeTab === 'create' && renderCreateOffer()}
    </div>
  );
};

export default AllianceSystem;
