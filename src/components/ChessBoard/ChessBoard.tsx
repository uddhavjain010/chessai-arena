import React, { useState, useMemo, useCallback } from 'react';
import { Chess, Square, Color, PieceSymbol } from 'chess.js';
import { ChessPiece } from '../../chess/pieces';
import { BoardTheme, PieceStyle } from '../../types/chess';

interface ChessBoardProps {
  chess: Chess;
  orientation: Color;
  theme: BoardTheme;
  pieceStyle: PieceStyle;
  showCoordinates: boolean;
  highlightLegalMoves: boolean;
  lastMove: { from: Square; to: Square } | null;
  hintMove: { from: Square; to: Square } | null;
  isInteractive: boolean;
  onMakeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
}

interface ChessSquareProps {
  square: Square;
  piece: { type: PieceSymbol; color: Color } | null | undefined;
  pieceStyle: PieceStyle;
  isLight: boolean;
  isSelected: boolean;
  isLastMove: boolean;
  isHint: boolean;
  isCheck: boolean;
  isLegalDest: boolean;
  isCapture: boolean;
  showRankCoord: string | null;
  showFileCoord: string | null;
  onClick: (square: Square) => void;
}

// Memoized ChessSquare: only the selected, targeted, or moved squares re-render!
const ChessSquare = React.memo<ChessSquareProps>(({
  square,
  piece,
  pieceStyle,
  isLight,
  isSelected,
  isLastMove,
  isHint,
  isCheck,
  isLegalDest,
  isCapture,
  showRankCoord,
  showFileCoord,
  onClick
}) => {
  const handleClick = useCallback(() => {
    onClick(square);
  }, [onClick, square]);

  return (
    <div
      id={`square-${square}`}
      onClick={handleClick}
      className={`chess-square ${
        isLight ? 'bg-[var(--square-light)]' : 'bg-[var(--square-dark)]'
      } ${isSelected ? 'square-selected' : ''} ${
        isLastMove ? 'square-last-move' : ''
      } ${isHint ? 'square-hint' : ''} ${
        isCheck ? 'king-in-check' : ''
      }`}
      style={{
        backgroundColor: isLight ? 'var(--square-light)' : 'var(--square-dark)'
      }}
    >
      {/* Rank coordinate label - strictly absolute, zero layout displacement */}
      {showRankCoord && (
        <span
          className={`absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-bold pointer-events-none select-none z-20 leading-none ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}
        >
          {showRankCoord}
        </span>
      )}

      {/* File coordinate label */}
      {showFileCoord && (
        <span
          className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-bold pointer-events-none select-none z-20 leading-none ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}
        >
          {showFileCoord}
        </span>
      )}

      {/* Piece - perfectly centered, responsive scaling */}
      {piece && (
        <div className="chess-piece-container">
          <ChessPiece
            type={piece.type}
            color={piece.color}
            style={pieceStyle}
          />
        </div>
      )}

      {/* Legal Move Destination Dot */}
      {isLegalDest && !isCapture && (
        <div className="legal-dot z-20" />
      )}

      {/* Legal Capture Ring */}
      {isLegalDest && isCapture && (
        <div className="legal-capture-ring z-20" />
      )}
    </div>
  );
});

ChessSquare.displayName = 'ChessSquare';

export const ChessBoard: React.FC<ChessBoardProps> = React.memo(({
  chess,
  orientation,
  theme,
  pieceStyle,
  showCoordinates,
  highlightLegalMoves,
  lastMove,
  hintMove,
  isInteractive,
  onMakeMove
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const displayedFiles = useMemo(
    () => orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'],
    [orientation]
  );

  const displayedRanks = useMemo(
    () => orientation === 'w' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'],
    [orientation]
  );

  // Check square calculation (only recomputes when turn or board position changes)
  const checkSquare = useMemo<Square | null>(() => {
    if (!chess.inCheck()) return null;
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return `${'abcdefgh'[c]}${8 - r}` as Square;
        }
      }
    }
    return null;
  }, [chess]);

  // Fast single-pass legal destinations for selected square
  const legalDestinations = useMemo(() => {
    const map = new Map<Square, boolean>();
    if (!selectedSquare || !highlightLegalMoves) return map;
    try {
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      for (let i = 0; i < moves.length; i++) {
        map.set(moves[i].to, !!moves[i].captured);
      }
    } catch {
      // ignore
    }
    return map;
  }, [selectedSquare, highlightLegalMoves, chess]);

  const handleSquareClick = useCallback((square: Square) => {
    if (!isInteractive) return;

    const pieceOnSquare = chess.get(square);

    // If clicking same selected square, deselect immediately
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If a piece is already selected, attempt to move
    if (selectedSquare) {
      const movingPiece = chess.get(selectedSquare);
      const isPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && square[1] === '8') ||
         (movingPiece.color === 'b' && square[1] === '1'));

      if (isPromotion && legalDestinations.has(square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      const success = onMakeMove(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        return;
      }
    }

    // Select piece if it belongs to current player's turn
    if (pieceOnSquare && pieceOnSquare.color === chess.turn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  }, [isInteractive, chess, selectedSquare, legalDestinations, onMakeMove]);

  const handlePromotionSelect = useCallback((piece: PieceSymbol) => {
    if (pendingPromotion) {
      onMakeMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  }, [pendingPromotion, onMakeMove]);

  return (
    <div
      data-theme={theme}
      className="chess-board-wrapper p-2 rounded-2xl shadow-2xl bg-slate-900/90 border border-slate-700/80"
    >
      {/* 8x8 Strict Equal Grid */}
      <div
        className="chess-board-grid rounded-lg overflow-hidden border-2 border-slate-700/80 shadow-inner"
        role="grid"
        aria-label="Chess Board"
      >
        {displayedRanks.map((rank) =>
          displayedFiles.map((file) => {
            const square = `${file}${rank}` as Square;
            const piece = chess.get(square);

            const fileIdx = 'abcdefgh'.indexOf(file);
            const rankIdx = 8 - parseInt(rank, 10);
            const isLightSquare = (fileIdx + rankIdx) % 2 === 0;

            const isSelected = selectedSquare === square;
            const isLastMove = !!lastMove && (lastMove.from === square || lastMove.to === square);
            const isHint = !!hintMove && (hintMove.from === square || hintMove.to === square);
            const isCheck = checkSquare === square;
            const isLegalDest = legalDestinations.has(square);
            const isCapture = !!legalDestinations.get(square);

            // Coordinates
            const showFileCoord = showCoordinates && rank === (orientation === 'w' ? '1' : '8') ? file : null;
            const showRankCoord = showCoordinates && file === (orientation === 'w' ? 'a' : 'h') ? rank : null;

            return (
              <ChessSquare
                key={square}
                square={square}
                piece={piece}
                pieceStyle={pieceStyle}
                isLight={isLightSquare}
                isSelected={isSelected}
                isLastMove={isLastMove}
                isHint={isHint}
                isCheck={isCheck}
                isLegalDest={isLegalDest}
                isCapture={isCapture}
                showRankCoord={showRankCoord}
                showFileCoord={showFileCoord}
                onClick={handleSquareClick}
              />
            );
          })
        )}
      </div>

      {/* Pawn Promotion Dialog */}
      {pendingPromotion && (
        <div className="modal-overlay">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 text-center border border-cyan-500/40 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold mb-2 text-white">Pawn Promotion</h3>
            <p className="text-sm text-slate-300 mb-6">Choose a piece to promote your pawn:</p>
            <div className="grid grid-cols-4 gap-3">
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((pieceType) => (
                <button
                  key={pieceType}
                  onClick={() => handlePromotionSelect(pieceType)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-400 transition-all hover:scale-105 active:scale-95"
                >
                  <div className="w-12 h-12">
                    <ChessPiece
                      type={pieceType}
                      color={chess.turn()}
                      style={pieceStyle}
                    />
                  </div>
                  <span className="text-xs uppercase font-bold text-slate-300 mt-2">
                    {pieceType === 'q' ? 'Queen' : pieceType === 'r' ? 'Rook' : pieceType === 'b' ? 'Bishop' : 'Knight'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ChessBoard.displayName = 'ChessBoard';
