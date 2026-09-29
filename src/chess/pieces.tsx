import React from 'react';
import { PieceSymbol, Color } from 'chess.js';
import { PieceStyle } from '../types/chess';

interface PieceProps {
  type: PieceSymbol;
  color: Color;
  style?: PieceStyle;
  className?: string;
  size?: number | string;
}

export const ChessPiece: React.FC<PieceProps> = ({
  type,
  color,
  style = 'neo',
  className = '',
  size = '100%'
}) => {
  const isWhite = color === 'w';

  // Palette definitions
  const whiteFill = style === 'minimal' ? '#f8fafc' : '#f1f5f9';
  const whiteStroke = style === 'minimal' ? '#334155' : '#1e293b';
  const whiteHighlight = '#ffffff';

  const blackFill = style === 'minimal' ? '#1e293b' : '#181e29';
  const blackHighlight = '#334155';

  const fill = isWhite ? whiteFill : blackFill;
  const stroke = isWhite ? whiteStroke : '#0f172a';
  const secondaryFill = isWhite ? whiteHighlight : blackHighlight;

  // Render SVG paths for standard pieces
  const renderPaths = () => {
    switch (type) {
      case 'p': // PAWN
        return (
          <g>
            <ellipse cx="22.5" cy="12" rx="6.5" ry="6.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path
              d="M17 38c0-3 2.5-6 3.5-9 1-3 0.5-6 1-9h2c0.5 3 0 6 1 9 1 3 3.5 6 3.5 9z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path d="M12 40h21a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H12a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M9 43h27v2H9z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            {isWhite && <path d="M20 10a4 4 0 0 1 4 2" stroke={secondaryFill} strokeWidth="1.2" strokeLinecap="round" fill="none" />}
          </g>
        );

      case 'n': // KNIGHT
        return (
          <g>
            <path
              d="M22 10c-3 0-6 2-7.5 5.5-1.5 3.5-1.5 7-4.5 9 1.5 1 3 0.5 4-0.5-1 2-0.5 4 1 5 2.5 1.5 5 0 6-2 0.5 1 1.5 2 3 2 1.5 0 2.5-1 3-2.5 1-3 0-5.5-1-8 2-1 3.5-3.5 3.5-6.5C29.5 11 26 10 22 10z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M11 24.5c1.5 0 4 3 4.5 6.5 0.5 3.5 0 7 2.5 9.5H33c1-3 1-9.5-2.5-14.5"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <circle cx="23" cy="15.5" r="1.5" fill={isWhite ? stroke : '#e2e8f0'} />
            <path d="M9 43h27v2H9z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </g>
        );

      case 'b': // BISHOP
        return (
          <g>
            <circle cx="22.5" cy="8" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
            <path
              d="M15 38c-2-3-2-7 1-12 2-3.5 4-6 6.5-14 2.5 8 4.5 10.5 6.5 14 3 5 3 9 1 12z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path d="M19 19l7 7m0-7l-7 7" stroke={isWhite ? '#64748b' : '#94a3b8'} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M12 40h21v2H12z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M9 43h27v2H9z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </g>
        );

      case 'r': // ROOK
        return (
          <g>
            {/* Battlements */}
            <path
              d="M12 14h4v4h3v-4h4v4h3v-4h4v4h3v-4h4v6l-2 3v13h4v4H10v-4h4V23l-2-3v-6z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M14 23h17M14 36h17" stroke={stroke} strokeWidth="1.2" />
            <path d="M9 43h27v2H9z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            {isWhite && <rect x="17" y="25" width="11" height="9" rx="1" fill="#e2e8f0" stroke={stroke} strokeWidth="1" />}
          </g>
        );

      case 'q': // QUEEN
        return (
          <g>
            {/* Crown circlets */}
            <circle cx="8" cy="16" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
            <circle cx="15" cy="13" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
            <circle cx="22.5" cy="11.5" r="2.2" fill={fill} stroke={stroke} strokeWidth="1" />
            <circle cx="30" cy="13" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
            <circle cx="37" cy="16" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Crown body */}
            <path
              d="M8.5 18l3.5 12h21l3.5-12-6 7-8-12-8 12-6-7z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 30c-1 3 0 7 2 9h17c2-2 3-6 2-9H12z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <path d="M10 40h25v2H10z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M8 43h29v2H8z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <circle cx="22.5" cy="27" r="2" fill={isWhite ? '#38bdf8' : '#e0f2fe'} opacity="0.8" />
          </g>
        );

      case 'k': // KING
        return (
          <g>
            {/* Cross */}
            <path d="M22.5 7v8M19 10.5h7" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
            {/* Crown */}
            <path
              d="M14 16c2-1.5 5.5-2 8.5-2s6.5 0.5 8.5 2c2 1.5 3 4.5 1.5 8.5-1.5 4-3.5 7.5-4 13.5h-12c-0.5-6-2.5-9.5-4-13.5-1.5-4-0.5-7 1.5-8.5z"
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M14 38c0-3 3-5 8.5-5s8.5 2 8.5 5H14z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M11 40h23v2H11z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M9 43h27v2H9z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            {isWhite && (
              <circle cx="22.5" cy="22" r="3" fill="#f59e0b" opacity="0.8" />
            )}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 45 48"
      width={size}
      height={size}
      className={`chess-piece select-none pointer-events-none drop-shadow-md transition-transform duration-150 ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`shadow-${color}-${type}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter={`url(#shadow-${color}-${type})`}>
        {renderPaths()}
      </g>
    </svg>
  );
};
