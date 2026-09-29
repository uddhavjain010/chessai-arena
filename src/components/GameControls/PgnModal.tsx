import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload, AlertCircle } from 'lucide-react';
import { Chess } from 'chess.js';
import { storageService } from '../../services/storage';

interface PgnModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPgn: string;
  onLoadPgn: (pgn: string) => void;
}

export const PgnModal: React.FC<PgnModalProps> = ({
  isOpen,
  onClose,
  currentPgn,
  onLoadPgn
}) => {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    storageService.downloadPgn(currentPgn);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    if (!importText.trim()) {
      setImportError('Please paste a PGN string.');
      return;
    }

    try {
      const validator = new Chess();
      validator.loadPgn(importText.trim());
      onLoadPgn(importText.trim());
      onClose();
    } catch {
      setImportError('Invalid PGN format. Please check the move notation.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel max-w-lg w-full p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in-95 bg-slate-900/95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('export')}
              className={`text-sm font-bold pb-1 border-b-2 transition-all ${
                tab === 'export' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Export PGN
            </button>
            <button
              onClick={() => setTab('import')}
              className={`text-sm font-bold pb-1 border-b-2 transition-all ml-4 ${
                tab === 'import' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Import PGN
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {tab === 'export' ? (
          <div className="space-y-4">
            <textarea
              readOnly
              value={currentPgn || 'No moves in current game.'}
              className="w-full h-48 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!currentPgn}
                className="btn-primary flex-1 py-2 text-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy PGN'}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!currentPgn}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download .pgn</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <textarea
              placeholder="Paste PGN here (e.g. 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ...)"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full h-48 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
            />
            {importError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}
            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-xs font-bold"
            >
              <Upload className="w-4 h-4" />
              <span>Load PGN Game</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
