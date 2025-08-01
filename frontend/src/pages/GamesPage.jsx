import { useState } from "react";
import TicTacToe from "../components/games/TicTacToe";
import FlappyBird from "../components/games/FlappyBird";
import TrafficRacer from "../components/games/TrafficRacer";
import Snake from "../components/games/Snake";
import { Gamepad, X, Car, CornerDownRight } from "lucide-react";

const GamesPage = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: "tictactoe",
      name: "Tic-Tac-Toe",
      description: "Classic two-player game. Line up three X's or O's to win!",
      icon: <X className="size-6" />,
      component: <TicTacToe />,
    },
    {
      id: "flappybird",
      name: "Flappy Bird",
      description: "Navigate through pipes by tapping to keep your bird afloat.",
      icon: <Gamepad className="size-6" />,
      component: <FlappyBird />,
    },
    {
      id: "trafficracer",
      name: "Traffic Racer",
      description: "Dodge oncoming traffic and see how far you can go!",
      icon: <Car className="size-6" />,
      component: <TrafficRacer />,
    },
    {
      id: "snake",
      name: "Snake",
      description: "Grow your snake by collecting food, but don't hit the walls or yourself!",
      icon: <CornerDownRight className="size-6" />,
      component: <Snake />,
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gamepad className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Games</h1>
                <p className="text-base-content/70">Take a break and have some fun!</p>
              </div>
            </div>
          </div>

          {/* Game content */}
          <div className="p-6">
            {selectedGame ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{games.find(g => g.id === selectedGame).name}</h2>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => setSelectedGame(null)}
                  >
                    Back to Games
                  </button>
                </div>
                <div className="bg-base-200 rounded-lg p-4">
                  {games.find(g => g.id === selectedGame).component}
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-6">Choose a Game</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="bg-base-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedGame(game.id)}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="size-12 rounded-lg bg-base-300 flex items-center justify-center">
                          {game.icon}
                        </div>
                        <h3 className="text-lg font-medium">{game.name}</h3>
                      </div>
                      <p className="text-base-content/70">{game.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;