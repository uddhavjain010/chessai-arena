import { Square, Color } from 'chess.js';

export type GameMode = 'ai' | 'local' | 'puzzle' | 'analysis';

export type AIDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export type PlayerColor = 'w' | 'b' | 'random';

export type BoardTheme = 'slate' | 'wood' | 'emerald' | 'cyber' | 'ice';

export type PieceStyle = 'neo' | 'classic' | 'minimal';

export interface TimeControl {
  name: string;
  initialMinutes: number;
  incrementSeconds: number;
}

export interface ClockState {
  whiteTime: number; // in seconds
  blackTime: number; // in seconds
  activeColor: Color | null;
  isRunning: boolean;
  timeControl: TimeControl;
}

export type MoveClassification = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';

export interface MoveAnalysis {
  san: string;
  from: Square;
  to: Square;
  color: Color;
  fenBefore: string;
  fenAfter: string;
  evalBefore: number; // in centipawns or pawns
  evalAfter: number;
  delta: number;
  classification: MoveClassification;
  bestMove?: string;
  bestMoveSan?: string;
  explanation: string;
}

export interface GameRecord {
  id: string;
  date: string;
  mode: GameMode;
  playerColor: Color;
  opponent: string;
  difficulty?: AIDifficulty;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  reason: string; // 'checkmate' | 'timeout' | 'resignation' | 'stalemate' | 'draw'
  timeControl: string;
  moveCount: number;
  durationSeconds: number;
  opening: {
    name: string;
    eco: string;
  };
  pgn: string;
  fen: string;
  moves: string[];
}

export interface Puzzle {
  id: string;
  title: string;
  category: 'mate_in_1' | 'mate_in_2' | 'fork' | 'pin' | 'skewer' | 'discovered_attack' | 'back_rank';
  rating: number;
  fen: string;
  playerColor: Color;
  solution: string[]; // SAN or UCI moves
  description: string;
  hint: string;
}

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  maxWinStreak: number;
  totalTimePlayed: number; // in seconds
  puzzlesSolved: number;
  puzzlesAttempted: number;
  difficultyDistribution: Record<AIDifficulty, { played: number; won: number }>;
}

export interface AppSettings {
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  showCoordinates: boolean;
  showEvalBar: boolean;
  highlightLegalMoves: boolean;
  autoQueen: boolean;
}

export interface CoachReport {
  openingScore: number; // 0-100
  tacticsScore: number;
  endgameScore: number;
  openingInsight: string;
  middlegameInsight: string;
  endgameInsight: string;
  kingSafety: string;
  pieceActivity: string;
  tacticalMistakes: string[];
  recommendations: string[];
}

export interface HintResult {
  from: Square;
  to: Square;
  san: string;
  evaluation: number;
  explanation: string;
}
