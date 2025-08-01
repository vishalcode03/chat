import { useState, useEffect, useRef } from "react";
import { RefreshCw, Pause, Play } from "lucide-react";

const Snake = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  
  // Game state refs
  const snakeRef = useRef([]);
  const foodRef = useRef({ x: 0, y: 0 });
  const directionRef = useRef("RIGHT");
  const nextDirectionRef = useRef("RIGHT");
  const frameIdRef = useRef(null);
  const speedRef = useRef(150);
  const lastMoveTimeRef = useRef(0);
  const gridSizeRef = useRef(20); // Size of each grid cell in pixels
  
  // Initialize game
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    const handleKeyDown = (e) => {
      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      // Start game with space if not started
      if (e.key === ' ' && !gameStarted) {
        startGame();
        return;
      }
      
      // Pause game with escape
      if (e.key === 'Escape') {
        togglePause();
        return;
      }
      
      // Change direction, but prevent 180-degree turns
      if (gameStarted && !gamePaused && !gameOver) {
        switch (e.key) {
          case 'ArrowUp':
            if (directionRef.current !== "DOWN") nextDirectionRef.current = "UP";
            break;
          case 'ArrowDown':
            if (directionRef.current !== "UP") nextDirectionRef.current = "DOWN";
            break;
          case 'ArrowLeft':
            if (directionRef.current !== "RIGHT") nextDirectionRef.current = "LEFT";
            break;
          case 'ArrowRight':
            if (directionRef.current !== "LEFT") nextDirectionRef.current = "RIGHT";
            break;
          default:
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameStarted, gamePaused, gameOver]);

  // Set speed based on difficulty
  useEffect(() => {
    switch (difficulty) {
      case "easy":
        speedRef.current = 150;
        break;
      case "medium":
        speedRef.current = 100;
        break;
      case "hard":
        speedRef.current = 70;
        break;
      default:
        speedRef.current = 150;
    }
  }, [difficulty]);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || gamePaused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const gridSize = gridSizeRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);
    
    // Helper function to place food in a random location
    const placeFood = () => {
      const snake = snakeRef.current;
      let newFoodPosition;
      
      // Keep generating positions until we find one not occupied by the snake
      do {
        const x = Math.floor(Math.random() * cols) * gridSize;
        const y = Math.floor(Math.random() * rows) * gridSize;
        newFoodPosition = { x, y };
      } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
      
      foodRef.current = newFoodPosition;
    };
    
    // Initialize food if not already placed
    if (foodRef.current.x === 0 && foodRef.current.y === 0) {
      placeFood();
    }
    
    const gameLoop = (timestamp) => {
      // Control game speed
      if (timestamp - lastMoveTimeRef.current < speedRef.current) {
        frameIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      lastMoveTimeRef.current = timestamp;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background grid
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid lines (optional)
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Apply direction change
      directionRef.current = nextDirectionRef.current;
      
      // Get current head position
      const head = {...snakeRef.current[0]};
      
      // Move the head based on direction
      switch (directionRef.current) {
        case "UP":
          head.y -= gridSize;
          break;
        case "DOWN":
          head.y += gridSize;
          break;
        case "LEFT":
          head.x -= gridSize;
          break;
        case "RIGHT":
          head.x += gridSize;
          break;
        default:
          break;
      }
      
      // Check if the snake hits the wall
      if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
        endGame();
        return;
      }
      
      // Check if the snake hits itself
      if (snakeRef.current.some((segment, index) => 
        index > 0 && segment.x === head.x && segment.y === head.y
      )) {
        endGame();
        return;
      }
      
      // Add new head to the beginning of snake array
      const newSnake = [head, ...snakeRef.current];
      
      // Check if the snake eats the food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        // Increase score
        setScore(prevScore => prevScore + 1);
        
        // Place new food
        placeFood();
      } else {
        // Remove tail if food wasn't eaten
        newSnake.pop();
      }
      
      // Update snake
      snakeRef.current = newSnake;
      
      // Draw food
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(foodRef.current.x, foodRef.current.y, gridSize, gridSize);
      
      // Draw snake
      snakeRef.current.forEach((segment, index) => {
        // Head is a different color
        if (index === 0) {
          ctx.fillStyle = "#51cf66";
        } else {
          // Gradient effect for body
          const greenValue = Math.max(140 - index * 5, 50);
          ctx.fillStyle = `rgb(46, ${greenValue}, 46)`;
        }
        
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        
        // Draw eyes for head
        if (index === 0) {
          ctx.fillStyle = "#000";
          
          // Position eyes based on direction
          if (directionRef.current === "RIGHT") {
            ctx.fillRect(segment.x + gridSize - 7, segment.y + 5, 4, 4);
            ctx.fillRect(segment.x + gridSize - 7, segment.y + gridSize - 9, 4, 4);
          } else if (directionRef.current === "LEFT") {
            ctx.fillRect(segment.x + 3, segment.y + 5, 4, 4);
            ctx.fillRect(segment.x + 3, segment.y + gridSize - 9, 4, 4);
          } else if (directionRef.current === "UP") {
            ctx.fillRect(segment.x + 5, segment.y + 3, 4, 4);
            ctx.fillRect(segment.x + gridSize - 9, segment.y + 3, 4, 4);
          } else if (directionRef.current === "DOWN") {
            ctx.fillRect(segment.x + 5, segment.y + gridSize - 7, 4, 4);
            ctx.fillRect(segment.x + gridSize - 9, segment.y + gridSize - 7, 4, 4);
          }
        }
      });
      
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    frameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameStarted, gameOver, gamePaused]);
  
  // Update highscore when game ends
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [gameOver, score, highScore]);
  
  const startGame = () => {
    // Initialize game state
    const gridSize = gridSizeRef.current;
    const canvas = canvasRef.current;
    const centerX = Math.floor((canvas.width / gridSize) / 2) * gridSize;
    const centerY = Math.floor((canvas.height / gridSize) / 2) * gridSize;
    
    // Create initial snake with 3 segments
    snakeRef.current = [
      { x: centerX, y: centerY },
      { x: centerX - gridSize, y: centerY },
      { x: centerX - (2 * gridSize), y: centerY }
    ];
    
    // Reset game state
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setGamePaused(false);
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    foodRef.current = { x: 0, y: 0 }; // Will be set in the game loop
    lastMoveTimeRef.current = 0;
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

  // Touch controls for mobile
  const handleSwipe = (direction) => {
    if (!gameStarted) {
      startGame();
      return;
    }
    
    if (gamePaused || gameOver) return;
    
    // Prevent 180-degree turns
    if (direction === "UP" && directionRef.current !== "DOWN") {
      nextDirectionRef.current = "UP";
    } else if (direction === "DOWN" && directionRef.current !== "UP") {
      nextDirectionRef.current = "DOWN";
    } else if (direction === "LEFT" && directionRef.current !== "RIGHT") {
      nextDirectionRef.current = "LEFT";
    } else if (direction === "RIGHT" && directionRef.current !== "LEFT") {
      nextDirectionRef.current = "RIGHT";
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
      
      <div className="relative bg-base-300 rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={340} 
          height={340}
          className="bg-gray-900"
        />
        
        {/* Mobile controls */}
        {gameStarted && !gameOver && !gamePaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="grid grid-cols-3 gap-1 w-full h-full pointer-events-auto opacity-50">
              {/* Empty top-left */}
              <div className=""></div>
              {/* Up */}
              <div className="flex items-center justify-center" 
                   onClick={() => handleSwipe("UP")}>
                <div className="w-12 h-12 rounded-full bg-base-100/30 flex items-center justify-center">
                  ↑
                </div>
              </div>
              {/* Empty top-right */}
              <div className=""></div>
              
              {/* Left */}
              <div className="flex items-center justify-center" 
                   onClick={() => handleSwipe("LEFT")}>
                <div className="w-12 h-12 rounded-full bg-base-100/30 flex items-center justify-center">
                  ←
                </div>
              </div>
              {/* Empty center */}
              <div className=""></div>
              {/* Right */}
              <div className="flex items-center justify-center" 
                   onClick={() => handleSwipe("RIGHT")}>
                <div className="w-12 h-12 rounded-full bg-base-100/30 flex items-center justify-center">
                  →
                </div>
              </div>
              
              {/* Empty bottom-left */}
              <div className=""></div>
              {/* Down */}
              <div className="flex items-center justify-center" 
                   onClick={() => handleSwipe("DOWN")}>
                <div className="w-12 h-12 rounded-full bg-base-100/30 flex items-center justify-center">
                  ↓
                </div>
              </div>
              {/* Empty bottom-right */}
              <div className=""></div>
            </div>
          </div>
        )}
        
        {!gameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300/80 text-center p-4">
            <h3 className="text-xl font-bold mb-4">Snake</h3>
            <p className="mb-3">Use arrow keys to navigate and collect the food. Don't hit the walls or yourself!</p>
            <button className="btn btn-primary mt-2" onClick={startGame}>Start Game</button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300/80 text-center p-4">
            <h3 className="text-xl font-bold mb-2">Game Over!</h3>
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
        <p>Use arrow keys to control the snake</p>
        <p>Press Esc to pause the game</p>
      </div>
    </div>
  );
};

export default Snake;