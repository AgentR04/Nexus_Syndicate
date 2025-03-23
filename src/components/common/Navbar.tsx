import React from "react";
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
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className={`${
                  isActive("/dashboard")
                    ? "text-neon-blue"
                    : "text-neon-green hover:text-neon-blue"
                } transition-colors`}
              >
                Dashboard
              </Link>
              <Link
                to="/map"
                className={`${
                  isActive("/map")
                    ? "text-neon-blue"
                    : "text-neon-yellow hover:text-neon-blue"
                } transition-colors font-cyber`}
              >
                Game Map
              </Link>
              <Link
                to="/profile"
                className={`${
                  isActive("/profile")
                    ? "text-neon-blue"
                    : "text-neon-blue hover:text-neon-purple"
                } transition-colors font-cyber`}
              >
                Profile
              </Link>
              <Link
                to="/howtoplay"
                className={`${
                  isActive("/howtoplay")
                    ? "text-neon-blue"
                    : "text-neon-purple hover:text-neon-green"
                } transition-colors font-cyber`}
              >
                How to Play
              </Link>
            </div>
          )}

          {/* Back to Dashboard button when on game map */}
          {location.pathname === "/map" && (
            <button
              className="cyber-button-small bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Player status */}
          {currentPlayer && (
            <div className="bg-dark-blue px-3 py-1 rounded border border-neon-green hidden md:block">
              <span className="text-neon-green text-sm">
                {currentPlayer.name} |{" "}
              </span>
              <span className="text-neon-blue text-sm">
                💰 {currentPlayer.resources.credits}
              </span>
            </div>
          )}

          {/* Wallet connection */}
          <AptosWalletConnect onWalletConnect={handleWalletConnect} />

          {/* Game Map Button */}
          {showGameMapButton && location.pathname !== "/map" && (
            <button
              onClick={() => navigate("/map")}
              className="cyber-button-small bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30"
            >
              Enter Game Map
            </button>
          )}

          {/* Wallet Address */}
          {/* {walletAddress ? (
            <div className="flex items-center space-x-2">
              <span className="text-neon-green text-sm truncate max-w-[120px]">
                {walletAddress}
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-neon-red hover:text-neon-pink transition-colors text-sm"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : null} */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
