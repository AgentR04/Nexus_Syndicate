import { AptosClient, Types, BCS, TxnBuilderTypes } from 'aptos';

// Aptos network configuration
const APTOS_NETWORK = {
  MAINNET: 'https://fullnode.mainnet.aptoslabs.com/v1',
  TESTNET: 'https://fullnode.testnet.aptoslabs.com/v1',
  DEVNET: 'https://fullnode.devnet.aptoslabs.com/v1',
};

// Initialize Aptos client (using testnet for development)
const aptosClient = new AptosClient(APTOS_NETWORK.TESTNET);

// Use a mock contract address for development
// In production, this would be the actual deployed contract address
const GAME_CONTRACT_ADDRESS = '0x1'; // Using a simple address for mock purposes

// Flag to use mock implementation (set to true for development)
const USE_MOCK_IMPLEMENTATION = true;

// Resource types
export const RESOURCE_TYPES = {
  CREDITS: 'Credits',
  DATA_SHARDS: 'DataShards',
  QUANTUM_CORES: 'QuantumCores',
  SYNTHETIC_ALLOYS: 'SyntheticAlloys',
  NEURAL_PROCESSORS: 'NeuralProcessors',
  INFLUENCE_TOKENS: 'InfluenceTokens',
};

// NFT categories
export const NFT_CATEGORIES = {
  AGENT: 'Agent',
  TERRITORY: 'Territory',
  EQUIPMENT: 'Equipment',
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
      return [];
    }
    return await aptosClient.getAccountResources(address);
  } catch (error) {
    console.error('Error fetching account resources:', error);
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
    // In a real implementation, this would query the blockchain for NFTs owned by the address
    // For now, we'll return a mock response
    return [];
  } catch (error) {
    console.error('Error fetching account NFTs:', error);
    return [];
  }
};

/**
 * Generate a mock transaction hash for development
 * @returns Mock transaction hash
 */
const generateMockTxHash = (): string => {
  return '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateMockTxHash();
    }
    
    const payload: Types.EntryFunctionPayload = {
      function: `${GAME_CONTRACT_ADDRESS}::marketplace::buy_resource`,
      type_arguments: [],
      arguments: [resourceType, amount],
    };

    const txnRequest = await aptosClient.generateTransaction(senderAddress, payload);
    // In a real implementation, this would be signed by the user's wallet
    return generateMockTxHash();
  } catch (error) {
    console.error('Error buying resource:', error);
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock transaction hash even on error for development
      return generateMockTxHash();
    }
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateMockTxHash();
    }
    
    const payload: Types.EntryFunctionPayload = {
      function: `${GAME_CONTRACT_ADDRESS}::marketplace::sell_resource`,
      type_arguments: [],
      arguments: [resourceType, amount],
    };

    const txnRequest = await aptosClient.generateTransaction(senderAddress, payload);
    // In a real implementation, this would be signed by the user's wallet
    return generateMockTxHash();
  } catch (error) {
    console.error('Error selling resource:', error);
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock transaction hash even on error for development
      return generateMockTxHash();
    }
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateMockTxHash();
    }
    
    const payload: Types.EntryFunctionPayload = {
      function: `${GAME_CONTRACT_ADDRESS}::marketplace::buy_nft`,
      type_arguments: [],
      arguments: [nftId],
    };

    const txnRequest = await aptosClient.generateTransaction(senderAddress, payload);
    // In a real implementation, this would be signed by the user's wallet
    return generateMockTxHash();
  } catch (error) {
    console.error('Error buying NFT:', error);
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock transaction hash even on error for development
      return generateMockTxHash();
    }
    throw error;
  }
};

/**
 * Sell NFT to the marketplace
 * @param senderAddress Seller's wallet address
 * @param nftId ID of the NFT to sell
 * @param price Price in APT
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateMockTxHash();
    }
    
    const payload: Types.EntryFunctionPayload = {
      function: `${GAME_CONTRACT_ADDRESS}::marketplace::sell_nft`,
      type_arguments: [],
      arguments: [nftId, price],
    };

    const txnRequest = await aptosClient.generateTransaction(senderAddress, payload);
    // In a real implementation, this would be signed by the user's wallet
    return generateMockTxHash();
  } catch (error) {
    console.error('Error selling NFT:', error);
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock transaction hash even on error for development
      return generateMockTxHash();
    }
    throw error;
  }
};

/**
 * Check if a transaction is complete
 * @param txnHash Transaction hash
 * @returns Transaction status
 */
export const checkTransaction = async (txnHash: string) => {
  try {
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock transaction status
      return {
        type: 'user_transaction',
        version: '123456789',
        hash: txnHash,
        state_change_hash: generateMockTxHash(),
        event_root_hash: generateMockTxHash(),
        state_checkpoint_hash: null,
        gas_used: '1000',
        success: true,
        vm_status: 'Executed successfully',
        accumulator_root_hash: generateMockTxHash(),
        changes: [],
        timestamp: Date.now().toString(),
      };
    }
    return await aptosClient.getTransactionByHash(txnHash);
  } catch (error) {
    console.error('Error checking transaction:', error);
    if (USE_MOCK_IMPLEMENTATION) {
      // Return mock transaction status even on error
      return {
        type: 'user_transaction',
        version: '123456789',
        hash: txnHash,
        state_change_hash: generateMockTxHash(),
        event_root_hash: generateMockTxHash(),
        state_checkpoint_hash: null,
        gas_used: '1000',
        success: true,
        vm_status: 'Executed successfully',
        accumulator_root_hash: generateMockTxHash(),
        changes: [],
        timestamp: Date.now().toString(),
      };
    }
    throw error;
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
