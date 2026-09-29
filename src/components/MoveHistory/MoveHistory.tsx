import React, { useRef, useEffect } from 'react';
import { PieceSymbol } from 'chess.js';
import { ChessPiece } from '../../chess/pieces';
import { PIECE_VALUES } from '../../chess/evaluation';
import { PieceStyle } from '../../types/chess';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';

interface MoveHistoryProps {
  history: string[]; // SAN moves
  currentMoveIndex: number; // -1 for starting position, 0 for 1st move, etc.
  onSelectMove: (index: number) => void;
  capturedByWhite: PieceSymbol[];
  capturedByBlack: PieceSymbol[];
  pieceStyle: PieceStyle;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  onSelectMove,
  capturedByWhite,
  capturedByBlack,
  pieceStyle
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group moves into turns (white move + black move)
  const turns: Array<{ moveNumber: number; white: string; black?: string; whiteIdx: number; blackIdx?: number }> = [];
  for (let i = 0; i < history.length; i += 2) {
    turns.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
      whiteIdx: i,
      blackIdx: i + 1 < history.length ? i + 1 : undefined
    });
  }

  // Auto-scroll to latest move when moves are made
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history.length]);

  // Compute material difference
  const whiteMaterial = capturedByWhite.reduce((acc, p) => acc + PIECE_VALUES[p], 0);
  const blackMaterial = capturedByBlack.reduce((acc, p) => acc + PIECE_VALUES[p], 0);
  const materialAdvantage = (whiteMaterial - blackMaterial) / 100;

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden border border-slate-700/60 rounded-xl p-3 bg-slate-900/70">
      {/* Captured pieces tray: White's captures */}
      <div className="flex items-center justify-between py-1 px-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1 flex-wrap min-h-[24px]">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">White:</span>
          {capturedByWhite.map((p, idx) => (
            <div key={`w-cap-${idx}`} className="w-4 h-4">
              <ChessPiece type={p} color="b" style={pieceStyle} />
            </div>
          ))}
          {materialAdvantage > 0 && (
            <span className="text-[11px] font-bold text-emerald-400 ml-1">+{materialAdvantage}</span>
          )}
        </div>
      </div>

      {/* Moves scroll area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto my-2 pr-1 space-y-1 text-sm font-mono"
        style={{ maxHeight: '220px', minHeight: '120px' }}
      >
        {turns.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic font-sans">
            No moves made yet
          </div>
        ) : (
          turns.map((turn) => {
            const isWhiteSelected = currentMoveIndex === turn.whiteIdx;
            const isBlackSelected = turn.blackIdx !== undefined && currentMoveIndex === turn.blackIdx;

            return (
              <div
                key={turn.moveNumber}
                className="grid grid-cols-12 gap-1 items-center py-1 px-2 rounded hover:bg-slate-800/40 text-xs transition-colors"
              >
                <span className="col-span-3 text-slate-500 font-semibold select-none">
                  {turn.moveNumber}.
                </span>

                <button
                  onClick={() => onSelectMove(turn.whiteIdx)}
                  className={`col-span-4 text-left py-0.5 px-2 rounded font-medium transition-all ${
                    isWhiteSelected
                      ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/40'
                      : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {turn.white}
                </button>

                {turn.black && (
                  <button
                    onClick={() => turn.blackIdx !== undefined && onSelectMove(turn.blackIdx)}
                    className={`col-span-4 text-left py-0.5 px-2 rounded font-medium transition-all ${
                      isBlackSelected
                        ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {turn.black}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Captured pieces tray: Black's captures */}
      <div className="flex items-center justify-between py-1 px-2 border-t border-slate-800 text-xs mb-2">
        <div className="flex items-center gap-1 flex-wrap min-h-[24px]">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Black:</span>
          {capturedByBlack.map((p, idx) => (
            <div key={`b-cap-${idx}`} className="w-4 h-4">
              <ChessPiece type={p} color="w" style={pieceStyle} />
            </div>
          ))}
          {materialAdvantage < 0 && (
            <span className="text-[11px] font-bold text-emerald-400 ml-1">+{Math.abs(materialAdvantage)}</span>
          )}
        </div>
      </div>

      {/* History Step Controls */}
      <div className="flex items-center justify-center gap-1 pt-1 border-t border-slate-800">
        <button
          onClick={() => onSelectMove(-1)}
          disabled={currentMoveIndex === -1}
          title="Start of game"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex <= -1}
          title="Previous move"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-slate-400 px-2 font-mono">
          {currentMoveIndex + 1} / {history.length}
        </span>
        <button
          onClick={() => onSelectMove(Math.min(history.length - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= history.length - 1}
          title="Next move"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(history.length - 1)}
          disabled={currentMoveIndex === history.length - 1}
          title="Latest move"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
