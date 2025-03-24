import { db } from '../config/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { COLLECTIONS } from '../config/firestoreSchema';

/**
 * Seed script for Nexus Syndicate Firestore database
 * This script populates the database with initial data for testing and development
 */

// Helper function to generate a random ID
const generateId = (): string => Math.random().toString(36).substring(2, 15);

// Define types for our data structures
interface Faction {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  leaderboardPosition: number;
  memberCount: number;
  territories?: string[];
  resources: {
    credits: number;
    influence: number;
  };
}

interface Territory {
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

interface Asset {
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

interface Mission {
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
    faction?: string;
    items: string[];
  };
  location: string;
  duration: number;
  cooldown: number;
}

interface GameEvent {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: string;
  rewards: {
    credits: number;
    items: string[];
  };
  participants: string[];
  status: string;
}

// Seed Factions
const seedFactions = async (): Promise<Faction[]> => {
  const factions: Faction[] = [
    {
      id: 'faction-neon-dragons',
      name: 'Neon Dragons',
      description: 'Tech-savvy hackers who specialize in information warfare and digital espionage.',
      imageUrl: '/images/factions/neon-dragons.jpg',
      leaderboardPosition: 1,
      memberCount: 0,
      territories: [],
      resources: {
        credits: 10000,
        influence: 500
      }
    },
    {
      id: 'faction-chrome-collective',
      name: 'Chrome Collective',
      description: 'Augmentation enthusiasts who believe in transcending human limitations through technology.',
      imageUrl: '/images/factions/chrome-collective.jpg',
      leaderboardPosition: 2,
      memberCount: 0,
      territories: [],
      resources: {
        credits: 10000,
        influence: 500
      }
    },
    {
      id: 'faction-quantum-cartel',
      name: 'Quantum Cartel',
      description: 'Underground traders who control the flow of rare resources and black market goods.',
      imageUrl: '/images/factions/quantum-cartel.jpg',
      leaderboardPosition: 3,
      memberCount: 0,
      territories: [],
      resources: {
        credits: 10000,
        influence: 500
      }
    },
    {
      id: 'faction-ghost-protocol',
      name: 'Ghost Protocol',
      description: 'Shadow operatives who specialize in stealth, infiltration, and covert operations.',
      imageUrl: '/images/factions/ghost-protocol.jpg',
      leaderboardPosition: 4,
      memberCount: 0,
      territories: [],
      resources: {
        credits: 10000,
        influence: 500
      }
    }
  ];

  const batch = writeBatch(db);
  
  factions.forEach(faction => {
    const factionRef = doc(db, COLLECTIONS.FACTIONS, faction.id);
    batch.set(factionRef, faction);
  });

  await batch.commit();
  console.log('Factions seeded successfully');
  
  return factions;
};

// Seed Territories
const seedTerritories = async (factions: Faction[]): Promise<Territory[]> => {
  const territories: Territory[] = [
    {
      id: 'territory-neo-downtown',
      name: 'Neo Downtown',
      description: 'The bustling heart of the city, filled with corporate towers and commercial hubs.',
      location: { x: 100, y: 100 },
      controlledBy: factions[0].id,
      resourceYield: {
        dataShards: 10,
        syntheticAlloys: 5,
        quantumCores: 2
      },
      contestedBy: [],
      contestLevel: 0
    },
    {
      id: 'territory-darkwater-harbor',
      name: 'Darkwater Harbor',
      description: 'A sprawling port area where illegal goods flow freely under the cover of night.',
      location: { x: 200, y: 150 },
      controlledBy: factions[2].id,
      resourceYield: {
        dataShards: 5,
        syntheticAlloys: 12,
        quantumCores: 3
      },
      contestedBy: [factions[3].id],
      contestLevel: 2
    },
    {
      id: 'territory-silicon-valley',
      name: 'Silicon Valley',
      description: 'The technological hub where cutting-edge research and development takes place.',
      location: { x: 150, y: 250 },
      controlledBy: factions[1].id,
      resourceYield: {
        dataShards: 15,
        syntheticAlloys: 8,
        quantumCores: 5
      },
      contestedBy: [factions[0].id],
      contestLevel: 1
    },
    {
      id: 'territory-shadow-district',
      name: 'Shadow District',
      description: 'A maze of narrow streets and hidden passages, perfect for those who wish to remain unseen.',
      location: { x: 300, y: 300 },
      controlledBy: factions[3].id,
      resourceYield: {
        dataShards: 8,
        syntheticAlloys: 8,
        quantumCores: 8
      },
      contestedBy: [],
      contestLevel: 0
    }
  ];

  const batch = writeBatch(db);
  
  territories.forEach(territory => {
    const territoryRef = doc(db, COLLECTIONS.TERRITORIES, territory.id);
    batch.set(territoryRef, territory);
  });

  await batch.commit();
  console.log('Territories seeded successfully');
  
  // Update factions with territories
  const factionBatch = writeBatch(db);
  
  factions.forEach((faction, index) => {
    const factionRef = doc(db, COLLECTIONS.FACTIONS, faction.id);
    const controlledTerritories = territories
      .filter(t => t.controlledBy === faction.id)
      .map(t => t.id);
    
    factionBatch.update(factionRef, {
      territories: controlledTerritories
    });
  });

  await factionBatch.commit();
  console.log('Factions updated with territories');
  
  return territories;
};

// Seed Assets
const seedAssets = async (): Promise<Asset[]> => {
  const assets: Asset[] = [
    {
      id: 'asset-neural-implant',
      name: 'Neural Implant',
      description: 'Enhances cognitive abilities and provides direct neural interface with digital systems.',
      type: 'implant',
      rarity: 'rare',
      imageUrl: '/images/assets/neural-implant.jpg',
      price: 5000,
      stats: {
        attack: 0,
        defense: 2,
        speed: 5,
        hacking: 10
      },
      ownerId: '',
      isForSale: true,
      mintedOnChain: false,
      tokenId: ''
    },
    {
      id: 'asset-plasma-rifle',
      name: 'Plasma Rifle',
      description: 'High-powered energy weapon capable of melting through most armor.',
      type: 'weapon',
      rarity: 'epic',
      imageUrl: '/images/assets/plasma-rifle.jpg',
      price: 8000,
      stats: {
        attack: 15,
        defense: 0,
        speed: -2,
        hacking: 0
      },
      ownerId: '',
      isForSale: true,
      mintedOnChain: false,
      tokenId: ''
    },
    {
      id: 'asset-stealth-suit',
      name: 'Stealth Suit',
      description: 'Advanced camouflage technology that bends light around the wearer.',
      type: 'armor',
      rarity: 'legendary',
      imageUrl: '/images/assets/stealth-suit.jpg',
      price: 12000,
      stats: {
        attack: 0,
        defense: 8,
        speed: 8,
        hacking: 0
      },
      ownerId: '',
      isForSale: true,
      mintedOnChain: false,
      tokenId: ''
    },
    {
      id: 'asset-quantum-decoder',
      name: 'Quantum Decoder',
      description: 'Cutting-edge device capable of breaking even the most sophisticated encryption.',
      type: 'tool',
      rarity: 'legendary',
      imageUrl: '/images/assets/quantum-decoder.jpg',
      price: 15000,
      stats: {
        attack: 0,
        defense: 0,
        speed: 0,
        hacking: 20
      },
      ownerId: '',
      isForSale: true,
      mintedOnChain: false,
      tokenId: ''
    }
  ];

  const batch = writeBatch(db);
  
  assets.forEach(asset => {
    const assetRef = doc(db, COLLECTIONS.ASSETS, asset.id);
    batch.set(assetRef, asset);
  });

  await batch.commit();
  console.log('Assets seeded successfully');
  
  return assets;
};

// Seed Missions
const seedMissions = async (territories: Territory[]): Promise<Mission[]> => {
  const missions: Mission[] = [
    {
      id: 'mission-data-heist',
      name: 'Data Heist',
      description: 'Infiltrate a corporate server farm and extract valuable data without being detected.',
      difficulty: 'medium',
      rewards: {
        credits: 2000,
        experience: 500,
        items: []
      },
      requirements: {
        minLevel: 5,
        faction: '',
        items: []
      },
      location: territories[0].id,
      duration: 30,
      cooldown: 4
    },
    {
      id: 'mission-smuggling-run',
      name: 'Smuggling Run',
      description: 'Transport a package of contraband across faction territories without being intercepted.',
      difficulty: 'hard',
      rewards: {
        credits: 3500,
        experience: 800,
        items: []
      },
      requirements: {
        minLevel: 8,
        faction: '',
        items: []
      },
      location: territories[1].id,
      duration: 45,
      cooldown: 6
    },
    {
      id: 'mission-tech-salvage',
      name: 'Tech Salvage',
      description: 'Recover advanced technology from an abandoned research facility overrun with security drones.',
      difficulty: 'extreme',
      rewards: {
        credits: 5000,
        experience: 1200,
        items: []
      },
      requirements: {
        minLevel: 12,
        faction: '',
        items: []
      },
      location: territories[2].id,
      duration: 60,
      cooldown: 12
    }
  ];

  const batch = writeBatch(db);
  
  missions.forEach(mission => {
    const missionRef = doc(db, COLLECTIONS.MISSIONS, mission.id);
    batch.set(missionRef, mission);
  });

  await batch.commit();
  console.log('Missions seeded successfully');
  
  return missions;
};

// Seed Game Events
const seedGameEvents = async (): Promise<GameEvent[]> => {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  const events: GameEvent[] = [
    {
      id: 'event-hacker-tournament',
      name: 'Hacker Tournament',
      description: 'Compete against other players in a series of hacking challenges to prove your skills.',
      startTime: oneWeekFromNow,
      endTime: new Date(oneWeekFromNow.getTime() + 2 * 24 * 60 * 60 * 1000),
      type: 'tournament',
      rewards: {
        credits: 10000,
        items: []
      },
      participants: [],
      status: 'upcoming'
    },
    {
      id: 'event-faction-war',
      name: 'Faction War',
      description: 'All-out conflict between factions for control of key territories. Choose your side wisely.',
      startTime: twoWeeksFromNow,
      endTime: new Date(twoWeeksFromNow.getTime() + 3 * 24 * 60 * 60 * 1000),
      type: 'faction war',
      rewards: {
        credits: 20000,
        items: []
      },
      participants: [],
      status: 'upcoming'
    }
  ];

  const batch = writeBatch(db);
  
  events.forEach(event => {
    const eventRef = doc(db, COLLECTIONS.GAME_EVENTS, event.id);
    batch.set(eventRef, event);
  });

  await batch.commit();
  console.log('Game Events seeded successfully');
  
  return events;
};

// Main seed function
export const seedFirestore = async (): Promise<{
  factions: Faction[];
  territories: Territory[];
  assets: Asset[];
  missions: Mission[];
  gameEvents: GameEvent[];
}> => {
  try {
    console.log('Starting Firestore seeding...');
    
    // Seed data in sequence
    const factions = await seedFactions();
    const territories = await seedTerritories(factions);
    const assets = await seedAssets();
    const missions = await seedMissions(territories);
    const gameEvents = await seedGameEvents();
    
    console.log('Seeding completed successfully!');
    
    return {
      factions,
      territories,
      assets,
      missions,
      gameEvents
    };
  } catch (error) {
    console.error('Error seeding Firestore:', error);
    throw error;
  }
};

// Execute the seed function if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFirestore()
    .then(() => {
      console.log('Seed script completed successfully');
      process.exit(0);
    })
    .catch((error: Error) => {
      console.error('Seed script failed:', error);
      process.exit(1);
    });
}
