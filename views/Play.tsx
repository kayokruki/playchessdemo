
import React, { useState, useCallback, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getMoveByElo } from '../engine/ai';
import { RotateCcw, User, Cpu } from 'lucide-react';

const PlayView: React.FC = () => {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [elo, setElo] = useState(1200);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Interaction State - explicitly type optionSquares to avoid {} inference
  const [moveFrom, setMoveFrom] = useState<Square | "">("");
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});

  const safeSetFen = useCallback(() => {
    setFen(game.current.fen());
    if (game.current.isGameOver()) {
      setIsGameOver(true);
    }
  }, []);

  const executeMove = useCallback((moveData: any) => {
    try {
      const result = game.current.move(moveData);
      if (result) {
        setMoveHistory(prev => [...prev, result.san]);
        safeSetFen();
        setMoveFrom("");
        setOptionSquares({});
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [safeSetFen]);

  const onSquareClick = (square: Square) => {
    if (isGameOver) return;

    const turn = game.current.turn();
    const isPlayerTurn = turn === (playerColor === 'white' ? 'w' : 'b');
    if (!isPlayerTurn) return;

    // Reset if clicking the same square
    if (moveFrom === square) {
      setMoveFrom("");
      setOptionSquares({});
      return;
    }

    // Try to make a move if a piece was already selected
    if (moveFrom !== "") {
      const move = executeMove({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      if (move) {
        // AI response
        setTimeout(() => {
          const aiMove = getMoveByElo(game.current, elo);
          if (aiMove) executeMove(aiMove);
        }, 300);
        return;
      }
    }

    // Select new piece and show legal moves
    const moves = game.current.moves({
      square,
      verbose: true,
    });

    if (moves.length === 0) {
      setMoveFrom("");
      setOptionSquares({});
      return;
    }

    const newSquares: Record<string, any> = {};
    moves.forEach((m) => {
      newSquares[m.to] = {
        background:
          game.current.get(m.to as Square)
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 20%, transparent 20%)",
        borderRadius: "50%",
      };
    });
    newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };

    setMoveFrom(square);
    setOptionSquares(newSquares);
  };

  const resetGame = () => {
    game.current = new Chess();
    setFen(game.current.fen());
    setMoveHistory([]);
    setIsGameOver(false);
    setMoveFrom("");
    setOptionSquares({});
    
    if (playerColor === 'black') {
      setTimeout(() => {
        const aiMove = getMoveByElo(game.current, elo);
        if (aiMove) executeMove(aiMove);
      }, 500);
    }
  };

  const getStatus = () => {
    if (game.current.isCheckmate()) return `Xeque-Mate! ${game.current.turn() === 'w' ? 'Pretas' : 'Brancas'} venceram.`;
    if (game.current.isDraw()) return "Empate!";
    if (game.current.isCheck()) return "Xeque!";
    return `${game.current.turn() === 'w' ? 'Brancas' : 'Pretas'} para mover`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <Cpu className="text-indigo-500 w-5 h-5" />
            <span className="font-semibold">Stockfish Mini (ELO {elo})</span>
          </div>
          <div className="px-3 py-1 bg-zinc-800 rounded-lg text-sm font-medium">
            {getStatus()}
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-900 bg-zinc-900">
          {/* Fixed: Removed 'id' property as it is not supported by ChessboardProps */}
          <Chessboard 
            position={fen} 
            onSquareClick={onSquareClick}
            boardOrientation={playerColor}
            customSquareStyles={optionSquares}
            animationDuration={200}
            customDarkSquareStyle={{ backgroundColor: '#4b5563' }}
            customLightSquareStyle={{ backgroundColor: '#e5e7eb' }}
          />
        </div>

        <div className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          <User className="text-emerald-500 w-5 h-5" />
          <span className="font-semibold">Você</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 h-fit sticky top-8">
          <h2 className="text-xl font-bold flex items-center gap-2">Configurações</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Dificuldade (ELO)</label>
              <input 
                type="range" 
                min="0" max="3000" step="100" 
                value={elo} 
                onChange={(e) => setElo(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <span>Iniciante ({elo})</span>
                <span>Mestre</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Sua Cor</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setPlayerColor('white'); resetGame(); }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${playerColor === 'white' ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}
                >Brancas</button>
                <button 
                  onClick={() => { setPlayerColor('black'); resetGame(); }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${playerColor === 'black' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                >Pretas</button>
              </div>
            </div>
          </div>

          <button 
            onClick={resetGame}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <RotateCcw className="w-5 h-5" /> Reiniciar Partida
          </button>

          <div className="pt-6 border-t border-zinc-800 mt-4">
             <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4">Histórico</h3>
             <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {moveHistory.map((m, i) => (
                 <div key={i} className="text-sm bg-zinc-800/50 p-2 rounded flex justify-between items-center px-3">
                   <span className="text-zinc-500">{Math.floor(i/2) + 1}.</span>
                   <span className="font-mono font-bold text-zinc-200">{m}</span>
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
