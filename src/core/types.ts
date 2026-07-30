/**
 * Core type definitions for Rebel Chess
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
  selectedPiece: Position | null;
  validMoves: Position[];
  status: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
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
 * Classic 8x8 Chess board preset
 */
export const classicBoardPreset: BoardPreset = {
  id: 'classic',
  name: 'Classic Chess',
  description: 'Standard 8x8 chess board',
  type: 'Classic',
  boardSize: { rows: 8, cols: 8 },
  initialSetup: undefined,
  leaderType: 'king',
};

/**
 * Chess960 (Fischer Random Chess) board preset
 * Randomizes the back rank pieces with constraints:
 * - Bishops on opposite colors
 * - King between rooks
 */
export const chess960Preset: BoardPreset = {
  id: 'chess960',
  name: 'Chess960',
  description: 'Fischer Random Chess - randomized back rank with bishops on opposite colors and king between rooks',
  type: 'Classic',
  boardSize: { rows: 8, cols: 8 },
  leaderType: 'king',
  initialSetup: () => {
    // Generate a valid Chess960 position
    const pieces = [
      { type: 'rook' as PieceType, count: 2 },
      { type: 'knight' as PieceType, count: 2 },
      { type: 'bishop' as PieceType, count: 2 },
      { type: 'queen' as PieceType, count: 1 },
      { type: 'king' as PieceType, count: 1 },
    ];

    let backRank: PieceType[] = [];
    let valid = false;

    while (!valid) {
      // Create array with all pieces
      const allPieces: PieceType[] = [];
      for (const p of pieces) {
        for (let i = 0; i < p.count; i++) {
          allPieces.push(p.type);
        }
      }
      // Shuffle
      for (let i = allPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPieces[i], allPieces[j]] = [allPieces[j], allPieces[i]];
      }
      backRank = allPieces;

      // Check constraints:
      // 1. Bishops on opposite colors
      const bishopIndices = backRank
        .map((p, i) => (p === 'bishop' ? i : -1))
        .filter(i => i !== -1);
      const bishopsOppositeColors = (bishopIndices[0] % 2) !== (bishopIndices[1] % 2);

      // 2. King between rooks
      const kingIndex = backRank.indexOf('king');
      const rookIndices = backRank
        .map((p, i) => (p === 'rook' ? i : -1))
        .filter(i => i !== -1);
      const kingBetweenRooks = rookIndices[0] < kingIndex && kingIndex < rookIndices[1];

      valid = bishopsOppositeColors && kingBetweenRooks;
    }

    const setup: (PieceSetup | null)[][] = [];

    // Black back rank (row 0)
    setup[0] = backRank.map(type => ({ type, color: 'black' as Color }));
    // Black pawns (row 1)
    setup[1] = Array(8).fill(null).map(() => ({ type: 'pawn' as PieceType, color: 'black' as Color }));
    // Empty rows 2-5
    for (let i = 2; i < 6; i++) {
      setup[i] = Array(8).fill(null);
    }
    // White pawns (row 6)
    setup[6] = Array(8).fill(null).map(() => ({ type: 'pawn' as PieceType, color: 'white' as Color }));
    // White back rank (row 7) - mirror of black
    setup[7] = backRank.map(type => ({ type, color: 'white' as Color }));

    return setup;
  },
};

/**
 * Resolves initialSetup to an array, calling the function if needed
 */
export const resolveInitialSetup = (
  preset: BoardPreset
): (PieceSetup | null)[][] | undefined => {
  if (!preset.initialSetup) return undefined;
  if (typeof preset.initialSetup === 'function') {
    return preset.initialSetup();
  }
  return preset.initialSetup;
};

/**
 * Demi-chess 4x8 board preset (from BOARDS.md)
 */
export const demiChessPreset: BoardPreset = {
  id: 'demi-chess',
  name: 'Demi-chess',
  description: '4x8 board with reduced pieces',
  type: 'Small',
  boardSize: { rows: 8, cols: 4 },
  leaderType: 'king',
  initialSetup: [
    [
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' },
    ],
    [
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
    ],
    [],
    [],
    [],
    [],
    [
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
    ],
    [
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' },
    ],
  ],
};

