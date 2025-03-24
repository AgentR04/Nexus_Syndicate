import { AptosClient, Types, BCS, TxnBuilderTypes } from "aptos";
import { isPetraInstalled } from "../types/wallet";

// Aptos network configuration
const APTOS_NETWORK = {
  MAINNET: "https://fullnode.mainnet.aptoslabs.com/v1",
  TESTNET: "https://fullnode.testnet.aptoslabs.com/v1",
  DEVNET: "https://fullnode.devnet.aptoslabs.com/v1",
};

// Initialize Aptos client (using testnet for development)
const aptosClient = new AptosClient(APTOS_NETWORK.TESTNET);

// Game contract address - this should be updated with the actual deployed contract address
export const GAME_CONTRACT_ADDRESS = "0x1"; // Using 0x1 as a temporary placeholder

// Flag to use mock implementation (set to false for production)
export const USE_MOCK_IMPLEMENTATION = true;

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
    if (!window.aptos) {
      throw new Error("Petra wallet is not installed");
    }

    // Sign and submit the transaction
    const response = await window.aptos.signAndSubmitTransaction(payload);
    return response.hash;
  } catch (error) {
    console.error("Error signing and submitting transaction:", error);
    throw error;
  }
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

    const payload: Types.EntryFunctionPayload = {
      function: `${GAME_CONTRACT_ADDRESS}::marketplace::buy_resource`,
      type_arguments: [],
      arguments: [resourceType, amount],
    };

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
 * @returns Transaction hash
 */
export const sellResource = async (
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

    const payload: Types.EntryFunctionPayload = {
      function: `${GAME_CONTRACT_ADDRESS}::marketplace::sell_resource`,
      type_arguments: [],
      arguments: [resourceType, amount],
    };

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

    const payload: Types.EntryFunctionPayload = {
      function: `${GAME_CONTRACT_ADDRESS}::marketplace::buy_nft`,
      type_arguments: [],
      arguments: [nftId],
    };

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

    const payload: Types.EntryFunctionPayload = {
      function: `${GAME_CONTRACT_ADDRESS}::marketplace::sell_nft`,
      type_arguments: [],
      arguments: [nftId, price],
    };

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

    const txn = await aptosClient.getTransactionByHash(txnHash);

    // Convert Aptos transaction response to our simplified format
    if (txn.type === "user_transaction") {
      // For user transactions, we can check the success field
      const userTxn = txn as any; // Type assertion to access success property
      return {
        status: userTxn.success ? "success" : "failed",
      };
    } else if (txn.type === "pending_transaction") {
      // For pending transactions
      return { status: "pending" };
    } else {
      // For other transaction types
      return { status: "failed" };
    }
  } catch (error) {
    console.error("Error checking transaction:", error);
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock status even on error for development
      return { status: "success" };
    }
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
