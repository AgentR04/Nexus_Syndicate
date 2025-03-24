import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import firestoreService, { 
  MarketplaceListing, 
  TransactionStatus as FirestoreTransactionStatus,
  TransactionType 
} from "../services/firestoreService";
import { 
  buyResource, 
  buyNFT, 
  sellResource, 
  sellNFT, 
  checkTransaction 
} from "../utils/aptosUtils";

// Transaction interface
interface Transaction {
  hash: string;
  status: "pending" | "success" | "failed";
  timestamp: number;
}

// Mock data for resources
interface Resource {
  id: number;
  name: string;
  icon: string;
  price: number;
  available: number;
  type: "resource";
  quantity?: number; // Add quantity for user resources
}

const resourcesData: Resource[] = [
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
  }
];

// Mock data for NFTs
interface NFT {
  id: number;
  name: string;
  image: string;
  price: number;
  rarity: string;
  owner: string;
  description: string;
  type: "nft";
  category: string;
}

const nftsData: NFT[] = [
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
  }
];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [selectedItem, setSelectedItem] = useState<Resource | NFT | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "transactions">("buy");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check if wallet is connected
  useEffect(() => {
    const user = authService.getUser();
    if (user && user.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, []);

  // Load user data on component mount
  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setWalletAddress(currentUser.walletAddress);
      
      // Load user resources
      if (currentUser.resources) {
        setUserResources([
          { 
            id: 1, 
            name: "Credits", 
            icon: "💰", 
            quantity: currentUser.resources.credits || 0, 
            type: "resource",
            price: 0.05,
            available: 15000
          },
          { 
            id: 2, 
            name: "Data Shards", 
            icon: "💾", 
            quantity: currentUser.resources.dataShards || 0, 
            type: "resource",
            price: 0.1,
            available: 8500
          },
          { 
            id: 3, 
            name: "Quantum Cores", 
            icon: "⚛️", 
            quantity: currentUser.resources.quantumCores || 0, 
            type: "resource",
            price: 0.5,
            available: 250
          },
          { 
            id: 4, 
            name: "Synthetic Alloys", 
            icon: "🔋", 
            quantity: currentUser.resources.syntheticAlloys || 0, 
            type: "resource",
            price: 0.2,
            available: 1200
          }
        ]);
      }
      
      // Load user transactions
      loadUserTransactions();
      
      // Load marketplace listings
      loadMarketplaceListings();
    }
  }, []);

  // Load user's transactions
  const loadUserTransactions = async () => {
    const currentUser = authService.getUser();
    if (!currentUser || !currentUser.id) {
      console.log("User not found, can't load transactions");
      return;
    }
    
    try {
      const transactions = await firestoreService.getUserTransactions(currentUser.id);
      
      // Convert to UI transaction format
      const uiTransactions: Transaction[] = transactions.map(tx => ({
        hash: tx.txHash || tx.id || 'local-tx',
        status: tx.status === FirestoreTransactionStatus.COMPLETED ? 'success' : 
                tx.status === FirestoreTransactionStatus.FAILED ? 'failed' : 'pending',
        timestamp: tx.createdAt instanceof Date ? tx.createdAt.getTime() : Date.now()
      }));
      
      setRecentTransactions(uiTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  // Load marketplace listings
  const loadMarketplaceListings = async () => {
    try {
      const listings = await firestoreService.getMarketplaceListings({
        status: 'active'
      });
      
      // Convert to UI format
      const resourceListings: Resource[] = listings
        .filter(listing => listing.itemType === 'resource')
        .map(listing => ({
          id: parseInt(listing.itemId) || parseInt(listing.id || '0'),
          name: listing.itemName,
          icon: listing.imageUrl || "/icons/credits.png",
          price: listing.price,
          available: listing.quantity,
          type: "resource" as const,
        }));
      
      const nftListings: NFT[] = listings
        .filter(listing => listing.itemType === 'nft')
        .map(listing => ({
          id: parseInt(listing.itemId) || parseInt(listing.id || '0'),
          name: listing.itemName,
          image: listing.imageUrl || "/images/nfts/default.png",
          price: listing.price,
          rarity: "Epic",
          owner: listing.sellerName,
          description: listing.description || "",
          type: "nft" as const,
          category: listing.category || "agent",
        }));
      
      // Merge with mock data for now (in production, you'd only use the database data)
      const combinedResources = [...resourcesData, ...resourceListings];
      const combinedNFTs = [...nftsData, ...nftListings];
      
      // Update state
      setUserResources(combinedResources);
      setUserNFTs(combinedNFTs);
    } catch (error) {
      console.error("Error loading marketplace listings:", error);
    }
  };

  // Filter items based on search term and category
  const filteredResources = userResources.filter((resource) =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNFTs = userNFTs.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
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

  // Handle sell transaction
  const handleSell = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // Show loading state
      setIsLoading(true);

      // Get current user
      const currentUser = authService.getUser();
      if (!currentUser || !currentUser.id) {
        toast.error("User not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      let txHash;
      if (selectedItem && selectedItem.type === "resource") {
        // Check if resource exists in user's inventory
        const existingResource = userResources.find(
          (r) => r.name === selectedItem.name
        );

        if (!existingResource) {
          toast.error(`You don't have any ${selectedItem.name} to sell`);
          setIsLoading(false);
          return;
        }

        // Check if user has enough of the resource
        if ((existingResource.quantity || 0) < quantity) {
          toast.error(
            `You don't have enough ${selectedItem.name}. You have ${
              existingResource.quantity || 0
            } but trying to sell ${quantity}`
          );
          setIsLoading(false);
          return;
        }

        // Call Aptos contract to sell resource
        txHash = await sellResource(
          walletAddress,
          selectedItem.name,
          quantity
        );

        // Add transaction to history
        addTransactionToHistory(txHash, "pending");

        // Start polling for transaction status
        pollTransactionStatus(txHash);

        // Create a marketplace listing
        const listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'> = {
          sellerId: currentUser.id,
          sellerName: currentUser.username || walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4),
          itemId: selectedItem.id.toString(),
          itemName: selectedItem.name,
          itemType: "resource",
          quantity: quantity,
          price: selectedItem.price * 0.95, // 5% discount when selling back
          description: `${selectedItem.name} resource`,
          imageUrl: selectedItem.icon ? `/icons/${selectedItem.name.toLowerCase().replace(/\s+/g, '_')}.png` : undefined,
          status: 'active'
        };

        const createdListing = await firestoreService.createMarketplaceListing(listing);
        
        if (createdListing) {
          // Update user's resources in Firestore
          const updatedResources = { ...currentUser.resources };
          
          // Map resource name to the correct property in user resources
          let resourceKey: keyof typeof updatedResources;
          switch (selectedItem.name.toLowerCase()) {
            case "credits":
              resourceKey = "credits";
              break;
            case "data shards":
              resourceKey = "dataShards";
              break;
            case "quantum cores":
              resourceKey = "quantumCores";
              break;
            case "synthetic alloys":
              resourceKey = "syntheticAlloys";
              break;
            default:
              resourceKey = "credits";
          }
          
          // Update the resource quantity
          if (updatedResources && updatedResources[resourceKey] !== undefined) {
            const currentValue = updatedResources[resourceKey] || 0;
            updatedResources[resourceKey] = Math.max(0, currentValue - quantity);
          }
          
          // Ensure all required properties are defined with default values
          const resourcesUpdate = {
            credits: updatedResources?.credits || 0,
            dataShards: updatedResources?.dataShards || 0,
            syntheticAlloys: updatedResources?.syntheticAlloys || 0,
            quantumCores: updatedResources?.quantumCores || 0
          };
          
          // Update Firestore
          const success = await firestoreService.updateUserResources(
            currentUser.id,
            resourcesUpdate
          );
          
          if (success) {
            toast.success(`Successfully listed ${quantity} ${selectedItem.name} for sale!`);
            
            // Update UI state
            setUserResources(
              userResources.map((r) =>
                r.name === selectedItem.name
                  ? { ...r, quantity: (r.quantity || 0) - quantity }
                  : r
              )
            );
          } else {
            toast.error("Failed to update resources. Please try again.");
          }
        } else {
          toast.error("Failed to create marketplace listing");
        }
      } else if (selectedItem && selectedItem.type === "nft") {
        // Call Aptos contract to sell NFT
        txHash = await sellNFT(walletAddress, selectedItem.id, selectedItem.price);

        // Add transaction to history
        addTransactionToHistory(txHash, "pending");

        // Start polling for transaction status
        pollTransactionStatus(txHash);

        // Create a marketplace listing
        const listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'> = {
          sellerId: currentUser.id,
          sellerName: currentUser.username || walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4),
          itemId: selectedItem.id.toString(),
          itemName: selectedItem.name,
          itemType: "nft",
          quantity: 1, // NFTs are unique
          price: selectedItem.price,
          description: selectedItem.description || `${selectedItem.name} NFT`,
          imageUrl: selectedItem.image,
          category: selectedItem.category,
          status: 'active'
        };

        const createdListing = await firestoreService.createMarketplaceListing(listing);
        
        if (createdListing) {
          toast.success(`Successfully listed ${selectedItem.name} NFT for sale!`);
          
          // Remove NFT from user's collection in UI
          setUserNFTs(userNFTs.filter((nft) => nft.id !== selectedItem.id));
        } else {
          toast.error("Failed to create marketplace listing");
        }
      }
    } catch (error) {
      console.error("Error during sale:", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      // Hide loading state
      setIsLoading(false);
      // Close modal
      setShowSellModal(false);
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

      // Get current user
      const currentUser = authService.getUser();
      if (!currentUser || !currentUser.id) {
        toast.error("User not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      let txHash;
      if (selectedItem && selectedItem.type === "resource") {
        // Call Aptos contract to buy resource
        txHash = await buyResource(walletAddress, selectedItem.name, quantity);

        // Add transaction to history
        addTransactionToHistory(txHash, "pending");

        // Start polling for transaction status
        pollTransactionStatus(txHash);

        // Create a marketplace listing for this purchase
        const listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'> = {
          sellerId: "MARKETPLACE", // System marketplace
          sellerName: "Nexus Marketplace",
          itemId: selectedItem.id.toString(),
          itemName: selectedItem.name,
          itemType: "resource",
          quantity: quantity,
          price: selectedItem.price,
          description: `${selectedItem.name} resource`,
          imageUrl: selectedItem.icon ? `/icons/${selectedItem.name.toLowerCase().replace(/\s+/g, '_')}.png` : undefined,
          status: 'active'
        };

        // Create a temporary listing
        const createdListing = await firestoreService.createMarketplaceListing(listing);
        
        if (createdListing && createdListing.id) {
          // Process the purchase in Firestore
          const success = await firestoreService.processMarketplacePurchase(
            createdListing.id,
            currentUser.id,
            quantity,
            txHash
          );
          
          if (success) {
            toast.success(`Successfully purchased ${quantity} ${selectedItem.name}!`);
            
            // Refresh user resources from Firestore
            const updatedUser = await firestoreService.getUserById(currentUser.id);
            if (updatedUser && updatedUser.resources) {
              // Update UI state with the latest resources
              setUserResources([
                { 
                  id: 1, 
                  name: "Credits", 
                  icon: "💰", 
                  quantity: updatedUser.resources.credits || 0, 
                  type: "resource" as const,
                  price: 0.05,
                  available: 15000
                },
                { 
                  id: 2, 
                  name: "Data Shards", 
                  icon: "💾", 
                  quantity: updatedUser.resources.dataShards || 0, 
                  type: "resource" as const,
                  price: 0.1,
                  available: 8500
                },
                { 
                  id: 3, 
                  name: "Quantum Cores", 
                  icon: "⚛️", 
                  quantity: updatedUser.resources.quantumCores || 0, 
                  type: "resource" as const,
                  price: 0.5,
                  available: 250
                },
                { 
                  id: 4, 
                  name: "Synthetic Alloys", 
                  icon: "🔋", 
                  quantity: updatedUser.resources.syntheticAlloys || 0, 
                  type: "resource" as const,
                  price: 0.2,
                  available: 1200
                }
              ]);
            }
          } else {
            toast.error("Failed to process purchase. Please try again.");
          }
        } else {
          toast.error("Failed to create marketplace listing");
        }
      } else if (selectedItem && selectedItem.type === "nft") {
        // Call Aptos contract to buy NFT
        txHash = await buyNFT(walletAddress, selectedItem.id);

        // Add transaction to history
        addTransactionToHistory(txHash, "pending");

        // Start polling for transaction status
        pollTransactionStatus(txHash);

        // Create a marketplace listing for this purchase
        const listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'> = {
          sellerId: "MARKETPLACE", // System marketplace
          sellerName: "Nexus Marketplace",
          itemId: selectedItem.id.toString(),
          itemName: selectedItem.name,
          itemType: "nft",
          quantity: 1, // NFTs are unique
          price: selectedItem.price,
          description: selectedItem.description || `${selectedItem.name} NFT`,
          imageUrl: selectedItem.image,
          category: selectedItem.category,
          status: 'active'
        };

        // Create a temporary listing
        const createdListing = await firestoreService.createMarketplaceListing(listing);
        
        if (createdListing && createdListing.id) {
          // Process the purchase in Firestore
          const success = await firestoreService.processMarketplacePurchase(
            createdListing.id,
            currentUser.id,
            1, // NFTs are unique
            txHash
          );
          
          if (success) {
            toast.success(`Successfully purchased ${selectedItem.name} NFT!`);
            
            // Add NFT to user's collection
            setUserNFTs([...userNFTs, { ...selectedItem, owner: walletAddress }]);
          } else {
            toast.error("Failed to process purchase. Please try again.");
          }
        } else {
          toast.error("Failed to create marketplace listing");
        }
      }
    } catch (error) {
      console.error("Error during purchase:", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      // Hide loading state
      setIsLoading(false);
      // Close modal
      setShowBuyModal(false);
    }
  };

  // Handle item click for buying
  const handleItemClick = (item: Resource | NFT) => {
    setSelectedItem(item);
    setQuantity(1);
    setShowBuyModal(true);
  };

  // Handle item click for selling
  const handleSellClick = (item: Resource | NFT) => {
    setSelectedItem(item);
    setQuantity(1);
    setShowSellModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">
        Nexus Marketplace
      </h1>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${activeTab === "buy" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("buy")}
          >
            Buy
          </button>
          <button
            className={`tab ${activeTab === "sell" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("sell")}
          >
            Sell
          </button>
          <button
            className={`tab ${activeTab === "transactions" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Buy Tab */}
      {activeTab === "buy" && (
        <div>
          {/* Category Filter */}
          <div className="flex justify-center mb-6">
            <div className="btn-group">
              <button
                className={`btn ${selectedCategory === "all" ? "btn-active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </button>
              <button
                className={`btn ${selectedCategory === "resources" ? "btn-active" : ""}`}
                onClick={() => setSelectedCategory("resources")}
              >
                Resources
              </button>
              <button
                className={`btn ${selectedCategory === "weapons" ? "btn-active" : ""}`}
                onClick={() => setSelectedCategory("weapons")}
              >
                Weapons
              </button>
              <button
                className={`btn ${selectedCategory === "armor" ? "btn-active" : ""}`}
                onClick={() => setSelectedCategory("armor")}
              >
                Armor
              </button>
              <button
                className={`btn ${selectedCategory === "collectibles" ? "btn-active" : ""}`}
                onClick={() => setSelectedCategory("collectibles")}
              >
                Collectibles
              </button>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Resources */}
            {(selectedCategory === "all" || selectedCategory === "resources") &&
              filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                  onClick={() => handleItemClick(resource)}
                >
                  <div className="card-body">
                    <h2 className="card-title">
                      <span className="text-2xl mr-2">{resource.icon}</span>
                      {resource.name}
                    </h2>
                    <p>Price: {resource.price} APT</p>
                    <p>Available: {resource.available}</p>
                    <div className="card-actions justify-end mt-4">
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(resource);
                        }}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {/* NFTs */}
            {(selectedCategory === "all" ||
              selectedCategory === "weapons" ||
              selectedCategory === "armor" ||
              selectedCategory === "collectibles") &&
              filteredNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                  onClick={() => handleItemClick(nft)}
                >
                  <figure className="px-4 pt-4">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="rounded-xl h-48 w-full object-cover"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">{nft.name}</h2>
                    <p className="text-sm text-gray-500">{nft.category}</p>
                    <p className="mt-2">{nft.description}</p>
                    <p className="font-bold mt-2">Price: {nft.price} APT</p>
                    <div className="card-actions justify-end mt-4">
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(nft);
                        }}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Sell Tab */}
      {activeTab === "sell" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Your Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {userResources.map((resource) => (
              <div
                key={resource.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => handleSellClick(resource)}
              >
                <div className="card-body">
                  <h2 className="card-title">
                    <span className="text-2xl mr-2">{resource.icon}</span>
                    {resource.name}
                  </h2>
                  <p>Owned: {resource.quantity || 0}</p>
                  <p>Value: {(resource.price * 0.95).toFixed(2)} APT each</p>
                  <div className="card-actions justify-end mt-4">
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSellClick(resource);
                      }}
                      disabled={(resource.quantity || 0) <= 0}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-4">Your NFTs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userNFTs.map((nft) => (
              <div
                key={nft.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => handleSellClick(nft)}
              >
                <figure className="px-4 pt-4">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="rounded-xl h-48 w-full object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{nft.name}</h2>
                  <p className="text-sm text-gray-500">{nft.category}</p>
                  <p className="mt-2">{nft.description}</p>
                  <p className="font-bold mt-2">Value: {nft.price} APT</p>
                  <div className="card-actions justify-end mt-4">
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSellClick(nft);
                      }}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {userNFTs.length === 0 && (
              <div className="col-span-4 text-center py-8 text-gray-500">
                You don't own any NFTs yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Transaction Hash</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx, index) => (
                    <tr key={index}>
                      <td>
                        <a
                          href={`https://explorer.aptoslabs.com/txn/${tx.hash}?network=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary"
                        >
                          {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                        </a>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tx.status === "pending"
                              ? "badge-warning"
                              : tx.status === "success"
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions yet.
            </div>
          )}
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Buy {selectedItem.name}
            </h2>
            {selectedItem.type === "resource" ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.available}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="input input-bordered w-full"
                />
              </div>
            ) : (
              <div className="mb-4">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="rounded-lg w-full h-48 object-cover mb-4"
                />
                <p>{selectedItem.description}</p>
              </div>
            )}
            <div className="mb-6">
              <p className="font-bold">
                Total Price:{" "}
                {selectedItem.type === "resource"
                  ? (selectedItem.price * quantity).toFixed(2)
                  : selectedItem.price}{" "}
                APT
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="btn btn-ghost"
                onClick={() => setShowBuyModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBuy}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Confirm Purchase"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Sell {selectedItem.name}
            </h2>
            {selectedItem.type === "resource" ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={
                    userResources.find((r) => r.name === selectedItem.name)
                      ?.quantity || 0
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="input input-bordered w-full"
                />
              </div>
            ) : (
              <div className="mb-4">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="rounded-lg w-full h-48 object-cover mb-4"
                />
                <p>{selectedItem.description}</p>
              </div>
            )}
            <div className="mb-6">
              <p className="font-bold">
                Total Value:{" "}
                {selectedItem.type === "resource"
                  ? ((selectedItem.price * 0.95) * quantity).toFixed(2)
                  : selectedItem.price}{" "}
                APT
              </p>
              {selectedItem.type === "resource" && (
                <p className="text-sm text-gray-500">
                  (5% marketplace fee applied)
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="btn btn-ghost"
                onClick={() => setShowSellModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleSell}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Confirm Sale"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
