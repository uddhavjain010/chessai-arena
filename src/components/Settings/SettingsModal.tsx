import React from 'react';
import { X, Volume2, VolumeX, Eye, Compass, BarChart2, ShieldCheck, Sparkles } from 'lucide-react';
import { AppSettings, BoardTheme, PieceStyle } from '../../types/chess';
import { soundManager } from '../../chess/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const handleToggle = (key: keyof AppSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    if (key === 'soundEnabled') {
      soundManager.setEnabled(updated.soundEnabled);
    }
    onUpdateSettings(updated);
  };

  const handleThemeChange = (theme: BoardTheme) => {
    onUpdateSettings({ ...settings, boardTheme: theme });
  };

  const handlePieceStyleChange = (style: PieceStyle) => {
    onUpdateSettings({ ...settings, pieceStyle: style });
  };

  const themes: Array<{ id: BoardTheme; name: string; light: string; dark: string }> = [
    { id: 'slate', name: 'Midnight Slate', light: '#e2e8f0', dark: '#64748b' },
    { id: 'wood', name: 'Classic Wood', light: '#f0d9b5', dark: '#b58863' },
    { id: 'emerald', name: 'Tournament Emerald', light: '#eeeed2', dark: '#769656' },
    { id: 'cyber', name: 'Cyberpunk Neon', light: '#334155', dark: '#0f172a' },
    { id: 'ice', name: 'Arctic Ocean', light: '#e0f2fe', dark: '#0284c7' }
  ];

  const pieceStyles: Array<{ id: PieceStyle; name: string }> = [
    { id: 'neo', name: 'Neo Modern' },
    { id: 'classic', name: 'Classic Wood' },
    { id: 'minimal', name: 'Minimalist Vector' }
  ];

  return (
    <div className="modal-overlay">
      <div className="glass-panel max-w-md w-full p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in-95 bg-slate-900/95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Board & Game Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm">
          {/* Board Themes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Board Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    settings.boardTheme === t.id
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md ring-1 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded flex overflow-hidden border border-slate-600 flex-shrink-0">
                    <div className="w-3 h-6" style={{ backgroundColor: t.light }} />
                    <div className="w-3 h-6" style={{ backgroundColor: t.dark }} />
                  </div>
                  <span className="text-xs font-medium truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piece Styles */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Piece Visual Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {pieceStyles.map((ps) => (
                <button
                  key={ps.id}
                  onClick={() => handlePieceStyleChange(ps.id)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                    settings.pieceStyle === ps.id
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {ps.name}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span className="text-slate-200 font-medium">Sound Effects</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={() => handleToggle('soundEnabled')}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
            </div>

            {/* Coordinates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200 font-medium">Board Coordinates (a-h, 1-8)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showCoordinates}
                onChange={() => handleToggle('showCoordinates')}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
            </div>

            {/* Evaluation Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200 font-medium">Live Evaluation Bar</span>
              </div>
              <input
                type="checkbox"
                checked={settings.showEvalBar}
                onChange={() => handleToggle('showEvalBar')}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
            </div>

            {/* Legal Move Highlighting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200 font-medium">Highlight Legal Moves</span>
              </div>
              <input
                type="checkbox"
                checked={settings.highlightLegalMoves}
                onChange={() => handleToggle('highlightLegalMoves')}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200 font-medium">Enable Animations</span>
              </div>
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={() => handleToggle('animationsEnabled')}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="btn-primary w-full py-2 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
