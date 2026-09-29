import React from 'react';
import { Color } from 'chess.js';
import { formatEvaluation, getEvalPercentage } from '../../chess/evaluation';

interface EvaluationBarProps {
  evaluation: number; // in centipawns
  orientation: Color;
  visible: boolean;
  isThinking?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = React.memo(({
  evaluation,
  orientation,
  visible,
  isThinking = false
}) => {
  if (!visible) return null;

  // Percentage of white area (0 to 100%)
  const whitePercent = getEvalPercentage(evaluation);
  const formattedScore = formatEvaluation(evaluation);

  // If orientation is Black, invert display so current player's color is at bottom
  const fillPercent = orientation === 'w' ? whitePercent : 100 - whitePercent;
  const isWhiteAdvantage = evaluation >= 0;

  return (
    <div
      className="flex flex-col items-center select-none flex-shrink-0"
      title="Position Evaluation (Stockfish heuristic). A higher score indicates a positional or material advantage, not a guaranteed outcome."
    >
      <div className="relative w-6 sm:w-7 h-[min(74vh,580px)] max-h-full rounded-lg overflow-hidden bg-slate-950 border border-slate-700/80 shadow-lg flex flex-col justify-end">
        {/* White side fill */}
        <div
          className="w-full bg-slate-100 transition-all duration-300 ease-out"
          style={{ height: `${fillPercent}%` }}
        />

        {/* Center line (even position 0.0) */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-500/50 -translate-y-1/2 pointer-events-none" />

        {/* Evaluation score indicator tag */}
        <div
          className={`absolute left-0 right-0 px-0.5 py-0.5 text-[10px] font-mono font-bold text-center pointer-events-none transition-all duration-200 ${
            isWhiteAdvantage
              ? (orientation === 'w' ? 'bottom-2 text-slate-900' : 'top-2 text-slate-100')
              : (orientation === 'w' ? 'top-2 text-slate-100' : 'bottom-2 text-slate-900')
          }`}
        >
          {formattedScore}
        </div>

        {/* Thinking pulse indicator */}
        {isThinking && (
          <div className="absolute inset-0 bg-cyan-400/20 animate-pulse pointer-events-none" />
        )}
      </div>
      <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
        Eval
      </span>
    </div>
  );
});

EvaluationBar.displayName = 'EvaluationBar';
