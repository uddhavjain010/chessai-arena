import { Chess, PieceSymbol, Color } from 'chess.js';

// Piece base values in centipawns
export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-Square Tables (from White's perspective; rank 8 is row 0, rank 1 is row 7)
// Pawns (Midgame)
const PAWN_TABLE = [
  0,   0,   0,   0,   0,   0,   0,   0,
  50,  50,  50,  50,  50,  50,  50,  50,
  10,  10,  20,  30,  30,  20,  10,  10,
  5,   5,  10,  27,  27,  10,   5,   5,
  0,   0,   0,  22,  22,   0,   0,   0,
  5,  -5, -10,   0,   0, -10,  -5,   5,
  5,  10,  10, -25, -25,  10,  10,   5,
  0,   0,   0,   0,   0,   0,   0,   0
];

// Knights
const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20,   0,   0,   0,   0, -20, -40,
  -30,   0,  10,  15,  15,  10,   0, -30,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -30,   0,  15,  20,  20,  15,   0, -30,
  -30,   5,  10,  15,  15,  10,   5, -30,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50
];

// Bishops
const BISHOP_TABLE = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,  10,  10,   5,   0, -10,
  -10,   5,   5,  10,  10,   5,   5, -10,
  -10,   0,  10,  10,  10,  10,   0, -10,
  -10,  10,  10,  10,  10,  10,  10, -10,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20
];

// Rooks
const ROOK_TABLE = [
  0,   0,   0,   0,   0,   0,   0,   0,
  5,  10,  10,  10,  10,  10,  10,   5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  0,   0,   0,   5,   5,   0,   0,   0
];

// Queens
const QUEEN_TABLE = [
  -20, -10, -10,  -5,  -5, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,   5,   5,   5,   0, -10,
  -5,   0,   5,   5,   5,   5,   0,  -5,
  0,   0,   5,   5,   5,   5,   0,  -5,
  -10,   5,   5,   5,   5,   5,   0, -10,
  -10,   0,   5,   0,   0,   0,   0, -10,
  -20, -10, -10,  -5,  -5, -10, -10, -20
];

// King (Middlegame)
const KING_TABLE_MID = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -20, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20,  20,   0,   0,   0,   0,  20,  20,
  20,  30,  10,   0,   0,  10,  30,  20
];

// King (Endgame)
const KING_TABLE_END = [
  -50, -40, -30, -20, -20, -30, -40, -50,
  -30, -20, -10,   0,   0, -10, -20, -30,
  -30, -10,  20,  30,  30,  20, -10, -30,
  -30, -10,  30,  40,  40,  30, -10, -30,
  -30, -10,  30,  40,  40,  30, -10, -30,
  -30, -10,  20,  30,  30,  20, -10, -30,
  -30, -30,   0,   0,   0,   0, -30, -30,
  -50, -30, -30, -30, -30, -30, -30, -50
];

const PST_MAP: Record<PieceSymbol, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_TABLE_MID
};

/**
 * Returns square index 0..63 from row and col
 */
function getSquareIndex(r: number, c: number, color: Color): number {
  if (color === 'w') {
    return r * 8 + c;
  } else {
    // Mirror vertically for Black
    return (7 - r) * 8 + c;
  }
}

/**
 * Evaluates the board position statically from White's perspective (+ = White advantage, - = Black advantage)
 * Return value is in Centipawns (100 = 1 pawn)
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -20000 : 20000;
  }

  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  const board = chess.board();
  let materialScore = 0;
  let positionalScore = 0;
  let whiteBishops = 0;
  let blackBishops = 0;
  let whiteQueen = false;
  let blackQueen = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseValue = PIECE_VALUES[piece.type];
      const sqIdx = getSquareIndex(r, c, piece.color);
      let psqt = PST_MAP[piece.type][sqIdx];

      if (piece.type === 'b') {
        if (piece.color === 'w') whiteBishops++;
        else blackBishops++;
      }
      if (piece.type === 'q') {
        if (piece.color === 'w') whiteQueen = true;
        else blackQueen = true;
      }

      if (piece.color === 'w') {
        materialScore += baseValue;
        positionalScore += psqt;
      } else {
        materialScore -= baseValue;
        positionalScore -= psqt;
      }
    }
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) positionalScore += 50;
  if (blackBishops >= 2) positionalScore -= 50;

  // Endgame king transition: if no queens or minor material, switch king to active table
  if (!whiteQueen && !blackQueen) {
    // Adjust king scores
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k') {
          const sqIdx = getSquareIndex(r, c, piece.color);
          const diff = KING_TABLE_END[sqIdx] - KING_TABLE_MID[sqIdx];
          if (piece.color === 'w') positionalScore += diff;
          else positionalScore -= diff;
        }
      }
    }
  }

  // Slight mobility factor
  const currentTurnMoves = chess.moves().length;
  const mobility = chess.turn() === 'w' ? currentTurnMoves * 4 : -currentTurnMoves * 4;

  return materialScore + positionalScore + mobility;
}

/**
 * Returns formatted evaluation in pawns e.g. "+1.4" or "-0.8" or "M3"
 */
export function formatEvaluation(centipawns: number): string {
  if (Math.abs(centipawns) >= 15000) {
    const mateIn = Math.ceil((20000 - Math.abs(centipawns)) / 2);
    return centipawns > 0 ? `+M${Math.max(1, mateIn)}` : `-M${Math.max(1, mateIn)}`;
  }
  const pawns = centipawns / 100;
  const sign = pawns > 0 ? '+' : '';
  return `${sign}${pawns.toFixed(1)}`;
}

/**
 * Calculates win percentage / bar position 0..100% from White's perspective
 */
export function getEvalPercentage(centipawns: number): number {
  if (centipawns >= 15000) return 100;
  if (centipawns <= -15000) return 0;
  // Standard sigmoid / logistic curve used by Lichess & chess engines
  // Win chance % = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  const score = 1 / (1 + Math.exp(-0.004 * centipawns));
  return Math.min(97, Math.max(3, score * 100));
}
