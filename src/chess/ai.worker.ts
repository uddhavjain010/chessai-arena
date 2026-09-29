import { getBestMove, getHint, analyzeGame } from './ai';

// Web Worker message listener
self.onmessage = (e: MessageEvent) => {
  const { type, fen, difficulty, pgn, id } = e.data;

  try {
    if (type === 'SEARCH') {
      const result = getBestMove(fen, difficulty);
      self.postMessage({
        type: 'SEARCH_RESULT',
        id,
        bestMove: result.bestMove ? {
          from: result.bestMove.from,
          to: result.bestMove.to,
          san: result.bestMove.san,
          promotion: result.bestMove.promotion
        } : null,
        evaluation: result.evaluation
      });
    } else if (type === 'HINT') {
      const hint = getHint(fen);
      self.postMessage({
        type: 'HINT_RESULT',
        id,
        hint
      });
    } else if (type === 'ANALYZE') {
      const analyses = analyzeGame(pgn);
      self.postMessage({
        type: 'ANALYZE_RESULT',
        id,
        analyses
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({
      type: 'ERROR',
      id,
      error: message
    });
  }
};
