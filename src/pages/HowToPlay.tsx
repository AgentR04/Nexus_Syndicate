import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AptosWalletConnect from '../components/common/AptosWalletConnect';

const HowToPlay: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };
  
  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <>
          <h3 className="text-xl font-cyber text-neon-green mb-4">Welcome to Nexus Syndicates</h3>
          <p className="mb-4">
            Nexus Syndicates is a strategic trading and territory control game set in a cyberpunk metaverse. 
            As a player, you'll lead your own syndicate, deploy AI agents, control territories, and trade resources 
            to become the most powerful faction in the digital realm.
          </p>
          <h4 className="text-lg font-cyber text-neon-blue mb-2">First Steps</h4>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li>Connect your wallet using the Aptos Wallet Connect button in the top-right corner.</li>
            <li>Create your character by selecting a username and faction on the Profile page.</li>
            <li>Explore the Dashboard to understand the game's main components.</li>
            <li>Visit the Game Map to see the territories you can control.</li>
          </ol>
          <div className="cyber-panel p-4 mb-4">
            <h4 className="text-lg font-cyber text-neon-yellow mb-2">Quick Tip</h4>
            <p>
              Start by securing a few territories close to each other. This will create a strong base of operations 
              and make it easier to defend your holdings.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'territories',
      title: 'Territories & Control',
      content: (
        <>
          <h3 className="text-xl font-cyber text-neon-green mb-4">Understanding Territories</h3>
          <p className="mb-4">
            The digital world of Nexus Syndicates is divided into hexagonal territories, each with unique resources 
            and strategic value. Controlling territories is essential for resource generation and syndicate growth.
          </p>
          <h4 className="text-lg font-cyber text-neon-blue mb-2">Territory Types</h4>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><span className="text-neon-blue">Urban</span> - Balanced resource generation, easier to defend</li>
            <li><span className="text-neon-green">Research</span> - High quantum cores and data shards production</li>
            <li><span className="text-neon-purple">Industrial</span> - High synthetic alloys production</li>
            <li><span className="text-neon-yellow">Commercial</span> - High credits generation</li>
            <li><span className="text-neon-pink">Black Market</span> - Random resource drops, high risk/reward</li>
          </ul>
          <h4 className="text-lg font-cyber text-neon-blue mb-2">Claiming Territories</h4>
          <p className="mb-4">
            To claim a territory:
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li>Navigate to the Game Map and select an unclaimed territory (shown in green).</li>
            <li>Deploy a defense agent to secure the territory.</li>
            <li>Wait for the claiming process to complete (approximately 24 hours).</li>
            <li>Once claimed, the territory will generate resources every cycle (8 hours).</li>
          </ol>
        </>
      )
    },
    {
      id: 'agents',
      title: 'AI Agents',
      content: (
        <>
          <h3 className="text-xl font-cyber text-neon-green mb-4">AI Agents System</h3>
          <p className="mb-4">
            AI Agents are your digital workforce, performing tasks autonomously across the network. 
            Different agent types specialize in various activities, from resource gathering to territory defense.
          </p>
          <h4 className="text-lg font-cyber text-neon-blue mb-2">Agent Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border border-neon-blue p-3 rounded-lg">
              <h5 className="font-cyber text-neon-blue">Scout Agents 🔍</h5>
              <p>Gather intelligence and discover new territories. Essential for expansion.</p>
            </div>
            <div className="border border-neon-pink p-3 rounded-lg">
              <h5 className="font-cyber text-neon-pink">Defense Agents 🛡️</h5>
              <p>Protect your territories from rival syndicates. Higher levels improve defense.</p>
            </div>
            <div className="border border-neon-green p-3 rounded-lg">
              <h5 className="font-cyber text-neon-green">Resource Agents ⛏️</h5>
              <p>Enhance resource extraction from territories. Boost production rates.</p>
            </div>
            <div className="border border-neon-yellow p-3 rounded-lg">
              <h5 className="font-cyber text-neon-yellow">Trader Agents 💹</h5>
              <p>Automate resource trading and market analysis. Increase profit margins.</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'resources',
      title: 'Resources & Economy',
      content: (
        <>
          <h3 className="text-xl font-cyber text-neon-green mb-4">Resource System</h3>
          <p className="mb-4">
            The economy of Nexus Syndicates revolves around four primary resources. 
            Managing these resources effectively is crucial for your syndicate's growth and power.
          </p>
          <h4 className="text-lg font-cyber text-neon-blue mb-2">Resource Types</h4>
          <div className="space-y-4 mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <h5 className="font-cyber text-neon-yellow">Credits</h5>
                <p className="text-sm">The basic currency. Used for most transactions, agent deployment, and upgrades.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💾</span>
              <div>
                <h5 className="font-cyber text-neon-blue">Data Shards</h5>
                <p className="text-sm">Digital information fragments. Used for research, agent upgrades, and territory scanning.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔩</span>
              <div>
                <h5 className="font-cyber text-neon-purple">Synthetic Alloys</h5>
                <p className="text-sm">Advanced materials. Used for defense systems, infrastructure, and high-tier upgrades.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚛️</span>
              <div>
                <h5 className="font-cyber text-neon-green">Quantum Cores</h5>
                <p className="text-sm">Rare and powerful. Used for the most advanced technologies and special operations.</p>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'syndicates',
      title: 'Syndicates & Alliances',
      content: (
        <>
          <h3 className="text-xl font-cyber text-neon-green mb-4">Syndicate System</h3>
          <p className="mb-4">
            Syndicates are player-formed organizations that work together to control larger portions of the network.
            Joining or forming a syndicate provides significant advantages in territory control and resource generation.
          </p>
          <h4 className="text-lg font-cyber text-neon-blue mb-2">Syndicate Benefits</h4>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Shared defense networks for better territory protection</li>
            <li>Resource pooling and distribution among members</li>
            <li>Collaborative research for faster technological advancement</li>
            <li>Coordinated attacks and strategic operations</li>
            <li>Exclusive syndicate-only missions and rewards</li>
          </ul>
        </>
      )
    }
  ];
  
  return (
    <div className="min-h-screen bg-dark-blue text-light-gray scrollable">
      {/* Header */}
      <Navbar onWalletConnect={handleWalletConnect} walletAddress={walletAddress} />
      
      {/* Main Content */}
      <div className="container mx-auto p-4 mt-6">
        <div className="cyber-panel p-6">
          <h2 className="text-3xl font-cyber text-neon-purple mb-6">HOW TO PLAY</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <div className="sticky top-6 space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-neon-blue bg-opacity-20 border-l-4 border-neon-blue'
                        : 'hover:bg-dark-gray'
                    }`}
                  >
                    <span className="font-cyber">{section.title}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Content Area */}
            <div className="md:col-span-3">
              <div className="cyber-panel p-6 scrollable max-h-[80vh]">
                {sections.find(section => section.id === activeSection)?.content}
              </div>
              <div className="mt-8 flex justify-between">
                {activeSection !== sections[0].id && (
                  <button
                    onClick={() => {
                      const currentIndex = sections.findIndex(section => section.id === activeSection);
                      if (currentIndex > 0) {
                        setActiveSection(sections[currentIndex - 1].id);
                      }
                    }}
                    className="px-4 py-2 bg-dark-gray border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-blue transition-colors rounded"
                  >
                    Previous: {sections[Math.max(0, sections.findIndex(section => section.id === activeSection) - 1)].title}
                  </button>
                )}
                
                {activeSection !== sections[sections.length - 1].id && (
                  <button
                    onClick={() => {
                      const currentIndex = sections.findIndex(section => section.id === activeSection);
                      if (currentIndex < sections.length - 1) {
                        setActiveSection(sections[currentIndex + 1].id);
                      }
                    }}
                    className="px-4 py-2 bg-dark-gray border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-dark-blue transition-colors rounded ml-auto"
                  >
                    Next: {sections[Math.min(sections.length - 1, sections.findIndex(section => section.id === activeSection) + 1)].title}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
