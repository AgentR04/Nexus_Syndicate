import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import FactionSelection from '../components/ui/FactionSelection';
import PlaystyleSelection from '../components/ui/PlaystyleSelection';
import AvatarSelection from '../components/ui/AvatarSelection';
import { UIFaction, UIPlaystyle, UIAvatar } from '../services/gameDataTypes';
import firestoreService from '../services/firestoreService';
import authService from '../services/authService';
import { User } from '../models/User';
import { connectPetraWallet, disconnectPetraWallet, isPetraInstalled } from '../types/wallet';

// Form steps
enum SignUpStep {
  PERSONAL_INFO = 0,
  CONNECT_WALLET = 1,
  FACTION_SELECTION = 2,
  PLAYSTYLE_SELECTION = 3,
  AVATAR_SELECTION = 4,
  REVIEW = 5
}

// Form data interface
interface SignUpFormData {
  username: string;
  email: string;
  walletAddress: string;
  faction?: UIFaction;
  playstyle?: UIPlaystyle;
  avatar?: UIAvatar;
}

// Component props
interface SignUpProps {
  onSignUp?: (username: string) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SignUpStep>(SignUpStep.PERSONAL_INFO);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    email: '',
    walletAddress: ''
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [walletConnecting, setWalletConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Check if wallet is already registered
  useEffect(() => {
    const checkWalletRegistration = async () => {
      if (formData.walletAddress) {
        try {
          const isRegistered = await authService.isWalletRegistered(formData.walletAddress);
          if (isRegistered) {
            setErrors(prev => ({
              ...prev,
              walletAddress: 'This wallet is already registered. Please sign in instead.'
            }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.walletAddress;
              return newErrors;
            });
          }
        } catch (error) {
          console.error('Error checking wallet registration:', error);
        }
      }
    };

    checkWalletRegistration();
  }, [formData.walletAddress]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Connect wallet
  const connectWallet = async () => {
    setWalletConnecting(true);
    setWalletError(null);
    
    try {
      // Check if Petra wallet is installed
      if (!isPetraInstalled()) {
        setWalletError('Petra wallet not found. Please install the Petra wallet extension.');
        return;
      }
      
      // Connect to Petra wallet using our utility function
      const address = await connectPetraWallet();
      
      if (address) {
        setFormData(prev => ({
          ...prev,
          walletAddress: address
        }));
      } else {
        setWalletError('Failed to get wallet address. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletError('Failed to connect wallet. Please try again.');
    } finally {
      setWalletConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      await disconnectPetraWallet();
      setFormData(prev => ({
        ...prev,
        walletAddress: ''
      }));
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet. Please try again.');
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};
    
    switch (currentStep) {
      case SignUpStep.PERSONAL_INFO:
        if (!formData.username.trim()) {
          newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        }
        
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        break;
        
      case SignUpStep.CONNECT_WALLET:
        if (!formData.walletAddress) {
          newErrors.walletAddress = 'Please connect your wallet';
        }
        break;
        
      case SignUpStep.FACTION_SELECTION:
        if (!formData.faction) {
          toast.error('Please select a faction');
          return false;
        }
        break;
        
      case SignUpStep.PLAYSTYLE_SELECTION:
        if (!formData.playstyle) {
          toast.error('Please select a playstyle');
          return false;
        }
        break;
        
      case SignUpStep.AVATAR_SELECTION:
        if (!formData.avatar) {
          toast.error('Please select an avatar');
          return false;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle faction selection
  const handleFactionSelect = (faction: UIFaction) => {
    setFormData(prev => ({
      ...prev,
      faction
    }));
  };

  // Handle playstyle selection
  const handlePlaystyleSelect = (playstyle: UIPlaystyle) => {
    setFormData(prev => ({
      ...prev,
      playstyle
    }));
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatar: UIAvatar) => {
    setFormData(prev => ({
      ...prev,
      avatar
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    try {
      setLoading(true);
      
      if (!formData.faction || !formData.playstyle || !formData.avatar) {
        toast.error('Please complete all steps before submitting');
        return;
      }
      
      // Create user object
      const newUser: User = {
        id: '',
        username: formData.username,
        email: formData.email,
        walletAddress: formData.walletAddress,
        faction: formData.faction.id,
        playstyle: formData.playstyle.id,
        avatar: formData.avatar.id,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
        resources: {
          credits: 1000, // Starting credits
          dataShards: 50,
          syntheticAlloys: 25,
          quantumCores: 10
        }
      };
      
      // Create user in Firestore
      const userId = await firestoreService.createUser(newUser);
      
      // Log in the user
      await authService.signInWithWallet(formData.walletAddress);
      
      toast.success('Account created successfully!');
      
      // Call onSignUp prop if provided
      if (onSignUp) {
        onSignUp(formData.username);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case SignUpStep.PERSONAL_INFO:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-cyber text-neon-blue">Personal Information</h2>
            
            <div className="cyber-input-group">
              <label htmlFor="username" className="cyber-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className={`cyber-input ${errors.username ? 'border-neon-pink' : ''}`}
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
              />
              {errors.username && <p className="text-neon-pink text-sm mt-1">{errors.username}</p>}
            </div>
            
            <div className="cyber-input-group">
              <label htmlFor="email" className="cyber-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`cyber-input ${errors.email ? 'border-neon-pink' : ''}`}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-neon-pink text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        );
        
      case SignUpStep.CONNECT_WALLET:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-cyber text-neon-blue">Connect Your Wallet</h2>
            
            <div className="cyber-panel p-6">
              <p className="text-light-gray mb-4">
                Connect your Aptos wallet to continue. This will be used for authentication and in-game transactions.
              </p>
              
              {formData.walletAddress ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-neon-green"></div>
                    <span className="text-neon-green">Wallet Connected</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="cyber-input"
                      value={formData.walletAddress}
                      readOnly
                    />
                  </div>
                  
                  <button
                    className="cyber-button-small border-neon-pink text-neon-pink"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-neon-pink"></div>
                    <p className="text-neon-pink">Wallet Not Connected</p>
                  </div>
                  
                  <button
                    className="cyber-button w-full"
                    onClick={connectWallet}
                    disabled={walletConnecting}
                  >
                    {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                  
                  {walletError && <p className="text-neon-pink text-sm">{walletError}</p>}
                </div>
              )}
            </div>
          </div>
        );
        
      case SignUpStep.FACTION_SELECTION:
        return (
          <FactionSelection
            onSelect={handleFactionSelect}
            selectedFactionId={formData.faction?.id}
          />
        );
        
      case SignUpStep.PLAYSTYLE_SELECTION:
        return (
          <PlaystyleSelection
            onSelect={handlePlaystyleSelect}
            selectedPlaystyleId={formData.playstyle?.id}
          />
        );
        
      case SignUpStep.AVATAR_SELECTION:
        return (
          <AvatarSelection
            onSelect={handleAvatarSelect}
            selectedAvatarId={formData.avatar?.id}
          />
        );
        
      case SignUpStep.REVIEW:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-cyber text-neon-blue">Review Your Information</h2>
            
            <div className="cyber-panel p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-neon-blue font-cyber">Personal Info</h3>
                  <p className="text-light-gray">Username: <span className="text-white">{formData.username}</span></p>
                  <p className="text-light-gray">Email: <span className="text-white">{formData.email}</span></p>
                </div>
                
                <div>
                  <h3 className="text-neon-blue font-cyber">Wallet</h3>
                  <p className="text-light-gray">Address: <span className="text-white truncate">{formData.walletAddress}</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-neon-blue font-cyber">Faction</h3>
                  <p className="text-light-gray">Selected: <span className="text-white">{formData.faction?.name}</span></p>
                </div>
                
                <div>
                  <h3 className="text-neon-blue font-cyber">Playstyle</h3>
                  <p className="text-light-gray">Selected: <span className="text-white">{formData.playstyle?.name}</span></p>
                </div>
                
                <div>
                  <h3 className="text-neon-blue font-cyber">Avatar</h3>
                  <p className="text-light-gray">Selected: <span className="text-white">{formData.avatar?.name}</span></p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-dark-gray">
                <p className="text-light-gray">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Progress bar calculation
  const progressPercentage = ((currentStep + 1) / (Object.keys(SignUpStep).length / 2)) * 100;

  return (
    <div className="min-h-screen bg-dark-blue flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <h1 className="text-3xl font-cyber text-neon-blue mb-6">Join Nexus Syndicate</h1>
          
          {/* Progress bar */}
          <div className="w-full bg-dark-gray h-2 mb-8 rounded-full overflow-hidden">
            <div 
              className="h-full bg-neon-blue"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Step content */}
          <div className="flex-1 cyber-panel p-6 mb-6">
            {renderStepContent()}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              className="cyber-button-small"
              onClick={handlePrevStep}
              disabled={currentStep === 0 || loading}
            >
              Previous
            </button>
            
            {currentStep < SignUpStep.REVIEW ? (
              <button
                className="cyber-button-small"
                onClick={handleNextStep}
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button
                className="cyber-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
