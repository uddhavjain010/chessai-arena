import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Home, Sparkles } from 'lucide-react';
import { Color } from 'chess.js';

interface GameOverModalProps {
  isOpen: boolean;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  reason: string; // 'checkmate' | 'timeout' | 'resignation' | 'stalemate' | 'draw'
  playerColor: Color;
  moveCount: number;
  durationSeconds: number;
  openingName: string;
  eco: string;
  onAnalyzeGame: () => void;
  onNewGame: () => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  result,
  reason,
  playerColor,
  moveCount,
  durationSeconds,
  openingName,
  eco,
  onAnalyzeGame,
  onNewGame,
  onReturnHome
}) => {
  if (!isOpen) return null;

  const isPlayerWin = (playerColor === 'w' && result === '1-0') || (playerColor === 'b' && result === '0-1');
  const isDraw = result === '1/2-1/2';

  // Confetti on win
  useEffect(() => {
    if (isPlayerWin) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isPlayerWin]);

  const getTitle = () => {
    switch (reason) {
      case 'checkmate': return 'CHECKMATE';
      case 'timeout': return 'TIME OUT';
      case 'resignation': return 'RESIGNED';
      case 'stalemate': return 'STALEMATE';
      case 'threefold': return 'DRAW BY REPETITION';
      case 'insufficient': return 'DRAW (INSUFFICIENT MATERIAL)';
      case 'agreement': return 'DRAW BY AGREEMENT';
      default: return isDraw ? 'DRAW' : 'GAME OVER';
    }
  };

  const getWinnerDescription = () => {
    if (result === '1-0') {
      return { winner: 'White', loser: 'Black', text: 'White is Victorious' };
    }
    if (result === '0-1') {
      return { winner: 'Black', loser: 'White', text: 'Black is Victorious' };
    }
    return { winner: 'None', loser: 'None', text: 'Game drawn by chess rules' };
  };

  const { winner, text } = getWinnerDescription();

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const formattedDuration = `${minutes}m ${seconds}s`;

  return (
    <div className="modal-overlay">
      <div className="glass-panel max-w-md w-full p-6 text-center border border-cyan-500/40 shadow-2xl relative animate-in fade-in zoom-in-95 bg-slate-900/90">
        {/* Glow header icon */}
        <div className="flex justify-center mb-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg ${
            isPlayerWin
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-400'
              : isDraw
              ? 'bg-slate-700/30 border-slate-600 text-slate-300'
              : 'bg-rose-500/20 border-rose-400/50 text-rose-400'
          }`}>
            {isPlayerWin ? <Trophy className="w-8 h-8" /> : <Award className="w-8 h-8" />}
          </div>
        </div>

        <h2 className="text-2xl font-extrabold tracking-wide text-white uppercase mb-1">
          {getTitle()}
        </h2>

        <p className="text-cyan-400 font-semibold mb-4 text-sm">
          {text} {result !== '*' && `(${result})`}
        </p>

        {/* Game summary statistics card */}
        <div className="bg-slate-800/60 rounded-xl p-3 mb-6 border border-slate-700/60 text-xs space-y-2 text-left">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Winner:</span>
            <span className="font-bold text-white">{winner}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Total Moves:</span>
            <span className="font-semibold text-white">{moveCount}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Game Duration:</span>
            <span className="font-semibold text-white">{formattedDuration}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 border-t border-slate-700/50 pt-2">
            <span className="text-slate-400">Opening:</span>
            <span className="font-semibold text-cyan-300 truncate max-w-[200px]" title={openingName}>
              {eco !== '---' ? `[${eco}] ` : ''}{openingName}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onAnalyzeGame}
            className="btn-primary w-full py-2.5 font-bold shadow-cyan-900/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Game</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onNewGame}
              className="btn-secondary py-2 text-xs font-semibold justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Game</span>
            </button>
            <button
              onClick={onReturnHome}
              className="btn-secondary py-2 text-xs font-semibold justify-center"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
