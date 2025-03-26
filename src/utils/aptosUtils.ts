import { AptosClient, Types, BCS, TxnBuilderTypes } from "aptos";
import { isPetraInstalled } from "../types/wallet";

// Aptos network configuration
const APTOS_NETWORK = {
  MAINNET: "https://fullnode.mainnet.aptoslabs.com/v1",
  TESTNET: "https://fullnode.testnet.aptoslabs.com/v1",
  DEVNET: "https://fullnode.devnet.aptoslabs.com/v1",
};

// Get the current network from environment or default to testnet
const CURRENT_NETWORK = (process.env.REACT_APP_APTOS_NETWORK || 'testnet').toUpperCase();
console.log(`Using Aptos ${CURRENT_NETWORK} network`);

// Initialize Aptos client
const aptosClient = new AptosClient(APTOS_NETWORK[CURRENT_NETWORK as keyof typeof APTOS_NETWORK] || APTOS_NETWORK.TESTNET);

// Game contract address - this should be updated with the actual deployed contract address
export const GAME_CONTRACT_ADDRESS = process.env.REACT_APP_APTOS_CONTRACT_ADDRESS || "0x5af503b5c379bd69f46184304975e9ef6d1e82c705f6e1f8854a576e121a5f42";

// Flag to use mock implementation (set to false for production)
export const USE_MOCK_IMPLEMENTATION = false;

// Resource types
export const RESOURCE_TYPES = {
  CREDITS: "Credits",
  DATA_SHARDS: "DataShards",
  QUANTUM_CORES: "QuantumCores",
  SYNTHETIC_ALLOYS: "SyntheticAlloys",
  NEURAL_PROCESSORS: "NeuralProcessors",
  INFLUENCE_TOKENS: "InfluenceTokens",
};

// NFT categories
export const NFT_CATEGORIES = {
  AGENT: "Agent",
  TERRITORY: "Territory",
  EQUIPMENT: "Equipment",
};

/**
 * Get account resources
 * @param address Wallet address
 * @returns Promise with account resources
 */
export const getAccountResources = async (address: string) => {
  try {
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock resources for development
      return [
        {
          type: `${GAME_CONTRACT_ADDRESS}::resources::${RESOURCE_TYPES.CREDITS}`,
          data: { value: 1000 },
        },
        {
          type: `${GAME_CONTRACT_ADDRESS}::resources::${RESOURCE_TYPES.DATA_SHARDS}`,
          data: { value: 50 },
        },
        {
          type: `${GAME_CONTRACT_ADDRESS}::resources::${RESOURCE_TYPES.QUANTUM_CORES}`,
          data: { value: 25 },
        },
        {
          type: `${GAME_CONTRACT_ADDRESS}::resources::${RESOURCE_TYPES.SYNTHETIC_ALLOYS}`,
          data: { value: 75 },
        },
        {
          type: `${GAME_CONTRACT_ADDRESS}::resources::${RESOURCE_TYPES.NEURAL_PROCESSORS}`,
          data: { value: 30 },
        },
        {
          type: `${GAME_CONTRACT_ADDRESS}::resources::${RESOURCE_TYPES.INFLUENCE_TOKENS}`,
          data: { value: 15 },
        },
      ];
    }
    return await aptosClient.getAccountResources(address);
  } catch (error) {
    console.error("Error fetching account resources:", error);
    // Return empty array instead of throwing error for development
    return [];
  }
};

/**
 * Get account NFTs
 * @param address Wallet address
 * @returns Promise with account NFTs
 */
export const getAccountNFTs = async (address: string) => {
  try {
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock NFTs for development
      return [
        {
          id: 1,
          name: "Cyber Agent Alpha",
          category: NFT_CATEGORIES.AGENT,
          price: 10,
          image: "/images/nfts/agent1.png",
          owner: address,
        },
        {
          id: 2,
          name: "Neo Tokyo District",
          category: NFT_CATEGORIES.TERRITORY,
          price: 25,
          image: "/images/nfts/territory1.png",
          owner: address,
        },
        {
          id: 3,
          name: "Quantum Disruptor",
          category: NFT_CATEGORIES.EQUIPMENT,
          price: 5,
          image: "/images/nfts/equipment1.png",
          owner: address,
        },
      ];
    }
    
    // In a real implementation, this would query the blockchain for NFTs owned by the address
    // For now, we'll return an empty array for non-mock implementation
    return [];
  } catch (error) {
    console.error("Error fetching account NFTs:", error);
    return [];
  }
};

