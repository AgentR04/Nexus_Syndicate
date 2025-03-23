import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AptosWalletConnect from './AptosWalletConnect';

interface NavbarProps {
  onWalletConnect: (address: string) => void;
  onLogout: () => void;
  walletAddress: string;
}

const Navbar: React.FC<NavbarProps> = ({ onWalletConnect, onLogout, walletAddress }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-dark-blue shadow-lg border-b border-neon-blue">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Wallet Section */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-cyber text-neon-purple mr-2">
                NEXUS <span className="text-neon-blue">SYNDICATES</span>
              </h1>
            </Link>
            
            {/* Wallet Address (Always visible) */}
            <div className="md:hidden ml-4">
              {walletAddress && (
                <div className="text-neon-green font-cyber text-sm">
                  {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-neon-blue hover:text-neon-purple transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-4">
            <Link 
              to="/dashboard" 
              className={`${isActive('/dashboard') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
            >
              Dashboard
            </Link>
            <Link 
              to="/map" 
              className={`${isActive('/map') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
            >
              Game Map
            </Link>
            <Link 
              to="/marketplace" 
              className={`${isActive('/marketplace') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
            >
              Marketplace
            </Link>
            <Link 
              to="/syndicate-management" 
              className={`${isActive('/syndicate-management') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
            >
              Syndicate
            </Link>
            <Link 
              to="/profile" 
              className={`${isActive('/profile') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
            >
              Profile
            </Link>
          </nav>

          {/* Wallet Connection (Desktop) */}
          <div className="hidden md:block">
            {!walletAddress ? (
              <AptosWalletConnect onWalletConnect={onWalletConnect} />
            ) : (
              <div className="text-neon-green font-cyber text-sm">
                {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 border-t border-gray-700 pt-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/dashboard" 
                className={`${isActive('/dashboard') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/map" 
                className={`${isActive('/map') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Game Map
              </Link>
              <Link 
                to="/marketplace" 
                className={`${isActive('/marketplace') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link 
                to="/syndicate-management" 
                className={`${isActive('/syndicate-management') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Syndicate
              </Link>
              <Link 
                to="/profile" 
                className={`${isActive('/profile') ? 'text-neon-blue font-cyber' : 'text-light-gray hover:text-neon-blue'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              
              {/* Wallet Connection (Mobile) */}
              <div className="pt-2">
                {!walletAddress ? (
                  <AptosWalletConnect onWalletConnect={onWalletConnect} />
                ) : (
                  <div className="text-neon-green font-cyber text-sm">
                    {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
