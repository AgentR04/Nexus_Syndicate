import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AptosWalletConnect from "../components/common/AptosWalletConnect";
import ImageWithFallback from "../components/common/ImageWithFallback";
import {
  buyNFT,
  buyResource,
  sellNFT,
  sellResource,
  checkTransaction,
} from "../utils/aptosUtils";
import toast from "react-hot-toast";
import { updateUserResource } from "../utils/resourceUtils";
import authService from "../services/authService";

// Mock data for resources
const resourcesData = [
  {
    id: 1,
    name: "Credits",
    icon: "💰",
    price: 0.05,
    available: 15000,
    type: "resource",
  },
  {
    id: 2,
    name: "Data Shards",
    icon: "💾",
    price: 0.1,
    available: 8500,
    type: "resource",
  },
  {
    id: 3,
    name: "Quantum Cores",
    icon: "⚛️",
    price: 0.5,
    available: 250,
    type: "resource",
  },
  {
    id: 4,
    name: "Synthetic Alloys",
    icon: "🔋",
    price: 0.2,
    available: 1200,
    type: "resource",
  },
  {
    id: 5,
    name: "Neural Processors",
    icon: "🧠",
    price: 0.8,
    available: 180,
    type: "resource",
  },
  {
    id: 6,
    name: "Influence Tokens",
    icon: "🌐",
    price: 0.3,
    available: 3000,
    type: "resource",
  },
];

// Mock data for NFTs
const nftsData = [
  {
    id: 101,
    name: "Cyber Samurai",
    image: "/images/nfts/agent1.png",
    price: 2.5,
    rarity: "Legendary",
    owner: "0x1a2b...3c4d",
    description:
      "A legendary cyber samurai agent with enhanced combat abilities",
    type: "nft",
    category: "agent",
  },
  {
    id: 102,
    name: "Quantum Hacker",
    image: "/images/nfts/agent2.png",
    price: 1.8,
    rarity: "Epic",
    owner: "0x5e6f...7g8h",
    description:
      "An elite hacker agent specialized in breaching secure systems",
    type: "nft",
    category: "agent",
  },
  {
    id: 103,
    name: "Neon District",
    image: "/images/nfts/territory1.png",
    price: 5.0,
    rarity: "Legendary",
    owner: "0x9i0j...1k2l",
    description: "A prime territory in the heart of the cyberpunk city",
    type: "nft",
    category: "territory",
  },
  {
    id: 104,
    name: "Tech Haven",
    image: "/images/nfts/territory2.png",
    price: 3.2,
    rarity: "Epic",
    owner: "0x3m4n...5o6p",
    description:
      "A resource-rich territory with advanced technological infrastructure",
    type: "nft",
    category: "territory",
  },
  {
    id: 105,
    name: "Neural Implant",
    image: "/images/nfts/equipment1.png",
    price: 1.5,
    rarity: "Rare",
    owner: "0x7q8r...9s0t",
    description: "An advanced neural implant that enhances agent capabilities",
    type: "nft",
    category: "equipment",
  },
  {
    id: 106,
    name: "Quantum Shield",
    image: "/images/nfts/equipment2.png",
    price: 1.2,
    rarity: "Rare",
    owner: "0x1u2v...3w4x",
    description:
      "A defensive equipment that provides protection against cyber attacks",
    type: "nft",
    category: "equipment",
  },
];

