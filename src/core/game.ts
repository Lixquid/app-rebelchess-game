/**
 * Main game logic for Rebel Chess
 */

import type {
  GameState,
  GameConfig,
  Position,
  Piece,
  PieceDefinitions,
  Move,
  AIProfile,
} from './types';
import {
  defaultPieceDefinitions,
  getValidMovesForPiece,
  checkGameOver,
  isPromotionMove,
  promotePawn,
  oppositeColor,
  getPieceAt,
} from './pieces';
import {
  createDefaultBoard,
  createBoardFromSetup,
  movePiece,
  cloneBoard,
} from './board';
import { makeAIMove as aiMakeMove } from './ai';

/** Animation duration in milliseconds */
const ANIMATION_DURATION = 300;

/**
 * Creates a deep copy of the piece definitions so leader-flag changes
 * for one game never leak into the shared defaults or other games.
 */
const clonePieceDefinitions = (
  pieceDefinitions: PieceDefinitions
): PieceDefinitions => {
  const clone = {} as PieceDefinitions;
  for (const key of Object.keys(pieceDefinitions) as (keyof PieceDefinitions)[]) {
    clone[key] = { ...pieceDefinitions[key], moves: pieceDefinitions[key].moves.map(m => ({ ...m })) };
  }
  return clone;
};

/**
 * Applies the leader type configuration to a piece definitions object
 */
const applyLeaderType = (
  pieceDefinitions: PieceDefinitions,
  leaderType?: GameConfig['leaderType'],
  customLeaderType?: Piece['type']
): void => {
  // Reset to default first: only the king is a leader
  for (const def of Object.values(pieceDefinitions)) {
    def.isLeader = def.type === 'king';
  }

  if (leaderType === 'custom' && customLeaderType) {
    pieceDefinitions[customLeaderType].isLeader = true;
    pieceDefinitions.king.isLeader = false;
  } else if (leaderType === 'queen') {
    pieceDefinitions.queen.isLeader = true;
    pieceDefinitions.king.isLeader = false;
  }
};

/**
 * Creates a new game state with the given configuration
 */
export const createGameState = (config: GameConfig): GameState => {
  const boardSize = config.boardSize || { rows: 8, cols: 8 };
  // Always clone so we never mutate the shared defaults (or caller's object)
  const pieceDefinitions = clonePieceDefinitions(
    config.pieceDefinitions || defaultPieceDefinitions
  );
  const initialSetup = config.initialSetup;

  const board = initialSetup && initialSetup.length > 0
    ? createBoardFromSetup(initialSetup, boardSize)
    : createDefaultBoard(boardSize);

  applyLeaderType(pieceDefinitions, config.leaderType, config.customLeaderType);

  return {
    board,
    currentPlayer: 'white',
    boardSize,
    pieceDefinitions,
    gameOver: false,
    winner: null,
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    moveMode: config.moveMode || 'regular',
    victoryCondition: config.victoryCondition || 'capture-leader',
  };
};

/**
 * Applies capture-first filtering to the moves of an already-selected piece:
 * if the chosen piece has any capture available, its non-capture moves are
 * removed. This constrains how the piece moves after selection — it never
 * restricts which piece can be picked — and applies identically to human
 * and AI moves.
 */
const applyCaptureFirstFilter = (
  state: GameState,
  moves: Position[]
): Position[] => {
  if (state.moveMode !== 'capture-first' || moves.length === 0) {
    return moves;
  }
  const captures = moves.filter(m => {
    const target = state.board[m.row][m.col];
    return target !== null && target.color !== state.currentPlayer;
  });
  return captures.length > 0 ? captures : moves;
};

/**
 * Internal function to execute a move without validation
 * Used by AI, random moves, etc.
 */
export const executeMove = (
  state: GameState,
  from: Position,
  to: Position,
  piece: Piece
): GameState => {
  const newBoard = cloneBoard(state.board);
  const capturedPiece = movePiece(newBoard, from, to);

  // Handle pawn promotion
  const movedPiece = getPieceAt(newBoard, to);
  if (movedPiece && isPromotionMove(movedPiece, to, state.boardSize)) {
    promotePawn(newBoard, to, 'queen');
  }

  const move: Move = {
    from: { ...from },
    to: { ...to },
    piece: { ...piece },
    capturedPiece: capturedPiece ? { ...capturedPiece } : undefined,
    timestamp: Date.now(),
  };

  // Update captured pieces
  const newCapturedPieces = { ...state.capturedPieces };
  if (capturedPiece) {
    const color = capturedPiece.color;
    newCapturedPieces[color] = [...newCapturedPieces[color], { ...capturedPiece }];
  }

  // Check for game over
  const nextPlayer = oppositeColor(state.currentPlayer);
  const { gameOver, winner } = checkGameOver(
    newBoard,
    state.pieceDefinitions,
    state.victoryCondition,
    nextPlayer
  );

  return {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    moveHistory: [...state.moveHistory, move],
    capturedPieces: newCapturedPieces,
    gameOver,
    winner,
    animatingMove: {
      piece: { ...piece },
      from: { ...from },
      to: { ...to },
      startTime: Date.now(),
      duration: ANIMATION_DURATION,
    },
  };
};

/**
 * Makes a random move for a specific piece at the given position
 */
export const makeRandomMoveForPiece = (
  state: GameState,
  from: Position
): GameState => {
  if (state.gameOver) return state;

  const piece = getPieceAt(state.board, from);
  if (!piece || piece.color !== state.currentPlayer) {
    return state;
  }

  const validMoves = applyCaptureFirstFilter(state, getValidMovesForPiece(
    state.board,
    piece,
    from,
    state.pieceDefinitions,
    state.boardSize
  ));

  if (validMoves.length === 0) {
    return state;
  }

  const randomTo = validMoves[Math.floor(Math.random() * validMoves.length)];
  return executeMove(state, from, randomTo, piece);
};

/**
 * Makes an AI move
 */
export const makeAIMove = (
  state: GameState,
  profile: AIProfile = 'bloodthirsty'
): GameState => {
  if (state.gameOver) return state;

  // Capture-first mode constrains the AI, not the human player
  const result = aiMakeMove(
    state.board,
    state.currentPlayer,
    state.pieceDefinitions,
    state.boardSize,
    { profile, captureFirst: state.moveMode === 'capture-first' }
  );

  if (!result) {
    const { gameOver, winner } = checkGameOver(
      state.board,
      state.pieceDefinitions,
      state.victoryCondition,
      state.currentPlayer
    );
    return { ...state, gameOver, winner };
  }

  return executeMove(state, result.from, result.to, result.piece);
};

/**
 * Gets a piece at a position
 */
export const getPiece = (state: GameState, position: Position): Piece | null => {
  return getPieceAt(state.board, position);
};

/**
 * Gets the game status text
 */
export const getGameStatusText = (state: GameState): string => {
  if (state.gameOver) {
    if (state.winner === 'draw') {
      return 'Game Over - Draw!';
    }
    return `Game Over - ${state.winner === 'white' ? 'White' : 'Black'} Wins!`;
  }
  return `${state.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
};

/**
 * Creates a default game configuration
 */
export const createDefaultGameConfig = (overrides: Partial<GameConfig> = {}): GameConfig => ({
  boardSize: { rows: 8, cols: 8 },
  pieceDefinitions: defaultPieceDefinitions,
  leaderType: 'king',
  moveMode: 'regular',
  victoryCondition: 'capture-leader',
  ...overrides,
});