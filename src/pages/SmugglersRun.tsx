import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SmugglersRun.css';

// Game entities and components
interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed?: number;
  type?: string;
  active?: boolean;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  success: boolean;
  score: number;
  distance: number;
  speed: number;
  boostCharges: number;
  boostCooldown: number;
  cloakCharges: number;
  cloakCooldown: number;
  isCloaked: boolean;
  routesUnlocked: number;
  cryptoCrates: number;
  lastTimestamp: number;
  targetDistance: number;
}

const SmugglersRun: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Game dimensions
  const [gameWidth, setGameWidth] = useState(800);
  const [gameHeight, setGameHeight] = useState(600);
  
  // Player state
  const [player, setPlayer] = useState<GameObject>({
    x: gameWidth / 2 - 25,
    y: gameHeight - 100,
    width: 50,
    height: 70,
    speed: 8
  });
  
  // Game objects
  const [obstacles, setObstacles] = useState<GameObject[]>([]);
  const [powerUps, setPowerUps] = useState<GameObject[]>([]);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    gameOver: false,
    success: false,
    score: 0,
    distance: 0,
    speed: 1,
    boostCharges: 3,
    boostCooldown: 0,
    cloakCharges: 3,
    cloakCooldown: 0,
    isCloaked: false,
    routesUnlocked: 0,
    cryptoCrates: 0,
    lastTimestamp: 0,
    targetDistance: 10000
  });
  
  // Controls state
  const [keys, setKeys] = useState({
    left: false,
    right: false,
    up: false,
    down: false
  });
  
  // Game images
  const [images, setImages] = useState<{[key: string]: HTMLImageElement}>({});
  
  // Load game assets
  useEffect(() => {
    const loadImages = async () => {
      const imageNames = ['player', 'obstacle1', 'obstacle2', 'powerup1', 'powerup2', 'background'];
      const loadedImages: {[key: string]: HTMLImageElement} = {};
      
      for (const name of imageNames) {
        const img = new Image();
        img.src = `/assets/smugglersrun/${name}.png`;
        loadedImages[name] = img;
      }
      
      setImages(loadedImages);
    };
    
    loadImages();
  }, []);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setKeys(prev => ({ ...prev, left: true }));
      if (e.key === 'ArrowRight') setKeys(prev => ({ ...prev, right: true }));
      if (e.key === 'ArrowUp') setKeys(prev => ({ ...prev, up: true }));
      if (e.key === 'ArrowDown') setKeys(prev => ({ ...prev, down: true }));
      
      // Boost
      if (e.key === 'Shift' && gameState.boostCharges > 0) {
        activateBoost();
      }
      
      // Cloak
      if (e.key === 'c' && gameState.cloakCharges > 0) {
        activateCloak();
      }
      
      // Pause
      if (e.key === 'p') {
        togglePause();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setKeys(prev => ({ ...prev, left: false }));
      if (e.key === 'ArrowRight') setKeys(prev => ({ ...prev, right: false }));
      if (e.key === 'ArrowUp') setKeys(prev => ({ ...prev, up: false }));
      if (e.key === 'ArrowDown') setKeys(prev => ({ ...prev, down: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.boostCharges, gameState.cloakCharges]);
  
  // Responsive canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('game-container');
      if (container) {
        const containerWidth = container.clientWidth;
        // Set canvas size based on container width
        if (containerWidth < 500) {
          setGameWidth(containerWidth - 20);
          setGameHeight((containerWidth - 20) * 0.75);
        } else if (containerWidth < 768) {
          setGameWidth(containerWidth - 40);
          setGameHeight((containerWidth - 40) * 0.75);
        } else {
          setGameWidth(Math.min(800, containerWidth - 40));
          setGameHeight(Math.min(600, (containerWidth - 40) * 0.75));
        }
      }
    };
    
    // Initial size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Mobile touch controls
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
      setIsTouching(true);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0 && gameState.isPlaying && isTouching) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      // Calculate movement based on touch difference
      const deltaX = touchX - touchStartX;
      const deltaY = touchY - touchStartY;
      
      // Update player position based on touch movement
      setPlayer(prev => ({
        ...prev,
        x: Math.max(0, Math.min(gameWidth - prev.width, prev.x + deltaX * 0.8)),
        y: Math.max(0, Math.min(gameHeight - prev.height, prev.y + deltaY * 0.8))
      }));
      
      // Update touch start position
      setTouchStartX(touchX);
      setTouchStartY(touchY);
    }
  };
  
  const handleTouchEnd = () => {
    setIsTouching(false);
  };
  
  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying && !gameState.gameOver) {
      // Draw the start screen
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderGame();
        }
      }
    }
    
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) return;
    
    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // Update game state
      updateGameState(deltaTime);
      
      // Move player
      movePlayer();
      
      // Generate obstacles and power-ups
      if (Math.random() < 0.02) {
        generateObstacle();
      }
      
      if (Math.random() < 0.005) {
        generatePowerUp();
      }
      
      // Update obstacles and power-ups
      updateObstacles(deltaTime);
      updatePowerUps(deltaTime);
      
      // Check collisions
      checkCollisions();
      
      // Render game
      renderGame();
      
      // Continue game loop
      requestIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    requestIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [gameState, player, obstacles, powerUps, keys]);
  
  // Update game state
  const updateGameState = (deltaTime: number) => {
    // Update distance and score
    setGameState(prev => ({
      ...prev,
      distance: prev.distance + prev.speed * deltaTime / 100,
      score: prev.score + deltaTime / 100
    }));
    
    // Check if player has reached target distance for level completion
    if (gameState.distance >= gameState.targetDistance) {
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        gameOver: true,
        success: true
      }));
    }
  };
  
  // Move player based on input
  const movePlayer = () => {
    let newX = player.x;
    let newY = player.y;
    
    if (keys.left) newX -= player.speed!;
    if (keys.right) newX += player.speed!;
    if (keys.up) newY -= player.speed! / 2;
    if (keys.down) newY += player.speed! / 2;
    
    // Constrain player to game bounds
    newX = Math.max(0, Math.min(gameWidth - player.width, newX));
    newY = Math.max(gameHeight / 2, Math.min(gameHeight - player.height, newY));
    
    setPlayer(prev => ({ ...prev, x: newX, y: newY }));
  };
  
  // Generate a new obstacle
  const generateObstacle = () => {
    const types = ['security', 'firewall', 'dataStorm', 'checkpoint'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const newObstacle: GameObject = {
      x: Math.random() * (gameWidth - 60),
      y: -100,
      width: 60,
      height: 60,
      speed: 3 + Math.random() * 2 + gameState.speed,
      type,
      active: true
    };
    
    setObstacles(prev => [...prev, newObstacle]);
  };
  
  // Generate a new power-up
  const generatePowerUp = () => {
    const types = ['speed', 'cloak', 'key', 'crate'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const newPowerUp: GameObject = {
      x: Math.random() * (gameWidth - 40),
      y: -80,
      width: 40,
      height: 40,
      speed: 2 + Math.random() * 2,
      type,
      active: true
    };
    
    setPowerUps(prev => [...prev, newPowerUp]);
  };
  
  // Update obstacles
  const updateObstacles = (deltaTime: number) => {
    setObstacles(prev => 
      prev
        .map(obstacle => ({
          ...obstacle,
          y: obstacle.y + obstacle.speed! * deltaTime / 16
        }))
        .filter(obstacle => obstacle.y < gameHeight + 100)
    );
  };
  
  // Update power-ups
  const updatePowerUps = (deltaTime: number) => {
    setPowerUps(prev => 
      prev
        .map(powerUp => ({
          ...powerUp,
          y: powerUp.y + powerUp.speed! * deltaTime / 16
        }))
        .filter(powerUp => powerUp.y < gameHeight + 100 && powerUp.active)
    );
  };
  
  // Check for collisions
  const checkCollisions = () => {
    // Check obstacle collisions
    for (const obstacle of obstacles) {
      if (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
      ) {
        handleObstacleCollision(obstacle);
      }
    }
    
    // Check power-up collisions
    for (const powerUp of powerUps) {
      if (
        powerUp.active &&
        player.x < powerUp.x + powerUp.width &&
        player.x + player.width > powerUp.x &&
        player.y < powerUp.y + powerUp.height &&
        player.y + player.height > powerUp.y
      ) {
        handlePowerUpCollision(powerUp);
      }
    }
  };
  
  // Handle collision with obstacle
  const handleObstacleCollision = (obstacle: GameObject) => {
    // Remove the obstacle
    setObstacles(prev => prev.filter(o => o !== obstacle));
    
    // Reduce lives
    setGameState(prev => {
      const newLives = prev.routesUnlocked - 1;
      return {
        ...prev,
        routesUnlocked: newLives,
        gameOver: newLives <= 0
      };
    });
  };
  
  // Handle collision with power-up
  const handlePowerUpCollision = (powerUp: GameObject) => {
    // Mark power-up as collected
    setPowerUps(prev => 
      prev.map(p => p === powerUp ? { ...p, active: false } : p)
    );
    
    // Apply power-up effect
    switch (powerUp.type) {
      case 'speed':
        activateBoost();
        break;
      case 'cloak':
        setGameState(prev => ({
          ...prev,
          cloakCharges: prev.cloakCharges + 1
        }));
        break;
      case 'key':
        setGameState(prev => ({
          ...prev,
          score: prev.score + 500
        }));
        break;
      case 'crate':
        setGameState(prev => ({
          ...prev,
          score: prev.score + 1000
        }));
        break;
    }
  };
  
  // Activate speed boost
  const activateBoost = () => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver || gameState.boostCooldown > 0 || gameState.boostCharges <= 0) return;
    
    setGameState(prev => ({
      ...prev,
      speed: prev.speed * 2,
      boostCharges: prev.boostCharges - 1,
      boostCooldown: 3000 // 3 seconds cooldown
    }));
    
    // Reset speed after boost duration
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        speed: Math.max(1, prev.speed / 2)
      }));
    }, 2000);
    
    // Start cooldown timer
    const cooldownInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.boostCooldown <= 0) {
          clearInterval(cooldownInterval);
          return prev;
        }
        return {
          ...prev,
          boostCooldown: prev.boostCooldown - 100
        };
      });
    }, 100);
  };
  
  // Activate cloaking
  const activateCloak = () => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver || gameState.cloakCooldown > 0 || gameState.cloakCharges <= 0) return;
    
    setGameState(prev => ({
      ...prev,
      isCloaked: true,
      cloakCharges: prev.cloakCharges - 1,
      cloakCooldown: 5000 // 5 seconds cooldown
    }));
    
    // Reset cloaking after duration
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isCloaked: false
      }));
    }, 3000);
    
    // Start cooldown timer
    const cooldownInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.cloakCooldown <= 0) {
          clearInterval(cooldownInterval);
          return prev;
        }
        return {
          ...prev,
          cloakCooldown: prev.cloakCooldown - 100
        };
      });
    }, 100);
  };
  
  // Toggle pause state
  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };
  
  // Draw player
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    // Save context
    ctx.save();
    
    // Draw player ship (cyberpunk drone)
    ctx.fillStyle = '#0ff';
    
    // Ship body
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y); // top center
    ctx.lineTo(player.x + player.width, player.y + player.height * 0.7); // bottom right
    ctx.lineTo(player.x + player.width * 0.7, player.y + player.height); // right bottom
    ctx.lineTo(player.x + player.width * 0.3, player.y + player.height); // left bottom
    ctx.lineTo(player.x, player.y + player.height * 0.7); // bottom left
    ctx.closePath();
    ctx.fill();
    
    // Add glow effect
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Engine glow
    ctx.beginPath();
    ctx.fillStyle = '#f0f';
    ctx.moveTo(player.x + player.width * 0.3, player.y + player.height);
    ctx.lineTo(player.x + player.width * 0.4, player.y + player.height + 15);
    ctx.lineTo(player.x + player.width * 0.6, player.y + player.height + 15);
    ctx.lineTo(player.x + player.width * 0.7, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height * 0.4, player.width * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Restore context
    ctx.restore();
  };

  // Render game
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#080821';
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    
    // Draw grid lines (cyberpunk style)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // Adjust grid spacing based on canvas size
    const gridSpacingX = Math.max(40, gameWidth / 20);
    const gridSpacingY = Math.max(40, gameHeight / 15);
    
    // Horizontal grid lines
    for (let y = 0; y < gameHeight; y += gridSpacingY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gameWidth, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let x = 0; x < gameWidth; x += gridSpacingX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gameHeight);
      ctx.stroke();
    }
    
    // Draw player
    ctx.fillStyle = gameState.isCloaked ? 'rgba(0, 255, 255, 0.5)' : '#00ffff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player details (cyberpunk style)
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
      if (obstacle.type === 'security') {
        ctx.fillStyle = '#ff0066';
      } else if (obstacle.type === 'firewall') {
        ctx.fillStyle = '#ff3300';
      } else {
        ctx.fillStyle = '#ff0000';
      }
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Add cyberpunk details to obstacles
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw power-ups
    powerUps.forEach(powerUp => {
      if (powerUp.type === 'boost') {
        ctx.fillStyle = '#00ff00';
      } else if (powerUp.type === 'cloak') {
        ctx.fillStyle = '#00ffff';
      } else if (powerUp.type === 'route') {
        ctx.fillStyle = '#ffff00';
      } else {
        ctx.fillStyle = '#ff00ff';
      }
      ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
      
      // Add cyberpunk details to power-ups
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
    
    // Draw UI elements
    ctx.fillStyle = '#00ffff';
    
    // Adjust font size based on canvas width
    const baseFontSize = Math.max(12, Math.min(16, gameWidth / 40));
    ctx.font = `${baseFontSize}px "Orbitron", sans-serif`;
    
    // Score and distance - position relative to canvas size
    const scoreX = 20;
    const scoreY = 30;
    const distanceX = gameWidth - 150;
    const distanceY = 30;
    
    ctx.fillText(`SCORE: ${Math.floor(gameState.score)}`, scoreX, scoreY);
    ctx.fillText(`DISTANCE: ${Math.floor(gameState.distance)}m`, distanceX, distanceY);
    
    // Progress bar
    const progressWidth = gameWidth - 40;
    const progressHeight = 10;
    const progressX = 20;
    const progressY = 50;
    const progressFill = (gameState.distance / gameState.targetDistance) * progressWidth;
    
    // Progress bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
    
    // Progress bar fill
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(progressX, progressY, progressFill, progressHeight);
    
    // Progress bar border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(progressX, progressY, progressWidth, progressHeight);
    
    // Lives/Routes - position at bottom left
    const routesX = 20;
    const routesY = gameHeight - 20;
    
    // Abilities - position at bottom center
    const cloakX = Math.max(150, gameWidth / 4);
    const cloakY = gameHeight - 20;
    const boostX = Math.min(gameWidth - 150, gameWidth * 3/4);
    const boostY = gameHeight - 20;
    
    // Crypto crates - position at bottom right
    const cryptoX = gameWidth - 150;
    const cryptoY = gameHeight - 20;
    
    ctx.fillText(`ROUTES: ${gameState.routesUnlocked}`, routesX, routesY);
    ctx.fillText(`CLOAK: ${gameState.cloakCharges}`, cloakX, cloakY);
    ctx.fillText(`BOOST: ${gameState.boostCharges}`, boostX, boostY);
    ctx.fillText(`CRYPTO: ${gameState.cryptoCrates}`, cryptoX, cryptoY);
  };
  
  // Start the game
  const startGame = () => {
    // Reset player position
    setPlayer({
      x: gameWidth / 2 - 25,
      y: gameHeight - 100,
      width: 50,
      height: 50,
      speed: 5
    });
    
    // Reset obstacles and power-ups
    setObstacles([]);
    setPowerUps([]);
    
    // Reset game state
    setGameState({
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      success: false,
      score: 0,
      distance: 0,
      speed: 1,
      boostCharges: 3,
      boostCooldown: 0,
      cloakCharges: 3,
      cloakCooldown: 0,
      isCloaked: false,
      routesUnlocked: 3,
      cryptoCrates: 0,
      lastTimestamp: performance.now(),
      targetDistance: 10000
    });
  };
  
  // Handle space key to start/restart game
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!gameState.isPlaying || gameState.gameOver) {
          startGame();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState.isPlaying, gameState.gameOver]);
  
  // Resume game
  const resumeGame = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: false,
      lastTimestamp: performance.now()
    }));
  };
  
  // Restart game
  const restartGame = () => {
    // Reset player position
    setPlayer({
      x: gameWidth / 2 - 25,
      y: gameHeight - 100,
      width: 50,
      height: 50,
      speed: 5
    });
    
    // Reset obstacles and power-ups
    setObstacles([]);
    setPowerUps([]);
    
    // Reset game state
    setGameState({
      isPlaying: true,
      isPaused: false,
      gameOver: false,
      success: false,
      score: 0,
      distance: 0,
      speed: 1,
      boostCharges: 3,
      boostCooldown: 0,
      cloakCharges: 3,
      cloakCooldown: 0,
      isCloaked: false,
      routesUnlocked: 3,
      cryptoCrates: 0,
      lastTimestamp: performance.now(),
      targetDistance: 10000
    });
  };
  
  // Exit game
  const exitGame = () => {
    navigate('/dashboard');
  };
  
  // Initialize game rendering on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        renderGame();
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-dark-blue p-4 flex flex-col">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-cyber text-neon-blue text-center mb-4">
        SMUGGLERS RUN
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-4 flex-grow">
        <div id="game-container" className="w-full lg:w-3/4 bg-black rounded-lg shadow-neon-blue overflow-hidden relative">
          {/* Game canvas */}
          <canvas 
            ref={canvasRef} 
            width={gameWidth} 
            height={gameHeight}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="mx-auto"
          />
          
          {/* Start screen */}
          {!gameState.isPlaying && !gameState.gameOver && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-80 p-4">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-cyber text-neon-blue mb-4">SMUGGLERS RUN</h2>
              <p className="text-neon-green text-center mb-2 max-w-md">
                Navigate through hazardous cyberpunk routes to deliver illegal goods and unlock hidden trade routes
              </p>
              
              <div className="my-4 text-center">
                <h3 className="text-neon-yellow font-cyber mb-2">CONTROLS:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-white text-sm md:text-base">
                  <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                    <span className="block font-bold text-neon-blue">DESKTOP</span>
                    <span className="block">Arrow Keys - Move</span>
                    <span className="block">SHIFT - Boost</span>
                    <span className="block">C - Cloak</span>
                    <span className="block">P - Pause</span>
                  </div>
                  <div className="bg-dark-blue bg-opacity-50 p-2 rounded">
                    <span className="block font-bold text-neon-green">MOBILE</span>
                    <span className="block">Touch & Drag - Move</span>
                    <span className="block">Boost Button - Boost</span>
                    <span className="block">Cloak Button - Cloak</span>
                    <span className="block">Pause Button - Pause</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={startGame}
                className="mt-4 px-6 py-2 bg-neon-blue text-black font-cyber rounded-md hover:bg-neon-purple transition-colors"
              >
                START MISSION
              </button>
            </div>
          )}
          
          {/* Game over screen */}
          {gameState.gameOver && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-80 p-4">
              <h2 className={`text-2xl md:text-3xl font-cyber ${gameState.success ? 'text-neon-green' : 'text-neon-red'} mb-4`}>
                {gameState.success ? 'MISSION SUCCESSFUL' : 'MISSION FAILED'}
              </h2>
              
              <p className="text-neon-blue text-xl mb-2">
                FINAL SCORE: {Math.floor(gameState.score)}
              </p>
              
              <p className="text-white mb-4">
                DISTANCE: {Math.floor(gameState.distance)}m
              </p>
              
              <div className="flex flex-col md:flex-row gap-2 mt-4">
                <button 
                  onClick={restartGame}
                  className="px-6 py-2 bg-neon-blue text-black font-cyber rounded-md hover:bg-neon-purple transition-colors"
                >
                  TRY AGAIN
                </button>
                
                <button 
                  onClick={exitGame}
                  className="px-6 py-2 bg-neon-red text-black font-cyber rounded-md hover:bg-neon-purple transition-colors"
                >
                  EXIT
                </button>
              </div>
            </div>
          )}
          
          {/* Pause screen */}
          {gameState.isPaused && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-80 p-4">
              <h2 className="text-2xl md:text-3xl font-cyber text-neon-yellow mb-4">PAUSED</h2>
              
              <div className="flex flex-col md:flex-row gap-2 mt-4">
                <button 
                  onClick={resumeGame}
                  className="px-6 py-2 bg-neon-blue text-black font-cyber rounded-md hover:bg-opacity-80 transition-colors"
                >
                  RESUME
                </button>
                
                <button 
                  onClick={exitGame}
                  className="px-6 py-2 bg-neon-red text-black font-cyber rounded-md hover:bg-opacity-80 transition-colors"
                >
                  EXIT
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Game info and mobile controls */}
        <div className="w-full lg:w-1/4 bg-dark-gray rounded-lg p-4 flex flex-col">
          <h2 className="text-xl font-cyber text-neon-blue mb-4">MISSION INFO</h2>
          
          {/* Game stats */}
          <div className="mb-4">
            <p className="text-neon-green mb-1">SCORE: {Math.floor(gameState.score)}</p>
            <p className="text-neon-blue mb-1">DISTANCE: {Math.floor(gameState.distance)}m</p>
            <p className="text-white mb-1">TARGET: {Math.floor(gameState.targetDistance)}m</p>
            <p className="text-neon-yellow mb-1">SPEED: {Math.floor(gameState.speed * 10)}km/h</p>
          </div>
          
          <div className="mb-4">
            <p className="text-neon-purple mb-1">ROUTES: {gameState.routesUnlocked}</p>
            <p className="text-neon-green mb-1">CRYPTO: {gameState.cryptoCrates}</p>
          </div>
          
          {/* Abilities */}
          <div className="mb-4">
            <h3 className="text-neon-yellow font-cyber mb-2">ABILITIES:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-blue bg-opacity-30 p-2 rounded">
                <p className="text-neon-blue mb-1 text-sm">BOOST</p>
                <p className="text-neon-green font-cyber">{gameState.boostCharges}</p>
              </div>
              <div className="bg-dark-blue bg-opacity-30 p-2 rounded">
                <p className="text-neon-blue mb-1 text-sm">CLOAK</p>
                <p className="text-neon-green font-cyber">{gameState.cloakCharges}</p>
              </div>
            </div>
          </div>
          
          {/* Mobile controls */}
          {gameState.isPlaying && !gameState.isPaused && !gameState.gameOver && (
            <div className="mt-auto">
              <h3 className="text-neon-yellow font-cyber mb-2">CONTROLS:</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onTouchStart={() => activateBoost()}
                  className="px-4 py-3 bg-neon-blue text-black font-cyber rounded-md active:bg-neon-green transition-colors"
                >
                  BOOST ({gameState.boostCharges})
                </button>
                <button 
                  onTouchStart={() => activateCloak()}
                  className="px-4 py-3 bg-neon-purple text-black font-cyber rounded-md active:bg-neon-green transition-colors"
                >
                  CLOAK ({gameState.cloakCharges})
                </button>
                <button 
                  onClick={togglePause}
                  className="px-4 py-3 bg-neon-yellow text-black font-cyber rounded-md hover:bg-opacity-80 transition-colors"
                >
                  PAUSE
                </button>
                <button 
                  onClick={exitGame}
                  className="px-4 py-3 bg-neon-red text-black font-cyber rounded-md hover:bg-opacity-80 transition-colors"
                >
                  EXIT
                </button>
              </div>
              <div className="mt-4 text-center text-xs text-light-gray">
                <p>Touch and drag on the game screen to move your ship</p>
              </div>
              <div className="mt-6 bg-dark-blue bg-opacity-30 p-3 rounded border border-neon-blue">
                <h4 className="text-neon-yellow font-cyber text-sm mb-2">HOW TO PLAY:</h4>
                <ul className="text-xs text-light-gray space-y-1">
                  <li>• <span className="text-neon-green">Navigate</span> your smuggling drone through hazardous routes</li>
                  <li>• <span className="text-neon-blue">Avoid</span> security drones, firewalls, and data storms</li>
                  <li>• <span className="text-neon-purple">Collect</span> power-ups to boost speed and activate cloaking</li>
                  <li>• <span className="text-neon-yellow">Gather</span> crypto crates and route keys for rewards</li>
                  <li>• <span className="text-neon-green">Reach</span> the target distance to complete your mission</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmugglersRun;
