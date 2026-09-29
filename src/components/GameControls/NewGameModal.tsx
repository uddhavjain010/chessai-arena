import React, { useState } from 'react';
import { X, Bot, Users, Clock, Play } from 'lucide-react';
import { GameMode, AIDifficulty, PlayerColor, TimeControl } from '../../types/chess';

export const TIME_PRESETS: TimeControl[] = [
  { name: '1 min', initialMinutes: 1, incrementSeconds: 0 },
  { name: '2 | 1', initialMinutes: 2, incrementSeconds: 1 },
  { name: '3 min', initialMinutes: 3, incrementSeconds: 0 },
  { name: '3 | 2', initialMinutes: 3, incrementSeconds: 2 },
  { name: '5 min', initialMinutes: 5, incrementSeconds: 0 },
  { name: '5 | 3', initialMinutes: 5, incrementSeconds: 3 },
  { name: '10 min', initialMinutes: 10, incrementSeconds: 0 },
  { name: '10 | 5', initialMinutes: 10, incrementSeconds: 5 },
  { name: '15 | 10', initialMinutes: 15, incrementSeconds: 10 },
  { name: '30 min', initialMinutes: 30, incrementSeconds: 0 },
  { name: 'No Clock', initialMinutes: 0, incrementSeconds: 0 }
];

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    mode: GameMode;
    playerColor: PlayerColor;
    difficulty: AIDifficulty;
    timeControl: TimeControl;
  }) => void;
  initialMode?: GameMode;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  initialMode = 'ai'
}) => {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>(TIME_PRESETS[4]); // 5 min default

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame({
      mode,
      playerColor,
      difficulty,
      timeControl: selectedTimeControl
    });
    onClose();
  };

  const difficulties: Array<{ id: AIDifficulty; label: string; desc: string }> = [
    { id: 'beginner', label: 'Beginner', desc: 'Tactical oversights and casual play' },
    { id: 'easy', label: 'Easy', desc: 'Basic opening principles' },
    { id: 'medium', label: 'Medium', desc: 'Solid positional play and piece defense' },
    { id: 'hard', label: 'Hard', desc: 'Deep tactical vision and sharp attacks' },
    { id: 'expert', label: 'Expert', desc: 'Stockfish evaluation with quiescence search' }
  ];

  return (
    <div className="modal-overlay">
      <div className="glass-panel max-w-lg w-full p-6 border border-cyan-500/40 shadow-2xl relative animate-in fade-in zoom-in-95 bg-slate-900/95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
            Configure New Game
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Game Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  mode === 'ai'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400/30'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Play vs AI</div>
                  <div className="text-[11px] text-slate-400">Engine opponent</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('local')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  mode === 'local'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-400/30'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Local 2 Player</div>
                  <div className="text-[11px] text-slate-400">Pass and play</div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Settings (if AI mode) */}
          {mode === 'ai' && (
            <>
              {/* Play as */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Play As
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayerColor('w')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      playerColor === 'w'
                        ? 'border-cyan-400 bg-cyan-950/50 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-400" />
                    White
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlayerColor('random')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      playerColor === 'random'
                        ? 'border-cyan-400 bg-cyan-950/50 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-100 to-slate-900 border border-slate-500" />
                    Random
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlayerColor('b')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      playerColor === 'b'
                        ? 'border-cyan-400 bg-cyan-950/50 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600" />
                    Black
                  </button>
                </div>
              </div>

              {/* AI Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  AI Difficulty Level
                </label>
                <div className="space-y-1.5">
                  {difficulties.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        difficulty === d.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/70 text-slate-300'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wide text-cyan-300">{d.label}</span>
                        <p className="text-[11px] text-slate-400">{d.desc}</p>
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        difficulty === d.id ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                      }`}>
                        {difficulty === d.id && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Time Controls */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Time Control Clock
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_PRESETS.map((tc) => (
                <button
                  key={tc.name}
                  type="button"
                  onClick={() => setSelectedTimeControl(tc)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                    selectedTimeControl.name === tc.name
                      ? 'border-cyan-400 bg-cyan-950/50 text-white ring-1 ring-cyan-400/30'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-bold tracking-wide shadow-cyan-900/40"
            >
              Start Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
