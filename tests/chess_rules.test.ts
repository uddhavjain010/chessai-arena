import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';

describe('Complete Chess Rules Verification', () => {
  it('correctly handles pawn movement, double push, and captures', () => {
    const chess = new Chess();
    // Pawn single move
    const m1 = chess.move('e3');
    expect(m1).toBeTruthy();
    expect(m1.san).toBe('e3');

    // Black pawn double move
    const m2 = chess.move('d5');
    expect(m2).toBeTruthy();
    expect(m2.san).toBe('d5');

    // White pawn capture
    chess.move('e4');
    const capture = chess.move('dxe4');
    expect(capture).toBeTruthy();
    expect(capture.captured).toBe('p');
  });

  it('correctly validates knight, bishop, rook, and queen movement', () => {
    const chess = new Chess();
    // Knight
    const nf3 = chess.move('Nf3');
    expect(nf3).toBeTruthy();
    expect(nf3.piece).toBe('n');

    chess.move('e5');
    // Open path for bishop with e4
    chess.move('e4');
    chess.move('d6');

    // Bishop
    const bc4 = chess.move('Bc4');
    expect(bc4).toBeTruthy();
    expect(bc4.piece).toBe('b');

    chess.move('Be7');
    // King move
    const ke2 = chess.move('Ke2');
    expect(ke2).toBeTruthy();
    expect(ke2.piece).toBe('k');

    chess.move('Nf6');
    // Queen move
    chess.move('Qe1');
    expect(chess.get('e1')?.type).toBe('q');
  });

  it('correctly executes kingside and queenside castling', () => {
    // Kingside castling
    const chess = new Chess('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4');
    const castleShort = chess.move('O-O');
    expect(castleShort).toBeTruthy();
    expect(chess.get('g1')?.type).toBe('k');
    expect(chess.get('f1')?.type).toBe('r');

    // Queenside castling for Black
    const chessQ = new Chess('r3kbnr/pppqpppp/2np4/1b6/4P3/2NP1N2/PPP1BPPP/R1BQK2R b KQkq - 2 5');
    const castleLong = chessQ.move('O-O-O');
    expect(castleLong).toBeTruthy();
    expect(chessQ.get('c8')?.type).toBe('k');
    expect(chessQ.get('d8')?.type).toBe('r');
  });

  it('correctly handles En Passant capture', () => {
    const chess = new Chess('rnbqkbnr/ppppp1pp/8/4Pp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3');
    const ep = chess.move('exf6');
    expect(ep).toBeTruthy();
    expect(ep.flags).toContain('e'); // En passant flag
    expect(chess.get('f5')).toBeFalsy(); // Captured black pawn removed
    expect(chess.get('f6')?.type).toBe('p');
  });

  it('correctly handles pawn promotion', () => {
    const chess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    const promotion = chess.move({ from: 'e7', to: 'e8', promotion: 'q' });
    expect(promotion).toBeTruthy();
    expect(chess.get('e8')?.type).toBe('q');
    expect(chess.get('e8')?.color).toBe('w');
  });

  it('correctly detects check and checkmate', () => {
    // Fool's Mate
    const chess = new Chess();
    chess.move('f3');
    chess.move('e5');
    chess.move('g4');
    const mateMove = chess.move('Qh4#');
    expect(mateMove).toBeTruthy();
    expect(chess.inCheck()).toBe(true);
    expect(chess.isCheckmate()).toBe(true);
    expect(chess.isGameOver()).toBe(true);
  });

  it('correctly detects stalemate', () => {
    const chess = new Chess('k7/8/1Q6/8/8/8/8/4K3 b - - 0 1');
    expect(chess.inCheck()).toBe(false);
    expect(chess.isStalemate()).toBe(true);
    expect(chess.isGameOver()).toBe(true);
  });

  it('correctly detects insufficient material draw', () => {
    const chess = new Chess('8/8/8/8/8/5k2/8/4K2B w - - 0 1');
    expect(chess.isInsufficientMaterial()).toBe(true);
  });

  it('rejects illegal moves', () => {
    const chess = new Chess();
    expect(() => chess.move('Ra3')).toThrow();
    expect(() => chess.move('Ke4')).toThrow();
    expect(() => chess.move('e7e5')).toThrow();
  });
});
