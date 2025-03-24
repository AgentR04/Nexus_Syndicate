@echo off
echo Starting Nexus Syndicate development environment...

:: Start the backend server in a new window
start cmd /k "cd server && npm install && npm run dev"

:: Wait a moment for the server to start
timeout /t 3 /nobreak > nul

:: Start the frontend in a new window
start cmd /k "npm install && npm start"

echo Both server and client have been started.
echo Server running at: http://localhost:3001
echo Client running at: http://localhost:3000
