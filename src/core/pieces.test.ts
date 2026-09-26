import { describe, it, expect } from 'vitest';
import {
  defaultPieceDefinitions,
  getValidMovesForPiece,
  getAllValidMovesForPlayer,
  filterCaptureMoves,
  checkGameOver,
  isPromotionMove,
} from './pieces';
import { createDefaultBoard, createEmptyBoard, cloneBoard } from './board';
import type { BoardSize, Piece } from './types';

const SIZE_8: BoardSize = { rows: 8, cols: 8 };

const pawn = (color: 'white' | 'black'): Piece => ({ type: 'pawn', color, hasMoved: false });

const place = (board: (Piece | null)[][], row: number, col: number, piece: Piece | null) => {
  board[row][col] = piece;
};

describe('getValidMovesForPiece', () => {
  it('white pawn on starting rank has 2 non-capture moves', () => {
    const board = createEmptyBoard(SIZE_8);
    place(board, 6, 3, pawn('white'));
    const moves = getValidMovesForPiece(board, board[6][3]!, { row: 6, col: 3 }, defaultPieceDefinitions, SIZE_8);
    expect(moves).toEqual([{ row: 5, col: 3 }, { row: 4, col: 3 }]);
  });

  it('white pawn loses the double move after moving', () => {
    const board = createEmptyBoard(SIZE_8);
    const p = { ...pawn('white'), hasMoved: true };
    place(board, 5, 3, p);
    const moves = getValidMovesForPiece(board, p, { row: 5, col: 3 }, defaultPieceDefinitions, SIZE_8);
    expect(moves).toEqual([{ row: 4, col: 3 }]);
  });

  it('black pawn moves in the opposite direction', () => {
    const board = createEmptyBoard(SIZE_8);
    place(board, 1, 3, pawn('black'));
    const moves = getValidMovesForPiece(board, board[1][3]!, { row: 1, col: 3 }, defaultPieceDefinitions, SIZE_8);
    expect(moves).toEqual([{ row: 2, col: 3 }, { row: 3, col: 3 }]);
  });

  it('pawn cannot move forward through an occupied square', () => {
    const board = createEmptyBoard(SIZE_8);
    place(board, 6, 3, pawn('white'));
    place(board, 5, 3, pawn('black'));
    const moves = getValidMovesForPiece(board, board[6][3]!, { row: 6, col: 3 }, defaultPieceDefinitions, SIZE_8);
    expect(moves).toEqual([]);
  });

  it('pawn can capture diagonally and still move forward', () => {
    const board = createEmptyBoard(SIZE_8);
    place(board, 6, 3, pawn('white'));
    place(board, 5, 2, pawn('black'));
    const moves = getValidMovesForPiece(board, board[6][3]!, { row: 6, col: 3 }, defaultPieceDefinitions, SIZE_8);
    expect(moves).toEqual([{ row: 5, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 2 }]);
  });

  it('rook slides but is blocked by friendly pieces', () => {
    const board = createEmptyBoard(SIZE_8);
    const rook: Piece = { type: 'rook', color: 'white', hasMoved: false };
    place(board, 4, 4, rook);
    place(board, 4, 6, { type: 'rook', color: 'white', hasMoved: false });
    const moves = getValidMovesForPiece(board, rook, { row: 4, col: 4 }, defaultPieceDefinitions, SIZE_8);
    // Rightward slides stop before col 6
    const rightMoves = moves.filter(m => m.row === 4 && m.col > 4);
    expect(rightMoves).toEqual([{ row: 4, col: 5 }]);
  });

  it('rook captures the first enemy piece in a line and stops', () => {
    const board = createEmptyBoard(SIZE_8);
    const rook: Piece = { type: 'rook', color: 'white', hasMoved: false };
    place(board, 4, 4, rook);
    place(board, 4, 6, { type: 'rook', color: 'black', hasMoved: false });
    const moves = getValidMovesForPiece(board, rook, { row: 4, col: 4 }, defaultPieceDefinitions, SIZE_8);
    expect(moves).toContainEqual({ row: 4, col: 6 });
    expect(moves).not.toContainEqual({ row: 4, col: 7 });
  });

  it('knight jumps over pieces', () => {
    const board = createEmptyBoard(SIZE_8);
    const knight: Piece = { type: 'knight', color: 'white', hasMoved: false };
    place(board, 4, 4, knight);
    // A friendly pawn directly in front of the knight must not block it
    place(board, 5, 4, { type: 'pawn', color: 'white', hasMoved: false });
    const moves = getValidMovesForPiece(board, knight, { row: 4, col: 4 }, defaultPieceDefinitions, SIZE_8);
    expect(moves).toContainEqual({ row: 2, col: 3 });
    expect(moves).toContainEqual({ row: 6, col: 5 });
    expect(moves).toHaveLength(8); // from the center, all 8 knight moves are on-board
  });

  it('berolina pawn moves diagonally and captures straight', () => {
    const board = createEmptyBoard(SIZE_8);
    const berolina: Piece = { type: 'berolina-pawn', color: 'white', hasMoved: false };
    place(board, 6, 3, berolina);
    place(board, 5, 3, { type: 'rook', color: 'black', hasMoved: false });
    const moves = getValidMovesForPiece(board, berolina, { row: 6, col: 3 }, defaultPieceDefinitions, SIZE_8);
    // Straight-ahead square is a capture, diagonals are quiet moves
    expect(moves).toContainEqual({ row: 5, col: 3 });
    expect(moves).toContainEqual({ row: 5, col: 2 });
    expect(moves).toContainEqual({ row: 5, col: 4 });
  });

  it('all generated moves stay within board bounds', () => {
    const board = createDefaultBoard(SIZE_8);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece) continue;
        const moves = getValidMovesForPiece(board, piece, { row, col }, defaultPieceDefinitions, SIZE_8);
        for (const m of moves) {
          expect(m.row).toBeGreaterThanOrEqual(0);
          expect(m.row).toBeLessThan(8);
          expect(m.col).toBeGreaterThanOrEqual(0);
          expect(m.col).toBeLessThan(8);
        }
      }
    }
  });
});

