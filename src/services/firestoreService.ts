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
  Timestamp,
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserCredential } from '../models/User';

// Collection references
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'transactions';
const MARKETPLACE_LISTINGS_COLLECTION = 'marketplaceListings';
const TERRITORIES_COLLECTION = 'territories';

// Transaction types
export enum TransactionType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  TRANSFER = 'transfer',
  MARKETPLACE_PURCHASE = 'marketplace_purchase'
}

// Transaction status
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Transaction interface
export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  itemId: string;
  itemName: string;
  itemType: 'resource' | 'nft';
  quantity: number;
  price: number;
  totalAmount: number;
  transactionType?: TransactionType;
  status: TransactionStatus;
  txHash?: string;
  listingId?: string;
  type?: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}

// Marketplace listing interface
export interface MarketplaceListing {
  id?: string;
  sellerId: string;
  sellerName: string;
  itemId: string;
  itemName: string;
  itemType: 'resource' | 'nft';
  quantity: number;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'sold' | 'cancelled' | 'completed';
}

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

  // Marketplace operations

  /**
   * Create a new marketplace listing
   * @param listing The listing data
   * @returns The created listing with ID
   */
  async createMarketplaceListing(listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketplaceListing | null> {
    try {
      const listingRef = collection(db, MARKETPLACE_LISTINGS_COLLECTION);
      
      const newListing = {
        ...listing,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(listingRef, {
        ...newListing,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        ...newListing,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error creating marketplace listing:', error);
      return null;
    }
  }

  /**
   * Get marketplace listings
   * @param filter Optional filter parameters
   * @returns Array of marketplace listings
   */
  async getMarketplaceListings(filter?: {
    itemType?: 'resource' | 'nft';
    category?: string;
    sellerId?: string;
    status?: 'active' | 'sold' | 'cancelled';
  }): Promise<MarketplaceListing[]> {
    try {
      const listingsRef = collection(db, MARKETPLACE_LISTINGS_COLLECTION);
      let q = query(listingsRef);
      
      // Apply filters if provided
      if (filter) {
        if (filter.itemType) {
          q = query(q, where('itemType', '==', filter.itemType));
        }
        if (filter.category) {
          q = query(q, where('category', '==', filter.category));
        }
        if (filter.sellerId) {
          q = query(q, where('sellerId', '==', filter.sellerId));
        }
        if (filter.status) {
          q = query(q, where('status', '==', filter.status));
        }
      }
      
      // Always sort by creation date
      q = query(q, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate()
        } as MarketplaceListing;
      });
    } catch (error) {
      console.error('Error getting marketplace listings:', error);
      return [];
    }
  }

  /**
   * Get a marketplace listing by ID
   * @param listingId The listing ID
   * @returns The marketplace listing or null if not found
   */
  async getMarketplaceListingById(listingId: string): Promise<MarketplaceListing | null> {
    try {
      const listingRef = doc(db, MARKETPLACE_LISTINGS_COLLECTION, listingId);
      const listingDoc = await getDoc(listingRef);
      
      if (!listingDoc.exists()) {
        return null;
      }
      
      const data = listingDoc.data();
      return {
        ...data,
        id: listingDoc.id,
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate()
      } as MarketplaceListing;
    } catch (error) {
      console.error('Error getting marketplace listing:', error);
      return null;
    }
  }

  /**
   * Update a marketplace listing
   * @param listingId The listing ID
   * @param updateData The data to update
   * @returns Boolean indicating success
   */
  async updateMarketplaceListing(
    listingId: string, 
    updateData: Partial<Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> {
    try {
      const listingRef = doc(db, MARKETPLACE_LISTINGS_COLLECTION, listingId);
      
      await updateDoc(listingRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating marketplace listing:', error);
      return false;
    }
  }

  /**
   * Create a transaction record
   * @param transaction The transaction data
   * @returns The created transaction with ID
   */
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction | null> {
    try {
      const transactionRef = collection(db, TRANSACTIONS_COLLECTION);
      
      // Create a transaction object without the fields that will be added by Firestore
      const newTransaction = {
        ...transaction
      };
      
      // Add the document to Firestore with server timestamps
      const docRef = await addDoc(transactionRef, {
        ...newTransaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Return the transaction with client-side timestamps for immediate use
      return {
        ...newTransaction,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  /**
   * Update a transaction
   * @param transactionId The transaction ID
   * @param updateData The data to update
   * @returns Boolean indicating success
   */
  async updateTransaction(
    transactionId: string, 
    updateData: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> {
    try {
      const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
      
      await updateDoc(transactionRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return false;
    }
  }

  /**
   * Get user transactions
   * @param userId The user ID
   * @param role Optional role filter ('buyer' or 'seller')
   * @param limit Optional limit of transactions to return
   * @returns Array of transactions
   */
  async getUserTransactions(
    userId: string, 
    role?: 'buyer' | 'seller',
    transactionLimit: number = 10
  ): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);
      let q;
      
      if (role === 'buyer') {
        q = query(
          transactionsRef, 
          where('buyerId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(transactionLimit)
        );
      } else if (role === 'seller') {
        q = query(
          transactionsRef, 
          where('sellerId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(transactionLimit)
        );
      } else {
        // Get both buyer and seller transactions
        // This is a simplified approach - in a real app, you might need a more complex query
        const buyerQuery = query(
          transactionsRef, 
          where('buyerId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(transactionLimit)
        );
        
        const sellerQuery = query(
          transactionsRef, 
          where('sellerId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(transactionLimit)
        );
        
        const [buyerSnapshot, sellerSnapshot] = await Promise.all([
          getDocs(buyerQuery),
          getDocs(sellerQuery)
        ]);
        
        const buyerTransactions = buyerSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
          } as Transaction;
        });
        
        const sellerTransactions = sellerSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate()
          } as Transaction;
        });
        
        // Combine, sort by date, and limit
        return [...buyerTransactions, ...sellerTransactions]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, transactionLimit);
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate()
        } as Transaction;
      });
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  /**
   * Process a marketplace purchase
   * @param listingId The listing ID
   * @param buyerId The buyer user ID
   * @param quantity The quantity to purchase
   * @param txHash Optional blockchain transaction hash
   * @returns Boolean indicating success
   */
  async processMarketplacePurchase(
    listingId: string,
    buyerId: string,
    quantity: number,
    txHash?: string
  ): Promise<boolean> {
    try {
      // Get the listing
      const listing = await this.getMarketplaceListingById(listingId);
      if (!listing) {
        console.error('Listing not found');
        return false;
      }
      
      // Get buyer and seller
      const buyer = await this.getUserById(buyerId);
      const seller = await this.getUserById(listing.sellerId);
      
      if (!buyer || !seller) {
        console.error('Buyer or seller not found');
        return false;
      }
      
      // Calculate total amount
      const totalAmount = listing.price * quantity;
      
      // Check if buyer has enough credits
      if (!buyer.resources || buyer.resources.credits < totalAmount) {
        console.error('Buyer does not have enough credits');
        return false;
      }
      
      // Update buyer's resources
      const updatedBuyerResources = { ...buyer.resources };
      updatedBuyerResources.credits -= totalAmount;
      
      // If buying a resource, add it to buyer's resources
      if (listing.itemType === 'resource') {
        const resourceKey = listing.itemName.toLowerCase().replace(/\s+/g, '');
        
        // Handle special cases for resource names
        let resourceKeyMapped: keyof typeof updatedBuyerResources;
        
        switch (resourceKey) {
          case 'credits':
            resourceKeyMapped = 'credits';
            break;
          case 'datashards':
          case 'data-shards':
          case 'data_shards':
            resourceKeyMapped = 'dataShards';
            break;
          case 'syntheticalloys':
          case 'synthetic-alloys':
          case 'synthetic_alloys':
            resourceKeyMapped = 'syntheticAlloys';
            break;
          case 'quantumcores':
          case 'quantum-cores':
          case 'quantum_cores':
            resourceKeyMapped = 'quantumCores';
            break;
          default:
            // Default to credits if no match
            resourceKeyMapped = 'credits';
        }
        
        if (updatedBuyerResources[resourceKeyMapped] !== undefined) {
          updatedBuyerResources[resourceKeyMapped] += quantity;
        } else {
          updatedBuyerResources[resourceKeyMapped] = quantity;
        }
      }
      
      // Update seller's resources
      const updatedSellerResources = { ...seller.resources };
      if (updatedSellerResources.credits !== undefined) {
        updatedSellerResources.credits += totalAmount;
      } else {
        updatedSellerResources.credits = totalAmount;
      }
      
      // Update listing status if all quantity is purchased
      let listingUpdatePromise;
      if (listing.quantity <= quantity) {
        listingUpdatePromise = this.updateMarketplaceListing(listingId, {
          status: 'completed'
        });
      } else {
        listingUpdatePromise = this.updateMarketplaceListing(listingId, {
          quantity: listing.quantity - quantity
        });
      }
      
      // Create transaction record
      const transactionData = {
        buyerId,
        sellerId: listing.sellerId,
        listingId,
        itemId: listing.itemId,
        itemName: listing.itemName,
        itemType: listing.itemType,
        quantity,
        price: listing.price,
        totalAmount,
        txHash,
        status: TransactionStatus.COMPLETED,
        transactionType: TransactionType.MARKETPLACE_PURCHASE
      };
      
      const transaction = await this.createTransaction(transactionData);
      
      // Update buyer and seller resources
      // Ensure all required properties are defined
      const buyerResources = {
        credits: updatedBuyerResources.credits || 0,
        dataShards: updatedBuyerResources.dataShards || 0,
        syntheticAlloys: updatedBuyerResources.syntheticAlloys || 0,
        quantumCores: updatedBuyerResources.quantumCores || 0
      };
      
      const sellerResources = {
        credits: updatedSellerResources.credits || 0,
        dataShards: updatedSellerResources.dataShards || 0,
        syntheticAlloys: updatedSellerResources.syntheticAlloys || 0,
        quantumCores: updatedSellerResources.quantumCores || 0
      };
      
      const buyerUpdatePromise = this.updateUserResources(buyerId, buyerResources);
      const sellerUpdatePromise = this.updateUserResources(listing.sellerId, sellerResources);
      
      // Wait for all updates to complete
      const [listingUpdated, transactionUpdated, buyerUpdated, sellerUpdated] = await Promise.all([
        listingUpdatePromise,
        transaction !== null,
        buyerUpdatePromise,
        sellerUpdatePromise
      ]);
      
      return listingUpdated && transactionUpdated && buyerUpdated && sellerUpdated;
    } catch (error) {
      console.error('Error processing marketplace purchase:', error);
      return false;
    }
  }

  /**
   * Update a territory in Firestore
   * @param territoryId The territory ID
   * @param updateData The data to update
   * @returns Boolean indicating success
   */
  async updateTerritory(
    territoryId: number,
    updateData: Partial<{
      owner: string;
      status: string;
      controlPoints: number;
      lastCaptureTime: number;
    }>
  ): Promise<boolean> {
    try {
      const territoryRef = doc(db, 'territories', territoryId.toString());
      
      await updateDoc(territoryRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating territory:', error);
      return false;
    }
  }

  /**
   * Get all territories
   * @returns Array of territories
   */
  async getTerritories(): Promise<any[]> {
    try {
      const territoriesRef = collection(db, 'territories');
      const querySnapshot = await getDocs(territoriesRef);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
          updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date()
        };
      });
    } catch (error) {
      console.error('Error getting territories:', error);
      return [];
    }
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
