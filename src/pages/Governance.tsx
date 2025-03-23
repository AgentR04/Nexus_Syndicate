import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AptosWalletConnect from '../components/common/AptosWalletConnect';

// Types
interface Proposal {
  id: number;
  title: string;
  description: string;
  creator: string;
  createdAt: string;
  endTime: string;
  status: 'active' | 'passed' | 'rejected';
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  category: 'resource' | 'territory' | 'alliance' | 'other';
  hasVoted: boolean | null;
}

interface SyndicateInfo {
  id: number;
  name: string;
  memberCount: number;
}

const Governance: React.FC = () => {
  const navigate = useNavigate();
  const { syndicateId } = useParams<{ syndicateId: string }>();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [syndicateInfo, setSyndicateInfo] = useState<SyndicateInfo | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showVoteModal, setShowVoteModal] = useState<boolean>(false);
  const [voteType, setVoteType] = useState<'for' | 'against' | 'abstain'>('for');
  
  // Form state for creating a new proposal
  const [newProposalTitle, setNewProposalTitle] = useState<string>('');
  const [newProposalDescription, setNewProposalDescription] = useState<string>('');
  const [newProposalCategory, setNewProposalCategory] = useState<'resource' | 'territory' | 'alliance' | 'other'>('resource');
  const [newProposalDuration, setNewProposalDuration] = useState<number>(3);
  const [isCreatingProposal, setIsCreatingProposal] = useState<boolean>(false);
  
  // Handle wallet connection
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };
  
  // Load proposals data
  useEffect(() => {
    // Mock data for proposals
    const mockProposals: Proposal[] = [
      {
        id: 1,
        title: 'Allocate 5000 credits for new territory acquisition',
        description: 'This proposal aims to allocate 5000 credits from our treasury to acquire new territory in the eastern district. The territory has strategic value due to its proximity to resource nodes.',
        creator: '0x123...abc',
        createdAt: '2025-03-20',
        endTime: '2025-03-25',
        status: 'active',
        votesFor: 15,
        votesAgainst: 5,
        votesAbstain: 2,
        category: 'territory',
        hasVoted: null
      },
      {
        id: 2,
        title: 'Form alliance with Chrome Dragons',
        description: 'Proposal to form a strategic alliance with Chrome Dragons syndicate to secure mutual protection and resource sharing in the northern sectors.',
        creator: '0xdef...456',
        createdAt: '2025-03-18',
        endTime: '2025-03-23',
        status: 'active',
        votesFor: 12,
        votesAgainst: 8,
        votesAbstain: 1,
        category: 'alliance',
        hasVoted: true
      },
      {
        id: 3,
        title: 'Invest in advanced hacking tools',
        description: 'Proposal to invest 3000 credits in acquiring advanced hacking tools to improve our data extraction capabilities and increase our influence in the digital realm.',
        creator: '0x789...ghi',
        createdAt: '2025-03-15',
        endTime: '2025-03-20',
        status: 'passed',
        votesFor: 18,
        votesAgainst: 3,
        votesAbstain: 0,
        category: 'resource',
        hasVoted: false
      },
      {
        id: 4,
        title: 'Recruit specialized AI developers',
        description: 'Proposal to allocate resources for recruiting specialized AI developers to enhance our technological capabilities and develop proprietary algorithms.',
        creator: '0xjkl...012',
        createdAt: '2025-03-10',
        endTime: '2025-03-15',
        status: 'rejected',
        votesFor: 7,
        votesAgainst: 12,
        votesAbstain: 3,
        category: 'other',
        hasVoted: true
      }
    ];
    
    setProposals(mockProposals);
    
    // Mock syndicate info
    setSyndicateInfo({
      id: parseInt(syndicateId || '1'),
      name: 'Neon Shadows',
      memberCount: 24
    });
  }, [syndicateId]);
  
  // Filter proposals based on active tab and search term
  useEffect(() => {
    const filtered = proposals.filter(p => {
      const matchesTab = activeTab === 'active' 
        ? p.status === 'active' 
        : p.status === 'passed' || p.status === 'rejected';
      
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
    
    setFilteredProposals(filtered);
  }, [activeTab, searchTerm, proposals]);
  
  // Handle creating a new proposal
  const handleCreateProposal = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!newProposalTitle.trim()) {
      alert('Please enter a proposal title');
      return;
    }
    
    setIsCreatingProposal(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate end date (days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + newProposalDuration);
      
      // Create new proposal
      const newProposal: Proposal = {
        id: proposals.length + 1,
        title: newProposalTitle,
        description: newProposalDescription,
        creator: walletAddress,
        createdAt: new Date().toISOString().split('T')[0],
        endTime: endDate.toISOString().split('T')[0],
        status: 'active',
        votesFor: 1, // Creator's vote
        votesAgainst: 0,
        votesAbstain: 0,
        category: newProposalCategory,
        hasVoted: true
      };
      
      // Update proposals
      setProposals([newProposal, ...proposals]);
      
      // Reset form
      setNewProposalTitle('');
      setNewProposalDescription('');
      setNewProposalCategory('resource');
      setNewProposalDuration(3);
      setShowCreateModal(false);
      
      // Select the new proposal
      setSelectedProposal(newProposal);
      setActiveTab('active');
      
      alert(`Successfully created proposal: ${newProposalTitle}`);
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setIsCreatingProposal(false);
    }
  };
  
  // Handle voting on a proposal
  const handleVote = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!selectedProposal) {
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update proposal votes
      const updatedProposals = proposals.map(p => {
        if (p.id === selectedProposal.id) {
          const updatedProposal = { ...p, hasVoted: true };
          
          if (voteType === 'for') {
            updatedProposal.votesFor += 1;
          } else if (voteType === 'against') {
            updatedProposal.votesAgainst += 1;
          } else {
            updatedProposal.votesAbstain += 1;
          }
          
          return updatedProposal;
        }
        return p;
      });
      
      setProposals(updatedProposals);
      setSelectedProposal({
        ...selectedProposal,
        hasVoted: true,
        votesFor: voteType === 'for' ? selectedProposal.votesFor + 1 : selectedProposal.votesFor,
        votesAgainst: voteType === 'against' ? selectedProposal.votesAgainst + 1 : selectedProposal.votesAgainst,
        votesAbstain: voteType === 'abstain' ? selectedProposal.votesAbstain + 1 : selectedProposal.votesAbstain
      });
      
      setShowVoteModal(false);
      
      alert(`Successfully voted ${voteType} proposal: ${selectedProposal.title}`);
    } catch (error) {
      console.error('Error voting on proposal:', error);
      alert('Failed to vote on proposal. Please try again.');
    }
  };
  
  // Calculate vote percentages
  const calculateVotePercentage = (proposal: Proposal) => {
    const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
    if (totalVotes === 0) return { for: 0, against: 0, abstain: 0 };
    
    return {
      for: Math.round((proposal.votesFor / totalVotes) * 100),
      against: Math.round((proposal.votesAgainst / totalVotes) * 100),
      abstain: Math.round((proposal.votesAbstain / totalVotes) * 100)
    };
  };
  
  return (
    <div className="min-h-screen bg-dark-blue p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-cyber text-neon-purple mb-2">
              GOVERNANCE <span className="text-neon-blue">PANEL</span>
            </h1>
            {syndicateInfo && (
              <p className="text-light-gray">
                Syndicate: <span className="text-neon-blue">{syndicateInfo.name}</span> | 
                Members: <span className="text-neon-green">{syndicateInfo.memberCount}</span>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button 
              onClick={() => navigate('/syndicate-management')}
              className="cyber-button bg-opacity-20 text-glow-blue"
            >
              <span className="mr-2">◀</span> Back to Syndicates
            </button>
            <AptosWalletConnect onWalletConnect={handleWalletConnect} />
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Proposal list */}
          <div className="lg:col-span-1">
            <div className="cyber-panel p-4 h-full">
              {/* Tabs */}
              <div className="flex border-b border-neon-blue mb-4">
                <button
                  className={`marketplace-tab px-4 py-2 ${activeTab === 'active' ? 'active text-neon-blue' : 'text-light-gray'}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active Proposals
                </button>
                <button
                  className={`marketplace-tab px-4 py-2 ${activeTab === 'past' ? 'active text-neon-blue' : 'text-light-gray'}`}
                  onClick={() => setActiveTab('past')}
                >
                  Past Proposals
                </button>
              </div>
              
              {/* Search and create */}
              <div className="flex mb-4">
                <input
                  type="text"
                  placeholder="Search proposals..."
                  className="flex-grow p-2 bg-dark-gray border border-neon-blue text-light-gray rounded-l"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="px-4 py-2 bg-neon-purple text-dark-blue hover:bg-neon-purple-bright transition-colors rounded-r font-cyber"
                  onClick={() => setShowCreateModal(true)}
                >
                  NEW
                </button>
              </div>
              
              {/* Proposal list */}
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                {filteredProposals.length > 0 ? (
                  filteredProposals.map(proposal => (
                    <div
                      key={proposal.id}
                      className={`cyber-resource-box cursor-pointer transition-all ${selectedProposal?.id === proposal.id ? 'border-neon-purple' : ''}`}
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-cyber text-neon-blue truncate">{proposal.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          proposal.status === 'active' 
                            ? 'bg-neon-blue bg-opacity-20 text-neon-blue' 
                            : proposal.status === 'passed'
                              ? 'bg-neon-green bg-opacity-20 text-neon-green'
                              : 'bg-neon-red bg-opacity-20 text-neon-red'
                        }`}>
                          {proposal.status}
                        </span>
                      </div>
                      <p className="text-light-gray text-sm mt-1 line-clamp-2">{proposal.description}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-neon-purple">{proposal.category}</span>
                        <span className="text-xs text-light-gray">
                          {proposal.status === 'active' 
                            ? `Ends: ${proposal.endTime}` 
                            : `Ended: ${proposal.endTime}`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-light-gray">
                    {activeTab === 'active' ? 'No active proposals found.' : 'No past proposals found.'}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right panel - Proposal details */}
          <div className="lg:col-span-2">
            {selectedProposal ? (
              <div className="cyber-panel p-4 h-full">
                {/* Proposal header */}
                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-cyber text-neon-purple">{selectedProposal.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded ${
                      selectedProposal.status === 'active' 
                        ? 'bg-neon-blue bg-opacity-20 text-neon-blue' 
                        : selectedProposal.status === 'passed'
                          ? 'bg-neon-green bg-opacity-20 text-neon-green'
                          : 'bg-neon-red bg-opacity-20 text-neon-red'
                    }`}>
                      {selectedProposal.status}
                    </span>
                  </div>
                  <div className="flex space-x-4 text-sm text-light-gray mt-2">
                    <span>Created by: {selectedProposal.creator}</span>
                    <span>Date: {selectedProposal.createdAt}</span>
                    <span>Category: <span className="text-neon-purple">{selectedProposal.category}</span></span>
                  </div>
                  <p className="text-light-gray mt-4">{selectedProposal.description}</p>
                </div>
                
                {/* Voting stats */}
                <div className="mb-6">
                  <h3 className="text-xl font-cyber text-neon-blue mb-4">Voting Results</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="cyber-stat-box">
                      <h4 className="text-sm text-light-gray">For</h4>
                      <p className="text-2xl font-cyber text-neon-green">{selectedProposal.votesFor}</p>
                    </div>
                    <div className="cyber-stat-box">
                      <h4 className="text-sm text-light-gray">Against</h4>
                      <p className="text-2xl font-cyber text-neon-red">{selectedProposal.votesAgainst}</p>
                    </div>
                    <div className="cyber-stat-box">
                      <h4 className="text-sm text-light-gray">Abstain</h4>
                      <p className="text-2xl font-cyber text-neon-blue">{selectedProposal.votesAbstain}</p>
                    </div>
                  </div>
                  
                  {/* Progress bars */}
                  <div className="space-y-2">
                    {(() => {
                      const percentages = calculateVotePercentage(selectedProposal);
                      return (
                        <>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-neon-green">For</span>
                              <span className="text-light-gray">{percentages.for}%</span>
                            </div>
                            <div className="w-full bg-dark-gray rounded-full h-2">
                              <div 
                                className="bg-neon-green h-2 rounded-full" 
                                style={{ width: `${percentages.for}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-neon-red">Against</span>
                              <span className="text-light-gray">{percentages.against}%</span>
                            </div>
                            <div className="w-full bg-dark-gray rounded-full h-2">
                              <div 
                                className="bg-neon-red h-2 rounded-full" 
                                style={{ width: `${percentages.against}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-neon-blue">Abstain</span>
                              <span className="text-light-gray">{percentages.abstain}%</span>
                            </div>
                            <div className="w-full bg-dark-gray rounded-full h-2">
                              <div 
                                className="bg-neon-blue h-2 rounded-full" 
                                style={{ width: `${percentages.abstain}%` }}
                              ></div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Vote button */}
                {selectedProposal.status === 'active' && selectedProposal.hasVoted !== true && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setShowVoteModal(true)}
                      className="cyber-button bg-neon-purple bg-opacity-20 text-neon-purple"
                    >
                      <span className="mr-2">🗳️</span> Cast Your Vote
                    </button>
                  </div>
                )}
                
                {selectedProposal.status === 'active' && selectedProposal.hasVoted === true && (
                  <div className="mt-6 text-center">
                    <p className="text-neon-green">You have already voted on this proposal</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="cyber-panel p-8 h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🗳️</div>
                <h3 className="text-xl font-cyber text-neon-blue mb-2">Select a Proposal</h3>
                <p className="text-light-gray text-center max-w-md">
                  Choose a proposal from the list to view details, or create a new proposal to influence the direction of your syndicate.
                </p>
                <button
                  className="mt-6 cyber-button bg-neon-purple bg-opacity-20 text-neon-purple"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create New Proposal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="cyber-panel p-6 max-w-md w-full modal-content">
            <h2 className="text-2xl font-cyber text-neon-purple mb-4">
              CREATE <span className="text-neon-blue">PROPOSAL</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-light-gray mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                  placeholder="Enter proposal title"
                  value={newProposalTitle}
                  onChange={(e) => setNewProposalTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-light-gray mb-1">Description</label>
                <textarea 
                  className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                  placeholder="Enter proposal description"
                  rows={4}
                  value={newProposalDescription}
                  onChange={(e) => setNewProposalDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-light-gray mb-1">Category</label>
                  <select 
                    className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                    value={newProposalCategory}
                    onChange={(e) => setNewProposalCategory(e.target.value as any)}
                  >
                    <option value="resource">Resource</option>
                    <option value="territory">Territory</option>
                    <option value="alliance">Alliance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-light-gray mb-1">Duration (days)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                    min={1}
                    max={14}
                    value={newProposalDuration}
                    onChange={(e) => setNewProposalDuration(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-dark-gray border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-blue transition-colors rounded font-cyber"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleCreateProposal}
                  disabled={isCreatingProposal}
                  className="px-4 py-2 bg-neon-purple text-dark-blue hover:bg-neon-purple-bright transition-colors rounded font-cyber disabled:opacity-50"
                >
                  {isCreatingProposal ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      CREATING...
                    </div>
                  ) : 'CREATE PROPOSAL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Vote Modal */}
      {showVoteModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="cyber-panel p-6 max-w-md w-full modal-content">
            <h2 className="text-2xl font-cyber text-neon-purple mb-4">
              CAST <span className="text-neon-blue">VOTE</span>
            </h2>
            <div className="mb-4">
              <h3 className="text-xl text-neon-blue">{selectedProposal.title}</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-light-gray mb-2">Select your vote:</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="vote-for" 
                      name="vote" 
                      className="mr-2" 
                      checked={voteType === 'for'}
                      onChange={() => setVoteType('for')}
                    />
                    <label htmlFor="vote-for" className="text-neon-green">Vote For</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="vote-against" 
                      name="vote" 
                      className="mr-2" 
                      checked={voteType === 'against'}
                      onChange={() => setVoteType('against')}
                    />
                    <label htmlFor="vote-against" className="text-neon-red">Vote Against</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="vote-abstain" 
                      name="vote" 
                      className="mr-2" 
                      checked={voteType === 'abstain'}
                      onChange={() => setVoteType('abstain')}
                    />
                    <label htmlFor="vote-abstain" className="text-neon-blue">Abstain</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setShowVoteModal(false)}
                  className="px-4 py-2 bg-dark-gray border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-blue transition-colors rounded font-cyber"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleVote}
                  className="px-4 py-2 bg-neon-purple text-dark-blue hover:bg-neon-purple-bright transition-colors rounded font-cyber"
                >
                  SUBMIT VOTE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Governance;
