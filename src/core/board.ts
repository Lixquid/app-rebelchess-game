/**
 * Board operations for Rebel Chess
 */

import type {
  BoardSize,
  Piece,
  Position,
  PieceSetup,
  Color,
} from './types';
import { createPiece } from './types';

/**
 * Creates an empty board of the given size
 */
export const createEmptyBoard = (size: BoardSize): (Piece | null)[][] => {
  return Array(size.rows)
    .fill(null)
    .map(() => Array(size.cols).fill(null));
};

/**
 * Creates the default 8x8 chess board setup
 */
export const createDefaultBoard = (size: BoardSize = { rows: 8, cols: 8 }): (Piece | null)[][] => {
  const board = createEmptyBoard(size);

  if (size.rows !== 8 || size.cols !== 8) {
    return board;
  }

  const backRank: PieceSetup[] = [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ];

  const whiteBackRank: PieceSetup[] = [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ];

  backRank.forEach((setup, col) => {
    board[0][col] = createPiece(setup.type, setup.color);
  });

  for (let col = 0; col < 8; col++) {
    board[1][col] = createPiece('pawn', 'black');
  }

  for (let col = 0; col < 8; col++) {
    board[6][col] = createPiece('pawn', 'white');
  }

  whiteBackRank.forEach((setup, col) => {
    board[7][col] = createPiece(setup.type, setup.color);
  });

  return board;
};

/**
 * Creates a board from a 2D array of PieceSetup
 */
export const createBoardFromSetup = (
  setup: (PieceSetup | null)[][],
  size: BoardSize
): (Piece | null)[][] => {
  const board = createEmptyBoard(size);

  for (let row = 0; row < Math.min(setup.length, size.rows); row++) {
    for (let col = 0; col < Math.min(setup[row].length, size.cols); col++) {
      const pieceSetup = setup[row][col];
      if (pieceSetup) {
        board[row][col] = createPiece(pieceSetup.type, pieceSetup.color);
      }
    }
  }

  return board;
};

/**
 * Gets a piece at a position
 */
export const getPieceAt = (
  board: (Piece | null)[][],
  position: Position
): Piece | null => {
  if (position.row < 0 || position.row >= board.length) return null;
  if (position.col < 0 || position.col >= board[0].length) return null;
  return board[position.row][position.col];
};

/**
 * Sets a piece at a position
 */
export const setPieceAt = (
  board: (Piece | null)[][],
  position: Position,
  piece: Piece | null
): void => {
  if (position.row >= 0 && position.row < board.length &&
      position.col >= 0 && position.col < board[0].length) {
    board[position.row][position.col] = piece;
  }
};

/**
 * Moves a piece from one position to another
 * Returns the captured piece (if any)
 */
export const movePiece = (
  board: (Piece | null)[][],
  from: Position,
  to: Position
): Piece | null => {
  const piece = getPieceAt(board, from);
  if (!piece) return null;

  const captured = getPieceAt(board, to);
  setPieceAt(board, to, { ...piece, hasMoved: true });
  setPieceAt(board, from, null);

  return captured;
};

/**
 * Deep clones a board
 */
export const cloneBoard = (board: (Piece | null)[][]): (Piece | null)[][] => {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
};

/**
 * Checks if a position is within board bounds
 */
export const isInBounds = (position: Position, boardSize: BoardSize): boolean => {
  return position.row >= 0 &&
         position.row < boardSize.rows &&
         position.col >= 0 &&
         position.col < boardSize.cols;
};

/**
 * Gets all pieces of a given color
 */
export const getPiecesByColor = (
  board: (Piece | null)[][],
  color: Color
): { piece: Piece; position: Position }[] => {
  const pieces: { piece: Piece; position: Position }[] = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        pieces.push({ piece, position: { row, col } });
      }
    }
  }

  return pieces;
};

/**
 * Gets all possible moves for a player
 */
export const getAllValidMoves = (
  board: (Piece | null)[][],
  color: Color,
  pieceDefinitions: Record<string, any>,
  boardSize: BoardSize,
  getValidMovesForPiece: (
    board: (Piece | null)[][],
    piece: Piece,
    position: Position,
    pieceDefinitions: Record<string, any>,
    boardSize: BoardSize
  ) => Position[]
): { piece: Piece; from: Position; to: Position }[] => {
  const moves: { piece: Piece; from: Position; to: Position }[] = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMovesForPiece(board, piece, { row, col }, pieceDefinitions, boardSize);
        for (const to of validMoves) {
          moves.push({ piece, from: { row, col }, to });
        }
      }
    }
  }

  return moves;
};

/**
 * Filters moves to only capturing moves
 */
export const filterCaptureMoves = (
  board: (Piece | null)[][],
  moves: { piece: Piece; from: Position; to: Position }[],
  color: Color
): { piece: Piece; from: Position; to: Position }[] => {
  return moves.filter(move => {
    const target = getPieceAt(board, move.to);
    return target !== null && target.color !== color;
  });
};

/**
 * Checks if a move results in pawn promotion
 */
export const isPromotionMove = (
  piece: Piece,
  to: Position,
  boardSize: BoardSize
): boolean => {
  if (piece.type !== 'pawn') return false;
  
  if (piece.color === 'white') {
    return to.row === 0;
  } else {
    return to.row === boardSize.rows - 1;
  }
};

/**
 * Promotes a pawn to a queen (or other piece)
 */
export const promotePawn = (
  board: (Piece | null)[][],
  position: Position,
  promoteTo: Piece['type'] = 'queen'
): void => {
  const piece = getPieceAt(board, position);
  if (piece && piece.type === 'pawn') {
    setPieceAt(board, position, { ...piece, type: promoteTo });
  }
};