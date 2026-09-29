import { AIDifficulty, MoveAnalysis, HintResult } from '../types/chess';
import { getBestMove, getHint, analyzeGame } from './ai';

export interface BestMoveResult {
  from: string;
  to: string;
  san: string;
  promotion?: string;
  evaluation: number;
}

class ChessEngineService {
  private worker: Worker | null = null;
  private workerFailed: boolean = false;
  private currentRequestId: number = 0;
  private activeSearchId: number = 0;
  private pendingCallbacks: Map<number, (data: any) => void> = new Map();
  private statusListeners: Array<(isThinking: boolean) => void> = [];

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined') return;

    try {
      this.worker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (e: MessageEvent) => {
        const { id, error } = e.data;
        const callback = this.pendingCallbacks.get(id);
        if (callback) {
          this.pendingCallbacks.delete(id);
          if (error) {
            console.warn('[Engine Worker Error]', error);
          }
          callback(e.data);
        }
      };

      this.worker.onerror = (err) => {
        console.warn('[Engine Worker] Web Worker error, falling back to non-blocking timeout engine:', err);
        this.workerFailed = true;
        this.notifyStatus(false);
      };
    } catch (e) {
      console.warn('[Engine Worker] Web Worker initialization failed, fallback active:', e);
      this.workerFailed = true;
    }
  }

  public subscribeStatus(listener: (isThinking: boolean) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notifyStatus(isThinking: boolean) {
    this.statusListeners.forEach(listener => listener(isThinking));
  }

  /**
   * Cancel or invalidate any in-flight AI calculations (e.g. on new game, restart, undo)
   */
  public cancelActiveSearch() {
    this.activeSearchId = ++this.currentRequestId;
    this.pendingCallbacks.clear();
    this.notifyStatus(false);
  }

  /**
   * Request best move from engine without blocking the React UI thread
   */
  public async getBestMove(fen: string, difficulty: AIDifficulty): Promise<BestMoveResult | null> {
    const requestId = ++this.currentRequestId;
    this.activeSearchId = requestId;
    this.notifyStatus(true);

    const startTime = performance.now();

    // Target minimum pacing so AI feels natural without lagging
    const targetDelayMs: Record<AIDifficulty, number> = {
      beginner: 250,
      easy: 380,
      medium: 800,
      hard: 1700,
      expert: 2500
    };
    const targetDelay = targetDelayMs[difficulty];

    return new Promise((resolve) => {
      let resolved = false;

      const finish = (result: any) => {
        if (resolved) return;
        // Verify this request is still the active search (not cancelled or superseded)
        if (this.activeSearchId !== requestId) {
          resolve(null);
          return;
        }

        resolved = true;
        this.pendingCallbacks.delete(requestId);

        const elapsed = performance.now() - startTime;
        const remainingDelay = Math.max(0, targetDelay - elapsed);

        setTimeout(() => {
          if (this.activeSearchId !== requestId) {
            resolve(null);
            return;
          }
          this.notifyStatus(false);
          if (!result || !result.bestMove) {
            resolve(null);
          } else {
            resolve({
              from: result.bestMove.from,
              to: result.bestMove.to,
              san: result.bestMove.san,
              promotion: result.bestMove.promotion,
              evaluation: result.evaluation
            });
          }
        }, remainingDelay);
      };

      // Failsafe timer (4.5s max): if calculation hangs, return immediate fallback move
      const safetyTimeout = setTimeout(() => {
        if (!resolved && this.activeSearchId === requestId) {
          console.warn('[Engine] Failsafe timeout reached, using fallback move');
          try {
            const fallback = getBestMove(fen, difficulty);
            finish({
              bestMove: fallback.bestMove ? {
                from: fallback.bestMove.from,
                to: fallback.bestMove.to,
                san: fallback.bestMove.san,
                promotion: fallback.bestMove.promotion
              } : null,
              evaluation: fallback.evaluation
            });
          } catch {
            finish(null);
          }
        }
      }, 4500);

      const wrappedFinish = (result: any) => {
        clearTimeout(safetyTimeout);
        finish(result);
      };

      if (this.worker && !this.workerFailed) {
        this.pendingCallbacks.set(requestId, wrappedFinish);
        this.worker.postMessage({
          type: 'SEARCH',
          id: requestId,
          fen,
          difficulty
        });
      } else {
        // Fallback execution off main loop
        setTimeout(() => {
          if (this.activeSearchId !== requestId) return;
          try {
            const res = getBestMove(fen, difficulty);
            wrappedFinish({
              bestMove: res.bestMove ? {
                from: res.bestMove.from,
                to: res.bestMove.to,
                san: res.bestMove.san,
                promotion: res.bestMove.promotion
              } : null,
              evaluation: res.evaluation
            });
          } catch (e) {
            console.error('Fallback engine calculation error', e);
            wrappedFinish(null);
          }
        }, 10);
      }
    });
  }

  /**
   * Request tactical/positional hint
   */
  public async getHint(fen: string): Promise<HintResult | null> {
    const requestId = ++this.currentRequestId;
    this.notifyStatus(true);

    return new Promise((resolve) => {
      const finish = (result: any) => {
        this.notifyStatus(false);
        resolve(result ? result.hint : null);
      };

      if (this.worker && !this.workerFailed) {
        this.pendingCallbacks.set(requestId, finish);
        this.worker.postMessage({
          type: 'HINT',
          id: requestId,
          fen
        });
      } else {
        setTimeout(() => {
          const hint = getHint(fen);
          finish({ hint });
        }, 10);
      }
    });
  }

  /**
   * Run full game move analysis
   */
  public async analyzeGame(pgn: string): Promise<MoveAnalysis[]> {
    const requestId = ++this.currentRequestId;
    this.notifyStatus(true);

    return new Promise((resolve) => {
      const finish = (result: any) => {
        this.notifyStatus(false);
        resolve(result?.analyses || []);
      };

      if (this.worker && !this.workerFailed) {
        this.pendingCallbacks.set(requestId, finish);
        this.worker.postMessage({
          type: 'ANALYZE',
          id: requestId,
          pgn
        });
      } else {
        setTimeout(() => {
          const analyses = analyzeGame(pgn);
          finish({ analyses });
        }, 10);
      }
    });
  }

  public terminate() {
    this.cancelActiveSearch();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Singleton instance initialized once
export const chessEngine = new ChessEngineService();
