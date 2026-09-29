import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { evaluateBoard, formatEvaluation } from '../src/chess/evaluation';
import { getBestMove, getHint, analyzeGame, generateCoachReport } from '../src/chess/ai';

describe('AI Engine, Evaluation & Tactical Analysis', () => {
  it('correctly evaluates initial position as neutral', () => {
    const chess = new Chess();
    const evalScore = evaluateBoard(chess);
    // Initial position should be close to 0 centipawns
    expect(Math.abs(evalScore)).toBeLessThan(100);
  });

  it('correctly formats evaluation numbers', () => {
    expect(formatEvaluation(150)).toBe('+1.5');
    expect(formatEvaluation(-240)).toBe('-2.4');
    expect(formatEvaluation(20000)).toContain('M');
  });

  it('finds decisive mate or winning move with minimax engine', () => {
    // Mate in 1 position for White: Qxf7#
    const fen = 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5';
    const result = getBestMove(fen, 'expert');
    expect(result.bestMove).toBeTruthy();
    expect(result.bestMove?.san).toBe('Qxf7#');
  });

  it('generates helpful tactical hints', () => {
    const fen = 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5';
    const hint = getHint(fen);
    expect(hint).toBeTruthy();
    expect(hint?.san).toBe('Qxf7#');
    expect(hint?.explanation).toBeDefined();
  });

  it('analyzes a completed game and categorizes moves', () => {
    const pgn = '1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0';
    const analysis = analyzeGame(pgn);
    expect(analysis.length).toBe(7);
    expect(analysis[0].san).toBe('e4');
    expect(analysis[6].san).toBe('Qxf7#');

    const coach = generateCoachReport(analysis, 'w');
    expect(coach.openingScore).toBeGreaterThan(0);
    expect(coach.recommendations.length).toBeGreaterThan(0);
  });
});
