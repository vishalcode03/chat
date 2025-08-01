import { useState, useEffect, useRef } from "react";
import { RefreshCw, Pause, Play } from "lucide-react";

const TrafficRacer = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  
  const playerRef = useRef({
    x: 175,
    y: 400,
    width: 40,
    height: 70,
    speed: 5
  });
  
  const obstaclesRef = useRef([]);
  const frameIdRef = useRef(null);
  const lastObstacleTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const keysPressed = useRef({});
  
  // Initialize game
  useEffect(() => {
    const savedHighScore = localStorage.getItem('trafficRacerHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
      
      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === ' ' && !gameStarted) {
        startGame();
      } else if (e.key === 'Escape') {
        togglePause();
      }
    };
    
    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameStarted, gamePaused]);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || gamePaused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const player = playerRef.current;
    
    // Set difficulty parameters
    let obstacleSpeed = 3;
    let obstacleFrequency = 1500;
    
    if (difficulty === "easy") {
      obstacleSpeed = 3;
      obstacleFrequency = 1800;
    } else if (difficulty === "medium") {
      obstacleSpeed = 5;
      obstacleFrequency = 1500;
    } else if (difficulty === "hard") {
      obstacleSpeed = 7;
      obstacleFrequency = 1000;
    }
    
    // Road marking variables for animation
    let roadOffset = 0;
    
    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw road
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw road markings
      ctx.fillStyle = "#FFFFFF";
      roadOffset = (roadOffset + obstacleSpeed) % 40;
      
      for (let i = -40 + roadOffset; i < canvas.height; i += 40) {
        // Center line
        ctx.fillRect(canvas.width / 2 - 5, i, 10, 20);
        
        // Side lines
        ctx.fillRect(50, i, 5, 20);
        ctx.fillRect(canvas.width - 55, i, 5, 20);
      }
      
      // Move player based on key presses
      if (keysPressed.current['ArrowLeft'] && player.x > 60) {
        player.x -= player.speed;
      }
      if (keysPressed.current['ArrowRight'] && player.x < canvas.width - player.width - 60) {
        player.x += player.speed;
      }
      
      // Draw player car
      ctx.fillStyle = "#4299e1"; // Blue car
      ctx.fillRect(player.x, player.y, player.width, player.height);
      // Car details
      ctx.fillStyle = "#2b6cb0";
      ctx.fillRect(player.x, player.y + 15, player.width, 10);
      ctx.fillRect(player.x, player.y + 45, player.width, 10);
      ctx.fillStyle = "#ebf8ff";
      ctx.fillRect(player.x + 5, player.y + 5, player.width - 10, 10);
      
      // Generate new obstacles
      const now = Date.now();
      if (now - lastObstacleTimeRef.current > obstacleFrequency) {
        // Random lane position
        const lanes = [85, 175, 265];
        const laneIndex = Math.floor(Math.random() * lanes.length);
        const obstacleX = lanes[laneIndex];
        
        obstaclesRef.current.push({
          x: obstacleX,
          y: -70, // Start above the canvas
          width: 40,
          height: 70,
          color: ["#f56565", "#ed8936", "#48bb78"][Math.floor(Math.random() * 3)] // Random car color
        });
        
        lastObstacleTimeRef.current = now;
        setScore(prevScore => prevScore + 1);
      }
      
      // Update and draw obstacles
      for (let i = 0; i < obstaclesRef.current.length; i++) {
        const obstacle = obstaclesRef.current[i];
        obstacle.y += obstacleSpeed;
        
        // Draw obstacle car
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        // Car details
        ctx.fillStyle = "#2d3748";
        ctx.fillRect(obstacle.x, obstacle.y + 15, obstacle.width, 10);
        ctx.fillRect(obstacle.x, obstacle.y + 45, obstacle.width, 10);
        ctx.fillStyle = "#fff5f5";
        ctx.fillRect(obstacle.x + 5, obstacle.y + 55, obstacle.width - 10, 10);
        
        // Check collision with player
        if (
          player.x < obstacle.x + obstacle.width &&
          player.x + player.width > obstacle.x &&
          player.y < obstacle.y + obstacle.height &&
          player.y + player.height > obstacle.y
        ) {
          endGame();
          return;
        }
      }
      
      // Remove off-screen obstacles
      obstaclesRef.current = obstaclesRef.current.filter(
        obstacle => obstacle.y < canvas.height
      );
      
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    frameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameStarted, gameOver, gamePaused, difficulty]);
  
  // Update highscore when game ends
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('trafficRacerHighScore', score.toString());
    }
  }, [gameOver, score, highScore]);
  
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setGamePaused(false);
    
    // Reset player position
    playerRef.current = {
      x: 175,
      y: 400,
      width: 40,
      height: 70,
      speed: difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6
    };
    
    // Clear obstacles
    obstaclesRef.current = [];
    lastObstacleTimeRef.current = Date.now();
  };
  
  const endGame = () => {
    setGameOver(true);
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
    }
  };
  
  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setGamePaused(!gamePaused);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex justify-between w-full">
        <div>
          <h3 className="text-xl font-semibold">Score: {score}</h3>
          <p className="text-sm text-base-content/70">High Score: {highScore}</p>
        </div>
        
        <div className="space-x-2">
          {gameStarted && !gameOver && (
            <button className="btn btn-sm" onClick={togglePause}>
              {gamePaused ? <Play className="size-4" /> : <Pause className="size-4" />}
              {gamePaused ? "Resume" : "Pause"}
            </button>
          )}
          {(gameOver || !gameStarted) && (
            <button className="btn btn-primary btn-sm gap-2" onClick={startGame}>
              <RefreshCw className="size-4" />
              {gameStarted ? "Restart" : "Start Game"}
            </button>
          )}
        </div>
      </div>
      
      {/* Difficulty selector */}
      <div className="mb-4 flex justify-center space-x-2">
        <span className="text-sm mr-2">Difficulty:</span>
        <button 
          className={`btn btn-xs ${difficulty === "easy" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setDifficulty("easy")}
          disabled={gameStarted && !gameOver}
        >
          Easy
        </button>
        <button 
          className={`btn btn-xs ${difficulty === "medium" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setDifficulty("medium")}
          disabled={gameStarted && !gameOver}
        >
          Medium
        </button>
        <button 
          className={`btn btn-xs ${difficulty === "hard" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setDifficulty("hard")}
          disabled={gameStarted && !gameOver}
        >
          Hard
        </button>
      </div>
      
      <div 
        className="relative bg-base-300 rounded-lg overflow-hidden"
        style={{ width: '350px', height: '500px' }}
      >
        <canvas 
          ref={canvasRef} 
          width={350} 
          height={500}
          className="bg-gray-800"
        />
        
        {!gameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300/80 text-center p-4">
            <h3 className="text-xl font-bold mb-4">Traffic Racer</h3>
            <p className="mb-3">Use the left and right arrow keys to dodge oncoming traffic!</p>
            <button className="btn btn-primary mt-2" onClick={startGame}>Start Game</button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300/80 text-center p-4">
            <h3 className="text-xl font-bold mb-2">Crash!</h3>
            <p className="mb-1">Your score: {score}</p>
            <p className="mb-4">High score: {highScore}</p>
            <button className="btn btn-primary" onClick={startGame}>Try Again</button>
          </div>
        )}
        
        {gamePaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300/80 text-center">
            <h3 className="text-xl font-bold mb-4">Game Paused</h3>
            <button className="btn btn-primary" onClick={togglePause}>Resume</button>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-base-content/70">
        <p>Use ← → arrow keys to move your car</p>
        <p>Press Esc to pause the game</p>
      </div>
    </div>
  );
};

export default TrafficRacer;