/**
 * Sign and submit transaction using Petra wallet
 * @param payload Transaction payload
 * @returns Transaction hash
 */
export const signAndSubmitTransaction = async (
  payload: Types.EntryFunctionPayload
): Promise<string> => {
  try {
    // Check if Petra wallet is available
    if (!isPetraInstalled() || !window.aptos) {
      throw new Error("Petra wallet is not installed");
    }

    console.log("Submitting transaction with payload:", JSON.stringify(payload, null, 2));
    
    // Get the current network from Petra wallet
    const network = await window.aptos.network();
    console.log("Petra wallet network:", network);
    
    // Warn if network mismatch
    if (network && network.toLowerCase() !== CURRENT_NETWORK.toLowerCase()) {
      console.warn(`Network mismatch: App is using ${CURRENT_NETWORK} but Petra wallet is on ${network}`);
      alert(`Warning: Your Petra wallet is on ${network} network but the app is configured for ${CURRENT_NETWORK}. Please switch your wallet network.`);
    }

    // Sign and submit the transaction
    const response = await window.aptos.signAndSubmitTransaction(payload);
    
    // Log transaction for debugging
    console.log("Transaction submitted:", response);
    
    // Wait for transaction to be confirmed on the blockchain
    if (response.hash) {
      try {
        console.log("Waiting for transaction confirmation...");
        // Wait for transaction to be confirmed (with timeout)
        await aptosClient.waitForTransaction(response.hash, { timeoutSecs: 30 });
        console.log("Transaction confirmed on blockchain:", response.hash);
      } catch (waitError) {
        console.warn("Transaction may not be confirmed yet:", waitError);
        // Continue anyway since the transaction was submitted
      }
    }
    
    // Log explorer link for easy verification
    const explorerLink = getTransactionExplorerLink(response.hash);
    console.log("View transaction on explorer:", explorerLink);
    
    return response.hash;
  } catch (error) {
    console.error("Error signing and submitting transaction:", error);
    if (error instanceof Error) {
      alert(`Transaction error: ${error.message}`);
    } else {
      alert("Unknown transaction error occurred");
    }
    throw error;
  }
};

/**
 * Get Aptos Explorer link for a transaction
 * @param txHash Transaction hash
 * @returns Explorer URL
 */
export const getTransactionExplorerLink = (txHash: string): string => {
  // Use the current network for the explorer
  const network = CURRENT_NETWORK.toLowerCase();
  console.log(`Creating explorer link for network: ${network}`);
  
  return `https://explorer.aptoslabs.com/txn/${txHash}?network=${network}`;
};

/**
 * Generate a mock transaction hash for development
 * @returns Mock transaction hash
 */
const generateMockTxHash = (): string => {
  return (
    "0x" +
    Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );
};

/**
 * Buy resource from the marketplace
 * @param senderAddress Buyer's wallet address
 * @param resourceType Type of resource to buy
 * @param amount Amount to buy
 * @returns Transaction hash
 */
export const buyResource = async (
  senderAddress: string,
  resourceType: string,
  amount: number
): Promise<string> => {
  try {
    if (USE_MOCK_IMPLEMENTATION) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return generateMockTxHash();
    }

    // For real implementation, we'll use a coin transfer transaction
    // This will show up in the Aptos Explorer
    const payload: Types.EntryFunctionPayload = {
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: ["0x1", (amount * 100).toString()], // Convert to octas (smallest unit)
    };

    console.log("Buying resource with payload:", JSON.stringify(payload, null, 2));

    // Sign and submit transaction using Petra wallet
    return await signAndSubmitTransaction(payload);
  } catch (error) {
    console.error("Error buying resource:", error);
    throw error;
  }
};

/**
 * Sell resource to the marketplace
 * @param senderAddress Seller's wallet address
 * @param resourceType Type of resource to sell
 * @param amount Amount to sell
 * @param price Price per unit
 * @returns Transaction hash
 */
