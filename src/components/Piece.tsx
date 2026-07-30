/**
 * Square component - renders a single chess square
 */

import { useMemo } from 'react';
import type { Position, Piece, PieceDefinitions, PieceDefinition } from '../core/types';
import type { CSSProperties } from 'react';

export interface SquareProps {
  position: Position;
  squareSize: number;
  isLight: boolean;
  isSelected?: boolean;
  isValidMove?: boolean;
  isHoverMove?: boolean;
  isLastMoveFrom?: boolean;
  isLastMoveTo?: boolean;
  isCheck?: boolean;
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
  isSelected = false,
  isValidMove = false,
  isHoverMove = false,
  isLastMoveFrom = false,
  isLastMoveTo = false,
  isCheck = false,
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

  const baseStyle = useMemo((): CSSProperties => ({
    width: squareSize,
    height: squareSize,
    backgroundColor: isLight ? '#f0d9b5' : '#b58863',
    position: 'relative',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background-color 0.1s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }), [squareSize, isLight, onClick]);

  let backgroundColor = baseStyle.backgroundColor;
  
  if (isSelected) {
    backgroundColor = '#86c232';
  } else if (isValidMove) {
    backgroundColor = isLight ? '#a8d050' : '#86c232';
  } else if (isHoverMove) {
    // Subtle highlight for hover moves
    backgroundColor = isLight ? '#ffe082' : '#ffd54f';
  } else if (isLastMoveFrom || isLastMoveTo) {
    backgroundColor = '#ffff66';
  } else if (isCheck) {
    backgroundColor = '#ff6666';
  }

  // Valid move indicator (dot for empty, ring for capture) - for selected piece
  const moveIndicator = isValidMove && !piece && !isSelected ? (
    <div
      className="move-indicator"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: squareSize * 0.25,
        height: squareSize * 0.25,
        borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  ) : null;

