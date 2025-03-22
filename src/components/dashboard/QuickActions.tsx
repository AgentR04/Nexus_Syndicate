import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Action categories with their respective actions
  const actionCategories = [
    {
      id: 'syndicate',
      name: 'SYNDICATE',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'neon-purple',
      actions: [
        { id: 'manage-members', name: 'Manage Members' },
        { id: 'view-stats', name: 'View Stats' },
        { id: 'set-policies', name: 'Set Policies' }
      ]
    },
    {
      id: 'territory',
      name: 'TERRITORY',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'neon-blue',
      actions: [
        { id: 'expand-territory', name: 'Expand Territory' },
        { id: 'defend-borders', name: 'Defend Borders' },
        { id: 'resource-extraction', name: 'Resource Extraction' }
      ]
    },
    {
      id: 'market',
      name: 'MARKET',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'neon-green',
      actions: [
        { id: 'place-order', name: 'Place Order' },
        { id: 'view-offers', name: 'View Offers' },
        { id: 'trade-history', name: 'Trade History' }
      ]
    },
    {
      id: 'technology',
      name: 'TECHNOLOGY',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'neon-pink',
      actions: [
        { id: 'research-tech', name: 'Research Tech' },
        { id: 'upgrade-facilities', name: 'Upgrade Facilities' },
        { id: 'deploy-innovations', name: 'Deploy Innovations' }
      ]
    }
  ];

  const handleActionClick = (actionId: string) => {
    onActionClick(actionId);
    // Close the panel after action is clicked
    setIsExpanded(false);
  };
  
  const navigateToHowToPlay = () => {
    navigate('/howtoplay');
    // Close the panel after navigation
    setIsExpanded(false);
  };

  return (
    <div className={`cyber-panel transition-all duration-300 ${isExpanded ? 'w-80' : 'w-16'}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b border-neon-blue">
        {isExpanded ? (
          <>
            <h3 className="text-neon-blue font-cyber text-lg">QUICK ACTIONS</h3>
            <button 
              onClick={toggleExpanded}
              className="text-neon-blue hover:text-neon-pink transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <button 
            onClick={toggleExpanded}
            className="w-full flex justify-center text-neon-blue hover:text-neon-green transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Action Categories */}
      {isExpanded ? (
        <div className="p-2 space-y-4">
          {actionCategories.map(category => (
            <div key={category.id} className="space-y-2">
              <div className={`flex items-center space-x-2 text-${category.color}`}>
                {category.icon}
                <h4 className="font-cyber text-sm">{category.name}</h4>
              </div>
              
              <div className="pl-7 space-y-1">
                {category.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(`${category.id}:${action.id}`)}
                    className="w-full text-left text-sm text-light-gray hover:text-neon-blue transition-colors"
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          {/* How To Play Button */}
          <div className="pt-2 border-t border-gray-700">
            <button
              onClick={navigateToHowToPlay}
              className="w-full text-left flex items-center space-x-2 text-neon-purple hover:text-neon-green transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>How To Play</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 flex flex-col items-center space-y-4">
          {actionCategories.map(category => (
            <button
              key={category.id}
              onClick={toggleExpanded}
              className={`text-${category.color} hover:text-neon-blue transition-colors`}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
          
          {/* Minimized How To Play Button */}
          <button
            onClick={navigateToHowToPlay}
            className="text-neon-purple hover:text-neon-green transition-colors"
            title="How To Play"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
