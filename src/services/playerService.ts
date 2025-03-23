import { Player } from '../types/gameTypes';

class PlayerService {
  private onlinePlayers: Map<string, Player> = new Map();
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId
  private socketPlayers: Map<string, string> = new Map(); // socketId -> playerId
  
  // Add a player to the online players list
  addPlayer(player: Player, socketId: string): void {
    this.onlinePlayers.set(player.id, player);
    this.playerSockets.set(player.id, socketId);
    this.socketPlayers.set(socketId, player.id);
    
    // Notify other players that a new player has joined
    this.broadcastPlayerList();
  }
  
  // Remove a player from the online players list
  removePlayer(playerId: string): void {
    const socketId = this.playerSockets.get(playerId);
    
    this.onlinePlayers.delete(playerId);
    this.playerSockets.delete(playerId);
    
    if (socketId) {
      this.socketPlayers.delete(socketId);
    }
    
    // Notify other players that a player has left
    this.broadcastPlayerList();
  }
  
  // Get a player by their socket ID
  getPlayerBySocketId(socketId: string): Player | undefined {
    const playerId = this.socketPlayers.get(socketId);
    return playerId ? this.onlinePlayers.get(playerId) : undefined;
  }
  
  // Get all online players
  getOnlinePlayers(): Player[] {
    return Array.from(this.onlinePlayers.values());
  }
  
  // Check if a player is online
  isPlayerOnline(playerId: string): boolean {
    return this.onlinePlayers.has(playerId);
  }
  
  // Broadcast the updated player list to all connected clients
  private broadcastPlayerList(): void {
    const onlinePlayers = this.getOnlinePlayers();
    // Use a custom event to notify about online players
    // We'll need to subscribe to this event in the GameContext
    document.dispatchEvent(new CustomEvent('online_players_updated', { 
      detail: onlinePlayers 
    }));
  }
}

// Create singleton instance
const playerService = new PlayerService();
export default playerService;
