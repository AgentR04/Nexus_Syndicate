// User model for Nexus Syndicate
export interface User {
  id?: string;
  username: string;
  email?: string;
  walletAddress: string;
  faction?: string;
  playstyle?: string;
  avatar?: string;
  bio?: string;
  joinDate?: string;
  level?: number;
  reputation?: number;
  experience?: number;
  nextLevelExp?: number;
  createdAt?: Date;
  lastLoginAt?: Date;
  isActive?: boolean;
  resources?: {
    credits: number;
    dataShards: number;
    syntheticAlloys: number;
    quantumCores: number;
  };
  socialLinks?: {
    discord: string;
    twitter: string;
    telegram: string;
  };
}

export interface UserCredential {
  username: string;
  email?: string;
  walletAddress: string;
  faction?: string;
  playstyle?: string;
  avatar?: string;
}
