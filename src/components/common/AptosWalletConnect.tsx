import React, { useState, useEffect } from 'react';
import { Types } from 'aptos';
import { 
  isPetraInstalled, 
  connectPetraWallet, 
  disconnectPetraWallet, 
  getPetraWalletAccount, 
  isPetraWalletConnected 
} from '../../types/wallet';

interface AptosWalletConnectProps {
  onWalletConnect: (address: string) => void;
}

const AptosWalletConnect: React.FC<AptosWalletConnectProps> = ({ onWalletConnect }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [networkName, setNetworkName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Check connection status on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isPetraInstalled()) {
        try {
          const connected = await isPetraWalletConnected();
          if (connected) {
            const account = await getPetraWalletAccount();
            if (account.address) {
              setWalletAddress(account.address);
              setIsConnected(true);
              onWalletConnect(account.address);
              // Get network info if needed
              if (window.aptos?.network) {
                const network = await window.aptos.network();
                if (network?.name) {
                  setNetworkName(network.name);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, [onWalletConnect]);

  // Connect to wallet
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const address = await connectPetraWallet();
      setWalletAddress(address);
      setIsConnected(true);
      onWalletConnect(address);
      
      // Get network info if needed
      if (window.aptos?.network) {
        const network = await window.aptos.network();
        if (network?.name) {
          setNetworkName(network.name);
        }
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from wallet
  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnectPetraWallet();
      setWalletAddress('');
      setIsConnected(false);
      setNetworkName('');
      onWalletConnect('');
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative">
      {isConnected ? (
        <div className="flex items-center">
          <button
            className="cyber-button-small flex items-center"
            onClick={toggleDropdown}
          >
            <span className="w-3 h-3 rounded-full bg-neon-green mr-2"></span>
            <span className="truncate max-w-[120px]">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <span className="ml-2">▼</span>
          </button>
          
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-cyber-dark border border-neon-blue rounded-md shadow-lg z-10">
              <div className="p-2 border-b border-neon-blue">
                <p className="text-xs text-neon-green">Connected to {networkName || 'Aptos'}</p>
                <p className="text-xs text-neon-blue truncate">{walletAddress}</p>
              </div>
              <button
                className="w-full text-left p-2 hover:bg-cyber-dark-hover text-neon-pink"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          className="cyber-button-small border-neon-blue"
          onClick={handleConnect}
          disabled={isLoading || !isPetraInstalled()}
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      
      {!isPetraInstalled() && (
        <p className="text-xs text-neon-pink mt-1">
          Petra wallet not detected. Please install it.
        </p>
      )}
    </div>
  );
};

export default AptosWalletConnect;
