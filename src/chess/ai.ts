import { Chess, Move } from 'chess.js';
import { evaluateBoard, PIECE_VALUES } from './evaluation';
import { AIDifficulty, MoveAnalysis, MoveClassification, CoachReport, HintResult } from '../types/chess';

interface SearchResult {
  bestMove: Move | null;
  evaluation: number;
}

// Order moves: checks & captures first (MVV-LVA), then quiet moves
function orderMoves(moves: Move[]): Move[] {
  return moves.slice().sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Checkmate or check priority
    if (a.san.includes('#')) return -1;
    if (b.san.includes('#')) return 1;
    if (a.san.includes('+')) scoreA += 500;
    if (b.san.includes('+')) scoreB += 500;

    // Captures
    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] * 10) - PIECE_VALUES[a.piece];
    }
    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] * 10) - PIECE_VALUES[b.piece];
    }

    // Promotions
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;

    return scoreB - scoreA;
  });
}

/**
 * Quiescence search to avoid the horizon effect on tactical trades
 */
function quiescence(chess: Chess, alpha: number, beta: number, maxDepth: number = 2): number {
  const standPat = evaluateBoard(chess);
  const isWhite = chess.turn() === 'w';

  if (isWhite) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  if (maxDepth <= 0 || chess.isGameOver()) return standPat;

  // Only examine captures and checks
  const captureMoves = chess.moves({ verbose: true }).filter(m => m.captured || m.promotion || m.san.includes('+'));
  if (captureMoves.length === 0) return standPat;

  const sortedCaptures = orderMoves(captureMoves);

  if (isWhite) {
    let maxEval = standPat;
    for (const move of sortedCaptures) {
      chess.move(move);
      const evalScore = quiescence(chess, alpha, beta, maxDepth - 1);
      chess.undo();

      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = standPat;
    for (const move of sortedCaptures) {
      chess.move(move);
      const evalScore = quiescence(chess, alpha, beta, maxDepth - 1);
      chess.undo();

      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  useQuiescence: boolean = true
): number {
  if (depth === 0) {
    return useQuiescence ? quiescence(chess, alpha, beta, 1) : evaluateBoard(chess);
  }

  if (chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = orderMoves(chess.moves({ verbose: true }));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false, useQuiescence);
      chess.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Prune
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true, useQuiescence);
      chess.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Prune
    }
    return minEval;
  }
}

/**
 * Finds best move given FEN and difficulty
 */
export function getBestMove(fen: string, difficulty: AIDifficulty): SearchResult {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return { bestMove: null, evaluation: evaluateBoard(chess) };
  }

  const isWhite = chess.turn() === 'w';

  // Check for immediate mate in 1
  for (const move of moves) {
    chess.move(move);
    const isMate = chess.isCheckmate();
    chess.undo();
    if (isMate) {
      return { bestMove: move, evaluation: isWhite ? 20000 : -20000 };
    }
  }

  // Configure depth and randomness by difficulty
  let depth = 2;
  let blunderProbability = 0;
  let useQuiescence = true;

  switch (difficulty) {
    case 'beginner':
      depth = 1;
      blunderProbability = 0.40;
      useQuiescence = false;
      break;
    case 'easy':
      depth = 2;
      blunderProbability = 0.20;
      useQuiescence = false;
      break;
    case 'medium':
      depth = 2;
      blunderProbability = 0.05;
      useQuiescence = true;
      break;
    case 'hard':
      depth = 3;
      blunderProbability = 0;
      useQuiescence = true;
      break;
    case 'expert':
      depth = 3;
      blunderProbability = 0;
      useQuiescence = true;
      break;
  }

  // Check for intentional blunder on casual beginner mode
  if (Math.random() < blunderProbability && moves.length > 1) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    chess.move(randomMove);
    const evalScore = evaluateBoard(chess);
    chess.undo();
    return { bestMove: randomMove, evaluation: evalScore };
  }

  const ordered = orderMoves(moves);
  let bestMove: Move = ordered[0];
  let bestValue = isWhite ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of ordered) {
    chess.move(move);
    const value = minimax(chess, depth - 1, alpha, beta, !isWhite, useQuiescence);
    chess.undo();

    if (isWhite) {
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
      alpha = Math.max(alpha, value);
    } else {
      if (value < bestValue) {
        bestValue = value;
        bestMove = move;
      }
      beta = Math.min(beta, value);
    }
  }

  return { bestMove, evaluation: bestValue };
}

