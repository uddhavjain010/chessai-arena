import React from 'react';
import { Color } from 'chess.js';
import { Clock } from 'lucide-react';

interface ChessClockProps {
  color: Color;
  timeRemainingSeconds: number; // in seconds
  isActive: boolean;
  playerName: string;
  hasClock: boolean;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  color,
  timeRemainingSeconds,
  isActive,
  playerName,
  hasClock
}) => {
  if (!hasClock) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
        <span className="font-medium">{playerName}</span>
        <span className="text-xs text-slate-500">(No Clock)</span>
      </div>
    );
  }

  const minutes = Math.floor(Math.max(0, timeRemainingSeconds) / 60);
  const seconds = Math.floor(Math.max(0, timeRemainingSeconds) % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = timeRemainingSeconds <= 30 && timeRemainingSeconds > 0;
  const isTimeOut = timeRemainingSeconds <= 0;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2 rounded-xl transition-all duration-200 border ${
        isTimeOut
          ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
          : isActive
          ? isLowTime
            ? 'bg-rose-900/60 border-rose-400 text-rose-100 ring-2 ring-rose-500/50'
            : 'bg-cyan-950/60 border-cyan-400/80 text-cyan-50 shadow-md shadow-cyan-900/20 ring-1 ring-cyan-500/40'
          : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-80'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${
            color === 'w' ? 'bg-slate-100 border border-slate-400' : 'bg-slate-900 border border-slate-600'
          }`}
        />
        <span className="text-sm font-semibold truncate text-white max-w-[120px]">
          {playerName}
        </span>
      </div>

      <div className="flex items-center gap-1.5 font-mono text-base md:text-lg font-bold tracking-wider">
        <Clock className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
        <span className={isLowTime ? 'text-rose-400 font-extrabold' : ''}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
