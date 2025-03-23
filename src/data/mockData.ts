import { Territory, Agent, Player } from '../types/gameTypes';

// Mock data for territories
export const mockTerritories: Territory[] = [
  { id: 1, q: 0, r: 0, name: 'Neon District', type: 'urban', owner: 'player', status: 'secure', resources: ['credits', 'dataShards'] },
  { id: 2, q: 1, r: -1, name: 'Quantum Fields', type: 'research', owner: 'player', status: 'contested', resources: ['quantumCores', 'syntheticAlloys'] },
  { id: 3, q: 0, r: -1, name: 'Digital Wastes', type: 'industrial', owner: 'player', status: 'secure', resources: ['dataShards', 'syntheticAlloys'] },
  { id: 4, q: -1, r: 0, name: 'Cyber Nexus', type: 'commercial', owner: 'player', status: 'secure', resources: ['credits', 'dataShards'] },
  { id: 5, q: -1, r: 1, name: 'Shadow Market', type: 'black-market', owner: 'rival', status: 'contested', resources: ['credits', 'quantumCores'] },
  { id: 6, q: 0, r: 1, name: 'Tech Haven', type: 'residential', owner: 'neutral', status: 'secure', resources: ['dataShards', 'credits'] },
  { id: 7, q: 1, r: 0, name: 'Synthetic Labs', type: 'research', owner: 'rival', status: 'contested', resources: ['syntheticAlloys', 'quantumCores'] },
  { id: 8, q: 2, r: -2, name: 'Quantum Nexus', type: 'research', owner: 'neutral', status: 'secure', resources: ['quantumCores'] },
  { id: 9, q: 2, r: -1, name: 'Data Haven', type: 'digital', owner: 'neutral', status: 'secure', resources: ['dataShards'] },
  { id: 10, q: 2, r: 0, name: 'Neural Network', type: 'digital', owner: 'rival', status: 'secure', resources: ['dataShards', 'quantumCores'] },
  { id: 11, q: 1, r: 1, name: 'Cybernetic Outpost', type: 'military', owner: 'rival', status: 'secure', resources: ['syntheticAlloys'] },
  { id: 12, q: 0, r: 2, name: 'Neon Wasteland', type: 'industrial', owner: 'neutral', status: 'contested', resources: ['credits', 'syntheticAlloys'] },
  { id: 13, q: -1, r: 2, name: 'Synthetic Forge', type: 'industrial', owner: 'neutral', status: 'secure', resources: ['syntheticAlloys'] },
  { id: 14, q: -2, r: 2, name: 'Credit Exchange', type: 'financial', owner: 'rival', status: 'secure', resources: ['credits'] },
  { id: 15, q: -2, r: 1, name: 'Black Market Hub', type: 'black-market', owner: 'neutral', status: 'contested', resources: ['credits', 'quantumCores'] },
  { id: 16, q: -2, r: 0, name: "Hacker's Den", type: 'digital', owner: 'player', status: 'secure', resources: ['dataShards'] },
  { id: 17, q: -1, r: -1, name: 'Quantum Vault', type: 'financial', owner: 'player', status: 'secure', resources: ['credits', 'quantumCores'] },
  { id: 18, q: 0, r: -2, name: 'Synthetic Research', type: 'research', owner: 'neutral', status: 'secure', resources: ['syntheticAlloys', 'dataShards'] },
  { id: 19, q: 1, r: -2, name: 'Digital Fortress', type: 'military', owner: 'player', status: 'secure', resources: ['dataShards', 'syntheticAlloys'] },
];

// Mock data for AI agents
export const mockAgents: Agent[] = [
  { id: 1, name: 'Scout-X1', type: 'scout', status: 'active', location: 'Neon District', task: 'Gathering intelligence', ownerId: 'player1', power: 75 },
  { id: 2, name: 'Defender-D3', type: 'defense', status: 'active', location: 'Quantum Fields', task: 'Protecting territory', ownerId: 'player1', power: 90 },
  { id: 3, name: 'Trader-T7', type: 'trader', status: 'active', location: 'Cyber Nexus', task: 'Market analysis', ownerId: 'player1', power: 60 },
  { id: 4, name: 'Infiltrator-I9', type: 'scout', status: 'moving', location: 'En route to Shadow Market', task: 'Infiltration', ownerId: 'player1', power: 80 },
  { id: 5, name: 'Harvester-H2', type: 'resource', status: 'active', location: 'Digital Wastes', task: 'Resource extraction', ownerId: 'player1', power: 65 },
];

// Mock data for players
export const mockPlayers: Player[] = [
  { id: 'player1', name: 'Your Syndicate', faction: 'Netrunners', resources: { credits: 1000, dataShards: 50, syntheticAlloys: 30, quantumCores: 15 } },
  { id: 'player2', name: 'Rival Syndicate', faction: 'Corporates', resources: { credits: 1200, dataShards: 40, syntheticAlloys: 35, quantumCores: 20 } },
  { id: 'player3', name: 'Shadow Syndicate', faction: 'Outcasts', resources: { credits: 800, dataShards: 60, syntheticAlloys: 25, quantumCores: 10 } },
];
