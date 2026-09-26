/**
 * Board presets for Rebel Chess
 * Preset data and setup generators, kept separate from type definitions.
 */

import type {
  BoardPreset,
  Color,
  PieceSetup,
  PieceType,
} from './types';

/**
 * Classic 8x8 Chess board preset
 */
export const classicBoardPreset: BoardPreset = {
  id: 'classic',
  name: 'Classic Chess',
  description: 'Standard 8x8 chess board',
  type: 'Classic',
  boardSize: { rows: 8, cols: 8 },
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
    const backRank = generateChess960BackRank();
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
 * Generates a valid Chess960 back rank:
 * - Bishops on opposite colors
 * - King between rooks
 */
const generateChess960BackRank = (): PieceType[] => {
  const pieceCounts: { type: PieceType; count: number }[] = [
    { type: 'rook', count: 2 },
    { type: 'knight', count: 2 },
    { type: 'bishop', count: 2 },
    { type: 'queen', count: 1 },
    { type: 'king', count: 1 },
  ];

  for (;;) {
    // Create array with all pieces
    const allPieces: PieceType[] = [];
    for (const p of pieceCounts) {
      for (let i = 0; i < p.count; i++) {
        allPieces.push(p.type);
      }
    }
    // Fisher-Yates shuffle
    for (let i = allPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPieces[i], allPieces[j]] = [allPieces[j], allPieces[i]];
    }

    // 1. Bishops on opposite colors
    const bishopIndices = allPieces
      .map((p, i) => (p === 'bishop' ? i : -1))
      .filter(i => i !== -1);
    const bishopsOppositeColors = (bishopIndices[0] % 2) !== (bishopIndices[1] % 2);

    // 2. King between rooks
    const kingIndex = allPieces.indexOf('king');
    const rookIndices = allPieces
      .map((p, i) => (p === 'rook' ? i : -1))
      .filter(i => i !== -1);
    const kingBetweenRooks = rookIndices[0] < kingIndex && kingIndex < rookIndices[1];

    if (bishopsOppositeColors && kingBetweenRooks) {
      return allPieces;
    }
  }
};

/**
 * Demi-chess 4x8 board preset
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
 * Silverman 4x5 board preset
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
 * Microchess 4x5 board preset
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
    Array.from({ length: 16 }, () => ({ type: 'pawn' as PieceType, color: 'black' as Color })),
    // Empty rows 2-5
    [],
    [],
    [],
    [],
    // White pawns (row 6) - 16 pawns
    Array.from({ length: 16 }, () => ({ type: 'pawn' as PieceType, color: 'white' as Color })),
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
    Array.from({ length: 8 }, () => ({ type: 'berolina-pawn' as PieceType, color: 'black' as Color })),
    // Empty rows 2-5
    [],
    [],
    [],
    [],
    // White Berolina Pawns
    Array.from({ length: 8 }, () => ({ type: 'berolina-pawn' as PieceType, color: 'white' as Color })),
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

    // Ensure exactly one king for each side (replace a random position with king)
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
 * Resolves initialSetup to an array, calling the generator function if needed
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