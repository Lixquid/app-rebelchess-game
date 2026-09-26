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

const getPieceSymbol = (pieceType: Piece['type'], pieceDefinitions?: PieceDefinitions): string => {
  if (pieceDefinitions) {
    const def = pieceDefinitions[pieceType];
    if (def?.unicode) {
      return def.unicode;
    }
  }
  return '?';
};

export const CapturedPieces = ({ capturedWhite, capturedBlack, squareSize, pieceDefinitions }: CapturedPiecesProps) => {
  const pieceSize = squareSize * 0.6;

  const renderCaptured = (pieces: Piece[]) => {
    // Group by type and count
    const counts: Record<string, number> = {};
    pieces.forEach(p => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => (
      <div key={type} className="captured-entry">
        <span style={{ fontSize: pieceSize, lineHeight: `${pieceSize}px` }}>
          {getPieceSymbol(type as Piece['type'], pieceDefinitions)}
        </span>
        {count > 1 && <span className="captured-count">×{count}</span>}
      </div>
    ));
  };

  return (
    <div className="captured-pieces">
      <div className="captured-group">
        <h4 style={{ fontSize: squareSize * 0.2 }}>Captured (Black)</h4>
        <div className="captured-list">
          {renderCaptured(capturedBlack)}
        </div>
      </div>
      <div className="captured-group">
        <h4 style={{ fontSize: squareSize * 0.2 }}>Captured (White)</h4>
        <div className="captured-list">
          {renderCaptured(capturedWhite)}
        </div>
      </div>
    </div>
  );
};