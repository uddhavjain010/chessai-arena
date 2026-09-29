import React, { useState } from 'react';
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

export const ChessBoard: React.FC<ChessBoardProps> = ({
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

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayedFiles = orientation === 'w' ? files : [...files].reverse();
  const displayedRanks = orientation === 'w' ? ranks : [...ranks].reverse();

  // Find king in check square
  let checkSquare: Square | null = null;
  if (chess.inCheck()) {
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          checkSquare = `${files[c]}${ranks[r]}` as Square;
          break;
        }
      }
      if (checkSquare) break;
    }
  }

  // Get legal moves for currently selected square
  const legalDestinations = new Map<Square, boolean>(); // key: square, value: isCapture
  if (selectedSquare && highlightLegalMoves) {
    const moves = chess.moves({ square: selectedSquare, verbose: true });
    moves.forEach(m => {
      legalDestinations.set(m.to, !!m.captured);
    });
  }

  const handleSquareClick = (square: Square) => {
    if (!isInteractive) return;

    const pieceOnSquare = chess.get(square);

    // If already selected the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If a piece is already selected, try to move
    if (selectedSquare) {
      const movingPiece = chess.get(selectedSquare);
      // Check if moving piece is a pawn reaching the last rank
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
  };

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (pendingPromotion) {
      onMakeMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  return (
    <div
      data-theme={theme}
      className="relative select-none flex flex-col items-center justify-center p-2 rounded-2xl shadow-2xl bg-slate-900/80 border border-slate-700/60 max-w-full"
    >
      <div
        className="grid grid-cols-8 rounded-lg overflow-hidden border-2 border-slate-700/80 shadow-inner"
        style={{
          width: 'min(86vw, min(70vh, 560px))',
          height: 'min(86vw, min(70vh, 560px))',
          aspectRatio: '1 / 1'
        }}
        role="grid"
        aria-label="Chess Board"
      >
        {displayedRanks.map((rank) =>
          displayedFiles.map((file) => {
            const square = `${file}${rank}` as Square;
            const piece = chess.get(square);

            const fileIdx = files.indexOf(file);
            const rankIdx = ranks.indexOf(rank);
            const isLightSquare = (fileIdx + rankIdx) % 2 === 0;

            const isSelected = selectedSquare === square;
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isHint = hintMove && (hintMove.from === square || hintMove.to === square);
            const isKingInCheck = checkSquare === square;
            const isLegalDest = legalDestinations.has(square);
            const isCapture = legalDestinations.get(square);

            // Coordinates display
            const showFileCoord = showCoordinates && rank === (orientation === 'w' ? '1' : '8');
            const showRankCoord = showCoordinates && file === (orientation === 'w' ? 'a' : 'h');

            return (
              <div
                key={square}
                id={`square-${square}`}
                onClick={() => handleSquareClick(square)}
                className={`chess-square relative flex items-center justify-center cursor-pointer transition-colors ${
                  isLightSquare ? 'bg-[var(--square-light)]' : 'bg-[var(--square-dark)]'
                } ${isSelected ? 'square-selected' : ''} ${
                  isLastMove ? 'square-last-move' : ''
                } ${isHint ? 'square-hint' : ''} ${
                  isKingInCheck ? 'king-in-check' : ''
                }`}
                style={{
                  backgroundColor: isLightSquare ? 'var(--square-light)' : 'var(--square-dark)'
                }}
              >
                {/* Board edge coordinates */}
                {showRankCoord && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] md:text-xs font-bold pointer-events-none select-none ${
                      isLightSquare ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {showFileCoord && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] md:text-xs font-bold pointer-events-none select-none ${
                      isLightSquare ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Piece */}
                {piece && (
                  <div className="w-[84%] h-[84%] flex items-center justify-center z-10">
                    <ChessPiece
                      type={piece.type}
                      color={piece.color}
                      style={pieceStyle}
                    />
                  </div>
                )}

                {/* Legal move indicator */}
                {isLegalDest && !isCapture && (
                  <div className="legal-dot z-20" />
                )}

                {/* Legal capture indicator */}
                {isLegalDest && isCapture && (
                  <div className="legal-capture-ring z-20" />
                )}
              </div>
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
};
