import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import GameMap from './pages/GameMap';
import UserProfile from './pages/UserProfile';
import HowToPlay from './pages/HowToPlay';
import Marketplace from './pages/Marketplace';
import SyndicateManagement from './pages/SyndicateManagement';
import Governance from './pages/Governance';
import Navbar from './components/common/Navbar';
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

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/signup" element={
            isAuthenticated ? <Navigate to="/howtoplay" /> : <SignUp onSignUp={() => setIsAuthenticated(true)} />
          } />
          <Route path="/signin" element={
            isAuthenticated ? <Navigate to="/howtoplay" /> : 
            <div className="min-h-screen bg-dark-blue flex flex-col">
              <Navbar onWalletConnect={handleWalletConnect} walletAddress={walletAddress} />
              <div className="flex-grow flex items-center justify-center p-4">
                <div className="cyber-panel p-8 max-w-md w-full">
                  <h2 className="text-2xl font-cyber text-neon-purple mb-6 text-center">
                    SIGN <span className="text-neon-blue">IN</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-light-gray mb-1">Username or Email</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                        placeholder="Enter your username or email"
                      />
                    </div>
                    <div>
                      <label className="block text-light-gray mb-1">Password</label>
                      <input 
                        type="password" 
                        className="w-full p-2 bg-dark-gray border border-neon-blue text-light-gray rounded"
                        placeholder="Enter your password"
                      />
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<GameMap />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/howtoplay" element={<HowToPlay />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/syndicate-management" element={<SyndicateManagement />} />
          <Route path="/governance/:syndicateId" element={<Governance />} />
          <Route path="/" element={
            <div className="min-h-screen bg-dark-blue flex flex-col">
              <Navbar onWalletConnect={handleWalletConnect} walletAddress={walletAddress} />
              <div className="flex-grow flex items-center justify-center p-4">
                <div className="cyber-panel p-8 max-w-2xl w-full">
                  <h1 className="text-4xl md:text-6xl font-cyber text-neon-purple mb-6 text-center animate-glitch">
                    NEXUS <span className="text-neon-blue">SYNDICATES</span>
                  </h1>
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
