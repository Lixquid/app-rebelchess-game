/**
 * Move history component
 */

import type { Move } from '../core/types';

export interface MoveHistoryProps {
  moves: Move[];
}

/**
 * Formats a move in a chess-like notation (e.g. "Nf3", "exd5")
 */
const formatMove = (move: Move): string => {
  const fileFrom = String.fromCharCode(97 + move.from.col);
  const rankFrom = 8 - move.from.row;
  const fileTo = String.fromCharCode(97 + move.to.col);
  const rankTo = 8 - move.to.row;
  const pieceSymbol = move.piece.type === 'pawn' ? '' : move.piece.type[0].toUpperCase();
  const capture = move.capturedPiece ? 'x' : '';

  return `${pieceSymbol}${fileFrom}${rankFrom}${capture}${fileTo}${rankTo}`;
};

export const MoveHistory = ({ moves }: MoveHistoryProps) => {
  return (
    <div className="move-history">
      <table className="move-history-table">
        <tbody>
          {moves.reduce((rows, move, index) => {
            const moveNumber = Math.floor(index / 2) + 1;
            const isWhiteMove = index % 2 === 0;

            if (isWhiteMove) {
              rows.push(
                <tr key={index}>
                  <td className="move-number">{moveNumber}.</td>
                  <td>{formatMove(move)}</td>
                  <td>{index + 1 < moves.length ? formatMove(moves[index + 1]) : ''}</td>
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