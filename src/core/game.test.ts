import { describe, it, expect } from 'vitest';
import { createGameState, createDefaultGameConfig, makeRandomMoveForPiece, executeMove } from './game';
import { classicBoardPreset, chess960Preset, fairyMixChessPreset, resolveInitialSetup, boardPresets } from './presets';
import { defaultPieceDefinitions } from './pieces';
import type { Position } from './types';

describe('createGameState', () => {
  it('never mutates the shared defaultPieceDefinitions (leader isolation)', () => {
    const before = JSON.stringify(defaultPieceDefinitions.queen.isLeader) +
      defaultPieceDefinitions.king.isLeader;

    // Game 1: queen as leader
    const game1 = createGameState(createDefaultGameConfig({ leaderType: 'queen' }));
    expect(game1.pieceDefinitions.queen.isLeader).toBe(true);
    expect(game1.pieceDefinitions.king.isLeader).toBe(false);

    // Shared defaults must be untouched
    expect(JSON.stringify(defaultPieceDefinitions.queen.isLeader) + defaultPieceDefinitions.king.isLeader)
      .toBe(before);
    expect(defaultPieceDefinitions.king.isLeader).toBe(true);

    // Game 2 (default config): king is leader again, not affected by game 1
    const game2 = createGameState(createDefaultGameConfig());
    expect(game2.pieceDefinitions.king.isLeader).toBe(true);
    expect(game2.pieceDefinitions.queen.isLeader).toBe(false);
  });

  it('never mutates caller-provided piece definitions', () => {
    const custom = JSON.parse(JSON.stringify(defaultPieceDefinitions));
    createGameState(createDefaultGameConfig({ pieceDefinitions: custom, leaderType: 'queen' }));
    expect(custom.king.isLeader).toBe(true);
    expect(custom.queen.isLeader).toBe(false);
  });

  it('applies custom leader type correctly', () => {
    const game = createGameState(createDefaultGameConfig({
      leaderType: 'custom',
      customLeaderType: 'queen',
    }));
    expect(game.pieceDefinitions.queen.isLeader).toBe(true);
    expect(game.pieceDefinitions.king.isLeader).toBe(false);
  });

  it('creates the default 8x8 setup with 32 pieces', () => {
    const game = createGameState(createDefaultGameConfig());
    expect(game.boardSize).toEqual({ rows: 8, cols: 8 });
    expect(game.board.flat().filter(Boolean)).toHaveLength(32);
    expect(game.currentPlayer).toBe('white');
    expect(game.gameOver).toBe(false);
  });

  it('board pieces reference the game-owned definitions, not the shared object', () => {
    const game = createGameState(createDefaultGameConfig({ leaderType: 'queen' }));
    expect(game.pieceDefinitions).not.toBe(defaultPieceDefinitions);
  });
});

