
import { Opening } from './types';

export const OPENINGS: Opening[] = [
  { name: 'Abertura Italiana', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], description: 'Focada no desenvolvimento rápido e controle do centro.' },
  { name: 'Defesa Siciliana', moves: ['e4', 'c5'], description: 'Uma resposta agressiva e assimétrica para as brancas.' },
  { name: 'Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], description: 'Uma das aberturas mais clássicas e profundas do xadrez.' },
  { name: 'Defesa Francesa', moves: ['e4', 'e6'], description: 'Sólida e contra-atacante, focada na estrutura de peões.' },
  { name: 'Caro-Kann', moves: ['e4', 'c6'], description: 'Extremamente sólida, visando um final de jogo favorável.' },
  { name: 'Gambito da Dama', moves: ['d4', 'd5', 'c4'], description: 'Sacrifício de peão temporário para controle central.' },
  { name: 'Defesa Índia do Rei', moves: ['d4', 'Nf6', 'c4', 'g6'], description: 'Hipermoderna, permitindo o centro para contra-atacar depois.' },
  { name: 'Inglesa', moves: ['c4'], description: 'Flexível e posicional, controla d5 à distância.' },
  { name: 'Escandinava', moves: ['e4', 'd5'], description: 'Desafia o peão central imediatamente.' },
  { name: 'Pirc', moves: ['e4', 'd6', 'd4', 'Nf6'], description: 'Similar à Índia do Rei, mas contra o peão do rei.' },
  { name: 'Alekhine', moves: ['e4', 'Nf6'], description: 'Provocativa, convida o avanço dos peões brancos.' },
  { name: 'Stonewall', moves: ['d4', 'd5', 'e3', 'Nf6', 'Bd3', 'c6', 'f4'], description: 'Uma formação defensiva de peões muito rígida.' },
  { name: 'London System', moves: ['d4', 'Nf6', 'Bf4'], description: 'Um esquema universal e sólido para as brancas.' },
  { name: 'Bird', moves: ['f4'], description: 'Abertura de flanco agressiva para o lado do rei.' },
  { name: 'Viena', moves: ['e4', 'e5', 'Nc3'], description: 'Desenvolvimento lateral antes de avançar f4.' }
];

// Piece-Square Tables for basic positional AI
export const PST = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  // ... and others can be simplified for now
};

export const MATERIAL_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};
