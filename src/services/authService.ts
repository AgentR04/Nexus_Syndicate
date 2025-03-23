// Authentication service for Nexus Syndicate
// Handles user authentication, storage, and session management

export interface User {
  username: string;
  email?: string;
  walletAddress?: string;
  faction?: string;
  resources?: {
    credits: number;
    dataShards: number;
    syntheticAlloys: number;
    quantumCores: number;
  };
}

class AuthService {
  private storagePrefix = 'nexus_syndicate_';
  
  // Store user data in local storage
  saveUser(user: User): void {
    localStorage.setItem(`${this.storagePrefix}user`, JSON.stringify(user));
    this.setAuthenticated(true);
  }
  
  // Get user data from local storage
  getUser(): User | null {
    const userData = localStorage.getItem(`${this.storagePrefix}user`);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }
  
  // Set authentication status
  setAuthenticated(status: boolean): void {
    localStorage.setItem(`${this.storagePrefix}authenticated`, status.toString());
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return localStorage.getItem(`${this.storagePrefix}authenticated`) === 'true';
  }
  
  // Store wallet address
  saveWalletAddress(address: string): void {
    localStorage.setItem(`${this.storagePrefix}wallet`, address);
    
    // Update user data if it exists
    const user = this.getUser();
    if (user) {
      user.walletAddress = address;
      this.saveUser(user);
    }
  }
  
  // Get wallet address
  getWalletAddress(): string {
    return localStorage.getItem(`${this.storagePrefix}wallet`) || '';
  }
  
  // Sign in user
  signIn(username: string, password: string, walletAddress?: string): boolean {
    // In a real app, you would validate against a backend
    // For demo purposes, we'll just accept any credentials
    
    // Create a new user if one doesn't exist
    if (!this.getUser()) {
      const newUser: User = {
        username,
        walletAddress: walletAddress || this.getWalletAddress(),
        faction: 'Netrunners', // Default faction
        resources: {
          credits: 1000,
          dataShards: 50,
          syntheticAlloys: 30,
          quantumCores: 15
        }
      };
      this.saveUser(newUser);
    } else {
      // Update username and wallet if user exists
      const user = this.getUser();
      if (user) {
        user.username = username;
        if (walletAddress) {
          user.walletAddress = walletAddress;
        }
        this.saveUser(user);
      }
    }
    
    this.setAuthenticated(true);
    return true;
  }
  
  // Sign out user
  signOut(): void {
    this.setAuthenticated(false);
    // We keep the user data for convenience, but you could clear it if needed
    // localStorage.removeItem(`${this.storagePrefix}user`);
  }
  
  // Update user data
  updateUser(userData: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      this.saveUser(updatedUser);
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
