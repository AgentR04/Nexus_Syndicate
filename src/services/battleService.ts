import { Territory, Agent, Player, BattleResult } from '../types/gameTypes';
import gameService from './gameService';

class BattleService {
  // Calculate battle outcome between two players for a territory
  calculateBattleOutcome(
    territory: Territory,
    attacker: Player,
    defender: Player,
    attackerAgents: Agent[],
    defenderAgents: Agent[]
  ): BattleResult {
    // Calculate attack power
    const attackPower = this.calculateTotalPower(attackerAgents);
    
    // Calculate defense power
    const defensePower = this.calculateTotalPower(defenderAgents);
    
    // Add territory defense bonus for the defender (10%)
    const territoryDefenseBonus = 1.1;
    const adjustedDefensePower = defensePower * territoryDefenseBonus;
    
    // Determine outcome
    let outcome: 'attacker_won' | 'defender_won' | 'draw';
    let territoryControlChange = 0;
    
    if (attackPower > adjustedDefensePower * 1.2) {
      // Attacker wins decisively
      outcome = 'attacker_won';
      territoryControlChange = 100; // Full control
    } else if (attackPower > adjustedDefensePower) {
      // Attacker wins marginally
      outcome = 'attacker_won';
      territoryControlChange = Math.floor((attackPower - adjustedDefensePower) / adjustedDefensePower * 50) + 20;
    } else if (adjustedDefensePower > attackPower * 1.2) {
      // Defender wins decisively
      outcome = 'defender_won';
      territoryControlChange = -20; // Defender strengthens control
    } else if (adjustedDefensePower > attackPower) {
      // Defender wins marginally
      outcome = 'defender_won';
      territoryControlChange = -10; // Defender maintains control
    } else {
      // Draw
      outcome = 'draw';
      territoryControlChange = 5; // Slight advantage to attacker for trying
    }
    
    // Generate battle details
    const details = this.generateBattleDetails(
      territory,
      attacker,
      defender,
      attackerAgents,
      defenderAgents,
      attackPower,
      defensePower,
      outcome
    );
    
    // Create battle result
    const battleResult: BattleResult = {
      id: `battle-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      territoryId: territory.id,
      attackerId: attacker.id,
      defenderId: defender.id,
      attackerAgents: attackerAgents.map(a => a.id),
      defenderAgents: defenderAgents.map(a => a.id),
      outcome,
      territoryControlChange,
      timestamp: Date.now(),
      details
    };
    
    return battleResult;
  }
  
  // Apply battle results to territory and agents
  applyBattleResults(
    battleResult: BattleResult,
    territories: Territory[],
    agents: Agent[]
  ): { updatedTerritory: Territory, updatedAgents: Agent[] } {
    // Find the territory
    const territoryIndex = territories.findIndex(t => t.id === battleResult.territoryId);
    if (territoryIndex === -1) {
      throw new Error(`Territory with ID ${battleResult.territoryId} not found`);
    }
    
    const territory = territories[territoryIndex];
    let updatedTerritory = { ...territory };
    
    // Apply control point changes
    const currentControlPoints = territory.controlPoints || 0;
    let newControlPoints = currentControlPoints;
    
    if (battleResult.outcome === 'attacker_won') {
      newControlPoints += battleResult.territoryControlChange;
      
      // If control points reach 100, change ownership
      if (newControlPoints >= 100) {
        // Convert player ID to owner string
        const newOwner = battleResult.attackerId === 'player1' ? 'player' : 
                         battleResult.attackerId === 'player2' ? 'rival' : 'neutral';
        
        updatedTerritory = {
          ...updatedTerritory,
          owner: newOwner,
          status: 'contested', // Still contested but new owner
          controlPoints: 100,
          lastCaptureTime: Date.now()
        };
      } else {
        updatedTerritory = {
          ...updatedTerritory,
          status: 'contested',
          controlPoints: newControlPoints,
          lastCaptureTime: Date.now()
        };
      }
    } else if (battleResult.outcome === 'defender_won') {
      // Defender strengthens control
      newControlPoints = Math.max(0, currentControlPoints + battleResult.territoryControlChange);
      
      updatedTerritory = {
        ...updatedTerritory,
        controlPoints: newControlPoints,
        lastCaptureTime: Date.now()
      };
      
      // If control points are 0, territory is secure
      if (newControlPoints <= 0) {
        updatedTerritory.status = 'secure';
      }
    } else {
      // Draw - small change
      newControlPoints = Math.min(100, Math.max(0, currentControlPoints + battleResult.territoryControlChange));
      
      updatedTerritory = {
        ...updatedTerritory,
        controlPoints: newControlPoints,
        lastCaptureTime: Date.now()
      };
    }
    
    // Apply effects to agents
    const updatedAgents = agents.map(agent => {
      // Check if agent was involved in battle
      const wasAttacker = battleResult.attackerAgents.includes(agent.id);
      const wasDefender = battleResult.defenderAgents.includes(agent.id);
      
      if (!wasAttacker && !wasDefender) {
        return agent;
      }
      
      // Apply cooldown to agents involved in battle
      const cooldownTime = 5 * 60 * 1000; // 5 minutes
      
      // Agents on losing side have a chance to be wounded (longer cooldown)
      const isOnWinningSide = 
        (wasAttacker && battleResult.outcome === 'attacker_won') ||
        (wasDefender && battleResult.outcome === 'defender_won');
      
      const finalCooldown = isOnWinningSide ? cooldownTime : cooldownTime * 2;
      
      return {
        ...agent,
        cooldownUntil: Date.now() + finalCooldown
      };
    });
    
    return { updatedTerritory, updatedAgents };
  }
  
  // Calculate total power of a group of agents
  private calculateTotalPower(agents: Agent[]): number {
    // Base power calculation
    let totalPower = agents.reduce((sum, agent) => {
      // Different agent types have different base power
      let basePower = 0;
      
      switch (agent.type) {
        case 'scout':
          basePower = 5;
          break;
        case 'defense':
          basePower = 10;
          break;
        case 'trader':
          basePower = 3;
          break;
        case 'resource':
          basePower = 4;
          break;
        default:
          basePower = 5;
      }
      
      // Agent's individual power
      const agentPower = agent.power || basePower;
      
      // Agents with specific tasks get bonuses
      let taskMultiplier = 1.0;
      
      if (agent.task === 'Defend Territory' && agent.type === 'defense') {
        taskMultiplier = 1.5; // Defense agents are 50% more effective at defending
      } else if (agent.task === 'Sabotage Operations' && agent.type === 'scout') {
        taskMultiplier = 1.3; // Scouts are 30% more effective at sabotage
      }
      
      return sum + (agentPower * taskMultiplier);
    }, 0);
    
    // Apply diminishing returns for large numbers of agents
    if (agents.length > 3) {
      totalPower = totalPower * (1 - (agents.length - 3) * 0.1);
    }
    
    return Math.max(totalPower, 1); // Minimum power of 1
  }
  
  // Generate detailed battle report
  private generateBattleDetails(
    territory: Territory,
    attacker: Player,
    defender: Player,
    attackerAgents: Agent[],
    defenderAgents: Agent[],
    attackPower: number,
    defensePower: number,
    outcome: 'attacker_won' | 'defender_won' | 'draw'
  ): string {
    const attackerName = attacker.name;
    const defenderName = defender.name;
    const territoryName = territory.name;
    
    let report = `Battle for ${territoryName}\n`;
    report += `${attackerName} (Attack: ${attackPower.toFixed(1)}) vs ${defenderName} (Defense: ${defensePower.toFixed(1)})\n`;
    
    report += `\nAttacker Agents:\n`;
    attackerAgents.forEach(agent => {
      report += `- ${agent.name} (${agent.type}): ${agent.task}\n`;
    });
    
    report += `\nDefender Agents:\n`;
    defenderAgents.forEach(agent => {
      report += `- ${agent.name} (${agent.type}): ${agent.task}\n`;
    });
    
    report += `\nOutcome: `;
    if (outcome === 'attacker_won') {
      report += `${attackerName} successfully gained control in ${territoryName}!`;
    } else if (outcome === 'defender_won') {
      report += `${defenderName} successfully defended ${territoryName}!`;
    } else {
      report += `The battle for ${territoryName} ended in a stalemate.`;
    }
    
    return report;
  }
}

// Create singleton instance
const battleService = new BattleService();
export default battleService;