/**
 * Silverman 4x5 board preset (from BOARDS.md)
 */
export const silvermanPreset: BoardPreset = {
  id: 'silverman',
  name: 'Silverman',
  description: '4x5 board with queens',
  type: 'Small',
  boardSize: { rows: 5, cols: 4 },
  leaderType: 'king',
  initialSetup: [
    [
      { type: 'rook', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'rook', color: 'black' },
    ],
    [
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
    ],
    [],
    [
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
    ],
    [
      { type: 'rook', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'king', color: 'white' },
    ],
  ],
};

/**
 * Microchess 4x5 board preset (from BOARDS.md)
 */
export const microchessPreset: BoardPreset = {
  id: 'microchess',
  name: 'Microchess',
  description: '4x5 board with single pawn',
  type: 'Small',
  boardSize: { rows: 5, cols: 4 },
  leaderType: 'king',
  initialSetup: [
    [
      { type: 'king', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'rook', color: 'black' },
    ],
    [
      { type: 'pawn', color: 'black' },
      null,
      null,
      null,
    ],
    [],
    [
      null,
      null,
      null,
      { type: 'pawn', color: 'white' },
    ],
    [
      { type: 'rook', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'king', color: 'white' },
    ],
  ],
};

/**
 * Doublewide 16x8 board preset
 * Classic chess pieces but duplicated on a 16-wide board
 */
export const doublewidePreset: BoardPreset = {
  id: 'doublewide',
  name: 'Doublewide',
  description: '16x8 board with duplicated classic chess pieces',
  type: 'Large',
  boardSize: { rows: 8, cols: 16 },
  leaderType: 'king',
  initialSetup: [
    // Black back rank (row 0) - classic layout duplicated horizontally
    [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' },
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' },
    ],
    // Black pawns (row 1) - 16 pawns
    [
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
    ],
    // Empty rows 2-5
    [],
    [],
    [],
    [],
    // White pawns (row 6) - 16 pawns
    [
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
    ],
    // White back rank (row 7) - classic layout duplicated horizontally
    [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' },
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' },
    ],
  ],
};

/**
 * Berolina Chess board preset
 * Standard 8x8 chess but with Berolina Pawns (move diagonally, capture straight)
 */
export const berolinaChessPreset: BoardPreset = {
  id: 'berolina-chess',
  name: 'Berolina Chess',
  description: 'Standard 8x8 chess with Berolina Pawns (move diagonally forward, capture straight ahead)',
  type: 'Variant',
  boardSize: { rows: 8, cols: 8 },
  leaderType: 'king',
  initialSetup: [
    // Black back rank
    [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' },
    ],
    // Black Berolina Pawns
    [
      { type: 'berolina-pawn', color: 'black' },
      { type: 'berolina-pawn', color: 'black' },
      { type: 'berolina-pawn', color: 'black' },
      { type: 'berolina-pawn', color: 'black' },
      { type: 'berolina-pawn', color: 'black' },
      { type: 'berolina-pawn', color: 'black' },
      { type: 'berolina-pawn', color: 'black' },
      { type: 'berolina-pawn', color: 'black' },
    ],
    // Empty rows 2-5
    [],
    [],
    [],
    [],
    // White Berolina Pawns
    [
      { type: 'berolina-pawn', color: 'white' },
      { type: 'berolina-pawn', color: 'white' },
      { type: 'berolina-pawn', color: 'white' },
      { type: 'berolina-pawn', color: 'white' },
      { type: 'berolina-pawn', color: 'white' },
      { type: 'berolina-pawn', color: 'white' },
      { type: 'berolina-pawn', color: 'white' },
      { type: 'berolina-pawn', color: 'white' },
    ],
    // White back rank
    [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' },
    ],
  ],
};

/**
 * Fairy Mix Chess board preset
 * Random pieces on back rank from fairy chess pieces, random mix of pawns and berolina pawns
 * Both sides have mirrored setups
 */
