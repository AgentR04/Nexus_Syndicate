import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, query, where, Timestamp } from 'firebase/firestore';
// Import collections using ES modules syntax
import COLLECTIONS from '../config/firestoreSchema';

// Types for game data
export interface FirestoreFaction {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  leaderboardPosition: number;
  memberCount: number;
  territories: string[];
  resources: {
    credits: number;
    influence: number;
  };
}

export interface FirestoreTerritory {
  id: string;
  name: string;
  description: string;
  location: {
    x: number;
    y: number;
  };
  controlledBy: string;
  resourceYield: {
    dataShards: number;
    syntheticAlloys: number;
    quantumCores: number;
  };
  contestedBy: string[];
  contestLevel: number;
}

export interface FirestoreAsset {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  imageUrl: string;
  price: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    hacking: number;
  };
  ownerId: string;
  isForSale: boolean;
  mintedOnChain: boolean;
  tokenId: string;
}

export interface FirestoreMission {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  rewards: {
    credits: number;
    experience: number;
    items: string[];
  };
  requirements: {
    minLevel: number;
    faction: string;
    items: string[];
  };
  location: string;
  duration: number;
  cooldown: number;
}

export interface FirestoreGameEvent {
  id: string;
  name: string;
  description: string;
  startTime: Date | Timestamp;
  endTime: Date | Timestamp;
  type: string;
  rewards: {
    credits: number;
    items: string[];
  };
  participants: string[];
  status: string;
}

// Helper function to convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp && timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date();
};

class GameDataService {
  // Fetch all factions
  async getAllFactions(): Promise<FirestoreFaction[]> {
    try {
      const factionsRef = collection(db, COLLECTIONS.FACTIONS);
      const factionsSnapshot = await getDocs(factionsRef);
      
      return factionsSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreFaction;
        return {
          ...data,
          id: doc.id
        };
      });
    } catch (error) {
      console.error('Error fetching factions:', error);
      throw error;
    }
  }

  // Fetch a specific faction by ID
  async getFactionById(factionId: string): Promise<FirestoreFaction | null> {
    try {
      const factionRef = doc(db, COLLECTIONS.FACTIONS, factionId);
      const factionSnapshot = await getDoc(factionRef);
      
      if (factionSnapshot.exists()) {
        return {
          ...factionSnapshot.data() as FirestoreFaction,
          id: factionSnapshot.id
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching faction ${factionId}:`, error);
      throw error;
    }
  }

  // Fetch all territories
  async getAllTerritories(): Promise<FirestoreTerritory[]> {
    try {
      const territoriesRef = collection(db, COLLECTIONS.TERRITORIES);
      const territoriesSnapshot = await getDocs(territoriesRef);
      
      return territoriesSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreTerritory;
        return {
          ...data,
          id: doc.id
        };
      });
    } catch (error) {
      console.error('Error fetching territories:', error);
      throw error;
    }
  }

  // Fetch territories controlled by a faction
  async getTerritoriesByFaction(factionId: string): Promise<FirestoreTerritory[]> {
    try {
      const territoriesRef = collection(db, COLLECTIONS.TERRITORIES);
      const q = query(territoriesRef, where('controlledBy', '==', factionId));
      const territoriesSnapshot = await getDocs(q);
      
      return territoriesSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreTerritory;
        return {
          ...data,
          id: doc.id
        };
      });
    } catch (error) {
      console.error(`Error fetching territories for faction ${factionId}:`, error);
      throw error;
    }
  }

  // Fetch all assets
  async getAllAssets(): Promise<FirestoreAsset[]> {
    try {
      const assetsRef = collection(db, COLLECTIONS.ASSETS);
      const assetsSnapshot = await getDocs(assetsRef);
      
      return assetsSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreAsset;
        return {
          ...data,
          id: doc.id
        };
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  }

  // Fetch assets by owner
  async getAssetsByOwner(ownerId: string): Promise<FirestoreAsset[]> {
    try {
      const assetsRef = collection(db, COLLECTIONS.ASSETS);
      const q = query(assetsRef, where('ownerId', '==', ownerId));
      const assetsSnapshot = await getDocs(q);
      
      return assetsSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreAsset;
        return {
          ...data,
          id: doc.id
        };
      });
    } catch (error) {
      console.error(`Error fetching assets for owner ${ownerId}:`, error);
      throw error;
    }
  }

  // Fetch all missions
  async getAllMissions(): Promise<FirestoreMission[]> {
    try {
      const missionsRef = collection(db, COLLECTIONS.MISSIONS);
      const missionsSnapshot = await getDocs(missionsRef);
      
      return missionsSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreMission;
        return {
          ...data,
          id: doc.id
        };
      });
    } catch (error) {
      console.error('Error fetching missions:', error);
      throw error;
    }
  }

  // Fetch missions by location (territory)
  async getMissionsByLocation(territoryId: string): Promise<FirestoreMission[]> {
    try {
      const missionsRef = collection(db, COLLECTIONS.MISSIONS);
      const q = query(missionsRef, where('location', '==', territoryId));
      const missionsSnapshot = await getDocs(q);
      
      return missionsSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreMission;
        return {
          ...data,
          id: doc.id
        };
      });
    } catch (error) {
      console.error(`Error fetching missions for location ${territoryId}:`, error);
      throw error;
    }
  }

  // Fetch all game events
  async getAllGameEvents(): Promise<FirestoreGameEvent[]> {
    try {
      const eventsRef = collection(db, COLLECTIONS.GAME_EVENTS);
      const eventsSnapshot = await getDocs(eventsRef);
      
      return eventsSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreGameEvent;
        // Convert Firestore timestamps to Date objects
        return {
          ...data,
          id: doc.id,
          startTime: convertTimestampToDate(data.startTime),
          endTime: convertTimestampToDate(data.endTime)
        };
      });
    } catch (error) {
      console.error('Error fetching game events:', error);
      throw error;
    }
  }

  // Fetch active game events
  async getActiveGameEvents(): Promise<FirestoreGameEvent[]> {
    try {
      const eventsRef = collection(db, COLLECTIONS.GAME_EVENTS);
      const q = query(eventsRef, where('status', '==', 'active'));
      const eventsSnapshot = await getDocs(q);
      
      return eventsSnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreGameEvent;
        return {
          ...data,
          id: doc.id,
          startTime: convertTimestampToDate(data.startTime),
          endTime: convertTimestampToDate(data.endTime)
        };
      });
    } catch (error) {
      console.error('Error fetching active game events:', error);
      throw error;
    }
  }
}

const gameDataService = new GameDataService();
export default gameDataService;
