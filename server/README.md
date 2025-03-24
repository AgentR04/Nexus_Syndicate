# Nexus Syndicate Multiplayer Server

This is the backend server for the Nexus Syndicate multiplayer functionality. It handles real-time communication between players using Socket.IO.

## Features

- Session management (create, join, leave)
- Real-time chat
- Mission coordination
- Resource pooling
- Player status tracking

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (or use the existing one)
   - Adjust settings as needed

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /`: Server status check
- `GET /api/sessions`: Get list of active sessions

## Socket.IO Events

### Connection Events
- `register_user`: Register a user with the server
- `disconnect`: Handle user disconnection

### Session Events
- `create_session`: Create a new multiplayer session
- `join_session`: Join an existing session
- `leave_session`: Leave a session
- `session_created`: Emitted when a session is created
- `session_joined`: Emitted when a player joins a session
- `player_joined`: Emitted to notify other players when someone joins
- `player_left`: Emitted when a player leaves a session
- `session_left`: Emitted to confirm a player has left
- `host_changed`: Emitted when the session host changes

### Chat Events
- `send_message`: Send a chat message
- `message_received`: Emitted when a new message is received

### Mission Events
- `start_mission`: Start a cooperative mission
- `update_mission_progress`: Update mission progress
- `complete_mission`: Complete a mission
- `mission_started`: Emitted when a mission starts
- `mission_progress`: Emitted when mission progress updates
- `mission_completed`: Emitted when a mission is completed

### Resource Events
- `contribute_resources`: Contribute resources to the pool
- `resource_pool_updated`: Emitted when the resource pool is updated

## Integration with Client

Update the client's WebSocket URL in the React app to point to this server:

```javascript
// In .env file of the React app
REACT_APP_WEBSOCKET_URL=http://localhost:3001
```
