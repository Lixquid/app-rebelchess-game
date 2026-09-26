/**
 * Game status display
 */

import type { GameState } from '../core/types';
import { getGameStatusText } from '../core/game';

export interface GameStatusProps {
  state: GameState;
}

export const GameStatus = ({ state }: GameStatusProps) => {
  return (
    <div className="game-status">
      <div className="game-status-main">
        {getGameStatusText(state)}
      </div>
      <div className="game-status-sub">
        Mode: {state.moveMode === 'capture-first' ? 'Capture First' : 'Regular'}
        {!state.gameOver && <span> | Turn: {state.currentPlayer === 'white' ? '♙ White' : '♟ Black'}</span>}
      </div>
      {state.gameOver && state.winner && (
        <div className={`game-winner ${state.winner === 'draw' ? 'draw' : state.winner}`}>
          {state.winner === 'draw' ? '🤝 Draw!' : `${state.winner === 'white' ? '♔' : '♚'} ${state.winner === 'white' ? 'White' : 'Black'} Wins!`}
        </div>
      )}
    </div>
  );
};