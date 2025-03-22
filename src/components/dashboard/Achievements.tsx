import React, { useState } from 'react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: string;
  completed: boolean;
  category: string;
}

interface AchievementsProps {
  achievements: Achievement[];
}

// Achievement categories with colors
const categories = {
  territory: 'neon-blue',
  resources: 'neon-green',
  combat: 'neon-pink',
  technology: 'neon-purple',
  social: 'neon-yellow',
  market: 'neon-green',
  agents: 'neon-blue'
};

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const [filter, setFilter] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  
  // Filter achievements based on category and completion status
  const filteredAchievements = achievements.filter((achievement) => {
    if (!showCompleted && achievement.completed) return false;
    if (filter !== 'all' && achievement.category !== filter) return false;
    return true;
  });
  
  // Calculate overall achievement progress
  const overallProgress = Math.round(
    (achievements.reduce((sum, achievement) => sum + achievement.progress, 0) / 
    (achievements.length * 100)) * 100
  );
  
  // Count completed achievements
  const completedCount = achievements.filter(a => a.completed).length;
  
  return (
    <div className="cyber-panel p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-cyber text-neon-blue">ACHIEVEMENTS</h2>
        <div className="text-sm">
          <span className="text-neon-yellow font-cyber">{completedCount}</span>
          <span className="text-light-gray">/{achievements.length} Completed</span>
        </div>
      </div>
      
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span>Overall Progress</span>
          <span className="font-mono">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-dark-gray rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-blue to-neon-purple" 
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex flex-wrap space-x-2 mb-2">
          <button
            className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-neon-blue bg-opacity-20 text-neon-blue' : 'text-light-gray'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${filter === 'territory' ? 'bg-neon-blue bg-opacity-20 text-neon-blue' : 'text-light-gray'}`}
            onClick={() => setFilter('territory')}
          >
            Territory
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${filter === 'resources' ? 'bg-neon-green bg-opacity-20 text-neon-green' : 'text-light-gray'}`}
            onClick={() => setFilter('resources')}
          >
            Resources
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${filter === 'combat' ? 'bg-neon-pink bg-opacity-20 text-neon-pink' : 'text-light-gray'}`}
            onClick={() => setFilter('combat')}
          >
            Combat
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${filter === 'technology' ? 'bg-neon-purple bg-opacity-20 text-neon-purple' : 'text-light-gray'}`}
            onClick={() => setFilter('technology')}
          >
            Tech
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${filter === 'social' ? 'bg-neon-yellow bg-opacity-20 text-neon-yellow' : 'text-light-gray'}`}
            onClick={() => setFilter('social')}
          >
            Social
          </button>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="show-completed"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
            className="mr-2 form-checkbox h-4 w-4 text-neon-blue rounded border-neon-blue bg-dark-gray"
          />
          <label htmlFor="show-completed" className="text-xs">Show Completed</label>
        </div>
      </div>
      
      {/* Achievements List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => {
            const categoryColor = categories[achievement.category as keyof typeof categories] || 'neon-blue';
            
            return (
              <div 
                key={achievement.id}
                className={`p-3 rounded border border-opacity-30 ${achievement.completed ? 
                  `border-${categoryColor} bg-${categoryColor} bg-opacity-10` : 
                  'border-light-gray bg-dark-gray'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-cyber text-${categoryColor}`}>{achievement.title}</h3>
                    <p className="text-sm mt-1">{achievement.description}</p>
                  </div>
                  {achievement.completed && (
                    <div className="bg-neon-green bg-opacity-20 text-neon-green text-xs px-2 py-1 rounded">
                      Completed
                    </div>
                  )}
                </div>
                
                {!achievement.completed && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span className="font-mono">{achievement.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-blue rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${categoryColor}`}
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-xs">
                    <span className="text-light-gray">Reward: </span>
                    <span className="text-neon-yellow">{achievement.reward}</span>
                  </div>
                  <button className="text-xs text-neon-blue hover:text-neon-purple transition-colors">
                    Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-6">
            <p className="text-light-gray">No achievements match your filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
