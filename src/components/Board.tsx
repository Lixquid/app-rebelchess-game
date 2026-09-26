/**
 * Chess board component
 */

import { useMemo, useState, useEffect } from 'react';
import type { Position, Piece, BoardSize } from '../core/types';
import { Square, type SquareProps, AnimatingPiece } from './Piece';

import { getValidMovesForPiece } from '../core/pieces';
import type { PieceDefinitions } from '../core/types';

export interface BoardProps {
  board: (Piece | null)[][];
  boardSize: BoardSize;
  squareSize: number;
  lastMove: { from: Position; to: Position } | null;
  onSquareClick: (position: Position) => void;
  showLeaderIndicator: boolean;
  pieceDefinitions: PieceDefinitions;
  hoverMovesEnabled?: boolean;
  animatingMove?: {
    piece: Piece;
    from: Position;
    to: Position;
    startTime: number;
    duration: number;
  } | null;
}

export const Board = ({
  board,
  boardSize,
  squareSize,
  lastMove,
  onSquareClick,
  showLeaderIndicator = true,
  pieceDefinitions,
  hoverMovesEnabled = true,
  animatingMove = null,
}: BoardProps) => {
  const [hoveredPiece, setHoveredPiece] = useState<Position | null>(null);
  const [animProgress, setAnimProgress] = useState(0);

  // Calculate animation progress using useEffect for smooth animation
  useEffect(() => {
    if (!animatingMove) {
      setAnimProgress(0);
      return;
    }

    let animationFrameId: number;
    const startTime = animatingMove.startTime;
    const duration = animatingMove.duration;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimProgress(progress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animatingMove]);

  // Calculate hover moves for the hovered piece
  const hoverMoveSet = useMemo(() => {
    const set = new Map<string, { isCapture: boolean }>();
    if (!hoverMovesEnabled || !hoveredPiece) return set;
    const piece = board[hoveredPiece.row]?.[hoveredPiece.col];
    if (!piece) return set;

    const moves = getValidMovesForPiece(board, piece, hoveredPiece, pieceDefinitions, boardSize);
    for (const move of moves) {
      const targetPiece = board[move.row]?.[move.col];
      set.set(`${move.row},${move.col}`, { isCapture: !!targetPiece });
    }
    return set;
  }, [board, hoveredPiece, pieceDefinitions, boardSize, hoverMovesEnabled]);

  const squares = useMemo(() => {
    const squares: SquareProps[] = [];

    for (let row = 0; row < boardSize.rows; row++) {
      for (let col = 0; col < boardSize.cols; col++) {
        const position: Position = { row, col };
        const isLight = (row + col) % 2 === 0;
        const piece = board[row][col];

        // Check if this is the destination of animating move
        const isAnimatingTo = animatingMove &&
          animatingMove.to.row === row && animatingMove.to.col === col;

        const isLastMoveFrom = lastMove?.from.row === row && lastMove?.from.col === col;
        const isLastMoveTo = lastMove?.to.row === row && lastMove?.to.col === col;

        // Hover move info
        const hoverMoveInfo = hoverMoveSet.get(`${row},${col}`);

        // During animation, don't show the piece at the destination square
        const displayPiece = isAnimatingTo ? null : piece;

        squares.push({
          position,
          squareSize,
          isLight,
          isLeftCol: col === 0,
          isBottomRow: row === boardSize.rows - 1,
          boardRows: boardSize.rows,
          isHoverMove: !!hoverMoveInfo,
          isHoverCapture: !!hoverMoveInfo?.isCapture,
          isLastMoveFrom,
          isLastMoveTo,
          piece: displayPiece,
          onClick: () => onSquareClick(position),
          showLeaderIndicator,
          pieceDefinitions,
        });
      }
    }

    return squares;
  }, [board, boardSize, squareSize, lastMove, onSquareClick, showLeaderIndicator, hoverMoveSet, animatingMove, pieceDefinitions]);

  const boardWidth = boardSize.cols * squareSize;
  const boardHeight = boardSize.rows * squareSize;

  return (
    <div
      className="chess-board"
      style={{
        width: boardWidth,
        height: boardHeight,
        display: 'grid',
        gridTemplateColumns: `repeat(${boardSize.cols}, ${squareSize}px)`,
        gridTemplateRows: `repeat(${boardSize.rows}, ${squareSize}px)`,
      }}
      role="grid"
      aria-label="Chess board"
    >
      {squares.map((squareProps, index) => (
        <Square
          key={index}
          {...squareProps}
          onMouseEnter={() => {
            if (hoverMovesEnabled && squareProps.piece) {
              setHoveredPiece(squareProps.position);
            }
          }}
          onMouseLeave={() => setHoveredPiece(null)}
        />
      ))}
      {/* Animating piece rendered at board level for proper positioning */}
      {animatingMove && (
        <AnimatingPiece
          piece={animatingMove.piece}
          from={animatingMove.from}
          to={animatingMove.to}
          progress={animProgress}
          squareSize={squareSize}
          pieceDefinitions={pieceDefinitions}
        />
      )}
    </div>
  );
};