describe('getAllValidMovesForPlayer / filterCaptureMoves', () => {
  it('returns moves only for the requested color', () => {
    const board = createDefaultBoard(SIZE_8);
    const whiteMoves = getAllValidMovesForPlayer(board, 'white', defaultPieceDefinitions, SIZE_8);
    expect(whiteMoves.length).toBeGreaterThan(0);
    expect(whiteMoves.every(m => m.piece.color === 'white')).toBe(true);
  });

  it('filterCaptureMoves keeps only moves onto enemy pieces', () => {
    const board = createEmptyBoard(SIZE_8);
    const rook: Piece = { type: 'rook', color: 'white', hasMoved: false };
    place(board, 4, 4, rook);
    place(board, 4, 0, { type: 'rook', color: 'black', hasMoved: false });
    place(board, 4, 7, { type: 'rook', color: 'white', hasMoved: false });
    const moves = getAllValidMovesForPlayer(board, 'white', defaultPieceDefinitions, SIZE_8);
    const captures = filterCaptureMoves(board, moves, 'white');
    expect(captures).toHaveLength(1);
    expect(captures[0].to).toEqual({ row: 4, col: 0 });
  });
});

describe('checkGameOver', () => {
  it('does not end the game while both leaders remain on the board', () => {
    const board = createEmptyBoard(SIZE_8);
    place(board, 0, 0, { type: 'king', color: 'black', hasMoved: false });
    place(board, 7, 0, { type: 'rook', color: 'white', hasMoved: false });
    place(board, 7, 7, { type: 'king', color: 'white', hasMoved: false });
    const result = checkGameOver(board, defaultPieceDefinitions, 'capture-leader', 'white');
    expect(result).toEqual({ gameOver: false, winner: null });
  });

  it('white wins when black has no leader', () => {
    const board = createEmptyBoard(SIZE_8);
    place(board, 7, 0, { type: 'king', color: 'white', hasMoved: false });
    place(board, 0, 4, { type: 'rook', color: 'black', hasMoved: false });
    const result = checkGameOver(board, defaultPieceDefinitions, 'capture-leader', 'black');
    expect(result).toEqual({ gameOver: true, winner: 'white' });
  });

  it('ends capture-all game when a side has no pieces', () => {
    const board = createEmptyBoard(SIZE_8);
    place(board, 7, 0, { type: 'rook', color: 'white', hasMoved: false });
    const result = checkGameOver(board, defaultPieceDefinitions, 'capture-all', 'white');
    expect(result).toEqual({ gameOver: true, winner: 'white' });
  });

  it('a player with no legal moves loses', () => {
    const board = createEmptyBoard(SIZE_8);
    // Lone king in a corner vs. enemy queen adjacent-but-attacking scenario:
    // black king at 0,0 is surrounded by white queen at 1,1 with no escape squares
    place(board, 0, 0, { type: 'king', color: 'black', hasMoved: false });
    place(board, 1, 1, { type: 'queen', color: 'white', hasMoved: false });
    place(board, 7, 7, { type: 'king', color: 'white', hasMoved: false });
    const result = checkGameOver(board, defaultPieceDefinitions, 'capture-leader', 'black');
    // Black king can capture the queen at 1,1, so the game continues
    expect(result.gameOver).toBe(false);
  });
});

describe('isPromotionMove', () => {
  it('detects white pawn reaching the last row', () => {
    expect(isPromotionMove({ type: 'pawn', color: 'white', hasMoved: true }, { row: 0, col: 3 }, SIZE_8)).toBe(true);
    expect(isPromotionMove({ type: 'pawn', color: 'white', hasMoved: true }, { row: 1, col: 3 }, SIZE_8)).toBe(false);
  });

  it('detects black pawn reaching the first row on any board size', () => {
    const size4: BoardSize = { rows: 4, cols: 4 };
    expect(isPromotionMove({ type: 'pawn', color: 'black', hasMoved: true }, { row: 3, col: 0 }, size4)).toBe(true);
  });

  it('never applies to non-pawns', () => {
    expect(isPromotionMove({ type: 'queen', color: 'white', hasMoved: true }, { row: 0, col: 3 }, SIZE_8)).toBe(false);
  });
});

describe('cloneBoard', () => {
  it('produces an independent copy', () => {
    const board = createDefaultBoard(SIZE_8);
    const clone = cloneBoard(board);
    clone[0][0]!.hasMoved = true;
    expect(board[0][0]!.hasMoved).toBe(false);
    expect(clone[0][0]!.hasMoved).toBe(true);
  });
});