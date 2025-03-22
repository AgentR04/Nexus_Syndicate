import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AptosWalletConnect from './AptosWalletConnect';

interface NavbarProps {
  onWalletConnect?: (address: string) => void;
  walletAddress?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onWalletConnect, walletAddress }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleWalletConnect = (address: string) => {
    if (onWalletConnect) {
      onWalletConnect(address);
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-dark-gray border-b border-neon-blue p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-cyber text-neon-purple">
          NEXUS <span className="text-neon-blue">SYNDICATES</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard" 
            className={`${isActive('/dashboard') ? 'text-neon-blue' : 'text-neon-green hover:text-neon-blue'} transition-colors`}
          >
            Dashboard
          </Link>
          <Link 
            to="/map" 
            className={`${isActive('/map') ? 'text-neon-blue' : 'text-neon-yellow hover:text-neon-blue'} transition-colors font-cyber`}
          >
            Game Map
          </Link>
          <Link 
            to="/profile" 
            className={`${isActive('/profile') ? 'text-neon-blue' : 'text-neon-blue hover:text-neon-purple'} transition-colors font-cyber`}
          >
            Profile
          </Link>
          <Link 
            to="/howtoplay" 
            className={`${isActive('/howtoplay') ? 'text-neon-blue' : 'text-neon-purple hover:text-neon-green'} transition-colors font-cyber`}
          >
            How To Play
          </Link>
          <div className="w-48">
            <AptosWalletConnect onWalletConnect={handleWalletConnect} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
