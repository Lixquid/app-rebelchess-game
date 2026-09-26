/**
 * Smoke tests: play full games to the end to verify the engine terminates
 * correctly under all configurations.
 */

import { describe, it, expect } from 'vitest';
import { createGameState, createDefaultGameConfig, makeRandomMoveForPiece, makeAIMove } from './game';
import { getAllValidMovesForPlayer, filterCaptureMoves } from './pieces';
import type { GameState, Position } from './types';

/** Pick a random move for the current player, respecting capture-first mode */
const randomMovablePiece = (state: GameState): { from: Position; to: Position } | null => {
  let moves = getAllValidMovesForPlayer(
    state.board,
    state.currentPlayer,
    state.pieceDefinitions,
    state.boardSize
  );
  if (state.moveMode === 'capture-first') {
    const captures = filterCaptureMoves(state.board, moves, state.currentPlayer);
    if (captures.length > 0) moves = captures;
  }
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
};

describe('smoke: full games terminate', () => {
  it('human (random) vs bloodthirsty AI terminates', () => {
    let state = createGameState(createDefaultGameConfig({ moveMode: 'capture-first' }));
    let turns = 0;
    while (!state.gameOver && turns < 1000) {
      if (state.currentPlayer === 'black') {
        state = makeAIMove(state, 'bloodthirsty');
      } else {
        const move = randomMovablePiece(state);
        if (!move) break;
        state = makeRandomMoveForPiece(state, move.from);
      }
      turns++;
    }
    expect(state.gameOver).toBe(true);
  }, 10_000);

  it('all-random games end under both victory conditions', () => {
    for (const victoryCondition of ['capture-leader', 'capture-all'] as const) {
      let state = createGameState(createDefaultGameConfig({ moveMode: 'capture-first', victoryCondition }));
      let turns = 0;
      while (!state.gameOver && turns < 1000) {
        const move = randomMovablePiece(state);
        if (!move) break;
        state = makeRandomMoveForPiece(state, move.from);
        turns++;
      }
      expect(state.gameOver).toBe(true);
      expect(turns).toBeLessThan(1000);
    }
  }, 10_000);
});