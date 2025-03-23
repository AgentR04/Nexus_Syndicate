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

  const handleSignIn = (username: string, password: string) => {
    // Authenticate user with wallet address if available
    const success = authService.signIn(username, password, walletAddress);
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
              element={
                isAuthenticated ? (
                  <Navigate to="/howtoplay" />
                ) : (
                  <SignUp
                    onSignUp={(username) => {
                      authService.signIn(username, "");
                      setIsAuthenticated(true);
                      setUsername(username);
                    }}
                  />
                )
              }
            />
            <Route
              path="/signin"
              element={
                isAuthenticated ? (
                  <Navigate to="/howtoplay" />
                ) : (
                  <div className="min-h-screen bg-dark-blue flex flex-col">
                    <Navbar
                      onWalletConnect={handleWalletConnect}
                      walletAddress={walletAddress}
                      onSignOut={handleSignOut}
                    />
                    <div className="flex-grow flex items-center justify-center p-4">
                      <div className="cyber-panel p-8 max-w-md w-full">
                        <h2 className="text-2xl font-cyber text-neon-purple mb-6 text-center">
                          SIGN <span className="text-neon-blue">IN</span>
                        </h2>
                        <form
                          className="space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const username = (
                              document.querySelector(
                                'input[type="text"]'
                              ) as HTMLInputElement
                            ).value;
                            const password = (
                              document.querySelector(
                                'input[type="password"]'
                              ) as HTMLInputElement
                            ).value;
                            handleSignIn(username, password);
                          }}
                        >
                          <div>
                            <label className="block text-light-gray mb-1">
                              Username or Email
                            </label>
                            <input
                              type="text"
                              className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                              placeholder="Enter your username or email"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-light-gray mb-1">
                              Password
                            </label>
                            <input
                              type="password"
                              className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                              placeholder="Enter your password"
                              required
                            />
                          </div>

                          <div className="border-t border-neon-blue pt-4 mt-4">
                            <div className="text-center text-light-gray mb-3">
                              <p>Connect your wallet for enhanced security</p>
                            </div>
                            <div className="flex justify-center mb-4">
                              {walletAddress ? (
                                <div className="text-neon-green text-sm">
                                  Wallet connected:{" "}
                                  {walletAddress.substring(0, 6)}...
                                  {walletAddress.substring(
                                    walletAddress.length - 4
                                  )}
                                </div>
                              ) : (
                                <div className="w-full flex justify-center">
                                  <AptosWalletConnect
                                    onWalletConnect={handleWalletConnect}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full px-4 py-2 bg-neon-blue text-dark-blue hover:bg-neon-blue-bright transition-colors rounded font-cyber"
                          >
                            SIGN IN
                          </button>
                          <div className="text-center text-light-gray">
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
                        </form>
                      </div>
                    </div>
                  </div>
                )
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
            <Route path="/governance/:syndicateId" element={<Governance />} />
            <Route path="/smugglers-run" element={<SmugglersRun />} />
            <Route
              path="/"
              element={
                <div className="min-h-screen bg-dark-blue flex flex-col">
                  <Navbar
                    onWalletConnect={handleWalletConnect}
                    walletAddress={walletAddress}
                    onSignOut={handleSignOut}
                  />
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