// Transaction status interface
interface TransactionStatus {
  hash: string;
  status: "pending" | "success" | "failed";
  timestamp: number;
}

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"resources" | "nfts">("resources");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [userResources, setUserResources] = useState<any[]>([
    { id: 1, name: "Credits", icon: "💰", quantity: 5000, type: "resource" },
    {
      id: 2,
      name: "Data Shards",
      icon: "💾",
      quantity: 1200,
      type: "resource",
    },
    {
      id: 3,
      name: "Quantum Cores",
      icon: "⚛️",
      quantity: 30,
      type: "resource",
    },
  ]);
  const [userNFTs, setUserNFTs] = useState<any[]>([
    {
      id: 107,
      name: "Shadow Runner",
      image: "/images/nfts/agent3.png",
      price: 2.0,
      rarity: "Epic",
      description: "A stealth agent specialized in covert operations",
      type: "nft",
      category: "agent",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionStatus[]
  >([]);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  // Check if wallet is connected on component mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  // Filter items based on search term and category
  const filteredResources = resourcesData.filter((resource) =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNFTs = nftsData.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || nft.category === selectedCategory)
  );

  // Add transaction to history
  const addTransactionToHistory = (
    hash: string,
    status: "pending" | "success" | "failed"
  ) => {
    const newTransaction = {
      hash,
      status,
      timestamp: Date.now(),
    };
    setRecentTransactions((prev) => [newTransaction, ...prev].slice(0, 10)); // Keep only the 10 most recent
  };

  // Check transaction status
  const pollTransactionStatus = async (hash: string) => {
    try {
      // Wait 2 seconds before checking
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check transaction status
      const txStatus = await checkTransaction(hash);

      // Update transaction status in history
      setRecentTransactions((prev) =>
        prev.map((tx) =>
          tx.hash === hash
            ? {
                ...tx,
                status: txStatus.status === "success" ? "success" : "failed",
              }
            : tx
        )
      );

      // Show toast notification
      if (txStatus.status === "success") {
        toast.success("Transaction completed successfully!");
      } else {
        toast.error("Transaction failed. Please try again.");
      }
    } catch (error) {
      console.error("Error checking transaction status:", error);
      // Update transaction as failed in history
      setRecentTransactions((prev) =>
        prev.map((tx) => (tx.hash === hash ? { ...tx, status: "failed" } : tx))
      );
      toast.error("Failed to verify transaction status");
    }
  };

  // Handle buy transaction
  const handleBuy = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // Show loading state
      setIsLoading(true);

      let txHash;
      if (selectedItem.type === "resource") {
        // Call Aptos contract to buy resource
        txHash = await buyResource(walletAddress, selectedItem.name, quantity);

        // Add transaction to history
        addTransactionToHistory(txHash, "pending");

        // Start polling for transaction status
        pollTransactionStatus(txHash);

        // Update user resources (in a production app, you would fetch the updated state from blockchain)
        const existingResource = userResources.find(
          (r) => r.id === selectedItem.id
        );
        
        // Calculate new quantity
        const newQuantity = existingResource 
          ? existingResource.quantity + quantity 
          : quantity;
        
        // Update UI state
        if (existingResource) {
          setUserResources(
            userResources.map((r) =>
              r.id === selectedItem.id
                ? { ...r, quantity: newQuantity }
                : r
            )
          );
        } else {
          setUserResources([
            ...userResources,
            {
              id: selectedItem.id,
              name: selectedItem.name,
              icon: selectedItem.icon,
              quantity: quantity,
              type: "resource",
            },
          ]);
        }
        
        // Update Firebase if this is the Credits resource
        if (selectedItem.name === "Credits") {
          const currentUser = authService.getUser();
          if (currentUser && currentUser.resources) {
            const updatedCredits = (currentUser.resources.credits || 0) + quantity;
            updateUserResource('credits', updatedCredits)
              .then(success => {
                if (!success) {
                  console.error('Failed to update credits in Firebase');
                }
              });
          }
        }
      } else if (selectedItem.type === "nft") {
        // Call Aptos contract to buy NFT
        txHash = await buyNFT(walletAddress, selectedItem.id);

        // Add transaction to history
        addTransactionToHistory(txHash, "pending");

        // Start polling for transaction status
        pollTransactionStatus(txHash);

        // Add NFT to user's collection
        setUserNFTs([...userNFTs, { ...selectedItem, owner: walletAddress }]);
      }

      setIsLoading(false);
      if (txHash) {
        toast.success(
          `Transaction submitted! Hash: ${txHash.slice(0, 8)}...${txHash.slice(
            -6
          )}`
        );
      } else {
        toast.success("Transaction submitted!");
      }
      setShowBuyModal(false);
      setQuantity(1);
    } catch (error) {
      console.error("Transaction failed:", error);
      setIsLoading(false);
      toast.error("Transaction failed. Please try again.");
    }
  };

  // Handle sell transaction
  const handleSell = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // Show loading state
      setIsLoading(true);

      let txHash;
      if (selectedItem.type === "resource") {
        // Call Aptos contract to sell resource
        txHash = await sellResource(walletAddress, selectedItem.name, quantity);

        // Add transaction to history
        addTransactionToHistory(txHash, "pending");

        // Start polling for transaction status
        pollTransactionStatus(txHash);

        // Calculate new quantity
        const existingResource = userResources.find(
          (r) => r.id === selectedItem.id
        );
        
        if (existingResource) {
          const newQuantity = existingResource.quantity - quantity;
          
          // Update UI state
          setUserResources(
            userResources
              .map((r) =>
                r.id === selectedItem.id
                  ? { ...r, quantity: newQuantity }
                  : r
              )
              .filter((r) => r.quantity > 0)
          );
          
          // Update Firebase if this is the Credits resource
          if (selectedItem.name === "Credits") {
            const currentUser = authService.getUser();
            if (currentUser && currentUser.resources) {
              const updatedCredits = Math.max((currentUser.resources.credits || 0) - quantity, 0);
              updateUserResource('credits', updatedCredits)
                .then(success => {
                  if (!success) {
                    console.error('Failed to update credits in Firebase');
                  }
                });
            }
          }
        }
      } else if (selectedItem.type === "nft") {
        // Call Aptos contract to sell NFT
        txHash = await sellNFT(
          walletAddress,
          selectedItem.id,
          selectedItem.price || 1.0
        );

        // Add transaction to history
        addTransactionToHistory(txHash, "pending");

        // Start polling for transaction status
        pollTransactionStatus(txHash);

        // Remove NFT from user's collection
        setUserNFTs(userNFTs.filter((nft) => nft.id !== selectedItem.id));
      }

      setIsLoading(false);
      if (txHash) {
        toast.success(
          `Transaction submitted! Hash: ${txHash.slice(0, 8)}...${txHash.slice(
            -6
          )}`
        );
      } else {
        toast.success("Transaction submitted!");
      }
      setShowSellModal(false);
      setQuantity(1);
    } catch (error) {
      console.error("Transaction failed:", error);
      setIsLoading(false);
      toast.error("Transaction failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-4 text-neon-blue hover:text-neon-pink transition-colors"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-3xl font-cyber text-glow-blue">MARKETPLACE</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
              className="cyber-button-small bg-neon-purple bg-opacity-20 hover:bg-opacity-30 text-neon-purple"
            >
              {recentTransactions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-neon-purple text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {
                    recentTransactions.filter((tx) => tx.status === "pending")
                      .length
                  }
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Transactions
            </button>
            <AptosWalletConnect
              onWalletConnect={(address) => setWalletAddress(address)}
            />
          </div>
        </div>

        {/* Transaction History Modal */}
        {showTransactionHistory && (
          <div className="cyber-panel p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-cyber text-neon-blue">
                RECENT TRANSACTIONS
              </h2>
              <button
                onClick={() => setShowTransactionHistory(false)}
                className="text-light-gray hover:text-white"
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

            {recentTransactions.length === 0 ? (
              <p className="text-light-gray text-center py-4">
                No recent transactions
              </p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border-b border-gray-700"
                  >
                    <div className="flex items-center">
                      <span
                        className={`h-2 w-2 rounded-full mr-2 ${
                          tx.status === "pending"
                            ? "bg-yellow-500"
                            : tx.status === "success"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      <span className="text-light-gray font-mono text-sm">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          tx.status === "pending"
                            ? "bg-yellow-900 text-yellow-300"
                            : tx.status === "success"
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {tx.status.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-neon-blue mb-6">
          <button
            className={`px-4 py-2 font-cyber text-sm ${
              activeTab === "resources"
                ? "text-neon-blue border-b-2 border-neon-blue"
                : "text-light-gray"
            }`}
            onClick={() => setActiveTab("resources")}
          >
            RESOURCES
          </button>
          <button
            className={`px-4 py-2 font-cyber text-sm ${
              activeTab === "nfts"
                ? "text-neon-blue border-b-2 border-neon-blue"
                : "text-light-gray"
            }`}
            onClick={() => setActiveTab("nfts")}
          >
            NFTs
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search marketplace..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-gray text-light-gray border border-neon-blue p-2 pl-10 rounded focus:outline-none focus:ring-1 focus:ring-neon-blue"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-light-gray"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {activeTab === "nfts" && (
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-xs rounded ${
                  selectedCategory === "all"
                    ? "bg-neon-blue bg-opacity-20 text-neon-blue"
                    : "text-light-gray"
                }`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </button>
              <button
                className={`px-3 py-1 text-xs rounded ${
                  selectedCategory === "agent"
                    ? "bg-neon-pink bg-opacity-20 text-neon-pink"
                    : "text-light-gray"
                }`}
                onClick={() => setSelectedCategory("agent")}
              >
                Agents
              </button>
              <button
                className={`px-3 py-1 text-xs rounded ${
                  selectedCategory === "territory"
                    ? "bg-neon-green bg-opacity-20 text-neon-green"
                    : "text-light-gray"
                }`}
                onClick={() => setSelectedCategory("territory")}
              >
                Territories
              </button>
              <button
                className={`px-3 py-1 text-xs rounded ${
                  selectedCategory === "equipment"
                    ? "bg-neon-purple bg-opacity-20 text-neon-purple"
                    : "text-light-gray"
                }`}
                onClick={() => setSelectedCategory("equipment")}
              >
                Equipment
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "resources"
            ? filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="cyber-panel p-4 flex flex-col h-full"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{resource.icon}</span>
                      <h3 className="text-lg font-cyber text-neon-blue">
                        {resource.name}
                      </h3>
                    </div>
                    <div className="text-neon-green font-mono">
                      {resource.price} APT
                    </div>
                  </div>
                  <div className="text-sm text-light-gray mb-4">
                    Available: {resource.available}
                  </div>
                  <div className="mt-auto flex justify-between">
                    <button
                      className="cyber-button-small bg-neon-blue bg-opacity-20 hover:bg-opacity-30 text-neon-blue"
                      onClick={() => {
                        setSelectedItem(resource);
                        setShowBuyModal(true);
                      }}
                    >
                      Buy
                    </button>
                    <button
                      className="cyber-button-small bg-neon-pink bg-opacity-20 hover:bg-opacity-30 text-neon-pink"
                      onClick={() => {
                        const userResource = userResources.find(
                          (r) => r.id === resource.id
                        );
                        if (userResource) {
                          setSelectedItem(userResource);
                          setShowSellModal(true);
                        } else {
                          toast.error(
                            `You don't have any ${resource.name} to sell`
                          );
                        }
                      }}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              ))
            : filteredNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="cyber-panel p-4 flex flex-col h-full"
                >
                  <div className="mb-4 relative">
                    <ImageWithFallback
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <div
                      className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                        nft.rarity === "Legendary"
                          ? "bg-neon-pink text-dark-blue"
                          : nft.rarity === "Epic"
                          ? "bg-neon-purple text-dark-blue"
                          : "bg-neon-blue text-dark-blue"
                      }`}
                    >
                      {nft.rarity}
                    </div>
                  </div>
                  <h3 className="text-lg font-cyber text-neon-blue mb-2">
                    {nft.name}
                  </h3>
                  <p className="text-sm text-light-gray mb-2">
                    {nft.description}
                  </p>
                  <div className="text-xs text-light-gray mb-4">
                    Owner: {nft.owner}
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="text-neon-green font-mono">
                      {nft.price} APT
                    </div>
                    <button
                      className="cyber-button-small bg-neon-blue bg-opacity-20 hover:bg-opacity-30 text-neon-blue"
                      onClick={() => {
                        setSelectedItem(nft);
                        setShowBuyModal(true);
                      }}
                    >
                      Buy NFT
                    </button>
                  </div>
                </div>
              ))}
        </div>

        {/* User's Inventory */}
        <div className="mt-8">
          <h2 className="text-xl font-cyber text-glow-purple mb-4">
            YOUR INVENTORY
          </h2>

          {/* Resources */}
          <div className="mb-6">
            <h3 className="text-lg font-cyber text-neon-blue mb-2">
              Resources
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userResources.map((resource) => (
                <div
                  key={resource.id}
                  className="cyber-panel p-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{resource.icon}</span>
                    <div>
                      <div className="text-sm font-cyber text-neon-blue">
                        {resource.name}
                      </div>
                      <div className="text-xs text-light-gray">
                        {resource.quantity}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-xs text-neon-pink hover:text-neon-purple"
                    onClick={() => {
                      setSelectedItem(resource);
                      setShowSellModal(true);
                    }}
                  >
                    Sell
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* NFTs */}
          <div>
            <h3 className="text-lg font-cyber text-neon-blue mb-2">NFTs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userNFTs.length > 0 ? (
                userNFTs.map((nft) => (
                  <div key={nft.id} className="cyber-panel p-3">
                    <div className="mb-2">
                      <ImageWithFallback
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-cyber text-neon-blue">
                          {nft.name}
                        </div>
                        <div className="text-xs text-light-gray">
                          {nft.rarity}
                        </div>
                      </div>
                      <button
                        className="text-xs text-neon-pink hover:text-neon-purple"
                        onClick={() => {
                          setSelectedItem(nft);
                          setShowSellModal(true);
                        }}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-light-gray">
                  You don't own any NFTs yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedItem && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center">
          <div className="cyber-panel modal-content cyber-glass max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-cyber text-glow-green">
                BUY {selectedItem.name.toUpperCase()}
              </h2>
              <button
                onClick={() => setShowBuyModal(false)}
                className="text-neon-blue hover:text-neon-pink transition-colors"
                disabled={isLoading}
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

            <div className="mb-4">
              {selectedItem.type === "nft" ? (
                <div className="mb-4">
                  <ImageWithFallback
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                  <p className="text-sm text-light-gray">
                    {selectedItem.description}
                  </p>
                </div>
              ) : (
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{selectedItem.icon}</span>
                  <div>
                    <h3 className="font-cyber text-neon-blue">
                      {selectedItem.name}
                    </h3>
                    <p className="text-sm text-light-gray">
                      Available: {selectedItem.available}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-light-gray">Price per unit:</div>
                <div className="text-neon-green font-mono">
                  {selectedItem.price} APT
                </div>
              </div>

              {selectedItem.type === "resource" && (
                <div className="mb-4">
                  <label className="block text-sm text-light-gray mb-1">
                    Quantity:
                  </label>
                  <div className="flex items-center">
                    <button
                      className="bg-dark-gray px-3 py-1 text-neon-blue"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isLoading}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedItem.available}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            selectedItem.available,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="w-20 text-center bg-dark-gray text-light-gray border-y border-neon-blue py-1"
                      disabled={isLoading}
                    />
                    <button
                      className="bg-dark-gray px-3 py-1 text-neon-blue"
                      onClick={() =>
                        setQuantity(
                          Math.min(selectedItem.available, quantity + 1)
                        )
                      }
                      disabled={isLoading}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-6 pt-4 border-t border-neon-blue">
                <div className="text-sm font-cyber text-light-gray">
                  Total cost:
                </div>
                <div className="text-xl text-neon-green font-mono">
                  {(
                    selectedItem.price *
                    (selectedItem.type === "resource" ? quantity : 1)
                  ).toFixed(2)}{" "}
                  APT
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className="cyber-button bg-dark-gray text-light-gray"
                  onClick={() => setShowBuyModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className={`cyber-button ${
                    isLoading
                      ? "bg-dark-gray text-light-gray"
                      : "bg-neon-green bg-opacity-20 text-neon-green"
                  }`}
                  onClick={handleBuy}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-neon-green"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Confirm Purchase"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedItem && (
        <div className="fixed inset-0 bg-dark-blue bg-opacity-90 z-50 flex items-center justify-center">
          <div className="cyber-panel modal-content cyber-glass max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-cyber text-glow-pink">
                SELL {selectedItem.name.toUpperCase()}
              </h2>
              <button
                onClick={() => setShowSellModal(false)}
                className="text-neon-blue hover:text-neon-pink transition-colors"
                disabled={isLoading}
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

            <div className="mb-4">
              {selectedItem.type === "nft" ? (
                <div className="mb-4">
                  <ImageWithFallback
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                  <p className="text-sm text-light-gray">
                    {selectedItem.description}
                  </p>
                </div>
              ) : (
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{selectedItem.icon}</span>
                  <div>
                    <h3 className="font-cyber text-neon-blue">
                      {selectedItem.name}
                    </h3>
                    <p className="text-sm text-light-gray">
                      You own: {selectedItem.quantity}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-light-gray">Price per unit:</div>
                <div className="text-neon-green font-mono">
                  {selectedItem.price ? selectedItem.price : 0.05} APT
                </div>
              </div>

              {selectedItem.type === "resource" && (
                <div className="mb-4">
                  <label className="block text-sm text-light-gray mb-1">
                    Quantity to sell:
                  </label>
                  <div className="flex items-center">
                    <button
                      className="bg-dark-gray px-3 py-1 text-neon-pink"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isLoading}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedItem.quantity}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            selectedItem.quantity,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="w-20 text-center bg-dark-gray text-light-gray border-y border-neon-pink py-1"
                      disabled={isLoading}
                    />
                    <button
                      className="bg-dark-gray px-3 py-1 text-neon-pink"
                      onClick={() =>
                        setQuantity(
                          Math.min(selectedItem.quantity, quantity + 1)
                        )
                      }
                      disabled={isLoading}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-6 pt-4 border-t border-neon-pink">
                <div className="text-sm font-cyber text-light-gray">
                  You will receive:
                </div>
                <div className="text-xl text-neon-green font-mono">
                  {(
                    (selectedItem.price ? selectedItem.price : 0.05) *
                    (selectedItem.type === "resource" ? quantity : 1)
                  ).toFixed(2)}{" "}
                  APT
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className="cyber-button bg-dark-gray text-light-gray"
                  onClick={() => setShowSellModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className={`cyber-button ${
                    isLoading
                      ? "bg-dark-gray text-light-gray"
                      : "bg-neon-pink bg-opacity-20 text-neon-pink"
                  }`}
                  onClick={handleSell}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-neon-pink"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Confirm Sale"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
