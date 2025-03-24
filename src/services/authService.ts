// Authentication service for Nexus Syndicate
// Handles user authentication, storage, and session management

import { User, UserCredential } from '../models/User';
import firestoreService from './firestoreService';

class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated: boolean = false;

  constructor() {
    this.loadUserFromLocalStorage();
  }

  /**
   * Load user data from localStorage on service initialization
   */
  private loadUserFromLocalStorage() {
    const userJson = localStorage.getItem('user');
    const authenticated = localStorage.getItem('authenticated');
    
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson);
        this.isAuthenticated = authenticated === 'true';
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.currentUser = null;
        this.isAuthenticated = false;
      }
    }
  }

  /**
   * Save user data to localStorage for session persistence
   */
  private saveUserToLocalStorage() {
    if (this.currentUser) {
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      localStorage.setItem('authenticated', String(this.isAuthenticated));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('authenticated');
    }
  }

  /**
   * Check if a wallet address is already registered
   */
  async isWalletRegistered(walletAddress: string): Promise<boolean> {
    if (!walletAddress) return false;
    return await firestoreService.isWalletRegistered(walletAddress);
  }

  /**
   * Sign in with wallet address
   */
  async signInWithWallet(walletAddress: string): Promise<boolean> {
    if (!walletAddress) return false;
    
    try {
      // Check if user exists in Firestore
      const user = await firestoreService.getUserByWalletAddress(walletAddress);
      
      if (user) {
        // Update last login time
        await firestoreService.updateUserLastLogin(user.id);
        
        // Set user in local state
        this.currentUser = user;
        this.setAuthenticated(true);
        this.saveUserToLocalStorage();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error signing in with wallet:', error);
      return false;
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<boolean> {
    // For demo purposes, we're not implementing real password auth
    // In a real app, you would verify credentials with Firebase Auth
    
    try {
      // Query users by email
      // This is a simplified version - in a real app, use Firebase Auth
      const users = await firestoreService.getUserByEmail(email);
      
      if (users) {
        // Update last login time
        await firestoreService.updateUserLastLogin(users.id);
        
        // Set user in local state
        this.currentUser = users;
        this.setAuthenticated(true);
        this.saveUserToLocalStorage();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error signing in:', error);
      return false;
    }
  }

  /**
   * Sign out the current user
   */
  signOut(): void {
    this.currentUser = null;
    this.setAuthenticated(false);
    this.saveUserToLocalStorage();
  }

  /**
   * Sign up a new user with wallet
   */
  async signUpWithWallet(userData: Partial<User>, walletAddress: string): Promise<boolean> {
    if (!walletAddress || !userData.username || !userData.email) {
      return false;
    }

    try {
      // Check if wallet is already registered
      const isRegistered = await this.isWalletRegistered(walletAddress);
      
      if (isRegistered) {
        console.error('Wallet already registered');
        return false;
      }
      
      // Create new user in Firestore
      const newUser = await firestoreService.createUser({
        username: userData.username,
        email: userData.email,
        walletAddress: walletAddress,
        faction: userData.faction,
        playstyle: userData.playstyle,
        avatar: userData.avatar
      });
      
      if (newUser) {
        // Set user in local state
        this.currentUser = newUser;
        this.setAuthenticated(true);
        this.saveUserToLocalStorage();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error signing up with wallet:', error);
      return false;
    }
  }

  /**
   * Set authentication status
   */
  setAuthenticated(status: boolean): void {
    this.isAuthenticated = status;
    this.saveUserToLocalStorage();
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }
}

const authService = new AuthService();
export default authService;
