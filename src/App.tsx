import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
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

const App = () => {
  // State for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getUser();
      if (user) {
        setIsAuthenticated(true);
        setUsername(user.username);
        if (user.walletAddress) {
          setWalletAddress(user.walletAddress);
        }
      }
    };
    
    checkAuth();
  }, []);

  // Handle wallet connection
  const handleWalletConnect = async (address: string) => {
    setWalletAddress(address);
    
    // Check if this wallet is already registered
    const isRegistered = await authService.isWalletRegistered(address);
    
    if (isRegistered) {
      // Sign in with wallet
      const success = await authService.signInWithWallet(address);
      if (success) {
        const user = authService.getUser();
        if (user) {
          setUsername(user.username);
          setIsAuthenticated(true);
        }
      }
    }
  };

  // Handle sign in
  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const success = await authService.signIn(email, password);
      if (success) {
        const user = authService.getUser();
        if (user) {
          setUsername(user.username);
          setIsAuthenticated(true);
          if (user.walletAddress) {
            setWalletAddress(user.walletAddress);
          }
        }
      }
      return success;
    } catch (error) {
      console.error("Sign in error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    authService.signOut();
    setIsAuthenticated(false);
    setUsername("");
    setWalletAddress("");
  };

  const appContent = (
    <div className="App">
      <Routes>
        <Route
          path="/signup"
          element={<SignUp
            onSignUp={(username) => {
              // User is already signed up and authenticated in the SignUp component
              setIsAuthenticated(true);
              setUsername(username);
              const user = authService.getUser();
              if (user?.walletAddress) {
                setWalletAddress(user.walletAddress);
              }
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
                      <p>Connect your Petra wallet to sign in to Nexus Syndicates</p>
                    </div>
                    
                    {isLoading ? (
                      <div className="text-center text-neon-blue">
                        <p className="animate-pulse">Connecting...</p>
                      </div>
                    ) : walletAddress ? (
                      <>
                        <div className="text-center text-neon-green mb-4 p-3 bg-dark-blue/50 rounded-md">
                          <p>Wallet connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</p>
                        </div>
                        <button
                          onClick={async () => {
                            setIsLoading(true);
                            // Use wallet address to authenticate
                            const success = await authService.signInWithWallet(walletAddress);
                            if (success) {
                              const user = authService.getUser();
                              if (user) {
                                setUsername(user.username);
                                setIsAuthenticated(true);
                              }
                              // Redirect to dashboard
                              window.location.href = "/dashboard";
                            } else {
                              // If wallet is not registered, redirect to signup
                              window.location.href = "/signup";
                            }
                            setIsLoading(false);
                          }}
                          className="w-full px-4 py-2 bg-neon-blue text-dark-blue hover:bg-neon-blue-bright transition-colors rounded font-cyber"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="animate-pulse">Processing...</span>
                          ) : (
                            "ENTER NEXUS SYNDICATES"
                          )}
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
  );

  return (
    <Router>
      <GameProvider children={appContent} />
    </Router>
  );
};

export default App;
