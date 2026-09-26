/**
 * Square and piece rendering components
 */

import type { Position, Piece, PieceDefinitions, PieceDefinition } from '../core/types';
import type { CSSProperties } from 'react';

export interface SquareProps {
  position: Position;
  squareSize: number;
  isLight: boolean;
  /** Whether this square is in the leftmost column (rank coordinate label) */
  isLeftCol: boolean;
  /** Whether this square is in the bottom row (file coordinate label) */
  isBottomRow: boolean;
  /** Total number of rows on the board (for rank labels) */
  boardRows: number;
  isHoverMove?: boolean;
  isHoverCapture?: boolean;
  isLastMoveFrom?: boolean;
  isLastMoveTo?: boolean;
  piece?: Piece | null;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showLeaderIndicator?: boolean;
  pieceDefinitions?: PieceDefinitions;
}

export const Square = ({
  position,
  squareSize,
  isLight,
  isLeftCol,
  isBottomRow,
  boardRows,
  isHoverMove = false,
  isHoverCapture = false,
  isLastMoveFrom = false,
  isLastMoveTo = false,
  piece = null,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showLeaderIndicator = true,
  pieceDefinitions,
}: SquareProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const classNames = [
    'chess-square',
    isLight ? 'light' : 'dark',
    isHoverMove ? (isHoverCapture ? 'hover-capture' : 'hover-move') : '',
    isLastMoveFrom || isLastMoveTo ? 'last-move' : '',
  ].filter(Boolean).join(' ');

  // Hover capture indicator (red ring) - absolutely positioned
  const hoverCaptureIndicator = isHoverCapture && piece ? (
    <div
      className="hover-capture-indicator"
      style={{
        width: squareSize * 0.8,
        height: squareSize * 0.8,
        borderWidth: Math.max(2, squareSize * 0.045),
      }}
    />
  ) : null;

  // Hover move indicator (amber dot) - absolutely positioned
  const hoverMoveIndicator = isHoverMove && !isHoverCapture && !piece ? (
    <div
      className="hover-move-indicator"
      style={{
        width: squareSize * 0.2,
        height: squareSize * 0.2,
        borderWidth: Math.max(1, squareSize * 0.03),
      }}
    />
  ) : null;

  return (
    <div
      className={classNames}
      style={{ width: squareSize, height: squareSize }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-position={`${position.row},${position.col}`}
    >
      {hoverMoveIndicator}
      {hoverCaptureIndicator}
      {piece && (
        <PieceComponent
          piece={piece}
          position={position}
          squareSize={squareSize}
          showLeaderIndicator={showLeaderIndicator}
          pieceDefinitions={pieceDefinitions}
        />
      )}
      {/* Coordinates */}
      {(isLeftCol || isBottomRow) && (
        <>
          {isLeftCol && (
            <div
              className="rank-coordinate"
              style={{ fontSize: squareSize * 0.15 }}
            >
              {boardRows - position.row}
            </div>
          )}
          {isBottomRow && (
            <div
              className="file-coordinate"
              style={{ fontSize: squareSize * 0.15 }}
            >
              {String.fromCharCode(97 + position.col)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Piece component - displays a chess piece
 */
export interface PieceProps {
  piece: Piece;
  position: Position;
  squareSize: number;
  showLeaderIndicator?: boolean;
  pieceDefinitions?: PieceDefinitions;
}

export const PieceComponent = ({
  piece,
  squareSize,
  showLeaderIndicator = true,
  pieceDefinitions,
}: PieceProps) => {
  const symbol = getPieceSymbol(piece, pieceDefinitions);
  const isLeader = piece.isLeader && showLeaderIndicator;
  const colorClass = piece.color === 'white' ? 'chess-piece-white' : 'chess-piece-black';

  const baseStyle: CSSProperties = {
    fontSize: squareSize * 0.7,
  };

  const label = `${piece.color} ${piece.type}${piece.hasMoved ? ' (moved)' : ''}`;

  if (!isLeader) {
    return (
      <span
        className={`chess-piece ${colorClass}`}
        style={baseStyle}
        role="img"
        aria-label={label}
        title={label}
      >
        {symbol}
      </span>
    );
  }

  // Leader piece: symbol in black text on a white circle
  return (
    <span
      className={`chess-piece leader ${colorClass}`}
      style={{
        ...baseStyle,
        width: squareSize * 0.45,
        height: squareSize * 0.45,
        fontSize: squareSize * 0.4,
        borderWidth: Math.max(1, squareSize * 0.03),
      }}
      role="img"
      aria-label={`${label} (Leader)`}
      title={`${label} (Leader)`}
    >
      {symbol}
    </span>
  );
};

/**
 * Gets the Unicode symbol for a piece from pieceDefinitions
 */
const getPieceSymbol = (piece: Piece, pieceDefinitions?: PieceDefinitions): string => {
  if (pieceDefinitions) {
    const def = pieceDefinitions[piece.type] as PieceDefinition | undefined;
    if (def?.unicode) {
      return def.unicode;
    }
  }
  return '?';
};

/**
 * AnimatingPiece component - displays a chess piece at an interpolated position
 * during move animation
 */
export interface AnimatingPieceProps {
  piece: Piece;
  from: Position;
  to: Position;
  progress: number; // 0 to 1
  squareSize: number;
  showLeaderIndicator?: boolean;
  pieceDefinitions?: PieceDefinitions;
}

export const AnimatingPiece = ({
  piece,
  from,
  to,
  progress,
  squareSize,
  showLeaderIndicator = true,
  pieceDefinitions,
}: AnimatingPieceProps) => {
  const symbol = getPieceSymbol(piece, pieceDefinitions);
  const isLeader = piece.isLeader && showLeaderIndicator;
  const colorClass = piece.color === 'white' ? 'chess-piece-white' : 'chess-piece-black';

  // Interpolate position
  const currentRow = from.row + (to.row - from.row) * progress;
  const currentCol = from.col + (to.col - from.col) * progress;

  const baseStyle: CSSProperties = {
    fontSize: squareSize * 0.7,
    top: `${currentRow * squareSize + squareSize / 2}px`,
    left: `${currentCol * squareSize + squareSize / 2}px`,
  };

  const label = `${piece.color} ${piece.type}${piece.hasMoved ? ' (moved)' : ''}`;

  if (!isLeader) {
    return (
      <span
        className={`chess-piece animating ${colorClass}`}
        style={baseStyle}
        role="img"
        aria-label={label}
        title={label}
      >
        {symbol}
      </span>
    );
  }

  // Leader piece: symbol in black text on a white circle
  return (
    <span
      className={`chess-piece leader animating ${colorClass}`}
      style={{
        ...baseStyle,
        width: squareSize * 0.45,
        height: squareSize * 0.45,
        fontSize: squareSize * 0.4,
        borderWidth: Math.max(1, squareSize * 0.03),
      }}
      role="img"
      aria-label={`${label} (Leader)`}
      title={`${label} (Leader)`}
    >
      {symbol}
    </span>
  );
};