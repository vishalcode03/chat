import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameStatus, setGameStatus] = useState("");

  useEffect(() => {
    checkWinner();
  }, [board]);

  const handleClick = (index) => {
    if (winner || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const checkWinner = () => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setGameStatus(`Winner: ${board[a]}`);
        return;
      }
    }

    if (board.every((square) => square !== null)) {
      setGameStatus("Game ended in a draw!");
    } else {
      setGameStatus(`Next player: ${xIsNext ? "X" : "O"}`);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setGameStatus("");
  };

  const renderSquare = (index) => {
    return (
      <button
        className={`size-16 sm:size-20 flex items-center justify-center text-2xl sm:text-4xl font-bold bg-base-300 rounded-lg hover:bg-base-300/80 transition-colors
        ${board[index] === "X" ? "text-primary" : board[index] === "O" ? "text-secondary" : ""}`}
        onClick={() => handleClick(index)}
        disabled={!!winner || !!board[index]}
      >
        {board[index]}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Tic-Tac-Toe</h2>
        <p className="text-base-content/70">{gameStatus || `Next player: ${xIsNext ? "X" : "O"}`}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderSquare(index))}
      </div>

      <button className="btn btn-primary gap-2" onClick={resetGame}>
        <RefreshCw className="size-4" />
        Reset Game
      </button>
    </div>
  );
};

export default TicTacToe;