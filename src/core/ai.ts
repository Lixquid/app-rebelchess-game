/**
 * AI implementation for Rebel Chess
 */

import type {
  Color,
  Piece,
  PieceDefinitions,
  BoardSize,
  AIConfig,
  AIMove,
} from './types';
import {
  getAllValidMovesForPlayer,
  filterCaptureMoves,
  getPieceAt,
} from './pieces';

const PIECE_VALUES: Record<string, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
  alfil: 200,
  camel: 350,
};

/**
 * Bloodthirsty AI: Always captures if possible (highest-value target first),
 * otherwise makes a random move
 */
export const getBloodthirstyMove = (
  board: (Piece | null)[][],
  currentPlayer: Color,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize
): AIMove | null => {
  const allMoves = getAllValidMovesForPlayer(board, currentPlayer, pieceDefinitions, boardSize);
  if (allMoves.length === 0) {
    return null;
  }

  const captureMoves = filterCaptureMoves(board, allMoves, currentPlayer);
  if (captureMoves.length > 0) {
    const sortedCaptures = [...captureMoves].sort((a, b) => {
      const targetA = board[a.to.row][a.to.col];
      const targetB = board[b.to.row][b.to.col];
      const valueA = targetA ? PIECE_VALUES[targetA.type] || 0 : 0;
      const valueB = targetB ? PIECE_VALUES[targetB.type] || 0 : 0;
      return valueB - valueA;
    });

    const move = sortedCaptures[0];
    const piece = getPieceAt(board, move.from);
    const capturedPiece = getPieceAt(board, move.to);
    return {
      from: move.from,
      to: move.to,
      piece: piece!,
      capturedPiece: capturedPiece || undefined,
      isCapture: true,
    };
  }

  const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
  const piece = getPieceAt(board, randomMove.from);
  return {
    from: randomMove.from,
    to: randomMove.to,
    piece: piece!,
    isCapture: false,
  };
};

/**
 * Random AI: Picks a completely random valid move
 */
export const getRandomMove = (
  board: (Piece | null)[][],
  currentPlayer: Color,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize,
  captureFirst = false
): AIMove | null => {
  const allMoves = getAllValidMovesForPlayer(board, currentPlayer, pieceDefinitions, boardSize);
  if (allMoves.length === 0) {
    return null;
  }

  // Pick a random piece first, then a random move for it. Capture-first mode
  // constrains the chosen piece's move (must capture if it can) but never
  // restricts which piece is selected.
  const movesByPiece = new Map<string, typeof allMoves>();
  for (const move of allMoves) {
    const key = `${move.from.row},${move.from.col}`;
    const list = movesByPiece.get(key);
    if (list) {
      list.push(move);
    } else {
      movesByPiece.set(key, [move]);
    }
  }
  const pieceMoveLists = [...movesByPiece.values()];
  let chosenMoves = pieceMoveLists[Math.floor(Math.random() * pieceMoveLists.length)];

  if (captureFirst) {
    const captures = chosenMoves.filter(m => {
      const target = board[m.to.row][m.to.col];
      return target !== null && target.color !== currentPlayer;
    });
    if (captures.length > 0) {
      chosenMoves = captures;
    }
  }

  const randomMove = chosenMoves[Math.floor(Math.random() * chosenMoves.length)];
  const piece = getPieceAt(board, randomMove.from);
  const capturedPiece = getPieceAt(board, randomMove.to);
  const isCapture = capturedPiece !== null && capturedPiece.color !== currentPlayer;

  return {
    from: randomMove.from,
    to: randomMove.to,
    piece: piece!,
    capturedPiece: isCapture ? capturedPiece : undefined,
    isCapture,
  };
};

/**
 * Gets an AI move based on the configured profile
 */
export const makeAIMove = (
  board: (Piece | null)[][],
  currentPlayer: Color,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize,
  config: AIConfig
): AIMove | null => {
  switch (config.profile) {
    case 'random':
      return getRandomMove(board, currentPlayer, pieceDefinitions, boardSize, config.captureFirst);
    case 'bloodthirsty':
    default:
      return getBloodthirstyMove(board, currentPlayer, pieceDefinitions, boardSize);
  }
};