import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import GameMap from './pages/GameMap';
import UserProfile from './pages/UserProfile';
import HowToPlay from './pages/HowToPlay';
import Marketplace from './pages/Marketplace';
import SyndicateManagement from './pages/SyndicateManagement';
import Governance from './pages/Governance';
import SmugglersRun from './pages/SmugglersRun';
import Navbar from './components/common/Navbar';
import AptosWalletConnect from './components/common/AptosWalletConnect'; // Import AptosWalletConnect component
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    setIsAuthenticated(!!address);
  };

  const handleSignIn = () => {
    // This would typically involve authentication logic
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Reset authentication state
    setWalletAddress('');
    setIsAuthenticated(false);
    
    // Force a complete page reload to the sign-in page
    // This bypasses React Router's navigation and ensures a clean state
    window.location.href = '/signin';
  };

  // SignOut component that handles logout and redirection
  const SignOut = () => {
    useEffect(() => {
      // Reset authentication state
      setWalletAddress('');
      setIsAuthenticated(false);
    }, []);
    
    return <Navigate to="/signin" replace />;
  };

  // Layout component with Navbar for authenticated routes
  const AuthenticatedLayout = () => {
    return (
      <>
        <Navbar onWalletConnect={handleWalletConnect} onLogout={handleLogout} walletAddress={walletAddress} />
        <Outlet />
      </>
    );
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes without navbar */}
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to="/howtoplay" /> : 
            <div className="min-h-screen bg-dark-blue flex flex-col">
              <div className="py-6 text-center">
                <h1 className="text-4xl font-cyber text-neon-purple animate-glitch">
                  NEXUS <span className="text-neon-blue">SYNDICATES</span>
                </h1>
              </div>
              <SignUp onSignUp={() => setIsAuthenticated(true)} />
            </div>
          } />
          
          <Route path="/signin" element={
            isAuthenticated ? <Navigate to="/howtoplay" /> : 
            <div className="min-h-screen bg-dark-blue flex flex-col">
              <div className="py-6 text-center">
                <h1 className="text-4xl font-cyber text-neon-purple animate-glitch">
                  NEXUS <span className="text-neon-blue">SYNDICATES</span>
                </h1>
              </div>
              <div className="flex-grow flex items-center justify-center p-4">
                <div className="cyber-panel p-8 max-w-md w-full">
                  <h2 className="text-2xl font-cyber text-neon-purple mb-6 text-center">
                    SIGN <span className="text-neon-blue">IN</span>
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-neon-blue mb-2 font-cyber">USERNAME</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                        placeholder="Enter your username"
                      />
                    </div>
                    
                    <div className="cyber-panel p-6">
                      <h3 className="text-xl font-cyber mb-4 text-neon-blue">Connect Your Petra Wallet</h3>
                      <p className="text-light-gray mb-6">
                        Connect your Aptos wallet to access your account and digital assets.
                      </p>
                      
                      <AptosWalletConnect onWalletConnect={handleWalletConnect} />
                      
                      {walletAddress && (
                        <div className="mt-4 p-3 bg-dark-blue rounded-md">
                          <p className="text-neon-green text-sm">✓ Wallet successfully connected</p>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleSignIn}
                      className="w-full px-4 py-2 bg-neon-blue text-dark-blue hover:bg-neon-blue-bright transition-colors rounded font-cyber"
                    >
                      SIGN IN
                    </button>
                    <div className="text-center text-light-gray">
                      Don't have an account? <Link to="/signup" className="text-neon-purple hover:text-neon-blue">Sign Up</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/" element={
            <div className="min-h-screen bg-dark-blue flex flex-col">
              <div className="py-6 text-center">
                <h1 className="text-4xl md:text-6xl font-cyber text-neon-purple animate-glitch">
                  NEXUS <span className="text-neon-blue">SYNDICATES</span>
                </h1>
              </div>
              <div className="flex-grow flex items-center justify-center p-4">
                <div className="cyber-panel p-8 max-w-2xl w-full">
                  <p className="text-light-gray text-lg mb-8 text-center">
                    A strategic trading and territory control game set in a cyberpunk metaverse
                  </p>
                  <div className="flex flex-col space-y-4">
                    <Link to="/signup" className="neon-button text-center">
                      SIGN UP
                    </Link>
                    <Link to="/signin" className="px-4 py-2 bg-dark-gray border-2 border-neon-blue text-neon-blue 
                                     hover:bg-neon-blue hover:text-dark-blue transition-all duration-300 
                                     shadow-neon-blue rounded-md font-cyber text-center">
                      SIGN IN
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          } />

          {/* Authenticated routes with navbar */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<GameMap />} />
            <Route path="/profile" element={<UserProfile onLogout={handleLogout} />} />
            <Route path="/howtoplay" element={<HowToPlay />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/syndicate-management" element={<SyndicateManagement />} />
            <Route path="/smugglers-run" element={<SmugglersRun />} />
            <Route path="/governance/:syndicateId" element={<Governance />} />
          </Route>

          {/* Special route for sign out */}
          <Route path="/signout" element={<SignOut />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
