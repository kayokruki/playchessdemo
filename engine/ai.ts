
import { Chess, Move } from 'chess.js';
import { MATERIAL_VALUES, PST } from '../constants';

/**
 * Basic evaluation function based on material and simple positional tables
 */
const evaluateBoard = (game: Chess): number => {
  let totalEvaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let val = MATERIAL_VALUES[piece.type] || 0;
        
        // Add positional bonus for pawns and knights
        if (piece.type === 'p' || piece.type === 'n') {
           const pstTable = PST[piece.type];
           const bonus = piece.color === 'w' ? pstTable[i][j] : pstTable[7 - i][j];
           val += bonus;
        }

        totalEvaluation += piece.color === 'w' ? val : -val;
      }
    }
  }
  return totalEvaluation;
};

/**
 * Minimax algorithm with Alpha-Beta pruning
 */
export const minimax = (
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number => {
  if (depth === 0) {
    return -evaluateBoard(game);
  }

  const moves = game.moves();

  if (isMaximizingPlayer) {
    let bestEval = -99999;
    for (const move of moves) {
      game.move(move);
      bestEval = Math.max(bestEval, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      alpha = Math.max(alpha, bestEval);
      if (beta <= alpha) return bestEval;
    }
    return bestEval;
  } else {
    let bestEval = 99999;
    for (const move of moves) {
      game.move(move);
      bestEval = Math.min(bestEval, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      beta = Math.min(beta, bestEval);
      if (beta <= alpha) return bestEval;
    }
    return bestEval;
  }
};

/**
 * Get the best move for a given depth
 */
export const getBestMove = (game: Chess, depth: number): string | null => {
  const moves = game.moves();
  if (moves.length === 0) return null;

  let bestMove: string | null = null;
  let bestValue = -99999;

  for (const move of moves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -100000, 100000, false);
    game.undo();
    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  return bestMove;
};

/**
 * Logic to scale AI based on ELO
 */
export const getMoveByElo = (game: Chess, elo: number): string | null => {
  const moves = game.moves();
  if (moves.length === 0) return null;

  if (elo < 600) {
    // Random moves mostly
    return moves[Math.floor(Math.random() * moves.length)];
  } else if (elo < 1200) {
    // Greedy material capture (Depth 1)
    return getBestMove(game, 1);
  } else if (elo < 2000) {
    // Standard Depth 2
    return getBestMove(game, 2);
  } else {
    // Stronger Depth 3 (performance heavy for browsers but manageable)
    return getBestMove(game, 3);
  }
};
