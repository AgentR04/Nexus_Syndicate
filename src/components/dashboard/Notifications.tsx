import React from 'react';

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
}

interface NotificationsProps {
  notifications: Notification[];
}

const Notifications: React.FC<NotificationsProps> = ({ notifications }) => {
  // Function to get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return (
          <svg className="w-5 h-5 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-light-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No notifications at this time</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`cyber-panel p-4 border-l-4 ${
              notification.type === 'alert' ? 'border-neon-red' : 
              notification.type === 'info' ? 'border-neon-blue' : 
              notification.type === 'success' ? 'border-neon-green' : 
              'border-neon-purple'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <div className="mt-1 mr-3">
                  {getNotificationIcon(notification.type)}
                </div>
                <div>
                  <p className="text-sm text-glow-blue mb-2">{notification.message}</p>
                  <span className="text-xs text-gray-400">{notification.time}</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-neon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
