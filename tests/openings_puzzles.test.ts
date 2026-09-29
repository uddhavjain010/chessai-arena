import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { detectOpening } from '../src/chess/openings';
import { CHESS_PUZZLES } from '../src/chess/puzzles';

describe('Openings Detection and Curated Puzzles', () => {
  it('accurately detects Italian Game', () => {
    const opening = detectOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']);
    expect(opening.name).toBe('Italian Game');
    expect(opening.eco).toBe('C50');
  });

  it('accurately detects Sicilian Defense', () => {
    const opening = detectOpening(['e4', 'c5']);
    expect(opening.name).toBe('Sicilian Defense');
    expect(opening.eco).toBe('B20');
  });

  it('accurately detects French Defense', () => {
    const opening = detectOpening(['e4', 'e6']);
    expect(opening.name).toBe('French Defense');
    expect(opening.eco).toBe('C00');
  });

  it('accurately detects Queen’s Gambit', () => {
    const opening = detectOpening(['d4', 'd5', 'c4']);
    expect(opening.name).toBe("Queen's Gambit");
    expect(opening.eco).toBe('D06');
  });

  it('returns "Opening not identified" for unknown sequences', () => {
    const opening = detectOpening(['h4', 'h5', 'a4', 'a5']);
    expect(opening.name).toBe('Opening not identified');
  });

  it('verifies all curated puzzles have legal FENs and valid solutions', () => {
    CHESS_PUZZLES.forEach((puzzle) => {
      const chess = new Chess();
      // Valid FEN loader
      expect(() => chess.load(puzzle.fen)).not.toThrow();
      expect(chess.turn()).toBe(puzzle.playerColor);

      // Validate solution move
      const firstMoveSan = puzzle.solution[0];
      const move = chess.move(firstMoveSan);
      expect(move, `Puzzle ${puzzle.id} solution move ${firstMoveSan} must be legal`).toBeTruthy();
    });
  });
});
