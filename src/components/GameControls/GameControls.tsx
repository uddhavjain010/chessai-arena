import React from 'react';
import { RotateCcw, Flag, Undo2, ArrowUpDown, Lightbulb, Settings as SettingsIcon, Play, Handshake, Download } from 'lucide-react';
import { GameMode } from '../../types/chess';

interface GameControlsProps {
  mode: GameMode;
  isGameOver: boolean;
  canUndo: boolean;
  isAiThinking: boolean;
  onNewGame: () => void;
  onRestart: () => void;
  onResign: () => void;
  onDrawOffer: () => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  onGetHint: () => void;
  onOpenSettings: () => void;
  onExportPgn: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  mode,
  isGameOver,
  canUndo,
  isAiThinking,
  onNewGame,
  onRestart,
  onResign,
  onDrawOffer,
  onUndo,
  onFlipBoard,
  onGetHint,
  onOpenSettings,
  onExportPgn
}) => {
  return (
    <div className="glass-panel p-3 border border-slate-700/60 rounded-xl bg-slate-900/70 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* New Game */}
        <button
          onClick={onNewGame}
          className="btn-primary text-xs py-2 px-3.5"
          title="Start a new game configuration"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>New Game</span>
        </button>

        {/* Restart */}
        <button
          onClick={onRestart}
          className="btn-secondary text-xs py-2 px-3"
          title="Restart current position"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>

        {/* Undo (for Local & Casual AI) */}
        <button
          onClick={onUndo}
          disabled={!canUndo || isGameOver || isAiThinking}
          className="btn-secondary text-xs py-2 px-3"
          title="Undo last move"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        {/* Hint */}
        {mode === 'ai' && (
          <button
            onClick={onGetHint}
            disabled={isGameOver || isAiThinking}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            title="Ask engine for a tactical hint"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Hint</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Draw Offer (when active) */}
        {!isGameOver && (
          <button
            onClick={onDrawOffer}
            disabled={isAiThinking}
            className="btn-secondary text-xs py-2 px-2.5"
            title="Offer a draw"
          >
            <Handshake className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Draw</span>
          </button>
        )}

        {/* Resign */}
        {!isGameOver && (
          <button
            onClick={onResign}
            disabled={isAiThinking}
            className="btn-danger text-xs py-2 px-2.5"
            title="Resign game"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resign</span>
          </button>
        )}

        {/* Flip Board */}
        <button
          onClick={onFlipBoard}
          className="btn-secondary text-xs py-2 px-2.5"
          title="Flip board orientation"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>

        {/* Export PGN */}
        <button
          onClick={onExportPgn}
          className="btn-secondary text-xs py-2 px-2.5"
          title="Export game PGN"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="btn-secondary text-xs py-2 px-2.5"
          title="Chess Settings"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