/**
 * Generate a helpful hint for the human player
 */
export function getHint(fen: string): HintResult | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const { bestMove, evaluation } = getBestMove(fen, 'expert');
  if (!bestMove) return null;

  // Generate tactical / positional rationale
  let explanation = 'Improve your position and maintain tactical harmony.';
  if (bestMove.san.includes('#')) {
    explanation = 'Deliver checkmate and win the game!';
  } else if (bestMove.captured) {
    const capturedName = getPieceName(bestMove.captured);
    const attackerName = getPieceName(bestMove.piece);
    explanation = `Win material by capturing the opponent's ${capturedName} with your ${attackerName}.`;
  } else if (bestMove.san.includes('+')) {
    explanation = 'Deliver check, putting immediate tactical pressure on the enemy King.';
  } else if (bestMove.san === 'O-O' || bestMove.san === 'O-O-O') {
    explanation = 'Castle to tuck your king safely into safety and activate your rook.';
  } else if (bestMove.piece === 'p' && (bestMove.to === 'd4' || bestMove.to === 'e4' || bestMove.to === 'd5' || bestMove.to === 'e5')) {
    explanation = 'Stake a claim in the vital central squares with your pawn.';
  } else if (bestMove.piece === 'n' || bestMove.piece === 'b') {
    explanation = `Develop your ${getPieceName(bestMove.piece)} toward active squares to support your plan.`;
  } else if (bestMove.piece === 'r') {
    explanation = 'Position your rook onto an open or semi-open file for maximum activity.';
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    san: bestMove.san,
    evaluation,
    explanation
  };
}

function getPieceName(symbol: string): string {
  switch (symbol.toLowerCase()) {
    case 'p': return 'Pawn';
    case 'n': return 'Knight';
    case 'b': return 'Bishop';
    case 'r': return 'Rook';
    case 'q': return 'Queen';
    case 'k': return 'King';
    default: return 'Piece';
  }
}

/**
 * Analyzes a completed game move-by-move
 */
export function analyzeGame(pgn: string): MoveAnalysis[] {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return [];
  }

  const history = chess.history({ verbose: true });
  const analysis: MoveAnalysis[] = [];

  const tempGame = new Chess();
  let prevEval = evaluateBoard(tempGame);

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const fenBefore = tempGame.fen();
    const isWhiteTurn = tempGame.turn() === 'w';

    // Fast best move calculation for analysis
    const { bestMove } = getBestMove(fenBefore, 'easy');

    tempGame.move(move);
    const fenAfter = tempGame.fen();
    const currentEval = evaluateBoard(tempGame);

    const evalBeforePawns = prevEval / 100;
    const evalAfterPawns = currentEval / 100;
    const evalDelta = isWhiteTurn ? (evalBeforePawns - evalAfterPawns) : (evalAfterPawns - evalBeforePawns);

    // Classify move
    let classification: MoveClassification = 'good';
    let explanation = 'Solid, principled continuation.';

    if (bestMove && bestMove.san === move.san) {
      classification = 'best';
      explanation = 'The engine agrees: this is the most accurate move in the position.';
    } else if (evalDelta <= 0.2) {
      classification = 'good';
      explanation = 'A very playable move preserving the balance.';
    } else if (evalDelta <= 0.7) {
      classification = 'inaccuracy';
      explanation = `Slight inaccuracy (${evalDelta > 0 ? '-' : ''}${evalDelta.toFixed(1)} pawns). Allows counterplay.`;
    } else if (evalDelta <= 1.8) {
      classification = 'mistake';
      explanation = `Significant mistake losing ${evalDelta.toFixed(1)} pawns. Concedes tactical initiative.`;
    } else {
      classification = 'blunder';
      explanation = `Tactical blunder costing ${evalDelta.toFixed(1)} pawns. Significantly harms your position.`;
    }

    if (i < 4 && classification === 'good') {
      classification = 'book';
      explanation = 'Standard opening book move.';
    }

    analysis.push({
      san: move.san,
      from: move.from,
      to: move.to,
      color: move.color,
      fenBefore,
      fenAfter,
      evalBefore: prevEval,
      evalAfter: currentEval,
      delta: evalDelta,
      classification,
      bestMove: bestMove ? `${bestMove.from}${bestMove.to}` : undefined,
      bestMoveSan: bestMove ? bestMove.san : undefined,
      explanation
    });

    prevEval = currentEval;
  }

  return analysis;
}

