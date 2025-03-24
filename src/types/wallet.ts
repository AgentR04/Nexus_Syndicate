// Type definitions and utility functions for wallet interactions

// Petra wallet interface
export interface PetraWallet {
  connect: () => Promise<{ address: string }>;
  disconnect: () => Promise<void>;
  isConnected: () => Promise<boolean>;
  account: () => Promise<{ address: string }>;
  network: () => Promise<{ name: string }>;
  signAndSubmitTransaction: (transaction: any) => Promise<{ hash: string }>;
}

// Declare the global window object with the aptos property
declare global {
  interface Window {
    aptos?: PetraWallet;
  }
}

// Utility functions for interacting with the Petra wallet
export const isPetraInstalled = (): boolean => {
  return window.aptos !== undefined;
};

export const connectPetraWallet = async (): Promise<string> => {
  if (!isPetraInstalled()) {
    throw new Error('Petra wallet not installed');
  }
  
  try {
    const response = await window.aptos?.connect();
    if (response && response.address) {
      return response.address;
    }
    throw new Error('Failed to get wallet address');
  } catch (error) {
    console.error('Error connecting to Petra wallet:', error);
    throw error;
  }
};

export const disconnectPetraWallet = async (): Promise<void> => {
  if (!isPetraInstalled()) {
    throw new Error('Petra wallet not installed');
  }
  
  try {
    await window.aptos?.disconnect();
  } catch (error) {
    console.error('Error disconnecting from Petra wallet:', error);
    throw error;
  }
};

export const getPetraWalletAccount = async (): Promise<{ address: string }> => {
  if (!isPetraInstalled()) {
    throw new Error('Petra wallet not installed');
  }
  
  try {
    const account = await window.aptos?.account();
    if (account) {
      return account;
    }
    throw new Error('Failed to get wallet account');
  } catch (error) {
    console.error('Error getting Petra wallet account:', error);
    throw error;
  }
};

export const isPetraWalletConnected = async (): Promise<boolean> => {
  if (!isPetraInstalled()) {
    return false;
  }
  
  try {
    return await window.aptos?.isConnected() || false;
  } catch (error) {
    console.error('Error checking Petra wallet connection:', error);
    return false;
  }
};
