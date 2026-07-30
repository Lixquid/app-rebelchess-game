/**
 * Move history component
 */

import type { Position, Piece } from '../core/types';

export interface MoveHistoryProps {
  moves: Array<{
    from: Position;
    to: Position;
    piece: Piece;
    capturedPiece?: Piece;
    timestamp: number;
  }>;
  onMoveClick?: (index: number) => void;
}

export const MoveHistory = ({ moves, onMoveClick }: MoveHistoryProps) => {
  const formatMove = (move: typeof moves[0], _index: number) => {
    const fileFrom = String.fromCharCode(97 + move.from.col);
    const rankFrom = 8 - move.from.row;
    const fileTo = String.fromCharCode(97 + move.to.col);
    const rankTo = 8 - move.to.row;
    const pieceSymbol = move.piece.type === 'pawn' ? '' : move.piece.type[0].toUpperCase();
    const capture = move.capturedPiece ? 'x' : '';
    const check = ''; // Would need check detection
    
    return `${pieceSymbol}${fileFrom}${rankFrom}${capture}${fileTo}${rankTo}${check}`;
  };

  return (
    <div className="move-history" style={{ maxHeight: 300, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <tbody>
          {moves.reduce((rows, move, index) => {
            const moveNumber = Math.floor(index / 2) + 1;
            const isWhiteMove = index % 2 === 0;
            
            if (isWhiteMove) {
              rows.push(
                <tr key={index}>
                  <td style={{ padding: '2px 8px', textAlign: 'right', width: '30px', color: '#666' }}>
                    {moveNumber}.
                  </td>
                  <td style={{ padding: '2px 8px', cursor: onMoveClick ? 'pointer' : 'default' }}
                    onClick={() => onMoveClick?.(index)}>
                    {formatMove(move, index)}
                  </td>
                  <td style={{ padding: '2px 8px', cursor: onMoveClick ? 'pointer' : 'default' }}
                    onClick={() => onMoveClick?.(index + 1)}>
                    {index + 1 < moves.length ? formatMove(moves[index + 1], index + 1) : ''}
                  </td>
                </tr>
              );
            }
            return rows;
          }, [] as React.ReactElement[])}
        </tbody>
      </table>
    </div>
  );
};