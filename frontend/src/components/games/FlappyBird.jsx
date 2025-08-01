import { useState, useEffect, useRef } from "react";
import { RefreshCw, Pause, Play } from "lucide-react";

const FlappyBird = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  // Added difficulty state
  const [difficulty, setDifficulty] = useState("easy"); // easy, medium, hard
  
  const birdRef = useRef({
    x: 50,
    y: 150,
    width: 30,
    height: 20,
    velocity: 0,
    gravity: 0.5,
    jumpStrength: -10
  });
  
  const pipesRef = useRef([]);
  const frameIdRef = useRef(null);
  const lastPipeTimeRef = useRef(0);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || gamePaused) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const bird = birdRef.current;
    
    // Set difficulty parameters
    let pipeSpeed = 2;
    let pipeFrequency = 2000;
    let gapHeight = 180;
    
    if (difficulty === "easy") {
      pipeSpeed = 1.5;      // Slower pipes
      pipeFrequency = 2500; // Less frequent pipes
      gapHeight = 200;      // Larger gaps
      bird.gravity = 0.4;   // Less gravity
    } else if (difficulty === "medium") {
      pipeSpeed = 2;
      pipeFrequency = 2000;
      gapHeight = 180;
      bird.gravity = 0.5;
    } else if (difficulty === "hard") {
      pipeSpeed = 3;
      pipeFrequency = 1500;
      gapHeight = 150;
      bird.gravity = 0.6;
    }
    
    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update bird
      bird.velocity += bird.gravity;
      bird.y += bird.velocity;
      
      // Draw bird
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
      
      // Generate new pipes
      const now = Date.now();
      if (now - lastPipeTimeRef.current > pipeFrequency) {
        const gapPosition = Math.floor(Math.random() * (canvas.height - gapHeight - 80)) + 40;
        
        pipesRef.current.push({
          x: canvas.width,
          topHeight: gapPosition,
          bottomY: gapPosition + gapHeight,
          width: 50,
          counted: false
        });
        
        lastPipeTimeRef.current = now;
      }
      
      // Update and draw pipes
      for (let i = 0; i < pipesRef.current.length; i++) {
        const pipe = pipesRef.current[i];
        pipe.x -= pipeSpeed;
        
        // Draw top pipe
        ctx.fillStyle = "#2F855A";
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        
        // Draw bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
        
        // Check collision
        if (
          bird.x + bird.width > pipe.x &&
          bird.x < pipe.x + pipe.width &&
          (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
        ) {
          endGame();
          return;
        }
        
        // Score point when passing pipe
        if (!pipe.counted && bird.x > pipe.x + pipe.width) {
          setScore(prevScore => prevScore + 1);
          pipe.counted = true;
        }
      }
      
      // Remove off-screen pipes
      pipesRef.current = pipesRef.current.filter(pipe => pipe.x + pipe.width > 0);
      
      // Check if bird hit the ground or ceiling
      if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
        return;
      }
      
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    frameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [gameStarted, gameOver, gamePaused, difficulty]);
  
  // Initialize highscore from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappyBirdHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);
  
  // Update highscore when game ends
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyBirdHighScore', score.toString());
    }
  }, [gameOver, score, highScore]);
  
  const handleJump = () => {
    if (gameOver) return;
    
    if (!gameStarted) {
      startGame();
      return;
    }
    
    if (gamePaused) return;
    
    const bird = birdRef.current;
    bird.velocity = bird.jumpStrength;
  };
  
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setGamePaused(false);
    
    // Reset bird position
    birdRef.current = {
      x: 50,
      y: 150,
      width: 30,
      height: 20,
      velocity: 0,
      gravity: difficulty === "easy" ? 0.4 : difficulty === "medium" ? 0.5 : 0.6,
      jumpStrength: difficulty === "easy" ? -8 : -10
    };
    
    // Clear pipes
    pipesRef.current = [];
    lastPipeTimeRef.current = Date.now();
  };
  
  const endGame = () => {
    setGameOver(true);
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
    }
  };
  
  const togglePause = () => {
    setGamePaused(!gamePaused);
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        handleJump();
      } else if (e.code === 'Escape') {
        togglePause();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gamePaused]);
  
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
      
      {/* Added difficulty selector */}
      <div className="mb-4 flex justify-center space-x-2">
        <span className="text-sm mr-2">Difficulty:</span>
        <button 
          className={`btn btn-xs ${difficulty === "easy" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setDifficulty("easy")}
        >
          Easy
        </button>
        <button 
          className={`btn btn-xs ${difficulty === "medium" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setDifficulty("medium")}
        >
          Medium
        </button>
        <button 
          className={`btn btn-xs ${difficulty === "hard" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setDifficulty("hard")}
        >
          Hard
        </button>
      </div>
      
      <div 
        className="relative bg-base-300 rounded-lg overflow-hidden"
        style={{ width: '350px', height: '500px' }}
        onClick={handleJump}
      >
        <canvas 
          ref={canvasRef} 
          width={350} 
          height={500}
          className="bg-gradient-to-b from-blue-400 to-blue-600"
        />
        
        {!gameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300/80 text-center p-4">
            <h3 className="text-xl font-bold mb-4">Flappy Bird</h3>
            <p className="mb-3">Tap or press space to flap the bird's wings and avoid obstacles!</p>
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
        <p>Press space bar to jump or tap/click the game area</p>
        <p>Press Esc to pause the game</p>
      </div>
    </div>
  );
};

export default FlappyBird;