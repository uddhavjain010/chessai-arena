import React, { useState, useEffect, useMemo } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { ChessBoard } from '../../components/ChessBoard/ChessBoard';
import { CHESS_PUZZLES } from '../../chess/puzzles';
import { Puzzle, AppSettings } from '../../types/chess';
import { storageService } from '../../services/storage';
import { soundManager } from '../../chess/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Lightbulb, RotateCcw, ChevronRight, Trophy } from 'lucide-react';

interface PuzzlesPageProps {
  settings: AppSettings;
}

export const PuzzlesPage: React.FC<PuzzlesPageProps> = ({ settings }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  const filteredPuzzles = useMemo(() => {
    if (selectedCategory === 'all') return CHESS_PUZZLES;
    return CHESS_PUZZLES.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const puzzle: Puzzle = filteredPuzzles[currentPuzzleIndex] || CHESS_PUZZLES[0];

  const [chess, setChess] = useState<Chess>(() => new Chess(puzzle.fen));
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: Square; to: Square } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [solvedPuzzles, setSolvedPuzzles] = useState<Set<string>>(new Set());

  // Load new puzzle position
  useEffect(() => {
    const newGame = new Chess(puzzle.fen);
    setChess(newGame);
    setLastMove(null);
    setHintMove(null);
    setShowHint(false);
    setStatus('idle');
  }, [puzzle.id, puzzle.fen]);

  const handleMakeMove = (from: Square, to: Square, promotion: PieceSymbol = 'q'): boolean => {
    if (status === 'correct') return false;

    try {
      const tempGame = new Chess(chess.fen());
      const move = tempGame.move({ from, to, promotion });
      if (!move) return false;

      // Validate against puzzle solution
      // The expected move is puzzle.solution[0] (or check clean SAN)
      const expectedMoveSan = puzzle.solution[0].replace(/[+#?!]/g, '').trim();
      const playedSan = move.san.replace(/[+#?!]/g, '').trim();

      if (playedSan === expectedMoveSan || move.san === puzzle.solution[0]) {
        // Move is correct!
        chess.move({ from, to, promotion });
        setLastMove({ from, to });
        setStatus('correct');
        setSolvedPuzzles(prev => new Set(prev).add(puzzle.id));
        storageService.recordPuzzleResult(true);

        if (settings.soundEnabled) {
          if (move.captured) soundManager.playCapture();
          else if (move.san.includes('#')) soundManager.playGameOver(true);
          else soundManager.playMove();
        }

        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {
          // ignore
        }
        return true;
      } else {
        // Incorrect move
        setStatus('wrong');
        storageService.recordPuzzleResult(false);
        if (settings.soundEnabled) {
          soundManager.playMove();
        }
        return false;
      }
    } catch {
      return false;
    }
  };

  const handleResetPuzzle = () => {
    const newGame = new Chess(puzzle.fen);
    setChess(newGame);
    setLastMove(null);
    setHintMove(null);
    setStatus('idle');
  };

  const handleNextPuzzle = () => {
    const nextIdx = (currentPuzzleIndex + 1) % filteredPuzzles.length;
    setCurrentPuzzleIndex(nextIdx);
  };

  const handleRevealHint = () => {
    setShowHint(true);
    // Parse target from first move of solution if possible
    try {
      const temp = new Chess(puzzle.fen);
      const m = temp.move(puzzle.solution[0]);
      if (m) {
        setHintMove({ from: m.from, to: m.to });
      }
    } catch {
      // ignore
    }
  };

  const categories = [
    { id: 'all', label: 'All Puzzles' },
    { id: 'mate_in_1', label: 'Mate in 1' },
    { id: 'mate_in_2', label: 'Mate in 2' },
    { id: 'fork', label: 'Forks' },
    { id: 'pin', label: 'Pins' },
    { id: 'skewer', label: 'Skewers' },
    { id: 'discovered_attack', label: 'Discovered' },
    { id: 'back_rank', label: 'Back Rank' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Category selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCategory(c.id);
              setCurrentPuzzleIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Chess Board */}
        <div className="lg:col-span-7 flex justify-center">
          <ChessBoard
            chess={chess}
            orientation={puzzle.playerColor}
            theme={settings.boardTheme}
            pieceStyle={settings.pieceStyle}
            showCoordinates={settings.showCoordinates}
            highlightLegalMoves={settings.highlightLegalMoves}
            lastMove={lastMove}
            hintMove={hintMove}
            isInteractive={status !== 'correct'}
            onMakeMove={handleMakeMove}
          />
        </div>

        {/* Right: Puzzle Details and Solver Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 border border-slate-700/80 rounded-2xl bg-slate-900/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {puzzle.category.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Rating: ~{puzzle.rating}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{puzzle.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {puzzle.description}
            </p>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 mb-4 text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Your Turn:</span>
              <span className="font-bold flex items-center gap-1.5 text-white">
                <span className={`w-3 h-3 rounded-full border ${puzzle.playerColor === 'w' ? 'bg-white border-slate-400' : 'bg-slate-900 border-slate-600'}`} />
                {puzzle.playerColor === 'w' ? 'White to move' : 'Black to move'}
              </span>
            </div>

            {/* Status alerts */}
            {status === 'correct' && (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 mb-4 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Puzzle Solved! Excellent Move.
                </div>
                <p className="text-xs text-emerald-300/90">
                  You identified the winning combination: {puzzle.solution.join(' ')}
                </p>
              </div>
            )}

            {status === 'wrong' && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 mb-4 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  Not the best move.
                </div>
                <p className="text-xs text-rose-300/90">
                  That move doesn't win the critical advantage. Reset the board and try again!
                </p>
              </div>
            )}

            {/* Hint reveal */}
            {showHint && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 mb-4 text-xs">
                <span className="font-bold">Coach Hint: </span>
                {puzzle.hint}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-2">
              {status === 'correct' ? (
                <button
                  onClick={handleNextPuzzle}
                  className="btn-primary py-2.5 font-bold text-xs"
                >
                  <span>Next Puzzle</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleRevealHint}
                    disabled={showHint}
                    className="btn-secondary flex-1 py-2 text-xs font-semibold"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>{showHint ? 'Hint Revealed' : 'Hint'}</span>
                  </button>

                  <button
                    onClick={handleResetPuzzle}
                    className="btn-secondary flex-1 py-2 text-xs font-semibold"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Puzzle Progress Track */}
          <div className="glass-panel p-4 border border-slate-700/60 rounded-xl bg-slate-900/60 text-xs flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Puzzles Solved this Session:</span>
            </div>
            <span className="font-bold text-sm text-white font-mono">
              {solvedPuzzles.size} / {filteredPuzzles.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
