import React, { useState, useEffect } from 'react';

interface AptosWalletConnectProps {
  onWalletConnect: (address: string) => void;
}

// Mock addresses for demonstration
const mockAddresses = [
  '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
  '0xabcdef1234567890abcdef1234567890abcdef12',
  '0x9876543210fedcba9876543210fedcba98765432'
];

const AptosWalletConnect: React.FC<AptosWalletConnectProps> = ({ onWalletConnect }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    // Check if wallet address exists in localStorage
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
      setIsConnected(true);
      onWalletConnect(savedAddress);
    }
  }, [onWalletConnect]);

  const handleConnect = async () => {
    setIsLoading(true);
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
    localStorage.setItem('walletAddress', randomAddress);
    setWalletAddress(randomAddress);
    setIsConnected(true);
    setIsLoading(false);
    onWalletConnect(randomAddress);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('walletAddress');
    setWalletAddress('');
    setIsConnected(false);
    setShowDropdown(false);
    onWalletConnect('');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative">
      {isConnected ? (
        <>
          <button 
            onClick={toggleDropdown}
            className="cyber-button neon-border-blue text-glow-blue flex items-center justify-between w-full"
          >
            <span className="mr-2">👤</span>
            <span className="truncate">{shortenAddress(walletAddress)}</span>
            <span className="ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-full cyber-panel cyber-glass z-10 cyber-pulse">
              <div className="p-2">
                <div className="mb-2 text-xs text-gray-400">Connected Wallet</div>
                <div className="text-sm text-glow-green mb-3 break-all">{walletAddress}</div>
                <button 
                  onClick={handleDisconnect}
                  className="cyber-button-small neon-border-pink text-glow-pink w-full"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <button 
          onClick={handleConnect}
          disabled={isLoading}
          className={`cyber-button neon-border-green text-glow-green ${isLoading ? 'opacity-70' : 'hover:bg-opacity-30'}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="cyber-loading w-5 h-5 mr-2"></div>
              Connecting...
            </div>
          ) : (
            <>
              <span className="mr-2">🔌</span>
              Connect Wallet
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AptosWalletConnect;
