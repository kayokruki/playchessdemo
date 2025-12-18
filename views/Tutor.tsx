
import React, { useState, useCallback, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getBestMove, minimax } from '../engine/ai';
import { Lightbulb, Info, CheckCircle2, XCircle, AlertTriangle, GraduationCap } from 'lucide-react';

const TutorView: React.FC = () => {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [analysis, setAnalysis] = useState<{ type: 'good' | 'inaccurate' | 'bad' | null, message: string }>({ type: null, message: 'Faça seu lance para análise.' });
  const [suggestion, setSuggestion] = useState<string | null>(null);
  
  // Interaction State - explicitly type optionSquares to avoid {} inference
  const [moveFrom, setMoveFrom] = useState<Square | "">("");
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});

  const analyzeMove = useCallback((prevFen: string) => {
    const prevGame = new Chess(prevFen);
    const bestMoveForPrev = getBestMove(prevGame, 2);
    
    const userEval = minimax(game.current, 2, -10000, 10000, false);
    
    prevGame.move(bestMoveForPrev!);
    const bestEval = minimax(prevGame, 2, -10000, 10000, false);
    
    const diff = Math.abs(bestEval - userEval);
    let type: 'good' | 'inaccurate' | 'bad' = 'good';
    let msg = 'Excelente lance!';
    
    if (diff > 100) {
      type = 'bad';
      msg = 'Lance perigoso! Você perdeu vantagem significativa.';
    } else if (diff > 40) {
      type = 'inaccurate';
      msg = 'Imprecisão. Havia caminhos melhores.';
    }

    setAnalysis({ type, message: msg });
    
    const nextBest = getBestMove(game.current, 2);
    setSuggestion(nextBest);
    
    // Highlight suggestion next time the board renders
    if (nextBest) {
      const tempGame = new Chess(game.current.fen());
      const moveObj = tempGame.move(nextBest);
      if (moveObj) {
        setOptionSquares({
          [moveObj.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
          [moveObj.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
        });
      }
    }
  }, []);

  const onSquareClick = (square: Square) => {
    if (game.current.isGameOver()) return;

    if (moveFrom === square) {
      setMoveFrom("");
      setOptionSquares({});
      return;
    }

    if (moveFrom !== "") {
      const prevFen = game.current.fen();
      try {
        const move = game.current.move({ from: moveFrom, to: square, promotion: 'q' });
        if (move) {
          setFen(game.current.fen());
          analyzeMove(prevFen);
          setMoveFrom("");
          
          setTimeout(() => {
            const aiMove = getBestMove(game.current, 2);
            if (aiMove) {
              game.current.move(aiMove);
              setFen(game.current.fen());
            }
          }, 800);
          return;
        }
      } catch (e) {
        setMoveFrom("");
        setOptionSquares({});
      }
    }

    const moves = game.current.moves({ square, verbose: true });
    if (moves.length === 0) return;

    const newSquares: Record<string, any> = {};
    moves.forEach((m) => {
      newSquares[m.to] = {
        background: "radial-gradient(circle, rgba(0,0,0,.1) 20%, transparent 20%)",
        borderRadius: "50%",
      };
    });
    newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };

    setMoveFrom(square);
    setOptionSquares(newSquares);
  };

  const reset = () => {
    game.current = new Chess();
    setFen(game.current.fen());
    setAnalysis({ type: null, message: 'Faça seu lance para análise.' });
    setSuggestion(null);
    setMoveFrom("");
    setOptionSquares({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <GraduationCap className="text-indigo-400 w-6 h-6" />
             <h2 className="font-bold text-lg">Modo Tutor</h2>
           </div>
           <button onClick={reset} className="text-zinc-400 hover:text-white text-sm font-bold px-3 py-1 bg-zinc-800 rounded-lg">Reset</button>
        </div>

        <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-900 bg-zinc-900">
          {/* Fixed: Removed 'id' property as it is not supported by ChessboardProps */}
          <Chessboard 
            position={fen} 
            onSquareClick={onSquareClick}
            customSquareStyles={optionSquares}
            customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
            customLightSquareStyle={{ backgroundColor: '#94a3b8' }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 sticky top-8">
          <h2 className="text-xl font-bold flex items-center gap-2"><Info className="text-indigo-500" /> Análise</h2>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl flex items-start gap-4 ${
              analysis.type === 'good' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              analysis.type === 'bad' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              analysis.type === 'inaccurate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              {analysis.type === 'good' && <CheckCircle2 className="w-6 h-6 shrink-0" />}
              {analysis.type === 'bad' && <XCircle className="w-6 h-6 shrink-0" />}
              {analysis.type === 'inaccurate' && <AlertTriangle className="w-6 h-6 shrink-0" />}
              {!analysis.type && <Lightbulb className="w-6 h-6 shrink-0" />}
              <div>
                <p className="font-bold text-xs uppercase tracking-wide">Status</p>
                <p className="mt-1 text-zinc-200">{analysis.message}</p>
              </div>
            </div>

            {suggestion && (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                 <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Sugestão</p>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center font-bold text-lg">{suggestion}</div>
                   <p className="text-zinc-300 text-sm">Este é o lance ideal sugerido pelo engine.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorView;