export const fairyMixChessPreset: BoardPreset = {
  id: 'fairy-mix-chess',
  name: 'Fairy Mix Chess',
  description: 'Random fairy pieces on back rank (rook, bishop, knight, queen, alfil, camel, man, amazon, princess, empress, ferz, nightrider, dabbabah, centaur, sergeant), random pawn/berolina-pawn mix. Mirrored for both sides.',
  type: 'Fairy',
  boardSize: { rows: 8, cols: 8 },
  leaderType: 'king',
  initialSetup: () => {
    // Available fairy pieces for back rank (excluding king and pawns)
    const fairyPieces: PieceType[] = [
      'rook',
      'bishop',
      'knight',
      'queen',
      'alfil',
      'camel',
      'man',
      'amazon',
      'princess',
      'empress',
      'ferz',
      'nightrider',
      'dabbabah',
      'centaur',
      'sergeant',
    ];

    // Generate random back rank (8 pieces)
    const backRank: PieceType[] = [];
    for (let i = 0; i < 8; i++) {
      backRank.push(fairyPieces[Math.floor(Math.random() * fairyPieces.length)]);
    }

    // Ensure at least one king for each side (replace a random position with king)
    const kingPos = Math.floor(Math.random() * 8);
    backRank[kingPos] = 'king';

    // Generate random pawn row (mix of pawn, berolina-pawn, and sergeant)
    const pawnRow: PieceType[] = [];
    for (let i = 0; i < 8; i++) {
      const r = Math.random();
      if (r < 0.4) {
        pawnRow.push('pawn');
      } else if (r < 0.7) {
        pawnRow.push('berolina-pawn');
      } else {
        pawnRow.push('sergeant');
      }
    }

    const setup: (PieceSetup | null)[][] = [];

    // Black back rank (row 0)
    setup[0] = backRank.map(type => ({ type, color: 'black' as Color }));
    // Black pawns (row 1)
    setup[1] = pawnRow.map(type => ({ type, color: 'black' as Color }));
    // Empty rows 2-5
    for (let i = 2; i < 6; i++) {
      setup[i] = Array(8).fill(null);
    }
    // White pawns (row 6) - mirrored
    setup[6] = pawnRow.map(type => ({ type, color: 'white' as Color }));
    // White back rank (row 7) - mirrored
    setup[7] = backRank.map(type => ({ type, color: 'white' as Color }));

    return setup;
  },
};

/**
 * All available board presets
 */
export const boardPresets: BoardPreset[] = [
  classicBoardPreset,
  chess960Preset,
  fairyMixChessPreset,
  demiChessPreset,
  silvermanPreset,
  microchessPreset,
  doublewidePreset,
  berolinaChessPreset,
];

/**
 * Gets a board preset by ID
 */
export const getBoardPreset = (id: string): BoardPreset | undefined => {
  return boardPresets.find(p => p.id === id);
};

/**
 * Creates a new piece with a unique ID
 */
export const createPiece = (type: PieceType, color: Color): Piece => {
  return {
    type,
    color,
    hasMoved: false,
    isLeader: type === 'king',
    id: `${color}-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
};

/**
 * Creates a piece setup object
 */
export const createPieceSetup = (type: PieceType, color: Color): PieceSetup => {
  return { type, color };
};

/**
 * Default 8x8 board size
 */
export const defaultBoardSize: BoardSize = { rows: 8, cols: 8 };

/**
 * Gets the opposite color
 */
export const oppositeColor = (color: Color): Color => {
  return color === 'white' ? 'black' : 'white';
};

/**
 * Checks if two positions are equal
 */
export const positionsEqual = (a: Position, b: Position): boolean => {
  return a.row === b.row && a.col === b.col;
};

/**
 * Creates a position object
 */
export const createPosition = (row: number, col: number): Position => {
  return { row, col };
};

/**
 * Checks if a position is within board bounds
 */
export const isValidPosition = (pos: Position, boardSize: BoardSize): boolean => {
  return pos.row >= 0 && pos.row < boardSize.rows && pos.col >= 0 && pos.col < boardSize.cols;
};

/**
 * Default piece definitions (populated by pieces.ts)
 */
export const defaultPieceDefinitions: PieceDefinitions = {} as PieceDefinitions;