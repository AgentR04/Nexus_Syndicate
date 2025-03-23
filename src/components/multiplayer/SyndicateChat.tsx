import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  faction: string;
  message: string;
  timestamp: number;
}

const SyndicateChat: React.FC = () => {
  const { currentPlayer, players } = useGame();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock chat data for demonstration
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        senderId: 'player2',
        senderName: 'CyberHawk',
        faction: 'Netrunners',
        message: 'Anyone want to coordinate an attack on sector 7?',
        timestamp: Date.now() - 1000 * 60 * 15
      },
      {
        id: '2',
        senderId: 'player3',
        senderName: 'DataWraith',
        faction: 'Netrunners',
        message: 'I have agents in sector 6, we could pincer them',
        timestamp: Date.now() - 1000 * 60 * 14
      },
      {
        id: '3',
        senderId: 'player1',
        senderName: currentPlayer?.name || 'You',
        faction: currentPlayer?.faction || 'Netrunners',
        message: 'I can contribute 200 credits to the syndicate pool for upgrades',
        timestamp: Date.now() - 1000 * 60 * 10
      },
      {
        id: '4',
        senderId: 'player4',
        senderName: 'NeonShadow',
        faction: 'Netrunners',
        message: 'Just unlocked a new trade route in the eastern district',
        timestamp: Date.now() - 1000 * 60 * 5
      }
    ];
    
    setMessages(mockMessages);
  }, [currentPlayer]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentPlayer) return;
    
    const newChatMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentPlayer.id,
      senderName: currentPlayer.name,
      faction: currentPlayer.faction,
      message: newMessage,
      timestamp: Date.now()
    };
    
    setMessages([...messages, newChatMessage]);
    setNewMessage('');
    
    // In a real implementation, this would send the message to a backend service
    // chatService.sendMessage(newChatMessage);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFactionColor = (faction: string): string => {
    switch (faction) {
      case 'Netrunners':
        return 'text-neon-blue';
      case 'Synth Lords':
        return 'text-neon-purple';
      case 'Chrome Jackals':
        return 'text-neon-pink';
      case 'Quantum Collective':
        return 'text-neon-yellow';
      default:
        return 'text-neon-green';
    }
  };

  return (
    <div className={`cyber-panel bg-dark-gray transition-all duration-300 ${isExpanded ? 'h-96' : 'h-12'}`}>
      <div 
        className="flex items-center justify-between p-2 border-b border-neon-blue cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-neon-blue font-cyber text-sm">SYNDICATE CHAT</h3>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-neon-green mr-2"></div>
          <span className="text-xs text-light-gray">{players.filter(p => p.faction === currentPlayer?.faction).length} ONLINE</span>
          <button className="ml-2 text-light-gray">
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <>
          <div className="h-72 overflow-y-auto p-2 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === currentPlayer?.id ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-3/4 rounded px-3 py-2 ${
                    msg.senderId === currentPlayer?.id 
                      ? 'bg-neon-blue bg-opacity-20 border border-neon-blue' 
                      : 'bg-dark-blue bg-opacity-30'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`text-xs font-bold ${getFactionColor(msg.faction)}`}>
                      {msg.senderName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-light-gray">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-2 border-t border-dark-blue flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow bg-dark-blue text-light-gray text-sm p-2 rounded-l outline-none"
            />
            <button 
              type="submit"
              className="bg-neon-blue text-black font-cyber px-3 py-1 rounded-r"
            >
              SEND
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default SyndicateChat;
