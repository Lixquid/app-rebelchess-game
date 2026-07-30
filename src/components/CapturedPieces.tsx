/**
 * Captured pieces display
 */

import type { Piece, PieceDefinitions } from '../core/types';

export interface CapturedPiecesProps {
  capturedWhite: Piece[];
  capturedBlack: Piece[];
  squareSize: number;
  pieceDefinitions?: PieceDefinitions;
}

const getPieceSymbol = (pieceType: Piece['type'], color: Piece['color'], pieceDefinitions?: PieceDefinitions): string => {
  if (pieceDefinitions) {
    const def = pieceDefinitions[pieceType];
    if (def?.unicode) {
      return def.unicode;
    }
  }
  
  // Fallback to hardcoded symbols
  const symbols: Record<string, { white: string; black: string }> = {
    pawn: { white: '♙', black: '♟' },
    rook: { white: '♖', black: '♜' },
    knight: { white: '♘', black: '♞' },
    bishop: { white: '♗', black: '♝' },
    queen: { white: '♕', black: '♛' },
    king: { white: '♔', black: '♚' },
    alfil: { white: '🐘', black: '🐘' },
    camel: { white: '🐫', black: '🐫' },
  };

  const pieceSymbols = symbols[pieceType];
  if (!pieceSymbols) return '?';

  return pieceSymbols[color];
};

export const CapturedPieces = ({ capturedWhite, capturedBlack, squareSize, pieceDefinitions }: CapturedPiecesProps) => {
  const pieceSize = squareSize * 0.6;
  
  const renderCaptured = (pieces: Piece[], _color: 'white' | 'black') => {
    // Group by type and count
    const counts: Record<string, number> = {};
    pieces.forEach(p => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    
    return Object.entries(counts).map(([type, count]) => (
      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, margin: 2 }}>
        <span style={{ fontSize: pieceSize, lineHeight: `${pieceSize}px` }}>
          {getPieceSymbol(type as Piece['type'], _color, pieceDefinitions)}
        </span>
        {count > 1 && <span style={{ fontSize: pieceSize * 0.6, fontWeight: 'bold' }}>×{count}</span>}
      </div>
    ));
  };

  return (
    <div className="captured-pieces" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="captured-black">
        <h4 style={{ margin: 0, fontSize: squareSize * 0.2 }}>Captured (Black)</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {renderCaptured(capturedBlack, 'black')}
        </div>
      </div>
      <div className="captured-white">
        <h4 style={{ margin: 0, fontSize: squareSize * 0.2 }}>Captured (White)</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {renderCaptured(capturedWhite, 'white')}
        </div>
      </div>
    </div>
  );
};