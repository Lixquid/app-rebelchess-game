/**
 * Core type definitions and small shared helpers for Rebel Chess
 */

export type Color = 'white' | 'black';
export type PieceType = 'pawn' | 'rook' | 'bishop' | 'queen' | 'king' | 'knight' | 'alfil' | 'camel' | 'man' | 'amazon' | 'princess' | 'empress' | 'ferz' | 'nightrider' | 'dabbabah' | 'berolina-pawn' | 'centaur' | 'sergeant';
export type LeaderType = 'king' | 'queen' | 'custom';
export type MoveMode = 'regular' | 'capture-first';
export type AIProfile = 'bloodthirsty' | 'random';
export type VictoryCondition = 'capture-leader' | 'capture-all';

export interface Position {
  row: number;
  col: number;
}

export interface BoardSize {
  rows: number;
  cols: number;
}

export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
  isLeader?: boolean;
  id?: string;
}

export interface PieceSetup {
  type: PieceType;
  color: Color;
}

export interface PieceMove {
  dr: number;
  dc: number;
  repeatable?: boolean;
  jumping?: boolean;
  firstMoveOnly?: boolean;
  captureOnly?: boolean;
  nonCaptureOnly?: boolean;
}

export interface PieceDefinition {
  type: PieceType;
  moves: PieceMove[];
  isLeader: boolean;
  unicode?: string;
}

export type PieceDefinitions = Record<PieceType, PieceDefinition>;

export interface GameConfig {
  boardSize: BoardSize;
  pieceDefinitions: PieceDefinitions;
  initialSetup?: (PieceSetup | null)[][];
  leaderType?: LeaderType;
  customLeaderType?: PieceType;
  moveMode?: MoveMode;
  victoryCondition?: VictoryCondition;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  timestamp: number;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: Color;
  boardSize: BoardSize;
  pieceDefinitions: PieceDefinitions;
  gameOver: boolean;
  winner: Color | 'draw' | null;
  moveHistory: Move[];
  capturedPieces: { white: Piece[]; black: Piece[] };
  moveMode: MoveMode;
  victoryCondition: VictoryCondition;
  // Animation state
  animatingMove?: {
    piece: Piece;
    from: Position;
    to: Position;
    startTime: number;
    duration: number;
  } | null;
}

export interface AIConfig {
  profile: AIProfile;
  /** If true (capture-first mode), the AI must capture when a capture is available */
  captureFirst?: boolean;
}

export interface AIMove {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isCapture: boolean;
  score?: number;
}

/**
 * Board preset for different game configurations
 */
export interface BoardPreset {
  id: string;
  name: string;
  description: string;
  type: string;
  boardSize: BoardSize;
  initialSetup?: (PieceSetup | null)[][] | (() => (PieceSetup | null)[][]);
  leaderType: LeaderType;
  customLeaderType?: PieceType;
}

/**
 * Default 8x8 board size
 */
export const defaultBoardSize: BoardSize = { rows: 8, cols: 8 };

/**
 * Creates a new piece with a unique ID
 */
export const createPiece = (type: PieceType, color: Color): Piece => {
  return {
    type,
    color,
    hasMoved: false,
    isLeader: type === 'king',
    id: `${color}-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  };
};

/**
 * Gets the opposite color
 */
export const oppositeColor = (color: Color): Color => {
  return color === 'white' ? 'black' : 'white';
};

/**
 * Checks if a position is within board bounds
 */
export const isValidPosition = (pos: Position, boardSize: BoardSize): boolean => {
  return pos.row >= 0 && pos.row < boardSize.rows && pos.col >= 0 && pos.col < boardSize.cols;
};