/**
 * Generates comprehensive AI Chess Coach report based on game analysis
 */
export function generateCoachReport(analyses: MoveAnalysis[], playerColor: 'w' | 'b'): CoachReport {
  const playerMoves = analyses.filter(a => a.color === playerColor);
  if (playerMoves.length === 0) {
    return {
      openingScore: 80,
      tacticsScore: 80,
      endgameScore: 80,
      openingInsight: 'Not enough moves recorded to evaluate.',
      middlegameInsight: 'Play a full game to receive comprehensive coaching notes.',
      endgameInsight: 'No endgame positions reached.',
      kingSafety: 'King safety was not tested.',
      pieceActivity: 'Solid piece coordination.',
      tacticalMistakes: [],
      recommendations: ['Play more games to build your statistical profile.']
    };
  }

  let blunders = 0;
  let mistakes = 0;
  let inaccuracies = 0;
  let bestCount = 0;
  const tacticalMistakes: string[] = [];

  playerMoves.forEach((m, idx) => {
    if (m.classification === 'blunder') {
      blunders++;
      tacticalMistakes.push(`Move ${Math.floor(idx * 2) + 1} (${m.san}): ${m.explanation}`);
    } else if (m.classification === 'mistake') {
      mistakes++;
      tacticalMistakes.push(`Move ${Math.floor(idx * 2) + 1} (${m.san}): ${m.explanation}`);
    } else if (m.classification === 'inaccuracy') {
      inaccuracies++;
    } else if (m.classification === 'best') {
      bestCount++;
    }
  });

  const total = playerMoves.length;
  const tacticsScore = Math.max(20, Math.round(100 - (blunders * 25 + mistakes * 12 + inaccuracies * 5) / (total / 10)));
  const openingMoves = playerMoves.slice(0, 7);
  const openingErrors = openingMoves.filter(m => m.classification === 'mistake' || m.classification === 'blunder').length;
  const openingScore = Math.max(30, 100 - openingErrors * 30);
  const endgameScore = Math.min(95, Math.max(40, 85 - (blunders * 10)));

  let openingInsight = 'You handled the initial setup smoothly, following sound opening principles.';
  if (openingErrors > 0) {
    openingInsight = 'You drifted early into sub-optimal piece placements. Aim to control the center with pawns and castle within the first 8-10 moves.';
  }

  let middlegameInsight = 'Good tactical alertness. You maintained steady pressure on key squares.';
  if (blunders > 0) {
    middlegameInsight = `You allowed ${blunders} major tactical oversight${blunders > 1 ? 's' : ''} in the middlegame. Always check all opponent checks, captures, and threats before deciding on a move.`;
  } else if (mistakes > 0) {
    middlegameInsight = 'You showed patience in maneuvering, but surrendered slight advantages when dynamic play was called for.';
  }

  const endgameInsight = total > 25
    ? 'In the late phase, active pieces and passed pawns are decisive. Keep your king active in king and pawn endings.'
    : 'The game concluded prior to a dedicated endgame transition.';

  const kingSafety = blunders > 0
    ? 'Your king defense was breached due to open files or premature pawn pushes around your castle.'
    : 'Your king remained securely guarded throughout the contest.';

  const pieceActivity = bestCount > total * 0.4
    ? 'Exceptional piece activity and square harmony throughout the game.'
    : 'Your minor pieces generally found useful roles, though look for ways to open files for rooks sooner.';

  const recommendations: string[] = [];
  if (blunders > 0) {
    recommendations.push('Practice daily tactic puzzles to spot hanging pieces and basic pin combinations.');
  }
  if (openingErrors > 0) {
    recommendations.push('Review the opening book variations to avoid early positional concession.');
  }
  recommendations.push('Take an extra 3 seconds before each move to calculate candidate moves.');
  if (recommendations.length < 3) {
    recommendations.push('Focus on king safety and early castling.');
  }

  return {
    openingScore,
    tacticsScore,
    endgameScore,
    openingInsight,
    middlegameInsight,
    endgameInsight,
    kingSafety,
    pieceActivity,
    tacticalMistakes: tacticalMistakes.slice(0, 4),
    recommendations
  };
}
