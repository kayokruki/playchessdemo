
import React, { useState, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { OPENINGS } from '../constants';
import { Opening } from '../types';
import { Play, CheckCircle, XCircle, ChevronRight, BookOpen } from 'lucide-react';

const OpeningsView: React.FC = () => {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<{ type: 'neutral' | 'success' | 'error', message: string }>({ type: 'neutral', message: 'Selecione uma abertura.' });

  // Interaction State - explicitly type optionSquares to avoid {} inference
  const [moveFrom, setMoveFrom] = useState<Square | "">("");
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});

  const selectOpening = (op: Opening) => {
    setSelectedOpening(op);
    game.current = new Chess();
    setFen(game.current.fen());
    setMoveIndex(0);
    setMoveFrom("");
    setOptionSquares({});
    setStatus({ type: 'neutral', message: `Treinando: ${op.name}` });
  };

  const onSquareClick = (square: Square) => {
    if (!selectedOpening) return;
    const nextCorrectMove = selectedOpening.moves[moveIndex];
    if (!nextCorrectMove) return;

    if (moveFrom === square) {
      setMoveFrom("");
      setOptionSquares({});
      return;
    }

    if (moveFrom !== "") {
      try {
        const tempGame = new Chess(game.current.fen());
        const move = tempGame.move({ from: moveFrom, to: square, promotion: 'q' });
        
        if (move) {
          if (move.san === nextCorrectMove) {
            game.current.move(move.san);
            setFen(game.current.fen());
            const nextIdx = moveIndex + 1;
            setMoveIndex(nextIdx);
            setMoveFrom("");
            setOptionSquares({});
            
            if (nextIdx >= selectedOpening.moves.length) {
              setStatus({ type: 'success', message: 'Sequência concluída!' });
            } else {
              setStatus({ type: 'neutral', message: `Correto! Próximo: ${selectedOpening.moves[nextIdx]}` });
            }
            return;
          } else {
            setStatus({ type: 'error', message: `Incorreto. Era esperado ${nextCorrectMove}.` });
            setMoveFrom("");
            setOptionSquares({});
            return;
          }
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-[600px] flex flex-col">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen className="text-indigo-500" /> Catálogo</h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {OPENINGS.map((op, idx) => (
            <button key={idx} onClick={() => selectOpening(op)} className={`w-full text-left p-3 rounded-xl border flex items-center justify-between group transition-all ${selectedOpening?.name === op.name ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-zinc-800/50 border-zinc-700 text-zinc-300'}`}>
              <span className="font-bold text-sm">{op.name}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>
          {status.type === 'success' ? <CheckCircle className="w-6 h-6" /> : status.type === 'error' ? <XCircle className="w-6 h-6" /> : <Play className="w-6 h-6 text-indigo-500" />}
          <p className="font-bold">{status.message}</p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-900 bg-zinc-900 max-w-[500px] mx-auto w-full">
          {/* Fixed: Removed 'id' property as it is not supported by ChessboardProps */}
          <Chessboard 
            position={fen} 
            onSquareClick={onSquareClick}
            customSquareStyles={optionSquares}
          />
        </div>

        {selectedOpening && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <p className="text-zinc-300 text-sm leading-relaxed">{selectedOpening.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedOpening.moves.map((m, i) => (
                <span key={i} className={`px-2 py-1 rounded text-xs font-bold ${i < moveIndex ? 'bg-emerald-600' : i === moveIndex ? 'bg-indigo-600' : 'bg-zinc-800 text-zinc-500'}`}>{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpeningsView;
