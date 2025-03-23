import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AptosWalletConnect from "./AptosWalletConnect";
import { useGame } from "../../context/GameContext";

interface NavbarProps {
  onWalletConnect?: (address: string) => void;
  walletAddress?: string;
  onSignOut?: () => void;
  showGameMapButton?: boolean;
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  onWalletConnect,
  walletAddress,
  onSignOut,
  showGameMapButton = false,
  title,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentPlayer } = useGame();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleWalletConnect = (address: string) => {
    if (onWalletConnect) {
      onWalletConnect(address);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-dark-blue border-b border-neon-blue">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-cyber text-neon-purple">
            {title ? (
              <>
                NEXUS <span className="text-neon-blue">{title}</span>
              </>
            ) : (
              <>
                NEXUS <span className="text-neon-blue">SYNDICATES</span>
              </>
            )}
          </Link>

          {/* Only show navigation links if we're not on the game map */}
          {location.pathname !== "/map" && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`font-cyber ${
                  isActive("/dashboard")
                    ? "text-neon-green border-b-2 border-neon-green"
                    : "text-light-gray hover:text-neon-green"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`font-cyber ${
                  isActive("/profile")
                    ? "text-neon-green border-b-2 border-neon-green"
                    : "text-light-gray hover:text-neon-green"
                }`}
              >
                Profile
              </Link>
            </nav>
          )}

          {/* Back arrow when on game map or syndicate management */}
          {(location.pathname === "/map" || location.pathname === "/syndicate-management") && (
            <button
              className="text-neon-blue hover:text-neon-purple"
              onClick={() => navigate(-1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Player status */}
          {currentPlayer && (
            <div className="bg-dark-blue px-3 py-1 rounded border border-neon-blue hidden md:block">
              <span className="text-neon-blue text-sm">
                {currentPlayer.name} |{" "}
              </span>
              <span className="text-neon-green text-sm">
                💰 {currentPlayer.resources.credits}
              </span>
            </div>
          )}

          {/* Wallet connection */}
          <div>
            {onWalletConnect ? (
              <AptosWalletConnect onWalletConnect={handleWalletConnect} />
            ) : (
              <AptosWalletConnect onWalletConnect={(address) => console.log("Wallet connected:", address)} />
            )}
          </div>

          {/* Game Map Button
          {showGameMapButton && location.pathname !== "/map" && (
            <button
              onClick={() => navigate("/map")}
              className="cyber-button-small bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30"
            >
              Enter Game Map
            </button>
          )} */}

          {/* Wallet Address */}
          {/* {walletAddress ? (
            <div className="flex items-center space-x-2">
              <span className="text-neon-blue text-sm truncate max-w-[120px]">
                {walletAddress}
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-neon-green hover:text-neon-blue transition-colors text-sm"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : null} */}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-dark-gray border-b border-neon-blue p-4 mt-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/dashboard" 
                className={`${isActive('/dashboard') ? 'text-neon-green font-cyber' : 'text-light-gray hover:text-neon-green'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/map" 
                className={`${isActive('/map') ? 'text-neon-green font-cyber' : 'text-light-gray hover:text-neon-green'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Game Map
              </Link>
              <Link 
                to="/marketplace" 
                className={`${isActive('/marketplace') ? 'text-neon-green font-cyber' : 'text-light-gray hover:text-neon-green'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link 
                to="/syndicate-management" 
                className={`${isActive('/syndicate-management') ? 'text-neon-green font-cyber' : 'text-light-gray hover:text-neon-green'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Syndicate
              </Link>
              <Link 
                to="/profile" 
                className={`${isActive('/profile') ? 'text-neon-green font-cyber' : 'text-light-gray hover:text-neon-green'} transition-colors font-cyber`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              
              {/* Wallet Connection (Mobile) */}
              <div className="pt-2">
                {!walletAddress ? (
                  <div>
                    {onWalletConnect ? (
                      <AptosWalletConnect onWalletConnect={onWalletConnect} />
                    ) : (
                      <AptosWalletConnect onWalletConnect={(address) => console.log("Wallet connected:", address)} />
                    )}
                  </div>
                ) : (
                  <div className="text-neon-blue font-cyber text-sm">
                    {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Secondary Navigation Bar */}
      <div className="bg-dark-gray border-b border-neon-purple">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-center md:justify-start space-x-1 md:space-x-6 overflow-x-auto">
            <Link
              to="/map"
              className={`px-3 py-1 rounded-md font-cyber text-sm ${
                isActive("/map")
                  ? "bg-neon-blue bg-opacity-20 text-neon-blue border border-neon-blue"
                  : "text-light-gray hover:text-neon-blue hover:bg-dark-blue hover:bg-opacity-30"
              }`}
            >
              🌐 ENTER GAME MAP
            </Link>
            <Link
              to="/multiplayer"
              className={`px-3 py-1 rounded-md font-cyber text-sm ${
                isActive("/multiplayer")
                  ? "bg-neon-purple bg-opacity-20 text-neon-purple border border-neon-purple"
                  : "text-light-gray hover:text-neon-purple hover:bg-dark-blue hover:bg-opacity-30"
              }`}
            >
              👥 MULTIPLAYER
            </Link>
            <Link
              to="/marketplace"
              className={`px-3 py-1 rounded-md font-cyber text-sm ${
                isActive("/marketplace")
                  ? "bg-neon-green bg-opacity-20 text-neon-green border border-neon-green"
                  : "text-light-gray hover:text-neon-green hover:bg-dark-blue hover:bg-opacity-30"
              }`}
            >
              💹 MARKETPLACE
            </Link>
            <Link
              to="/syndicate-management"
              className={`px-3 py-1 rounded-md font-cyber text-sm ${
                isActive("/syndicate-management")
                  ? "bg-neon-purple bg-opacity-20 text-neon-purple border border-neon-purple"
                  : "text-light-gray hover:text-neon-purple hover:bg-dark-blue hover:bg-opacity-30"
              }`}
            >
              🏙️ SYNDICATE
            </Link>
            <Link
              to="/smugglers-run"
              className={`px-3 py-1 rounded-md font-cyber text-sm ${
                isActive("/smugglers-run")
                  ? "bg-neon-pink bg-opacity-20 text-neon-pink border border-neon-pink"
                  : "text-light-gray hover:text-neon-pink hover:bg-dark-blue hover:bg-opacity-30"
              }`}
            >
              🚀 SMUGGLERS RUN
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
