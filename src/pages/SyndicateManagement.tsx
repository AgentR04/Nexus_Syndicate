import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AptosWalletConnect from "../components/common/AptosWalletConnect";

// Types
interface Syndicate {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  resources: {
    credits: number;
    influence: number;
  };
  territories: number;
  leader: string;
  isJoined: boolean;
}

interface Member {
  id: number;
  name: string;
  address: string;
  role: string;
  joinedDate: string;
  contribution: number;
  status: "active" | "inactive";
}

const SyndicateManagement: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "mySyndicates" | "allSyndicates" | "createSyndicate"
  >("mySyndicates");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [syndicates, setSyndicates] = useState<Syndicate[]>([]);
  const [mySyndicates, setMySyndicates] = useState<Syndicate[]>([]);
  const [selectedSyndicate, setSelectedSyndicate] = useState<Syndicate | null>(
    null
  );
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteAddress, setInviteAddress] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<string>("member");

  // Form state for creating a new syndicate
  const [newSyndicateName, setNewSyndicateName] = useState<string>("");
  const [newSyndicateDescription, setNewSyndicateDescription] =
    useState<string>("");
  const [isCreatingSyndicate, setIsCreatingSyndicate] =
    useState<boolean>(false);

  // Handle wallet connection
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  // Load syndicates data
  useEffect(() => {
    // Mock data for syndicates
    const mockSyndicates: Syndicate[] = [
      {
        id: 1,
        name: "Neon Shadows",
        description:
          "Elite hackers specializing in data extraction and cyber warfare",
        memberCount: 24,
        resources: {
          credits: 15000,
          influence: 750,
        },
        territories: 3,
        leader: "0x123...abc",
        isJoined: true,
      },
      {
        id: 2,
        name: "Chrome Dragons",
        description: "Mercenary group controlling the eastern districts",
        memberCount: 42,
        resources: {
          credits: 28000,
          influence: 1200,
        },
        territories: 5,
        leader: "0x456...def",
        isJoined: false,
      },
      {
        id: 3,
        name: "Quantum Nexus",
        description: "Tech innovators focused on AI development",
        memberCount: 18,
        resources: {
          credits: 22000,
          influence: 950,
        },
        territories: 2,
        leader: "0x789...ghi",
        isJoined: false,
      },
      {
        id: 4,
        name: "Void Runners",
        description:
          "Smugglers and traders with connections throughout the city",
        memberCount: 31,
        resources: {
          credits: 19500,
          influence: 820,
        },
        territories: 4,
        leader: "0xabc...123",
        isJoined: true,
      },
    ];

    setSyndicates(mockSyndicates);
    setMySyndicates(mockSyndicates.filter((s) => s.isJoined));

    // Mock data for members if a syndicate is selected
    const mockMembers: Member[] = [
      {
        id: 1,
        name: "CyberNinja",
        address: "0x123...abc",
        role: "Leader",
        joinedDate: "2024-12-15",
        contribution: 4500,
        status: "active",
      },
      {
        id: 2,
        name: "DataPhantom",
        address: "0xdef...456",
        role: "Officer",
        joinedDate: "2025-01-03",
        contribution: 3200,
        status: "active",
      },
      {
        id: 3,
        name: "NeonWanderer",
        address: "0x789...ghi",
        role: "Member",
        joinedDate: "2025-01-18",
        contribution: 1800,
        status: "active",
      },
      {
        id: 4,
        name: "QuantumShift",
        address: "0xjkl...012",
        role: "Member",
        joinedDate: "2025-02-05",
        contribution: 2100,
        status: "active",
      },
      {
        id: 5,
        name: "VoidWalker",
        address: "0x345...mno",
        role: "Member",
        joinedDate: "2025-02-22",
        contribution: 1500,
        status: "inactive",
      },
    ];

    setMembers(mockMembers);
  }, []);

  // Filter syndicates based on search term
  const filteredSyndicates =
    activeTab === "mySyndicates"
      ? mySyndicates.filter((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : syndicates.filter((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // Handle joining a syndicate
  const handleJoinSyndicate = (syndicateId: number) => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    // Update syndicate status
    setSyndicates(
      syndicates.map((s) =>
        s.id === syndicateId ? { ...s, isJoined: true } : s
      )
    );

    // Update my syndicates
    const joinedSyndicate = syndicates.find((s) => s.id === syndicateId);
    if (joinedSyndicate) {
      setMySyndicates([
        ...mySyndicates,
        { ...joinedSyndicate, isJoined: true },
      ]);
    }

    alert(
      `Successfully joined syndicate: ${
        syndicates.find((s) => s.id === syndicateId)?.name
      }`
    );
  };

  // Handle leaving a syndicate
  const handleLeaveSyndicate = (syndicateId: number) => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    // Update syndicate status
    setSyndicates(
      syndicates.map((s) =>
        s.id === syndicateId ? { ...s, isJoined: false } : s
      )
    );

    // Update my syndicates
    setMySyndicates(mySyndicates.filter((s) => s.id !== syndicateId));

    // If the selected syndicate is the one being left, deselect it
    if (selectedSyndicate && selectedSyndicate.id === syndicateId) {
      setSelectedSyndicate(null);
    }

    alert(
      `Successfully left syndicate: ${
        syndicates.find((s) => s.id === syndicateId)?.name
      }`
    );
  };

  // Handle viewing syndicate details
  const handleViewSyndicate = (syndicate: Syndicate) => {
    setSelectedSyndicate(syndicate);
  };

  // Handle creating a new syndicate
  const handleCreateSyndicate = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!newSyndicateName.trim()) {
      alert("Please enter a syndicate name");
      return;
    }

    setIsCreatingSyndicate(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create new syndicate
      const newSyndicate: Syndicate = {
        id: syndicates.length + 1,
        name: newSyndicateName,
        description: newSyndicateDescription,
        memberCount: 1,
        resources: {
          credits: 1000,
          influence: 100,
        },
        territories: 0,
        leader: walletAddress,
        isJoined: true,
      };

      // Update syndicates
      setSyndicates([...syndicates, newSyndicate]);
      setMySyndicates([...mySyndicates, newSyndicate]);

      // Reset form
      setNewSyndicateName("");
      setNewSyndicateDescription("");
      setShowCreateModal(false);

      // Select the new syndicate
      setSelectedSyndicate(newSyndicate);
      setActiveTab("mySyndicates");

      alert(`Successfully created syndicate: ${newSyndicateName}`);
    } catch (error) {
      console.error("Error creating syndicate:", error);
      alert("Failed to create syndicate. Please try again.");
    } finally {
      setIsCreatingSyndicate(false);
    }
  };

  // Handle inviting a member
  const handleInviteMember = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!inviteAddress.trim()) {
      alert("Please enter a wallet address");
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update selected syndicate
      if (selectedSyndicate) {
        setSelectedSyndicate({
          ...selectedSyndicate,
          memberCount: selectedSyndicate.memberCount + 1,
        });
      }

      // Reset form
      setInviteAddress("");
      setInviteRole("member");
      setShowInviteModal(false);

      alert(`Successfully invited member: ${inviteAddress}`);
    } catch (error) {
      console.error("Error inviting member:", error);
      alert("Failed to invite member. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-cyber text-neon-purple mb-2">
              SYNDICATE <span className="text-neon-blue">MANAGEMENT</span>
            </h1>
            <p className="text-light-gray font-cyber">
              Create, join, and manage your alliances in the cyberpunk world
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="cyber-button bg-opacity-20 text-glow-blue font-cyber"
            >
              <span className="mr-2">◀</span> Back to Dashboard
            </button>
            <AptosWalletConnect onWalletConnect={handleWalletConnect} />
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Syndicate list */}
          <div className="lg:col-span-1">
            <div className="cyber-panel p-4 h-full">
              {/* Tabs */}
              <div className="flex border-b border-neon-blue mb-4">
                <button
                  className={`marketplace-tab px-4 py-2 font-cyber ${
                    activeTab === "mySyndicates"
                      ? "active text-neon-blue"
                      : "text-light-gray"
                  }`}
                  onClick={() => setActiveTab("mySyndicates")}
                >
                  My Syndicates
                </button>
                <button
                  className={`marketplace-tab px-4 py-2 font-cyber ${
                    activeTab === "allSyndicates"
                      ? "active text-neon-blue"
                      : "text-light-gray"
                  }`}
                  onClick={() => setActiveTab("allSyndicates")}
                >
                  All Syndicates
                </button>
              </div>

              {/* Search and create */}
              <div className="flex mb-4">
                <input
                  type="text"
                  placeholder="Search syndicates..."
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

              {/* Syndicate list */}
              <div className="space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {filteredSyndicates.length > 0 ? (
                  filteredSyndicates.map((syndicate) => (
                    <div
                      key={syndicate.id}
                      className={`cyber-resource-box cursor-pointer transition-all hover:border-neon-purple ${
                        selectedSyndicate?.id === syndicate.id
                          ? "border-neon-purple"
                          : ""
                      }`}
                      onClick={() => setSelectedSyndicate(syndicate)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-cyber text-neon-blue">
                          {syndicate.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-cyber ${
                            syndicate.isJoined
                              ? "bg-neon-green bg-opacity-20 text-neon-green"
                              : "bg-neon-blue bg-opacity-20 text-neon-blue"
                          }`}
                        >
                          {syndicate.isJoined ? "JOINED" : "OPEN"}
                        </span>
                      </div>
                      <p className="text-light-gray text-sm mt-1 line-clamp-2">
                        {syndicate.description}
                      </p>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-neon-purple font-cyber">
                          MEMBERS: {syndicate.memberCount}
                        </span>
                        <span className="text-xs text-light-gray">
                          TERRITORIES: {syndicate.territories}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-light-gray">
                    {activeTab === "mySyndicates"
                      ? "You have not joined any syndicates yet."
                      : "No syndicates found."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel - Syndicate details */}
          <div className="lg:col-span-2">
            {selectedSyndicate ? (
              <div className="cyber-panel p-4 h-full">
                {/* Syndicate header */}
                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-cyber text-neon-purple">
                      {selectedSyndicate.name}
                    </h2>
                    <span
                      className={`text-xs px-2 py-1 rounded font-cyber ${
                        selectedSyndicate.isJoined
                          ? "bg-neon-green bg-opacity-20 text-neon-green"
                          : "bg-neon-blue bg-opacity-20 text-neon-blue"
                      }`}
                    >
                      {selectedSyndicate.isJoined ? "JOINED" : "OPEN"}
                    </span>
                  </div>
                  <p className="text-light-gray mt-2">
                    {selectedSyndicate.description}
                  </p>
                  <div className="flex space-x-4 text-sm text-light-gray mt-4">
                    <span>Leader: {selectedSyndicate.leader}</span>
                    <span>Members: {selectedSyndicate.memberCount}</span>
                    <span>Territories: {selectedSyndicate.territories}</span>
                  </div>
                </div>

                {/* Syndicate stats */}
                <div className="mb-6">
                  <h3 className="text-xl font-cyber text-neon-blue mb-4">
                    SYNDICATE RESOURCES
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="cyber-stat-box">
                      <h4 className="text-sm text-light-gray font-cyber">
                        CREDITS
                      </h4>
                      <p className="text-2xl font-cyber text-neon-green">
                        {selectedSyndicate.resources.credits}
                      </p>
                    </div>
                    <div className="cyber-stat-box">
                      <h4 className="text-sm text-light-gray font-cyber">
                        INFLUENCE
                      </h4>
                      <p className="text-2xl font-cyber text-neon-blue">
                        {selectedSyndicate.resources.influence}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member list */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-cyber text-neon-blue">
                      MEMBERS
                    </h3>
                    {selectedSyndicate.isJoined && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-3 py-1 bg-neon-purple text-dark-blue hover:bg-neon-purple-bright transition-colors rounded text-sm font-cyber"
                      >
                        INVITE
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-neon-blue">
                          <th className="py-2 text-left text-neon-blue font-cyber">
                            NAME
                          </th>
                          <th className="py-2 text-left text-neon-blue font-cyber">
                            ROLE
                          </th>
                          <th className="py-2 text-left text-neon-blue font-cyber">
                            JOINED
                          </th>
                          <th className="py-2 text-left text-neon-blue font-cyber">
                            CONTRIBUTION
                          </th>
                          <th className="py-2 text-left text-neon-blue font-cyber">
                            STATUS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr
                            key={member.id}
                            className="border-b border-dark-gray"
                          >
                            <td className="py-2 text-light-gray">
                              {member.name}
                            </td>
                            <td className="py-2 text-light-gray font-cyber">
                              {member.role.toUpperCase()}
                            </td>
                            <td className="py-2 text-light-gray">
                              {member.joinedDate}
                            </td>
                            <td className="py-2 text-neon-green">
                              {member.contribution}
                            </td>
                            <td className="py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-cyber ${
                                  member.status === "active"
                                    ? "bg-neon-green bg-opacity-20 text-neon-green"
                                    : "bg-neon-red bg-opacity-20 text-neon-red"
                                }`}
                              >
                                {member.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-4 justify-center mt-6">
                  {selectedSyndicate.isJoined ? (
                    <>
                      <button
                        onClick={() =>
                          navigate(`/governance/${selectedSyndicate.id}`)
                        }
                        className="cyber-button bg-neon-blue bg-opacity-20 text-neon-blue font-cyber"
                      >
                        <span className="mr-2">🏛️</span> GOVERNANCE PANEL
                      </button>
                      <button
                        onClick={() =>
                          handleLeaveSyndicate(selectedSyndicate.id)
                        }
                        className="cyber-button bg-neon-red bg-opacity-20 text-neon-red font-cyber"
                      >
                        <span className="mr-2">🚪</span> LEAVE SYNDICATE
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleJoinSyndicate(selectedSyndicate.id)}
                      className="cyber-button bg-neon-green bg-opacity-20 text-neon-green font-cyber"
                    >
                      <span className="mr-2">➕</span> JOIN SYNDICATE
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="cyber-panel p-8 h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-cyber text-neon-blue mb-2">
                  SELECT A SYNDICATE
                </h3>
                <p className="text-light-gray text-center max-w-md">
                  Choose a syndicate from the list to view details, or create a
                  new syndicate to start building your alliance.
                </p>
                <button
                  className="mt-6 cyber-button bg-neon-purple bg-opacity-20 text-neon-purple font-cyber"
                  onClick={() => setShowCreateModal(true)}
                >
                  CREATE NEW SYNDICATE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Syndicate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="cyber-panel p-6 max-w-md w-full modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-neon-purple">
                CREATE <span className="text-neon-blue">SYNDICATE</span>
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neon-blue hover:text-neon-purple transition-colors"
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
                <label className="block text-light-gray mb-1 font-cyber">
                  NAME
                </label>
                <input
                  type="text"
                  className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                  placeholder="Enter syndicate name"
                  value={newSyndicateName}
                  onChange={(e) => setNewSyndicateName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-light-gray mb-1 font-cyber">
                  DESCRIPTION
                </label>
                <textarea
                  className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded custom-scrollbar"
                  placeholder="Enter syndicate description"
                  rows={4}
                  value={newSyndicateDescription}
                  onChange={(e) => setNewSyndicateDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-dark-gray border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-blue transition-colors rounded font-cyber"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleCreateSyndicate}
                  disabled={isCreatingSyndicate}
                  className="px-4 py-2 bg-neon-purple text-dark-blue hover:bg-neon-purple-bright transition-colors rounded font-cyber disabled:opacity-50"
                >
                  {isCreatingSyndicate ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      CREATING...
                    </div>
                  ) : (
                    "CREATE SYNDICATE"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="cyber-panel p-6 max-w-md w-full modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-cyber text-neon-purple">
                INVITE <span className="text-neon-blue">MEMBER</span>
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-neon-blue hover:text-neon-purple transition-colors"
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
                <label className="block text-light-gray mb-1 font-cyber">
                  WALLET ADDRESS
                </label>
                <input
                  type="text"
                  className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                  placeholder="Enter wallet address"
                  value={inviteAddress}
                  onChange={(e) => setInviteAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-light-gray mb-1 font-cyber">
                  ROLE
                </label>
                <select
                  className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="officer">Officer</option>
                </select>
              </div>
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-dark-gray border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-blue transition-colors rounded font-cyber"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleInviteMember}
                  className="px-4 py-2 bg-neon-purple text-dark-blue hover:bg-neon-purple-bright transition-colors rounded font-cyber"
                >
                  SEND INVITE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyndicateManagement;
