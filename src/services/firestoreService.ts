import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserCredential } from '../models/User';

// Collection references
const USERS_COLLECTION = 'users';

class FirestoreService {
  // User operations
  
  /**
   * Create a new user in Firestore
   */
  async createUser(userData: UserCredential): Promise<User | null> {
    try {
      const userRef = doc(collection(db, USERS_COLLECTION));
      const userId = userRef.id;
      
      const newUser: User = {
        id: userId,
        username: userData.username,
        email: userData.email,
        walletAddress: userData.walletAddress,
        faction: userData.faction || '',
        playstyle: userData.playstyle || '',
        avatar: userData.avatar || '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
        resources: {
          credits: 1000,
          dataShards: 50,
          syntheticAlloys: 25,
          quantumCores: 10
        }
      };
      
      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }
  
  /**
   * Get user by wallet address
   */
  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('walletAddress', '==', walletAddress));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const userData = querySnapshot.docs[0].data();
      return {
        ...userData,
        id: querySnapshot.docs[0].id,
        createdAt: (userData.createdAt as Timestamp).toDate(),
        lastLoginAt: (userData.lastLoginAt as Timestamp).toDate()
      } as User;
    } catch (error) {
      console.error('Error getting user by wallet address:', error);
      return null;
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      return {
        ...userData,
        id: userDoc.id,
        createdAt: (userData.createdAt as Timestamp).toDate(),
        lastLoginAt: (userData.lastLoginAt as Timestamp).toDate()
      } as User;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
  
  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const userData = querySnapshot.docs[0].data();
      return {
        ...userData,
        id: querySnapshot.docs[0].id,
        createdAt: (userData.createdAt as Timestamp).toDate(),
        lastLoginAt: (userData.lastLoginAt as Timestamp).toDate()
      } as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }
  
  /**
   * Update user's last login time
   */
  async updateUserLastLogin(userId: string | undefined): Promise<boolean> {
    try {
      if (!userId) {
        console.error('Error updating user last login: userId is undefined');
        return false;
      }
      
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user last login:', error);
      return false;
    }
  }
  
  /**
   * Update user data
   */
  async updateUserData(userId: string, userData: Partial<User>): Promise<boolean> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        ...userData
      });
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  }
  
  /**
   * Update user resources
   * @param userId User ID
   * @param resources Updated resources object
   * @returns Promise<boolean> indicating success or failure
   */
  async updateUserResources(userId: string, resources: User['resources']): Promise<boolean> {
    try {
      if (!userId) {
        console.error('Error updating user resources: userId is undefined');
        return false;
      }
      
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        resources: resources
      });
      return true;
    } catch (error) {
      console.error('Error updating user resources:', error);
      return false;
    }
  }
  
  /**
   * Check if wallet address is already registered
   */
  async isWalletRegistered(walletAddress: string): Promise<boolean> {
    try {
      const user = await this.getUserByWalletAddress(walletAddress);
      return !!user;
    } catch (error) {
      console.error('Error checking wallet registration:', error);
      return false;
    }
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
