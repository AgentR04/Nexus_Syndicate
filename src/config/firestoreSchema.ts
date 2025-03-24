// Firestore Schema for Nexus Syndicate
// This file documents the collection structure used in Firestore

/**
 * Firestore Collections Structure
 * 
 * users/
 *   - userId (document)
 *     - id: string (auto-generated)
 *     - username: string
 *     - email: string
 *     - walletAddress: string
 *     - faction: string
 *     - playstyle: string
 *     - avatar: string
 *     - createdAt: timestamp
 *     - lastLoginAt: timestamp
 *     - isActive: boolean
 *     - resources: {
 *         credits: number
 *         dataShards: number
 *         syntheticAlloys: number
 *         quantumCores: number
 *       }
 * 
 * factions/
 *   - factionId (document)
 *     - id: string
 *     - name: string
 *     - description: string
 *     - imageUrl: string
 *     - leaderboardPosition: number
 *     - memberCount: number
 *     - territories: array<string> (territoryIds)
 *     - resources: {
 *         credits: number
 *         influence: number
 *       }
 * 
 * territories/
 *   - territoryId (document)
 *     - id: string
 *     - name: string
 *     - description: string
 *     - location: {
 *         x: number
 *         y: number
 *       }
 *     - controlledBy: string (factionId)
 *     - resourceYield: {
 *         dataShards: number
 *         syntheticAlloys: number
 *         quantumCores: number
 *       }
 *     - contestedBy: array<string> (factionIds)
 *     - contestLevel: number
 * 
 * assets/
 *   - assetId (document)
 *     - id: string
 *     - name: string
 *     - description: string
 *     - type: string (equipment, vehicle, implant, etc.)
 *     - rarity: string (common, rare, epic, legendary)
 *     - imageUrl: string
 *     - price: number
 *     - stats: {
 *         attack: number
 *         defense: number
 *         speed: number
 *         hacking: number
 *       }
 *     - ownerId: string (userId)
 *     - isForSale: boolean
 *     - mintedOnChain: boolean
 *     - tokenId: string (if minted)
 * 
 * transactions/
 *   - transactionId (document)
 *     - id: string
 *     - type: string (purchase, sale, trade, reward)
 *     - fromUserId: string
 *     - toUserId: string
 *     - assetId: string (if applicable)
 *     - amount: number
 *     - currency: string (credits, dataShards, etc.)
 *     - timestamp: timestamp
 *     - status: string (pending, completed, failed)
 *     - txHash: string (blockchain transaction hash if applicable)
 * 
 * missions/
 *   - missionId (document)
 *     - id: string
 *     - name: string
 *     - description: string
 *     - difficulty: string (easy, medium, hard, extreme)
 *     - rewards: {
 *         credits: number
 *         experience: number
 *         items: array<string> (assetIds)
 *       }
 *     - requirements: {
 *         minLevel: number
 *         faction: string (optional)
 *         items: array<string> (required items)
 *       }
 *     - location: string (territoryId)
 *     - duration: number (in minutes)
 *     - cooldown: number (in hours)
 * 
 * userMissions/
 *   - userMissionId (document)
 *     - id: string
 *     - userId: string
 *     - missionId: string
 *     - status: string (active, completed, failed)
 *     - startTime: timestamp
 *     - endTime: timestamp
 *     - rewards: {
 *         claimed: boolean
 *         items: array<string> (assetIds)
 *       }
 * 
 * marketplaceListings/
 *   - listingId (document)
 *     - id: string
 *     - sellerId: string
 *     - assetId: string
 *     - price: number
 *     - currency: string (credits, dataShards, etc.)
 *     - listedAt: timestamp
 *     - expiresAt: timestamp
 *     - status: string (active, sold, cancelled)
 * 
 * governanceProposals/
 *   - proposalId (document)
 *     - id: string
 *     - title: string
 *     - description: string
 *     - proposerId: string (userId)
 *     - factionId: string (if faction-specific)
 *     - createdAt: timestamp
 *     - expiresAt: timestamp
 *     - status: string (active, passed, rejected)
 *     - votes: {
 *         for: number
 *         against: number
 *       }
 *     - voters: array<string> (userIds)
 * 
 * walletTransactions/
 *   - transactionId (document)
 *     - id: string
 *     - walletAddress: string
 *     - type: string (deposit, withdrawal, transfer)
 *     - amount: number
 *     - currency: string (APT, etc.)
 *     - timestamp: timestamp
 *     - status: string (pending, completed, failed)
 *     - txHash: string (blockchain transaction hash)
 *     - userId: string
 * 
 * gameEvents/
 *   - eventId (document)
 *     - id: string
 *     - name: string
 *     - description: string
 *     - startTime: timestamp
 *     - endTime: timestamp
 *     - type: string (tournament, raid, faction war)
 *     - rewards: {
 *         credits: number
 *         items: array<string> (assetIds)
 *       }
 *     - participants: array<string> (userIds)
 *     - status: string (upcoming, active, completed)
 * 
 * userInventory/
 *   - inventoryId (document)
 *     - id: string
 *     - userId: string
 *     - assets: array<{
 *         assetId: string
 *         quantity: number
 *         equipped: boolean
 *       }>
 *     - currencies: {
 *         credits: number
 *         dataShards: number
 *         syntheticAlloys: number
 *         quantumCores: number
 *       }
 *     - lastUpdated: timestamp
 */

// Export collection names as constants for use throughout the application
export const COLLECTIONS = {
  USERS: 'users',
  FACTIONS: 'factions',
  TERRITORIES: 'territories',
  ASSETS: 'assets',
  TRANSACTIONS: 'transactions',
  MISSIONS: 'missions',
  USER_MISSIONS: 'userMissions',
  MARKETPLACE_LISTINGS: 'marketplaceListings',
  GOVERNANCE_PROPOSALS: 'governanceProposals',
  WALLET_TRANSACTIONS: 'walletTransactions',
  GAME_EVENTS: 'gameEvents',
  USER_INVENTORY: 'userInventory'
};

// For backward compatibility with CommonJS imports
export default COLLECTIONS;