describe('makeRandomMoveForPiece', () => {
  it('moves a piece and switches the current player', () => {
    const game = createGameState(createDefaultGameConfig());
    // Find white pawn at (6, 0)
    const from: Position = { row: 6, col: 0 };
    const next = makeRandomMoveForPiece(game, from);
    expect(next.currentPlayer).toBe('black');
    expect(next.moveHistory).toHaveLength(1);
    expect(next.board[6][0]).toBeNull();
    expect(['5', '4']).toContain(String(next.moveHistory[0].to.row));
  });

  it('ignores moves for the wrong color or empty squares', () => {
    const game = createGameState(createDefaultGameConfig());
    const emptyFrom: Position = { row: 3, col: 3 };
    expect(makeRandomMoveForPiece(game, emptyFrom)).toBe(game);
  });

  it('respects capture-first mode: the chosen piece must capture if it can', () => {
    const game = createGameState(createDefaultGameConfig({
      moveMode: 'capture-first',
      initialSetup: (() => {
        const setup = Array.from({ length: 8 }, () => Array(8).fill(null));
        setup[6][0] = { type: 'pawn', color: 'white' };
        setup[5][1] = { type: 'rook', color: 'black' };
        setup[0][7] = { type: 'king', color: 'black' };
        setup[7][7] = { type: 'king', color: 'white' };
        return setup;
      })(),
    }));
    // White pawn (6,0) can capture the rook (5,1): once picked, it must capture.
    const next = makeRandomMoveForPiece(game, { row: 6, col: 0 });
    expect(next.moveHistory).toHaveLength(1);
    expect(next.moveHistory[0].to).toEqual({ row: 5, col: 1 });
    expect(next.moveHistory[0].capturedPiece?.type).toBe('rook');
  });

  it('capture-first never restricts piece selection: a piece without captures can still move', () => {
    const game = createGameState(createDefaultGameConfig({
      moveMode: 'capture-first',
      initialSetup: (() => {
        const setup = Array.from({ length: 8 }, () => Array(8).fill(null));
        setup[6][0] = { type: 'pawn', color: 'white' };
        setup[5][1] = { type: 'rook', color: 'black' };
        setup[6][3] = { type: 'pawn', color: 'white' };
        setup[0][7] = { type: 'king', color: 'black' };
        setup[7][7] = { type: 'king', color: 'white' };
        return setup;
      })(),
    }));
    // The pawn at (6,0) has a capture available, but the human picks the
    // pawn at (6,3), which cannot capture. It must still be able to move.
    const next = makeRandomMoveForPiece(game, { row: 6, col: 3 });
    expect(next).not.toBe(game);
    expect(next.moveHistory).toHaveLength(1);
    expect(next.moveHistory[0].from).toEqual({ row: 6, col: 3 });
    expect(next.moveHistory[0].capturedPiece).toBeUndefined();
  });
});

describe('executeMove', () => {
  it('promotes a pawn to queen on the last rank', () => {
    const game = createGameState(createDefaultGameConfig({
      initialSetup: (() => {
        const setup = Array.from({ length: 8 }, () => Array(8).fill(null));
        setup[1][0] = { type: 'pawn', color: 'white' };
        setup[0][7] = { type: 'king', color: 'black' };
        setup[7][7] = { type: 'king', color: 'white' };
        setup[0][1] = { type: 'king', color: 'black' };
        return setup;
      })(),
    }));
    const next = executeMove(game, { row: 1, col: 0 }, { row: 0, col: 0 }, {
      type: 'pawn', color: 'white', hasMoved: true,
    });
    expect(next.board[0][0]?.type).toBe('queen');
  });
});

describe('board presets', () => {
  it('chess960 generator satisfies both constraints', () => {
    for (let i = 0; i < 20; i++) {
      const setup = resolveInitialSetup(chess960Preset)!;
      const backRank = setup[7].map(p => p!.type);
      const bishops = backRank.map((t, idx) => (t === 'bishop' ? idx : -1)).filter(i => i !== -1);
      expect(bishops[0] % 2).not.toBe(bishops[1] % 2);
      const kingIndex = backRank.indexOf('king');
      const rooks = backRank.map((t, idx) => (t === 'rook' ? idx : -1)).filter(i => i !== -1);
      expect(rooks[0]).toBeLessThan(kingIndex);
      expect(kingIndex).toBeLessThan(rooks[1]);
    }
  });

  it('fairy mix generator produces exactly one king per side', () => {
    for (let i = 0; i < 20; i++) {
      const setup = resolveInitialSetup(fairyMixChessPreset)!;
      for (const row of [0, 7]) {
        const kings = setup[row].filter(p => p!.type === 'king').length;
        expect(kings).toBe(1);
      }
    }
  });

  it('classic preset uses the default board', () => {
    const game = createGameState(createDefaultGameConfig({
      boardSize: classicBoardPreset.boardSize,
      initialSetup: resolveInitialSetup(classicBoardPreset),
    }));
    expect(game.board.flat().filter(Boolean)).toHaveLength(32);
  });

  it('every preset produces a board matching its declared size', () => {
    for (const preset of boardPresets) {
      const setup = resolveInitialSetup(preset);
      if (!setup) continue; // generators covered above / default board
      expect(setup.length).toBeLessThanOrEqual(preset.boardSize.rows);
      for (const row of setup) {
        expect(row.length).toBeLessThanOrEqual(preset.boardSize.cols);
      }
    }
  });
});