export const sellResource = async (
  senderAddress: string,
  resourceType: string,
  amount: number,
  price: number
): Promise<string> => {
  try {
    if (USE_MOCK_IMPLEMENTATION) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return generateMockTxHash();
    }

    // For real implementation, we'll use a coin transfer transaction
    const payload: Types.EntryFunctionPayload = {
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: ["0x1", "100"], // Small fee for listing (100 octas = 0.000001 APT)
    };

    console.log("Selling resource with payload:", JSON.stringify(payload, null, 2));

    // Sign and submit transaction using Petra wallet
    return await signAndSubmitTransaction(payload);
  } catch (error) {
    console.error("Error selling resource:", error);
    throw error;
  }
};

/**
 * Buy NFT from the marketplace
 * @param senderAddress Buyer's wallet address
 * @param nftId ID of the NFT to buy
 * @returns Transaction hash
 */
export const buyNFT = async (
  senderAddress: string,
  nftId: number
): Promise<string> => {
  try {
    if (USE_MOCK_IMPLEMENTATION) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return generateMockTxHash();
    }

    // For real implementation, we'll use a coin transfer transaction
    const payload: Types.EntryFunctionPayload = {
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: ["0x1", (nftId * 1000).toString()], // Price based on NFT ID
    };

    console.log("Buying NFT with payload:", JSON.stringify(payload, null, 2));

    // Sign and submit transaction using Petra wallet
    return await signAndSubmitTransaction(payload);
  } catch (error) {
    console.error("Error buying NFT:", error);
    throw error;
  }
};

/**
 * Sell NFT to the marketplace
 * @param senderAddress Seller's wallet address
 * @param nftId ID of the NFT to sell
 * @param price Price of the NFT in APT
 * @returns Transaction hash
 */
export const sellNFT = async (
  senderAddress: string,
  nftId: number,
  price: number
): Promise<string> => {
  try {
    if (USE_MOCK_IMPLEMENTATION) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return generateMockTxHash();
    }

    // For real implementation, we'll use a coin transfer transaction
    const payload: Types.EntryFunctionPayload = {
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: ["0x1", "500"], // Listing fee (500 octas = 0.000005 APT)
    };

    console.log("Selling NFT with payload:", JSON.stringify(payload, null, 2));

    // Sign and submit transaction using Petra wallet
    return await signAndSubmitTransaction(payload);
  } catch (error) {
    console.error("Error selling NFT:", error);
    throw error;
  }
};

/**
 * Check if a transaction is complete
 * @param txnHash Transaction hash
 * @returns Transaction status with a consistent format
 */
export const checkTransaction = async (
  txnHash: string
): Promise<{ status: "pending" | "success" | "failed" }> => {
  try {
    if (USE_MOCK_IMPLEMENTATION) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { status: "success" };
    }

    try {
      // First try to get the transaction - if it doesn't exist, it will throw an error
      const txn = await aptosClient.getTransactionByHash(txnHash);

      // Convert Aptos transaction response to our simplified format
      if (txn.type === "user_transaction") {
        // For user transactions, we can check the success field
        const userTxn = txn as Types.UserTransaction;
        
        // Log transaction details for debugging
        console.log("Transaction details:", {
          hash: txnHash,
          sender: userTxn.sender,
          success: userTxn.success,
          timestamp: userTxn.timestamp,
          version: userTxn.version,
          vm_status: userTxn.vm_status
        });
        
        return {
          status: userTxn.success ? "success" : "failed",
        };
      } else if (txn.type === "pending_transaction") {
        // For pending transactions
        console.log("Transaction is still pending:", txnHash);
        return { status: "pending" };
      } else {
        // For other transaction types
        console.log("Unknown transaction type:", txn.type);
        return { status: "failed" };
      }
    } catch (txError) {
      // If the transaction doesn't exist yet, it might be pending
      console.error("Error checking transaction:", txError);
      
      // Check if it's a "transaction not found" error
      if (txError.message && txError.message.includes("not found")) {
        console.log("Transaction not found yet, might be pending:", txnHash);
        return { status: "pending" };
      }
      
      // For other errors, assume failed
      return { status: "failed" };
    }
  } catch (error) {
    console.error("Error in checkTransaction:", error);
    return { status: "failed" };
  }
};

export default {
  aptosClient,
  GAME_CONTRACT_ADDRESS,
  RESOURCE_TYPES,
  NFT_CATEGORIES,
  getAccountResources,
  getAccountNFTs,
  buyResource,
  sellResource,
  buyNFT,
  sellNFT,
  checkTransaction,
};
