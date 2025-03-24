import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import ImageWithFallback from '../components/common/ImageWithFallback';
import firestoreService from '../services/firestoreService';
import { getAccountResources, getAccountNFTs } from '../utils/aptosUtils';
import { User } from '../models/User';
import toast from 'react-hot-toast';
import { RESOURCE_UPDATE_EVENT } from '../utils/resourceUtils';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  dateUnlocked: string;
  rarity: string;
  progress?: {
    current: number;
    total: number;
  };
}

interface Badge {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity: string;
}

interface Resource {
  id: number;
  name: string;
  amount: number;
  icon: string;
}

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userResources, setUserResources] = useState<any[]>([]);
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  
  // User data with default values
  const [userData, setUserData] = useState<User>({
    username: 'NeonRunner',
    walletAddress: '',
    avatar: '/avatars/default.png',
    faction: 'NetStalkers',
    bio: 'Veteran cyberpunk hacker with a knack for finding exploits in the system.',
    joinDate: '2025-01-15',
    level: 42,
    reputation: 78,
    experience: 12750,
    nextLevelExp: 15000,
    socialLinks: {
      discord: 'neonrunner#1337',
      twitter: '@neon_runner',
      telegram: '@neon_runner'
    }
  });
  
  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'Digital Conquistador',
      description: 'Control 10 territories simultaneously',
      icon: '🏆',
      dateUnlocked: '2025-02-10',
      rarity: 'Rare',
      progress: {
        current: 10,
        total: 10
      }
    },
    {
      id: 2,
      title: 'Resource Baron',
      description: 'Accumulate 10,000 credits in your treasury',
      icon: '💰',
      dateUnlocked: '2025-02-15',
      rarity: 'Uncommon',
      progress: {
        current: 15750,
        total: 10000
      }
    },
    {
      id: 3,
      title: 'Master Strategist',
      description: 'Win 5 territory disputes without losing any agents',
      icon: '🧠',
      dateUnlocked: '2025-02-28',
      rarity: 'Epic',
      progress: {
        current: 5,
        total: 5
      }
    },
    {
      id: 4,
      title: 'AI Whisperer',
      description: 'Deploy 20 AI agents across the network',
      icon: '🤖',
      dateUnlocked: '',
      rarity: 'Rare',
      progress: {
        current: 12,
        total: 20
      }
    },
    {
      id: 5,
      title: 'Syndicate Overlord',
      description: 'Reach the #1 position on the leaderboard',
      icon: '👑',
      dateUnlocked: '',
      rarity: 'Legendary',
      progress: {
        current: 0,
        total: 1
      }
    }
  ];
  
  // Mock badges data
  const badges: Badge[] = [
    {
      id: 1,
      name: 'Founding Member',
      description: 'One of the first to join Nexus Syndicates',
      image: '🌟',
      rarity: 'Legendary'
    },
    {
      id: 2,
      name: 'NetStalker Elite',
      description: 'High-ranking member of the NetStalkers faction',
      image: '⚡',
      rarity: 'Epic'
    },
    {
      id: 3,
      name: 'Resource Specialist',
      description: 'Expert in resource acquisition and management',
      image: '💎',
      rarity: 'Rare'
    }
  ];
  
  // Mock transaction history
  const transactions = [
    { id: 1, type: 'Resource Trade', details: 'Traded 500 credits for 50 dataShards', timestamp: '2025-03-22 14:32' },
    { id: 2, type: 'Agent Deployment', details: 'Deployed Scout-X1 to Neon District', timestamp: '2025-03-21 09:15' },
    { id: 3, type: 'Territory Acquisition', details: 'Claimed Digital Fortress territory', timestamp: '2025-03-20 18:45' },
    { id: 4, type: 'Syndicate Contribution', details: 'Contributed 200 credits to syndicate treasury', timestamp: '2025-03-19 11:20' },
    { id: 5, type: 'Market Purchase', details: 'Purchased Advanced Encryption upgrade', timestamp: '2025-03-18 16:05' }
  ];
  
  // Mock resources data - will be replaced with real data from blockchain
  const [resources, setResources] = useState<Resource[]>([
    { id: 1, name: 'Credits', amount: 0, icon: '/icons/credits.png' },
    { id: 2, name: 'Data Shards', amount: 0, icon: '/icons/data_shard.png' },
    { id: 3, name: 'Synthetic Alloys', amount: 0, icon: '/icons/alloy.png' },
    { id: 4, name: 'Quantum Cores', amount: 0, icon: '/icons/quantum_core.png' }
  ]);
  
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };
  
  const handleLogout = () => {
    // Call the parent's logout function if provided
    if (onLogout) {
      onLogout();
    }
    // The App component will handle navigation to sign-in page
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSocialLinkChange = (platform: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || { discord: '', twitter: '', telegram: '' }),
        [platform]: value
      }
    }));
  };
  
  const saveUserData = async () => {
    if (!walletAddress) {
      toast.error('Wallet address not found');
      return;
    }

    setIsLoading(true);
    try {
      // Only update fields that can be edited
      const userDataToUpdate = {
        username: userData.username,
        bio: userData.bio,
        avatar: userData.avatar,
        socialLinks: userData.socialLinks
      };

      // First get the user to get the ID
      const user = await firestoreService.getUserByWalletAddress(walletAddress);
      if (!user || !user.id) {
        toast.error('User not found');
        return;
      }

      await firestoreService.updateUserData(user.id, userDataToUpdate);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = () => {
    saveUserData();
  };
  
  const calculateExpPercentage = () => {
    const exp = userData.experience || 0;
    const nextExp = userData.nextLevelExp || 1; // Avoid division by zero
    return Math.min(Math.floor((exp / nextExp) * 100), 100);
  };
  
  const getRarityColor = (rarity: string) => {
    switch(rarity.toLowerCase()) {
      case 'common':
        return 'text-gray-400';
      case 'uncommon':
        return 'text-neon-green';
      case 'rare':
        return 'text-neon-blue';
      case 'epic':
        return 'text-neon-purple';
      case 'legendary':
        return 'text-neon-yellow';
      default:
        return 'text-gray-400';
    }
  };
  
  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    } else {
      // Redirect to login if no wallet address is found
      navigate('/login');
      toast.error('Please connect your wallet to view your profile');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Use getUserByWalletAddress instead of getUserDoc
        const user = await firestoreService.getUserByWalletAddress(walletAddress);
        if (user) {
          setUserData({
            ...userData,
            ...user,
            // Ensure these fields exist even if not in the database
            bio: user.bio || userData.bio,
            level: user.level || userData.level,
            reputation: user.reputation || userData.reputation,
            experience: user.experience || userData.experience,
            nextLevelExp: user.nextLevelExp || userData.nextLevelExp,
            socialLinks: {
              discord: user.socialLinks?.discord || userData.socialLinks?.discord || '',
              twitter: user.socialLinks?.twitter || userData.socialLinks?.twitter || '',
              telegram: user.socialLinks?.telegram || userData.socialLinks?.telegram || ''
            }
          });
        } else {
          toast.error('User data not found');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchBlockchainResources = async () => {
      setIsLoading(true);
      try {
        const blockchainResources = await getAccountResources(walletAddress);
        const nfts = await getAccountNFTs(walletAddress);
        
        // Update resources with blockchain data
        setUserResources(blockchainResources);
        setUserNFTs(nfts);
        
        // Update the resources state with blockchain data
        const updatedResources = [...resources];
        
        // Map blockchain resources to UI resources
        if (blockchainResources && blockchainResources.length > 0) {
          // This is a simplified example - adjust based on actual blockchain data structure
          blockchainResources.forEach((resource: any) => {
            if (resource.type && resource.data) {
              if (resource.type.includes('Credits')) {
                updatedResources[0].amount = parseInt(resource.data.value || '0');
              } else if (resource.type.includes('DataShards')) {
                updatedResources[1].amount = parseInt(resource.data.value || '0');
              } else if (resource.type.includes('SyntheticAlloys')) {
                updatedResources[2].amount = parseInt(resource.data.value || '0');
              } else if (resource.type.includes('QuantumCores')) {
                updatedResources[3].amount = parseInt(resource.data.value || '0');
              }
            }
          });
        }
        
        // If user has resources data in Firebase, use that as a fallback
        if (userData.resources) {
          if (updatedResources[0].amount === 0) updatedResources[0].amount = userData.resources.credits;
          if (updatedResources[1].amount === 0) updatedResources[1].amount = userData.resources.dataShards;
          if (updatedResources[2].amount === 0) updatedResources[2].amount = userData.resources.syntheticAlloys;
          if (updatedResources[3].amount === 0) updatedResources[3].amount = userData.resources.quantumCores;
        }
        
        setResources(updatedResources);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch blockchain resources');
        
        // If blockchain fetch fails, use Firebase data as fallback
        if (userData.resources) {
          const updatedResources = [...resources];
          updatedResources[0].amount = userData.resources.credits;
          updatedResources[1].amount = userData.resources.dataShards;
          updatedResources[2].amount = userData.resources.syntheticAlloys;
          updatedResources[3].amount = userData.resources.quantumCores;
          setResources(updatedResources);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (walletAddress) {
      fetchUserData();
      fetchBlockchainResources();
    }
  }, [walletAddress, userData.resources, resources, userData]);

  useEffect(() => {
    const handleResourceUpdate = (event: CustomEvent) => {
      console.log('Resource update event received in UserProfile:', event.detail);
      const { resources } = event.detail;
      
      if (resources) {
        // Map Firebase resource structure to UI resource structure
        const updatedResources = [
          { id: 1, name: 'Credits', amount: resources.credits || 0, icon: '/icons/credits.png' },
          { id: 2, name: 'Data Shards', amount: resources.dataShards || 0, icon: '/icons/data_shard.png' },
          { id: 3, name: 'Synthetic Alloys', amount: resources.syntheticAlloys || 0, icon: '/icons/alloy.png' },
          { id: 4, name: 'Quantum Cores', amount: resources.quantumCores || 0, icon: '/icons/quantum_core.png' }
        ];
        
        console.log('Updating UI resources:', updatedResources);
        setResources(updatedResources);
        
        // Also update the userData state to keep it in sync
        setUserData(prevUserData => ({
          ...prevUserData,
          resources
        }));
      }
    };
    
    // Add event listener
    document.addEventListener(
      RESOURCE_UPDATE_EVENT, 
      handleResourceUpdate as EventListener
    );
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener(
        RESOURCE_UPDATE_EVENT, 
        handleResourceUpdate as EventListener
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-dark-blue text-light-gray">
      <Navbar />
      {/* Main Content */}
      <div className="container mx-auto p-4 mt-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Profile Card */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <div className="cyber-panel p-6 flex flex-col items-center">
              <div className="relative mb-4">
                <ImageWithFallback 
                  src={userData.avatar || '/avatars/default.png'} 
                  alt="User Avatar" 
                  className="w-32 h-32 rounded-full border-4 border-neon-blue object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-dark-gray border-2 border-neon-blue rounded-full w-10 h-10 flex items-center justify-center text-neon-blue">
                  {userData.level}
                </div>
              </div>
              
              <h2 className="text-2xl font-cyber text-neon-purple mb-1">{userData.username}</h2>
              <p className="text-neon-blue mb-4">{userData.faction}</p>
              
              <div className="w-full bg-dark-gray rounded-full h-3 mb-4">
                <div 
                  className="bg-neon-purple h-3 rounded-full"
                  style={{ width: `${calculateExpPercentage()}%` }}
                ></div>
              </div>
              <p className="text-sm mb-4">Level {userData.level} • {userData.experience}/{userData.nextLevelExp} XP</p>
              
              <div className="flex items-center mb-4">
                <span className="text-neon-green mr-2">Reputation:</span>
                <span className="text-neon-yellow">{userData.reputation}</span>
              </div>
              
              <div className="w-full mb-4">
                <p className="text-sm text-center">{userData.bio}</p>
              </div>
              
              <button
                onClick={editMode ? handleSaveProfile : toggleEditMode}
                className="cyber-button-small bg-neon-blue bg-opacity-20 border border-neon-blue text-neon-blue hover:bg-opacity-30 w-full"
              >
                {editMode ? 'Save Profile' : 'Edit Profile'}
              </button>
              
              <button
                onClick={handleLogout}
                className="cyber-button-small bg-neon-pink bg-opacity-20 border border-neon-pink text-neon-pink hover:bg-opacity-30 w-full mt-3"
              >
                LOG OUT
              </button>
            </div>
            
            {/* Social Links */}
            <div className="cyber-panel p-4 mt-4">
              <h3 className="text-lg font-cyber text-neon-blue mb-3">SOCIAL LINKS</h3>
              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-neon-green block mb-1">Discord</label>
                    <input
                      type="text"
                      id="discord"
                      className="bg-dark-gray text-light-gray border border-neon-blue p-2 rounded w-full"
                      value={userData.socialLinks?.discord || ''}
                      onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neon-green block mb-1">Twitter</label>
                    <input
                      type="text"
                      id="twitter"
                      className="bg-dark-gray text-light-gray border border-neon-blue p-2 rounded w-full"
                      value={userData.socialLinks?.twitter || ''}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neon-green block mb-1">Telegram</label>
                    <input
                      type="text"
                      id="telegram"
                      className="bg-dark-gray text-light-gray border border-neon-blue p-2 rounded w-full"
                      value={userData.socialLinks?.telegram || ''}
                      onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {userData.socialLinks?.discord && (
                    <div className="flex items-center mb-2">
                      <i className="fab fa-discord text-neon-purple mr-2"></i>
                      <span className="text-sm">{userData.socialLinks.discord}</span>
                    </div>
                  )}
                  {userData.socialLinks?.twitter && (
                    <div className="flex items-center mb-2">
                      <i className="fab fa-twitter text-neon-blue mr-2"></i>
                      <span className="text-sm">{userData.socialLinks.twitter}</span>
                    </div>
                  )}
                  {userData.socialLinks?.telegram && (
                    <div className="flex items-center">
                      <i className="fab fa-telegram text-neon-blue mr-2"></i>
                      <span className="text-sm">{userData.socialLinks.telegram}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Wallet Info */}
            <div className="cyber-panel p-4 mt-4">
              <h3 className="text-lg font-cyber text-neon-blue mb-3">WALLET</h3>
              <div className="break-all">
                <span className="text-xs">{walletAddress || 'Not connected'}</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Tabs */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            {/* Tab Navigation */}
            <div className="flex border-b border-neon-blue mb-6">
              <button
                onClick={() => handleTabChange('profile')}
                className={`px-4 py-2 font-cyber ${activeTab === 'profile' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
              >
                PROFILE
              </button>
              <button
                onClick={() => handleTabChange('achievements')}
                className={`px-4 py-2 font-cyber ${activeTab === 'achievements' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
              >
                ACHIEVEMENTS
              </button>
              <button
                onClick={() => handleTabChange('badges')}
                className={`px-4 py-2 font-cyber ${activeTab === 'badges' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
              >
                BADGES
              </button>
              <button
                onClick={() => handleTabChange('resources')}
                className={`px-4 py-2 font-cyber ${activeTab === 'resources' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
              >
                RESOURCES
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`px-4 py-2 font-cyber ${activeTab === 'history' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-light-gray'}`}
              >
                HISTORY
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="cyber-panel p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-cyber text-neon-purple mb-6">PROFILE DETAILS</h2>
                  
                  {editMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-neon-green block mb-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={userData.username}
                          onChange={handleInputChange}
                          className="w-full bg-dark-gray border border-neon-blue p-2 text-light-gray rounded"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-neon-green block mb-1">Faction</label>
                        <select
                          name="faction"
                          value={userData.faction}
                          onChange={(e) => handleInputChange(e as any)}
                          className="w-full bg-dark-gray border border-neon-blue p-2 text-light-gray rounded"
                        >
                          <option value="NetStalkers">NetStalkers</option>
                          <option value="DataWraiths">DataWraiths</option>
                          <option value="CyberHunters">CyberHunters</option>
                          <option value="QuantumSyndicate">QuantumSyndicate</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-neon-green block mb-1">Bio</label>
                        <textarea
                          name="bio"
                          value={userData.bio}
                          onChange={handleInputChange}
                          className="w-full bg-dark-gray border border-neon-blue p-2 text-light-gray rounded h-32"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          onClick={handleSaveProfile}
                          className="cyber-button bg-neon-green bg-opacity-20 border border-neon-green text-neon-green hover:bg-opacity-30"
                        >
                          Save Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-neon-green text-sm mb-1">Username</h3>
                          <p>{userData.username}</p>
                        </div>
                        <div>
                          <h3 className="text-neon-green text-sm mb-1">Faction</h3>
                          <p>{userData.faction}</p>
                        </div>
                        <div>
                          <h3 className="text-neon-green text-sm mb-1">Join Date</h3>
                          <p>{userData.joinDate}</p>
                        </div>
                        <div>
                          <h3 className="text-neon-green text-sm mb-1">Wallet Address</h3>
                          <p className="truncate">{walletAddress || 'Not connected'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h3 className="text-neon-green text-sm mb-1">Bio</h3>
                          <p>{userData.bio}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div>
                  <h2 className="text-xl font-cyber text-neon-purple mb-6">ACHIEVEMENTS</h2>
                  
                  <div className="space-y-4">
                    {achievements.map(achievement => (
                      <div 
                        key={achievement.id} 
                        className={`border ${achievement.dateUnlocked ? 'border-neon-blue' : 'border-gray-700'} p-4 rounded-lg transition-all duration-300 hover:shadow-neon-blue`}
                      >
                        <div className="flex items-start">
                          <div className="text-4xl mr-4">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className={`text-lg font-cyber ${achievement.dateUnlocked ? 'text-neon-blue' : 'text-gray-400'}`}>
                                {achievement.title}
                              </h3>
                              <span className={`text-sm ${getRarityColor(achievement.rarity)}`}>
                                {achievement.rarity}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{achievement.description}</p>
                            
                            {achievement.progress && (
                              <div className="mb-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress.current}/{achievement.progress.total}</span>
                                </div>
                                <div className="w-full bg-dark-gray rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${achievement.dateUnlocked ? 'bg-neon-blue' : 'bg-gray-600'}`}
                                    style={{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {achievement.dateUnlocked && (
                              <div className="text-xs text-neon-green mt-2">
                                Unlocked: {achievement.dateUnlocked}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Badges Tab */}
              {activeTab === 'badges' && (
                <div>
                  <h2 className="text-xl font-cyber text-neon-purple mb-6">BADGES</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map(badge => (
                      <div 
                        key={badge.id} 
                        className="border border-neon-blue p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-neon-blue"
                      >
                        <div className="text-5xl mb-3">{badge.image}</div>
                        <h3 className="text-lg font-cyber text-neon-blue mb-1">{badge.name}</h3>
                        <span className={`text-xs mb-2 ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                        <p className="text-sm">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div>
                  <h3 className="text-xl text-neon-blue mb-4">Resources</h3>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="cyber-spinner"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {resources.map((resource) => (
                        <div key={resource.id} className="cyber-panel p-4 flex flex-col items-center">
                          <ImageWithFallback
                            src={resource.icon}
                            alt={resource.name}
                            className="w-12 h-12 mb-2"
                          />
                          <div className="text-center">
                            <div className="text-neon-blue">{resource.name}</div>
                            <div className="text-xl text-neon-green">{resource.amount}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <h3 className="text-xl text-neon-blue mt-8 mb-4">NFTs & Digital Assets</h3>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="cyber-spinner"></div>
                    </div>
                  ) : userNFTs && userNFTs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {userNFTs.map((nft: any, index: number) => (
                        <div key={index} className="cyber-panel p-4">
                          <div className="aspect-square mb-2 overflow-hidden">
                            <ImageWithFallback
                              src={nft.uri || '/images/nft_placeholder.png'}
                              alt={nft.name || 'NFT'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-neon-purple font-bold">{nft.name || `NFT #${index + 1}`}</div>
                          <div className="text-sm text-light-gray truncate">{nft.description || 'No description available'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="cyber-panel p-6 text-center">
                      <p className="text-light-gray">No NFTs found in your wallet.</p>
                      <button 
                        onClick={() => navigate('/marketplace')}
                        className="cyber-button-small bg-neon-purple bg-opacity-20 border border-neon-purple text-neon-purple hover:bg-opacity-30 mt-4"
                      >
                        Browse Marketplace
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* History Tab */}
              {activeTab === 'history' && (
                <div>
                  <h2 className="text-xl font-cyber text-neon-purple mb-6">TRANSACTION HISTORY</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-neon-blue">
                          <th className="text-left py-3 text-neon-green">Type</th>
                          <th className="text-left py-3 text-neon-green">Details</th>
                          <th className="text-left py-3 text-neon-green">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(tx => (
                          <tr key={tx.id} className="border-b border-gray-800 hover:bg-dark-gray">
                            <td className="py-3 text-neon-blue">{tx.type}</td>
                            <td className="py-3">{tx.details}</td>
                            <td className="py-3 text-sm">{tx.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
