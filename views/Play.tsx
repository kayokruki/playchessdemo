import React, { useState, useRef, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { RotateCcw, User, Cpu } from "lucide-react";
import { getMoveByElo } from "../engine/ai";

const PlayView: React.FC = () => {
  // =========================
  // GAME CORE
  // =========================
  const gameRef = useRef(new Chess());

  const [fen, setFen] = useState(gameRef.current.fen());
  const [elo, setElo] = useState(1200);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // =========================
  // INTERACTION STATE
  // =========================
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalSquares, setLegalSquares] = useState<Record<string, any>>({});

  // =========================
  // HELPERS
  // =========================
  const updateGameState = useCallback(() => {
    setFen(gameRef.current.fen());
    if (gameRef.current.isGameOver()) {
      setIsGameOver(true);
    }
  }, []);

  const executeMove = useCallback(
    (move: any) => {
      const result = gameRef.current.move(move);
      if (!result) return false;

      setMoveHistory((prev) => [...prev, result.san]);
      setSelectedSquare(null);
      setLegalSquares({});
      updateGameState();
      return true;
    },
    [updateGameState]
  );

  const makeAIMove = useCallback(() => {
    if (gameRef.current.isGameOver()) return;

    const aiMove = getMoveByElo(gameRef.current, elo);
    if (aiMove) {
      executeMove(aiMove);
    }
  }, [elo, executeMove]);

  const isPlayersTurn = () => {
    const turn = gameRef.current.turn();
    return turn === (playerColor === "white" ? "w" : "b");
  };

  // =========================
  // BOARD INTERACTION
  // =========================
  const onSquareClick = (square: Square) => {
    if (isGameOver) return;
    if (!isPlayersTurn()) return;

    // MOVE if clicking a legal square
    if (selectedSquare && legalSquares[square]) {
      const moved = executeMove({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });

      if (moved) {
        setTimeout(makeAIMove, 300);
      }
      return;
    }

    // DESELECT if clicking same square
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalSquares({});
      return;
    }

    // SELECT piece and show legal moves
    const moves = gameRef.current.moves({
      square,
      verbose: true,
    });

    if (moves.length === 0) {
      setSelectedSquare(null);
      setLegalSquares({});
      return;
    }

    const highlights: Record<string, any> = {};

    moves.forEach((m) => {
      highlights[m.to] = {
        background: gameRef.current.get(m.to as Square)
          ? "radial-gradient(circle, rgba(0,0,0,0.35) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(0,0,0,0.35) 20%, transparent 20%)",
        borderRadius: "50%",
      };
    });

    highlights[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };

    setSelectedSquare(square);
    setLegalSquares(highlights);
  };

  // =========================
  // RESET GAME
  // =========================
  const resetGame = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setMoveHistory([]);
    setIsGameOver(false);
    setSelectedSquare(null);
    setLegalSquares({});

    if (playerColor === "black") {
      setTimeout(makeAIMove, 300);
    }
  };

  // =========================
  // STATUS TEXT
  // =========================
  const getStatusText = () => {
    if (gameRef.current.isCheckmate())
      return `Xeque-mate! ${
        gameRef.current.turn() === "w" ? "Pretas" : "Brancas"
      } venceram.`;
    if (gameRef.current.isDraw()) return "Empate";
    if (gameRef.current.isCheck()) return "Xeque!";
    return `${gameRef.current.turn() === "w" ? "Brancas" : "Pretas"} para mover`;
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      {/* BOARD */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <Cpu className="text-indigo-500 w-5 h-5" />
            <span className="font-semibold">AI (ELO {elo})</span>
          </div>
          <div className="px-3 py-1 bg-zinc-800 rounded-lg text-sm font-medium">
            {getStatusText()}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-900 bg-zinc-900">
          <Chessboard
            position={fen}
            boardOrientation={playerColor}
            onSquareClick={onSquareClick}
            customSquareStyles={legalSquares}
            animationDuration={200}
            customDarkSquareStyle={{ backgroundColor: "#4b5563" }}
            customLightSquareStyle={{ backgroundColor: "#e5e7eb" }}
          />
        </div>

        <div className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          <User className="text-emerald-500 w-5 h-5" />
          <span className="font-semibold">Você</span>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="flex flex-col gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 sticky top-8">
          <h2 className="text-xl font-bold">Configurações</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Dificuldade (ELO)
            </label>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={elo}
              onChange={(e) => setElo(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Sua Cor
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPlayerColor("white");
                  resetGame();
                }}
                className={`flex-1 py-2 rounded-lg font-bold ${
                  playerColor === "white"
                    ? "bg-white text-zinc-900"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                Brancas
              </button>
              <button
                onClick={() => {
                  setPlayerColor("black");
                  resetGame();
                }}
                className={`flex-1 py-2 rounded-lg font-bold ${
                  playerColor === "black"
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                Pretas
              </button>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reiniciar Partida
          </button>

          <div className="pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4">
              Histórico
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {moveHistory.map((m, i) => (
                <div
                  key={i}
                  className="text-sm bg-zinc-800/50 p-2 rounded flex justify-between px-3"
                >
                  <span className="text-zinc-500">
                    {Math.floor(i / 2) + 1}.
                  </span>
                  <span className="font-mono font-bold">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayView;
