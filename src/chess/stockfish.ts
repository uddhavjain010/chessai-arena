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
          this.notifyStatus(false);
          if (error) {
            console.warn('[Engine Worker Error]', error);
          }
          callback(e.data);
        }
      };

      this.worker.onerror = (err) => {
        console.warn('[Engine Worker] Web Worker error, falling back to synchronous execution:', err);
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
   * Request best move from engine
   */
  public async getBestMove(fen: string, difficulty: AIDifficulty): Promise<BestMoveResult | null> {
    this.notifyStatus(true);
    const requestId = ++this.currentRequestId;

    // Artificial thinking delay to feel natural like a human/engine opponent
    const thinkingDelayMs: Record<AIDifficulty, number> = {
      beginner: 350,
      easy: 500,
      medium: 700,
      hard: 1000,
      expert: 1300
    };
    const delay = thinkingDelayMs[difficulty];

    return new Promise((resolve) => {
      const finish = (result: any) => {
        setTimeout(() => {
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
        }, Math.max(100, delay));
      };

      if (this.worker && !this.workerFailed) {
        this.pendingCallbacks.set(requestId, finish);
        this.worker.postMessage({
          type: 'SEARCH',
          id: requestId,
          fen,
          difficulty
        });
      } else {
        // Fallback execution off next tick
        setTimeout(() => {
          try {
            const res = getBestMove(fen, difficulty);
            finish({
              bestMove: res.bestMove ? {
                from: res.bestMove.from,
                to: res.bestMove.to,
                san: res.bestMove.san,
                promotion: res.bestMove.promotion
              } : null,
              evaluation: res.evaluation
            });
          } catch (e) {
            console.error('Fallback engine failed', e);
            finish(null);
          }
        }, delay);
      }
    });
  }

  /**
   * Request tactical/positional hint
   */
  public async getHint(fen: string): Promise<HintResult | null> {
    this.notifyStatus(true);
    const requestId = ++this.currentRequestId;

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
        }, 300);
      }
    });
  }

  /**
   * Run full game move analysis
   */
  public async analyzeGame(pgn: string): Promise<MoveAnalysis[]> {
    this.notifyStatus(true);
    const requestId = ++this.currentRequestId;

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
        }, 100);
      }
    });
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingCallbacks.clear();
    this.notifyStatus(false);
  }
}

export const chessEngine = new ChessEngineService();
