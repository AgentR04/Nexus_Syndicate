import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import firestoreService, { MarketplaceListing, TransactionStatus } from "../services/firestoreService";
import {
  buyResource,
  sellResource,
  buyNFT,
  sellNFT,
  checkTransaction,
  getTransactionExplorerLink,
} from "../utils/aptosUtils";
import { BlockchainTransaction, FirestoreTransaction, FirestoreTransactionStatus } from "../types/transaction";
import { TransactionType } from "../services/firestoreService";

// Add JSX namespace to fix JSX element type errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      a: any;
      h1: any;
      h2: any;
      p: any;
      span: any;
      button: any;
      img: any;
      input: any;
      label: any;
      table: any;
      thead: any;
      tbody: any;
      tr: any;
      th: any;
      td: any;
      figure: any;
    }
  }
}

// Transaction interface for local state management
interface Transaction {
  hash: string;
  status: "pending" | "success" | "failed";
  timestamp: number;
  explorerLink?: string;
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
      loadRecentTransactions();
      
      // Load marketplace listings
      loadMarketplaceListings();
    }
  }, []);

  // Load recent transactions from Firestore
  const loadRecentTransactions = async () => {
    try {
      const currentUser = authService.getUser();
      if (!currentUser || !currentUser.id) return;

      const transactions = await firestoreService.getUserTransactions(currentUser.id);
      
      // Map Firestore transactions to UI transactions
      const uiTransactions: Transaction[] = transactions.map(tx => ({
        hash: tx.txHash || tx.id || 'local-tx',
        status: tx.status === TransactionStatus.COMPLETED ? 'success' : 
                tx.status === TransactionStatus.FAILED ? 'failed' : 'pending',
        timestamp: tx.createdAt instanceof Date ? tx.createdAt.getTime() : Date.now(),
        explorerLink: getTransactionExplorerLink(tx.txHash || tx.id || 'local-tx')
      }));
      
      setRecentTransactions(uiTransactions);
    } catch (error) {
      console.error("Error loading recent transactions:", error);
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
    const explorerLink = getTransactionExplorerLink(hash);
    const newTransaction = {
      hash,
      status,
      timestamp: Date.now(),
      explorerLink
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
        toast.success(
          <div>
            Transaction completed successfully!{" "}
            <a 
              href={getTransactionExplorerLink(hash)} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              View on Explorer
            </a>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(
          <div>
            Transaction failed.{" "}
            <a 
              href={getTransactionExplorerLink(hash)} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              View on Explorer
            </a>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error("Error checking transaction status:", error);
      // Update transaction as failed in history
      setRecentTransactions((prev) =>
        prev.map((tx) => (tx.hash === hash ? { ...tx, status: "failed" } : tx))
      );
      toast.error(
        <div>
          Failed to verify transaction status.{" "}
          <a 
            href={getTransactionExplorerLink(hash)} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            View on Explorer
          </a>
        </div>,
        { duration: 5000 }
      );
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
        // Show transaction in progress toast
        const toastId = toast.loading("Sending transaction to blockchain...");
        
        try {
          // Check if resource exists in user's inventory
          const existingResource = userResources.find(
            (r) => r.name === selectedItem.name
          );

          if (!existingResource) {
            toast.error(`You don't have any ${selectedItem.name} to sell`, { id: toastId });
            setIsLoading(false);
            return;
          }

          // Check if user has enough of the resource
          if ((existingResource.quantity || 0) < quantity) {
            toast.error(
              `You don't have enough ${selectedItem.name}. You have ${
                existingResource.quantity || 0
              } but trying to sell ${quantity}`, 
              { id: toastId }
            );
            setIsLoading(false);
            return;
          }

          // Call Aptos contract to sell resource
          txHash = await sellResource(
            walletAddress,
            selectedItem.name,
            quantity,
            selectedItem.price * 0.95 // 5% discount when selling back
          );
          
          // Update toast to show transaction submitted
          toast.success("Transaction submitted to blockchain!", { id: toastId });

          // Add transaction to history
          addTransactionToHistory(txHash, "pending");

          // Start polling for transaction status
          pollTransactionStatus(txHash);
          
          // Create a transaction record in Firestore
          await firestoreService.createTransaction({
            userId: currentUser.id,
            txHash: txHash,
            type: TransactionType.SALE,
            itemId: selectedItem.id.toString(),
            itemName: selectedItem.name,
            itemType: "resource",
            quantity: quantity,
            price: selectedItem.price * 0.95,
            status: TransactionStatus.PENDING
          });

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
        } catch (error) {
          console.error("Error during sale:", error);
          toast.error("Transaction failed. Please try again.", { id: toastId });
          
          // Create a failed transaction record
          await firestoreService.createTransaction({
            userId: currentUser.id,
            txHash: txHash || "failed-tx",
            type: TransactionType.SALE,
            itemId: selectedItem.id.toString(),
            itemName: selectedItem.name,
            itemType: "resource",
            quantity: quantity,
            price: selectedItem.price * 0.95,
            status: TransactionStatus.FAILED
          });
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
        // Show transaction in progress toast
        const toastId = toast.loading("Sending transaction to blockchain...");
        
        try {
          // Call Aptos contract to buy resource
          txHash = await buyResource(walletAddress, selectedItem.name, quantity);
          
          // Update toast to show transaction submitted
          toast.success("Transaction submitted to blockchain!", { id: toastId });
          
          // Add transaction to history
          addTransactionToHistory(txHash, "pending");
          
          // Start polling for transaction status
          pollTransactionStatus(txHash);
          
          // Create a transaction record in Firestore
          await firestoreService.createTransaction({
            userId: currentUser.id,
            txHash: txHash,
            type: TransactionType.PURCHASE,
            itemId: selectedItem.id.toString(),
            itemName: selectedItem.name,
            itemType: "resource",
            quantity: quantity,
            price: selectedItem.price,
            status: TransactionStatus.PENDING
          });
          
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
        } catch (error) {
          console.error("Error during purchase:", error);
          toast.error("Transaction failed. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-base-100">
      {/* Hero Section */}
      <div className="bg-gray-900 py-10 px-4 mb-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center text-primary mb-4">
            Nexus Marketplace
          </h1>
          <p className="text-center text-lg max-w-2xl mx-auto mb-6 text-gray-300">
            Buy and sell resources, weapons, and collectibles using your Aptos wallet
          </p>
          
          {/* Wallet Status */}
          <div className="flex justify-center">
            <div className="stats shadow bg-base-300">
              <div className="stat">
                <div className="stat-title">Wallet</div>
                <div className="stat-value text-sm md:text-base truncate max-w-[200px]">
                  {walletAddress ? walletAddress : "Not Connected"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="tabs tabs-boxed bg-gray-800 p-1 rounded-full">
            <button
              className={`tab tab-lg rounded-full px-8 transition-all duration-300 ${activeTab === "buy" ? "bg-primary text-primary-content" : "bg-gray-700 text-gray-200"}`}
              onClick={() => setActiveTab("buy")}
            >
              Buy
            </button>
            <button
              className={`tab tab-lg rounded-full px-8 transition-all duration-300 ${activeTab === "sell" ? "bg-secondary text-secondary-content" : "bg-gray-700 text-gray-200"}`}
              onClick={() => setActiveTab("sell")}
            >
              Sell
            </button>
            <button
              className={`tab tab-lg rounded-full px-8 transition-all duration-300 ${activeTab === "transactions" ? "bg-accent text-accent-content" : "bg-gray-700 text-gray-200"}`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
          </div>
        </div>

        {/* Buy Tab */}
        {activeTab === "buy" && (
          <div>
            {/* Search and Filter Bar */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="form-control w-full md:w-1/2">
                  <div className="input-group input-group-lg shadow-md rounded-full overflow-hidden">
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="input input-lg w-full text-black focus:outline-none"
                      style={{ color: 'black' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn btn-square btn-lg bg-primary border-none">
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
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    className={`btn ${selectedCategory === "all" ? "btn-primary" : "btn-outline bg-gray-800 text-gray-200 hover:bg-gray-700"} rounded-full`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Items
                  </button>
                  <button
                    className={`btn ${selectedCategory === "resources" ? "btn-primary" : "btn-outline bg-gray-800 text-gray-200 hover:bg-gray-700"} rounded-full`}
                    onClick={() => setSelectedCategory("resources")}
                  >
                    Resources
                  </button>
                  <button
                    className={`btn ${selectedCategory === "weapons" ? "btn-primary" : "btn-outline bg-gray-800 text-gray-200 hover:bg-gray-700"} rounded-full`}
                    onClick={() => setSelectedCategory("weapons")}
                  >
                    Weapons
                  </button>
                  <button
                    className={`btn ${selectedCategory === "armor" ? "btn-primary" : "btn-outline bg-gray-800 text-gray-200 hover:bg-gray-700"} rounded-full`}
                    onClick={() => setSelectedCategory("armor")}
                  >
                    Armor
                  </button>
                  <button
                    className={`btn ${selectedCategory === "collectibles" ? "btn-primary" : "btn-outline bg-gray-800 text-gray-200 hover:bg-gray-700"} rounded-full`}
                    onClick={() => setSelectedCategory("collectibles")}
                  >
                    Collectibles
                  </button>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Resources */}
              {(selectedCategory === "all" || selectedCategory === "resources") &&
                filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="card bg-blue-900 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    onClick={() => handleItemClick(resource)}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <div className="badge badge-primary">{resource.price} APT</div>
                    </div>
                    <div className="h-40 bg-gradient-to-br from-blue-800 to-blue-950 flex items-center justify-center">
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{resource.icon}</span>
                    </div>
                    <div className="card-body">
                      <h2 className="card-title justify-between">
                        {resource.name}
                        <span className="text-sm text-blue-300">Resource</span>
                      </h2>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Available: {resource.available}</span>
                        <button
                          className="btn btn-primary btn-sm rounded-full px-6"
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
                    className="card bg-purple-900 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    onClick={() => handleItemClick(nft)}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <div className="badge badge-primary">{nft.price} APT</div>
                    </div>
                    <figure className="px-0 pt-0 relative">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <span className="badge badge-secondary">{nft.category}</span>
                        <span className="badge badge-outline ml-2">{nft.rarity}</span>
                      </div>
                    </figure>
                    <div className="card-body bg-purple-900">
                      <h2 className="card-title">{nft.name}</h2>
                      <p className="text-sm line-clamp-2 text-purple-200">{nft.description}</p>
                      <div className="card-actions justify-end mt-2">
                        <button
                          className="btn btn-primary btn-sm rounded-full px-6"
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
            
            {/* Empty State */}
            {filteredResources.length === 0 && filteredNFTs.length === 0 && (
              <div className="text-center py-16 bg-gray-800 rounded-box">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No items found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {/* Sell Tab */}
        {activeTab === "sell" && (
          <div>
            {/* Resources Section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Resources</h2>
                <div className="badge badge-lg p-3 bg-secondary">Resources can be sold instantly</div>
              </div>
              
              {userResources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userResources.map((resource) => (
                    <div
                      key={resource.id}
                      className={`card ${(resource.quantity || 0) <= 0 ? 'bg-gray-800 opacity-60' : 'bg-green-900'} shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group`}
                      onClick={() => (resource.quantity || 0) > 0 ? handleSellClick(resource) : null}
                    >
                      <div className="absolute top-2 right-2 z-10">
                        <div className="badge badge-secondary">{(resource.price * 0.95).toFixed(2)} APT</div>
                      </div>
                      <div className="h-40 bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{resource.icon}</span>
                      </div>
                      <div className="card-body">
                        <h2 className="card-title justify-between">
                          {resource.name}
                          <span className="badge badge-outline">{resource.quantity || 0}</span>
                        </h2>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">Value: {(resource.price * 0.95).toFixed(2)} APT each</span>
                          <button
                            className="btn btn-secondary btn-sm rounded-full px-6"
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
              ) : (
                <div className="text-center py-16 bg-gray-800 rounded-box">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-2xl font-bold mb-2">No resources yet</h3>
                  <p className="text-gray-400 mb-4">Earn resources by playing games or buy them from the marketplace</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab("buy")}>Go to Marketplace</button>
                </div>
              )}
            </div>

            {/* NFTs Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your NFTs</h2>
                <div className="badge badge-lg p-3 bg-secondary">NFTs can be listed for sale</div>
              </div>
              
              {userNFTs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userNFTs.map((nft) => (
                    <div
                      key={nft.id}
                      className="card bg-teal-900 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                      onClick={() => handleSellClick(nft)}
                    >
                      <figure className="px-0 pt-0 relative">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <span className="badge badge-secondary">{nft.category}</span>
                          <span className="badge badge-outline ml-2">{nft.rarity}</span>
                        </div>
                      </figure>
                      <div className="card-body">
                        <h2 className="card-title">{nft.name}</h2>
                        <p className="text-sm line-clamp-2 text-teal-200">{nft.description}</p>
                        <div className="card-actions justify-end mt-2">
                          <button
                            className="btn btn-secondary btn-sm rounded-full px-6"
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
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-800 rounded-box">
                  <div className="text-6xl mb-4">🖼️</div>
                  <h3 className="text-2xl font-bold mb-2">No NFTs yet</h3>
                  <p className="text-gray-400 mb-4">Collect NFTs by playing games or buy them from the marketplace</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab("buy")}>Go to Marketplace</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Transactions</h2>
              <div className="badge badge-lg p-3 bg-accent">Recent blockchain activity</div>
            </div>
            
            {recentTransactions.length > 0 ? (
              <div className="overflow-x-auto bg-gray-800 rounded-box shadow-xl">
                <table className="table table-zebra w-full">
                  <thead className="bg-gray-900">
                    <tr>
                      <th>Transaction</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td>
                          <a
                            href={tx.explorerLink}
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
                            } p-3`}
                          >
                            {tx.status === "pending" && <span className="loading loading-spinner loading-xs mr-1"></span>}
                            {tx.status}
                          </span>
                        </td>
                        <td>{new Date(tx.timestamp).toLocaleString()}</td>
                        <td>
                          <a
                            href={tx.explorerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-outline"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-800 rounded-box">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-2">No transactions yet</h3>
                <p className="text-gray-400 mb-4">Your blockchain transactions will appear here</p>
                <button className="btn btn-primary" onClick={() => setActiveTab("buy")}>Start Trading</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-primary text-primary-content p-6">
              <h2 className="text-2xl font-bold">
                Buy {selectedItem.name}
              </h2>
            </div>
            
            <div className="p-6">
              {selectedItem.type === "resource" ? (
                <div className="mb-6">
                  <div className="flex items-center justify-center text-6xl mb-4">
                    {selectedItem.icon}
                  </div>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Quantity</span>
                      <span className="label-text-alt">Available: {selectedItem.available}</span>
                    </div>
                    <div className="join w-full">
                      <button 
                        className="btn join-item bg-gray-700"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedItem.available}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="input input-bordered join-item w-full text-center text-black bg-gray-100"
                        style={{ color: 'black' }}
                      />
                      <button 
                        className="btn join-item bg-gray-700"
                        onClick={() => setQuantity(Math.min(selectedItem.available, quantity + 1))}
                        disabled={quantity >= selectedItem.available}
                      >
                        +
                      </button>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="mb-6">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="rounded-lg w-full h-48 object-cover mb-4"
                  />
                  <div className="flex gap-2 mb-4">
                    <span className="badge badge-secondary">{selectedItem.category}</span>
                    <span className="badge badge-outline">{selectedItem.rarity}</span>
                  </div>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              )}
              
              <div className="bg-gray-900 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span>Item Price:</span>
                  <span className="font-medium">{selectedItem.price} APT</span>
                </div>
                {selectedItem.type === "resource" && quantity > 1 && (
                  <div className="flex justify-between items-center mb-2">
                    <span>Quantity:</span>
                    <span className="font-medium">x{quantity}</span>
                  </div>
                )}
                <div className="divider my-2"></div>
                <div className="flex justify-between items-center text-primary">
                  <span className="font-bold">Total Price:</span>
                  <span className="font-bold text-lg">
                    {selectedItem.type === "resource"
                      ? (selectedItem.price * quantity).toFixed(2)
                      : selectedItem.price}{" "}
                    APT
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  className="btn btn-outline flex-1 text-gray-300 hover:bg-gray-700"
                  onClick={() => setShowBuyModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleBuy}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Buy Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-secondary text-secondary-content p-6">
              <h2 className="text-2xl font-bold">
                Sell {selectedItem.name}
              </h2>
            </div>
            
            <div className="p-6">
              {selectedItem.type === "resource" ? (
                <div className="mb-6">
                  <div className="flex items-center justify-center text-6xl mb-4">
                    {selectedItem.icon}
                  </div>
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Quantity</span>
                      <span className="label-text-alt">
                        Owned: {userResources.find((r) => r.name === selectedItem.name)?.quantity || 0}
                      </span>
                    </div>
                    <div className="join w-full">
                      <button 
                        className="btn join-item bg-gray-700"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={
                          userResources.find((r) => r.name === selectedItem.name)
                            ?.quantity || 0
                        }
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="input input-bordered join-item w-full text-center text-black bg-gray-100"
                        style={{ color: 'black' }}
                      />
                      <button 
                        className="btn join-item bg-gray-700"
                        onClick={() => setQuantity(Math.min(
                          userResources.find((r) => r.name === selectedItem.name)?.quantity || 0, 
                          quantity + 1
                        ))}
                        disabled={quantity >= (userResources.find((r) => r.name === selectedItem.name)?.quantity || 0)}
                      >
                        +
                      </button>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="mb-6">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="rounded-lg w-full h-48 object-cover mb-4"
                  />
                  <div className="flex gap-2 mb-4">
                    <span className="badge badge-secondary">{selectedItem.category}</span>
                    <span className="badge badge-outline">{selectedItem.rarity}</span>
                  </div>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              )}
              
              <div className="bg-gray-900 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span>Item Value:</span>
                  <span className="font-medium">{(selectedItem.price * 0.95).toFixed(2)} APT</span>
                </div>
                {selectedItem.type === "resource" && quantity > 1 && (
                  <div className="flex justify-between items-center mb-2">
                    <span>Quantity:</span>
                    <span className="font-medium">x{quantity}</span>
                  </div>
                )}
                <div className="divider my-2"></div>
                <div className="flex justify-between items-center text-secondary">
                  <span className="font-bold">Total Value:</span>
                  <span className="font-bold text-lg">
                    {selectedItem.type === "resource"
                      ? ((selectedItem.price * 0.95) * quantity).toFixed(2)
                      : selectedItem.price}{" "}
                    APT
                  </span>
                </div>
                {selectedItem.type === "resource" && (
                  <div className="text-center mt-2 text-sm text-gray-400">
                    (5% marketplace fee applied)
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  className="btn btn-outline flex-1 text-gray-300 hover:bg-gray-700"
                  onClick={() => setShowSellModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-secondary flex-1"
                  onClick={handleSell}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Sell Now"
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
