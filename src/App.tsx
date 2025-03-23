import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import GameMap from "./pages/GameMap";
import UserProfile from "./pages/UserProfile";
import HowToPlay from "./pages/HowToPlay";
import Marketplace from "./pages/Marketplace";
import SyndicateManagement from "./pages/SyndicateManagement";
import Governance from "./pages/Governance";
import Navbar from "./components/common/Navbar";
import AptosWalletConnect from "./components/common/AptosWalletConnect";
import authService from "./services/authService";
import { GameProvider } from "./context/GameContext";
import "./App.css";
import SmugglersRun from "./pages/SmugglersRun";
import Multiplayer from "./pages/Multiplayer";

function App() {
  const [walletAddress, setWalletAddress] = useState<string>(
    authService.getWalletAddress()
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authService.isAuthenticated()
  );
  const [username, setUsername] = useState<string>(
    authService.getUser()?.username || ""
  );

  // Initialize state from auth service
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setWalletAddress(authService.getWalletAddress());
    const user = authService.getUser();
    if (user) {
      setUsername(user.username);
    }
  }, []);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    authService.saveWalletAddress(address);

    // If a wallet is connected but not authenticated, create a user
    if (!isAuthenticated) {
      authService.signIn(`Player_${address.substring(0, 6)}`, "");
      setIsAuthenticated(true);
      setUsername(`Player_${address.substring(0, 6)}`);
    }
  };

  const handleSignIn = (username: string, walletAddress: string) => {
    // Authenticate user with wallet address if available
    const success = authService.signIn(username, "", walletAddress);
    if (success) {
      setIsAuthenticated(true);
      setUsername(username);
    }
  };

  const handleSignOut = () => {
    authService.signOut();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <GameProvider>
        <div className="App">
          <Routes>
            <Route
              path="/signup"
              element={<SignUp
                onSignUp={(username) => {
                  // Create a new account when user completes the sign up process
                  authService.signIn(username, "");
                  setIsAuthenticated(true);
                  setUsername(username);
                }}
              />}
            />
            <Route
              path="/signin"
              element={
                <div className="min-h-screen bg-dark-blue flex flex-col">
                  <div className="flex-grow flex items-center justify-center p-4">
                    <div className="cyber-panel p-8 max-w-md w-full">
                      <h2 className="text-2xl font-cyber text-neon-purple mb-6 text-center">
                        SIGN <span className="text-neon-blue">IN</span>
                      </h2>
                      <div className="space-y-6">
                        <div className="text-center text-light-gray mb-6">
                          <p>Connect your wallet to sign in to Nexus Syndicates</p>
                        </div>
                        
                        {walletAddress ? (
                          <>
                            <div className="text-center text-neon-green mb-4 p-3 bg-dark-blue/50 rounded-md">
                              <p>Wallet connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</p>
                            </div>
                            <button
                              onClick={() => {
                                // Use wallet address to authenticate
                                handleSignIn(`Player_${walletAddress.substring(0, 6)}`, walletAddress);
                                // Redirect to dashboard
                                window.location.href = "/dashboard";
                              }}
                              className="w-full px-4 py-2 bg-neon-blue text-dark-blue hover:bg-neon-blue-bright transition-colors rounded font-cyber"
                            >
                              ENTER NEXUS SYNDICATES
                            </button>
                          </>
                        ) : (
                          <div className="w-full flex justify-center">
                            <AptosWalletConnect
                              onWalletConnect={handleWalletConnect}
                            />
                          </div>
                        )}
                        
                        <div className="text-center text-light-gray mt-6">
                          <p>
                            Don't have an account?{" "}
                            <Link
                              to="/signup"
                              className="text-neon-purple hover:text-neon-blue"
                            >
                              Sign Up
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<GameMap />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/howtoplay" element={<HowToPlay />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route
              path="/syndicate-management"
              element={<SyndicateManagement />}
            />
            <Route path="/governance" element={<Governance />} />
            <Route path="/smugglers-run" element={<SmugglersRun />} />
            <Route path="/multiplayer" element={<Multiplayer />} />
            <Route
              path="/"
              element={
                <div className="min-h-screen bg-dark-blue flex flex-col">
                  {/* <Navbar
                    onWalletConnect={handleWalletConnect}
                    walletAddress={walletAddress}
                    onSignOut={handleSignOut}
                  /> */}
                  <div className="flex-grow flex items-center justify-center p-4">
                    <div className="cyber-panel p-8 max-w-2xl w-full">
                      <h1 className="text-4xl md:text-6xl font-cyber text-neon-purple mb-6 text-center animate-glitch">
                        NEXUS <span className="text-neon-blue">SYNDICATES</span>
                      </h1>
                      <p className="text-light-gray text-lg mb-8 text-center">
                        A strategic trading and territory control game set in a
                        cyberpunk metaverse
                      </p>
                      <div className="flex flex-col space-y-4">
                        <Link to="/signup" className="neon-button text-center">
                          SIGN UP
                        </Link>
                        <Link
                          to="/signin"
                          className="px-4 py-2 bg-dark-gray border-2 border-neon-blue text-neon-blue 
                                       hover:bg-neon-blue hover:text-dark-blue transition-all duration-300 
                                       shadow-neon-blue rounded-md font-cyber text-center"
                        >
                          SIGN IN
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </GameProvider>
    </Router>
  );
}

export default App;