  // Capture indicator (ring) - for selected piece
  const captureIndicator = isValidMove && piece && !isSelected ? (
    <div
      className="capture-indicator"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: squareSize * 0.85,
        height: squareSize * 0.85,
        border: `3px solid #86c232`,
        borderRadius: '4px',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        zIndex: 5,
      }}
    />
  ) : null;

  // Hover capture indicator (ring, different color) - absolutely positioned
  const hoverCaptureIndicator = isHoverMove && piece && !isSelected && !isValidMove ? (
    <div
      className="hover-capture-indicator"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: squareSize * 0.8,
        height: squareSize * 0.8,
        border: `3px solid #d84315`,
        borderRadius: '4px',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        backgroundColor: 'rgba(216, 67, 21, 0.15)',
        zIndex: 5,
      }}
    />
  ) : null;

  // Hover move indicator (dot for empty, different color) - absolutely positioned
  const hoverMoveIndicator = isHoverMove && !piece && !isSelected && !isValidMove ? (
    <div
      className="hover-move-indicator"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: squareSize * 0.2,
        height: squareSize * 0.2,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 193, 7, 0.7)', // Amber for non-capture
        pointerEvents: 'none',
        border: '2px solid #fbc02d',
        boxSizing: 'border-box',
        zIndex: 5,
      }}
    />
  ) : null;

  return (
    <div
      className={`chess-square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''} ${isHoverMove ? 'hover-move' : ''} ${isLastMoveFrom || isLastMoveTo ? 'last-move' : ''} ${isCheck ? 'check' : ''}`}
      style={{
        ...baseStyle,
        backgroundColor,
      }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-position={`${position.row},${position.col}`}
    >
      {moveIndicator}
      {captureIndicator}
      {hoverMoveIndicator}
      {hoverCaptureIndicator}
      {piece && (
        <PieceComponent
          piece={piece}
          position={position}
          squareSize={squareSize}
          isSelected={isSelected}
          isValidMove={isValidMove}
          isLastMove={isLastMoveTo}
          showLeaderIndicator={showLeaderIndicator}
          pieceDefinitions={pieceDefinitions}
        />
      )}
      {/* Coordinates */}
      {(position.col === 0 || position.row === 7) && (
        <>
          {position.col === 0 && (
            <div
              className="rank-coordinate"
              style={{
                position: 'absolute',
                left: 4,
                top: 2,
                fontSize: squareSize * 0.15,
                color: isLight ? '#b58863' : '#f0d9b5',
                fontWeight: 'bold',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {8 - position.row}
            </div>
          )}
          {position.row === 7 && (
            <div
              className="file-coordinate"
              style={{
                position: 'absolute',
                right: 4,
                bottom: 2,
                fontSize: squareSize * 0.15,
                color: isLight ? '#b58863' : '#f0d9b5',
                fontWeight: 'bold',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
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
  isSelected?: boolean;
  isValidMove?: boolean;
  isLastMove?: boolean;
  showLeaderIndicator?: boolean;
  pieceDefinitions?: PieceDefinitions;
}

export const PieceComponent = ({
  piece,
  squareSize,
  isSelected = false,
  showLeaderIndicator = true,
  pieceDefinitions,
}: PieceProps) => {
  const symbol = getPieceSymbol(piece, pieceDefinitions);
  const isLeader = piece.isLeader && showLeaderIndicator;

  const baseStyle = useMemo((): CSSProperties => ({
    fontSize: squareSize * 0.7,
    lineHeight: 1,
    userSelect: 'none',
    pointerEvents: 'none',
    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
    color: piece.color === 'white' ? '#ffffff' : '#1a1a1a',
    filter: piece.color === 'white' 
      ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
      : 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
    transition: 'transform 0.1s ease',
    zIndex: isSelected ? 10 : 1,
  }), [squareSize, piece.color, isSelected]);

  if (!isLeader) {
    return (
      <span
        style={baseStyle}
        role="img"
        aria-label={`${piece.color} ${piece.type}${piece.hasMoved ? ' (moved)' : ''}`}
        title={`${piece.color} ${piece.type}${piece.hasMoved ? ' (moved)' : ''}`}
      >
        {symbol}
      </span>
    );
  }

  // Leader piece: symbol in black text on a white circle
  const leaderCircleSize = squareSize * 0.45;
  const leaderStyle: CSSProperties = {
    ...baseStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: leaderCircleSize,
    height: leaderCircleSize,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '2px solid #3d2914',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    color: '#1a1a1a', // Black text
    fontSize: squareSize * 0.4,
    fontWeight: 'bold',
  };

  return (
    <span
      style={leaderStyle}
      role="img"
      aria-label={`${piece.color} ${piece.type} (Leader)${piece.hasMoved ? ' (moved)' : ''}`}
      title={`${piece.color} ${piece.type} (Leader)${piece.hasMoved ? ' (moved)' : ''}`}
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
  return '?'
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

  // Interpolate position
  const currentRow = from.row + (to.row - from.row) * progress;
  const currentCol = from.col + (to.col - from.col) * progress;

  const baseStyle = useMemo((): CSSProperties => ({
    fontSize: squareSize * 0.7,
    lineHeight: 1,
    userSelect: 'none',
    pointerEvents: 'none',
    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
    color: piece.color === 'white' ? '#ffffff' : '#1a1a1a',
    filter: piece.color === 'white' 
      ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
      : 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
    position: 'absolute',
    top: `${currentRow * squareSize + squareSize / 2}px`,
    left: `${currentCol * squareSize + squareSize / 2}px`,
    transform: `translate(-50%, -50%)`,
    zIndex: 100,
  }), [squareSize, piece.color, currentRow, currentCol]);

  if (!isLeader) {
    return (
      <span
        style={baseStyle}
        role="img"
        aria-label={`${piece.color} ${piece.type}${piece.hasMoved ? ' (moved)' : ''}`}
        title={`${piece.color} ${piece.type}${piece.hasMoved ? ' (moved)' : ''}`}
      >
        {symbol}
      </span>
    );
  }

  // Leader piece: symbol in black text on a white circle
  const leaderCircleSize = squareSize * 0.45;
  const leaderStyle: CSSProperties = {
    ...baseStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: leaderCircleSize,
    height: leaderCircleSize,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '2px solid #3d2914',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    color: '#1a1a1a',
    fontSize: squareSize * 0.4,
    fontWeight: 'bold',
  };

  return (
    <span
      style={leaderStyle}
      role="img"
      aria-label={`${piece.color} ${piece.type} (Leader)${piece.hasMoved ? ' (moved)' : ''}`}
      title={`${piece.color} ${piece.type} (Leader)${piece.hasMoved ? ' (moved)' : ''}`}
    >
      {symbol}
    </span>
  );
};