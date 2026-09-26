/**
 * Core module exports for Rebel Chess
 */

// Types and helpers
export type {
  Color,
  PieceType,
  LeaderType,
  MoveMode,
  AIProfile,
  Position,
  BoardSize,
  Piece,
  PieceSetup,
  PieceMove,
  PieceDefinition,
  PieceDefinitions,
  GameConfig,
  Move,
  GameState,
  AIConfig,
  AIMove,
  BoardPreset,
} from './types';

export {
  createPiece,
  defaultBoardSize,
  oppositeColor,
  isValidPosition,
} from './types';

// Board presets
export {
  boardPresets,
  classicBoardPreset,
  chess960Preset,
  fairyMixChessPreset,
  demiChessPreset,
  silvermanPreset,
  microchessPreset,
  doublewidePreset,
  berolinaChessPreset,
  getBoardPreset,
  resolveInitialSetup,
} from './presets';

// Piece logic
export {
  defaultPieceDefinitions,
  getPieceDefinition,
  getValidMovesForPiece,
  findLeaderPiece,
  hasLostLeader,
  getAllValidMovesForPlayer,
  filterCaptureMoves,
  isPositionAttacked,
  isLeaderInCheck,
  hasValidMoves,
  checkGameOver,
  isPromotionMove,
  promotePawn,
  getPieceAt,
} from './pieces';

// Board operations
export {
  createEmptyBoard,
  createDefaultBoard,
  createBoardFromSetup,
  movePiece,
  cloneBoard,
} from './board';

// Game logic
export {
  createGameState,
  executeMove,
  makeRandomMoveForPiece,
  makeAIMove,
  getPiece,
  getGameStatusText,
  createDefaultGameConfig,
} from './game';

// AI
export {
  makeAIMove as aiMakeMove,
  getBloodthirstyMove,
  getRandomMove,
} from './ai';