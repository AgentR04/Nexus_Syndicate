import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AptosWalletConnect from "../components/common/AptosWalletConnect";
import AvatarSelection, { Avatar } from "../components/ui/AvatarSelection";
import FactionSelection, { Faction } from "../components/ui/FactionSelection";
import PlaystyleSelection, {
  Playstyle,
} from "../components/ui/PlaystyleSelection";

interface FormData {
  name: string;
  gameName: string;
  email: string;
  dob: string;
  walletAddress: string;
  faction: Faction | null;
  playstyle: Playstyle | null;
  avatar: Avatar | null;
}

interface SignUpProps {
  onSignUp?: (username: string) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    gameName: "",
    email: "",
    dob: "",
    walletAddress: "",
    faction: null,
    playstyle: null,
    avatar: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [isOver18, setIsOver18] = useState<boolean | null>(null);

  // Check if user is over 18 when DOB changes
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setIsOver18(age >= 18);

      if (age < 18) {
        setErrors((prev) => ({
          ...prev,
          dob: "You must be at least 18 years old to join Nexus Syndicates.",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.dob;
          return newErrors;
        });
      }
    }
  }, [formData.dob]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWalletConnect = (address: string) => {
    setFormData((prev) => ({
      ...prev,
      walletAddress: address,
    }));
  };

  const handleFactionSelect = (faction: Faction) => {
    setFormData((prev) => ({
      ...prev,
      faction,
    }));
  };

  const handlePlaystyleSelect = (playstyle: Playstyle) => {
    setFormData((prev) => ({
      ...prev,
      playstyle,
    }));
  };

  const handleAvatarSelect = (avatar: Avatar) => {
    setFormData((prev) => ({
      ...prev,
      avatar,
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.gameName.trim())
        newErrors.gameName = "Game name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.dob) {
        newErrors.dob = "Date of birth is required";
      } else if (!isOver18) {
        newErrors.dob =
          "You must be at least 18 years old to join Nexus Syndicates.";
      }
    } else if (step === 2) {
      if (!formData.walletAddress)
        newErrors.walletAddress = "Wallet connection is required";
    } else if (step === 3) {
      if (!formData.faction) newErrors.faction = "Please select a syndicate";
      if (!formData.playstyle)
        newErrors.playstyle = "Please select a playstyle";
    } else if (step === 4) {
      if (!formData.avatar) newErrors.avatar = "Please select an avatar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only proceed if we're on the final step and all validations pass
    if (currentStep === 4 && validateStep(currentStep)) {
      // Submit form
      console.log("Form submitted:", formData);

      // Call onSignUp if provided
      if (onSignUp) {
        onSignUp(formData.gameName);
      }

      // Navigate to Dashboard page after successful signup
      navigate("/dashboard");
    } else {
      // If not on the final step, just go to the next step
      handleNextStep();
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute h-1 bg-dark-gray w-full top-1/2 transform -translate-y-1/2 z-0"></div>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 font-cyber ${
              step === currentStep
                ? "bg-neon-blue text-dark-blue animate-pulse-slow"
                : step < currentStep
                ? "bg-neon-purple text-dark-blue"
                : "bg-dark-gray text-light-gray"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    );
  };

  const renderStepTitle = () => {
    const titles = [
      "Personal Information",
      "Connect Your Wallet",
      "Choose Your Path",
      "Select Your Avatar",
    ];

    return (
      <h2 className="text-2xl md:text-3xl font-cyber text-neon-blue mb-6 text-center">
        {titles[currentStep - 1]}
      </h2>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-neon-blue mb-2 font-cyber"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="cyber-input w-full text-black"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-neon-pink text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="gameName"
                className="block text-neon-blue mb-2 font-cyber"
              >
                Syndicate Name
              </label>
              <input
                type="text"
                id="gameName"
                name="gameName"
                value={formData.gameName}
                onChange={handleInputChange}
                className="cyber-input w-full text-black"
                placeholder="Choose your in-game name"
              />
              {errors.gameName && (
                <p className="text-neon-pink text-sm mt-1">{errors.gameName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-neon-blue mb-2 font-cyber"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="cyber-input w-full text-black"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="text-neon-pink text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="dob"
                className="block text-neon-blue mb-2 font-cyber"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="cyber-input w-full text-black"
                max={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18)
                  )
                    .toISOString()
                    .split("T")[0]
                }
              />
              {errors.dob && (
                <p className="text-neon-pink text-sm mt-1">{errors.dob}</p>
              )}
              {isOver18 === false && (
                <div className="bg-dark-purple border border-neon-pink p-3 rounded-md mt-3">
                  <p className="text-neon-pink">
                    You must be at least 18 years old to join Nexus Syndicates.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="cyber-panel p-6">
              <h3 className="text-xl font-cyber mb-4 text-neon-blue">
                Connect Your Petra Wallet
              </h3>
              <p className="text-light-gray mb-6">
                To participate in Nexus Syndicates, you'll need to connect your
                Aptos wallet. This will be used for all in-game transactions and
                to store your digital assets.
              </p>

              <AptosWalletConnect onWalletConnect={handleWalletConnect} />

              {formData.walletAddress && (
                <div className="mt-4 p-3 bg-dark-blue rounded-md">
                  <p className="text-neon-green text-sm">
                    ✓ Wallet successfully connected
                  </p>
                </div>
              )}

              {errors.walletAddress && (
                <p className="text-neon-pink text-sm mt-4">
                  {errors.walletAddress}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <FactionSelection
              onSelect={handleFactionSelect}
              selectedFactionId={formData.faction?.id}
            />

            {errors.faction && (
              <p className="text-neon-pink text-sm">{errors.faction}</p>
            )}

            <div className="border-t border-dark-gray pt-8">
              <PlaystyleSelection
                onSelect={handlePlaystyleSelect}
                selectedPlaystyleId={formData.playstyle?.id}
              />

              {errors.playstyle && (
                <p className="text-neon-pink text-sm">{errors.playstyle}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <AvatarSelection
              onSelect={handleAvatarSelect}
              selectedAvatarId={formData.avatar?.id}
            />

            {errors.avatar && (
              <p className="text-neon-pink text-sm">{errors.avatar}</p>
            )}

            <div className="cyber-panel mt-8">
              <h3 className="text-xl font-cyber mb-4 text-neon-blue">
                Ready to Enter Nexus Syndicates?
              </h3>
              <p className="text-light-gray">
                Review your choices before finalizing your registration. Once
                confirmed, you'll be ready to enter the cyberpunk metaverse of
                Nexus Syndicates.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue bg-hex-pattern py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-cyber text-neon-purple mb-4 animate-glitch">
            NEXUS <span className="text-neon-blue">SYNDICATES</span>
          </h1>
          <p className="text-light-gray text-lg">
            Join the elite network of digital power brokers
          </p>
        </div>

        <div className="cyber-panel p-6 md:p-8 scrollable">
          {renderStepIndicator()}
          {renderStepTitle()}

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-2 bg-dark-gray border-2 border-light-gray text-light-gray 
                           hover:bg-light-gray hover:text-dark-gray transition-all duration-300 
                           rounded-md font-cyber"
                >
                  Back
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto neon-button"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-6 py-2 bg-dark-gray border-2 border-neon-pink text-neon-pink 
                           hover:bg-neon-pink hover:text-dark-gray transition-all duration-300 
                           shadow-neon-pink rounded-md font-cyber"
                >
                  Complete Registration
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="text-center mt-8 text-light-gray text-sm">
          <p>
            By registering, you agree to our Terms of Service and Privacy
            Policy.
          </p>
          <p className="mt-2"> 2025 Nexus Syndicates. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
