/**
 * AI implementation for Rebel Chess
 */

import type {
  Position,
  Color,
  Piece,
  PieceDefinitions,
  BoardSize,
} from './types';
import {
  getAllValidMovesForPlayer,
  filterCaptureMoves,
  getPieceAt,
} from './pieces';

export type AIProfile = 'bloodthirsty' | 'random';

export interface AIConfig {
  profile: AIProfile;
  depth?: number;
}

export interface AIMove {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isCapture: boolean;
  score?: number;
}

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
 * Bloodthirsty AI: Always captures if possible, otherwise random move
 */
export const getBloodthirstyMove = (
  board: (Piece | null)[][],
  currentPlayer: Color,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize
): AIMove | null => {
  console.log('[getBloodthirstyMove] Called for player:', currentPlayer);
  const allMoves = getAllValidMovesForPlayer(
    board,
    currentPlayer,
    pieceDefinitions,
    boardSize
  );
  console.log('[getBloodthirstyMove] All valid moves:', allMoves.length);

  if (allMoves.length === 0) {
    console.log('[getBloodthirstyMove] No valid moves');
    return null;
  }

  const captureMoves = filterCaptureMoves(board, allMoves, currentPlayer);
  console.log('[getBloodthirstyMove] Capture moves available:', captureMoves.length);

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
    console.log('[getBloodthirstyMove] Selected capture move:', move, 'captured:', capturedPiece);
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
  console.log('[getBloodthirstyMove] No captures, random move:', randomMove);
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
  boardSize: BoardSize
): AIMove | null => {
  console.log('[getRandomMove] Called for player:', currentPlayer);
  const allMoves = getAllValidMovesForPlayer(
    board,
    currentPlayer,
    pieceDefinitions,
    boardSize
  );
  console.log('[getRandomMove] All valid moves:', allMoves.length);

  if (allMoves.length === 0) {
    console.log('[getRandomMove] No valid moves');
    return null;
  }

  const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
  const piece = getPieceAt(board, randomMove.from);
  const capturedPiece = getPieceAt(board, randomMove.to);
  const isCapture = capturedPiece !== null && capturedPiece.color !== currentPlayer;
  console.log('[getRandomMove] Selected random move:', randomMove, 'isCapture:', isCapture);

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
  console.log('[makeAIMove] Called with profile:', config.profile);
  switch (config.profile) {
    case 'bloodthirsty':
      return getBloodthirstyMove(board, currentPlayer, pieceDefinitions, boardSize);
    case 'random':
      return getRandomMove(board, currentPlayer, pieceDefinitions, boardSize);
    default:
      console.log('[makeAIMove] Unknown profile, defaulting to bloodthirsty');
      return getBloodthirstyMove(board, currentPlayer, pieceDefinitions, boardSize);
  }
};

/**
 * Evaluates a board position from the perspective of a color
 */
export const evaluatePosition = (
  board: (Piece | null)[][],
  _pieceDefinitions: PieceDefinitions,
  _boardSize: BoardSize,
  perspective: Color = 'white'
): number => {
  let score = 0;
  const multiplier = perspective === 'white' ? 1 : -1;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type] || 0;
        if (piece.color === 'white') {
          score += value;
        } else {
          score -= value;
        }
      }
    }
  }

  return score * multiplier;
};

/**
 * AI Profile configurations
 */
export const AIProfiles: Record<AIProfile, { name: string; description: string }> = {
  bloodthirsty: {
    name: 'Bloodthirsty',
    description: 'Always captures if possible, otherwise moves randomly',
  },
  random: {
    name: 'Random',
    description: 'Moves completely randomly',
  },
};

/**
 * Creates an AI config from a profile name
 */
export const createAIConfig = (profileName: string, depth?: number): AIConfig => {
  const profile = profileName as AIProfile;
  if (!AIProfiles[profile]) {
    return { profile: 'bloodthirsty', depth };
  }
  return { profile, depth };
};