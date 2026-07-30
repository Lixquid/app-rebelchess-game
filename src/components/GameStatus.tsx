/**
 * Game status display
 */

import type { GameState } from '../core/types';

export interface GameStatusProps {
  state: GameState;
}

export const GameStatus = ({ state }: GameStatusProps) => {
  const getStatusText = () => {
    if (state.gameOver) {
      if (state.winner === 'draw') {
        return 'Game Over - Draw!';
      }
      return `Game Over - ${state.winner === 'white' ? 'White' : 'Black'} Wins!`;
    }
    
    if (state.status === 'check') {
      return `${state.currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
    }
    
    return `${state.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
  };

  return (
    <div className="game-status" style={{ 
      padding: '12px 16px', 
      backgroundColor: '#f5f0e1', 
      borderRadius: '8px',
      border: '2px solid #3d2914',
      fontFamily: 'Georgia, serif',
      minHeight: '60px',
    }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3d2914' }}>
        {getStatusText()}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
        Mode: {state.moveMode === 'capture-first' ? 'Capture First' : 'Regular'}
        {state.currentPlayer && !state.gameOver && <span> | Turn: {state.currentPlayer === 'white' ? '♙ White' : '♟ Black'}</span>}
      </div>
      {state.gameOver && state.winner && (
        <div style={{ marginTop: 8, fontSize: '1.2rem', fontWeight: 'bold', color: state.winner === 'draw' ? '#666' : state.winner === 'white' ? '#2c5f2d' : '#8b1a1a' }}>
          {state.winner === 'draw' ? '🤝 Draw!' : `${state.winner === 'white' ? '♔' : '♚'} ${state.winner === 'white' ? 'White' : 'Black'} Wins!`}
        </div>
      )}
    </div>
  );
};