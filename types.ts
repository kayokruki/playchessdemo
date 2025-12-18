
export type Color = 'w' | 'b';

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export enum GameView {
  PLAY = 'play',
  TUTOR = 'tutor',
  OPENINGS = 'openings'
}

export interface Opening {
  name: string;
  moves: string[]; // List of move SANs
  description: string;
}

export interface EvalResult {
  score: number;
  bestMove?: Move;
}
