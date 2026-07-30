/**
 * Core module exports for Rebel Chess
 */

// Types
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

// Functions from types
export {
  createPiece,
  createPieceSetup,
  defaultBoardSize,
  oppositeColor,
  positionsEqual,
  createPosition,
  isValidPosition,
  defaultPieceDefinitions,
  classicBoardPreset,
  demiChessPreset,
  silvermanPreset,
  microchessPreset,
  boardPresets,
  getBoardPreset,
} from './types';

// Piece logic
export {
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
  defaultPieceDefinitions as pieceDefinitions,
} from './pieces';

// Board operations
export {
  createEmptyBoard,
  createDefaultBoard,
  createBoardFromSetup,
  getPieceAt,
  setPieceAt,
  movePiece,
  cloneBoard,
  isInBounds,
  getPiecesByColor,
  filterCaptureMoves as filterCaptureMovesBoard,
  isPromotionMove as isPromotionMoveBoard,
  promotePawn as promotePawnBoard,
} from './board';

// Game logic
export {
  createGameState,
  selectPiece,
  deselectPiece,
  makeMove,
  makeRandomMove,
  makeAIMove,
  getCurrentPlayerMoves,
  resetGame,
  getGameStatusText,
  isValidMove,
  getPiece,
  getValidMoves,
  createDefaultGameConfig,
} from './game';

// AI
export {
  makeAIMove as aiMakeMove,
  getBloodthirstyMove,
  getRandomMove,
  evaluatePosition,
  AIProfiles,
  createAIConfig,
} from './ai';