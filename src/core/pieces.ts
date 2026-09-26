/**
 * Piece definitions and move generation for Rebel Chess
 */

import type {
  BoardSize,
  Color,
  Piece,
  PieceDefinition,
  PieceDefinitions,
  PieceMove,
  PieceType,
  Position,
} from './types';
import { isValidPosition, oppositeColor } from './types';

/**
 * Adjusts moves for piece color
 * White moves "up" (decreasing row), Black moves "down" (increasing row)
 */
const adjustMovesForColor = (moves: PieceMove[], color: Color): PieceMove[] => {
  if (color === 'white') {
    return moves;
  }
  // For black, flip vertical direction
  return moves.map(move => ({ ...move, dr: -move.dr }));
};

/**
 * Pawn moves
 */
const pawnMoves: PieceMove[] = [
  { dr: -1, dc: 0, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: false, nonCaptureOnly: true },
  { dr: -2, dc: 0, repeatable: false, jumping: false, firstMoveOnly: true, captureOnly: false, nonCaptureOnly: true },
  { dr: -1, dc: -1, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: true, nonCaptureOnly: false },
  { dr: -1, dc: 1, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: true, nonCaptureOnly: false },
];

/**
 * Rook moves
 */
const rookMoves: PieceMove[] = [
  { dr: -1, dc: 0, repeatable: true, jumping: false },
  { dr: 1, dc: 0, repeatable: true, jumping: false },
  { dr: 0, dc: -1, repeatable: true, jumping: false },
  { dr: 0, dc: 1, repeatable: true, jumping: false },
];

/**
 * Bishop moves
 */
const bishopMoves: PieceMove[] = [
  { dr: -1, dc: -1, repeatable: true, jumping: false },
  { dr: -1, dc: 1, repeatable: true, jumping: false },
  { dr: 1, dc: -1, repeatable: true, jumping: false },
  { dr: 1, dc: 1, repeatable: true, jumping: false },
];

/**
 * Queen moves
 */
const queenMoves: PieceMove[] = [
  ...rookMoves,
  ...bishopMoves,
];

/**
 * Knight moves
 */
const knightMoves: PieceMove[] = [
  { dr: -2, dc: -1, repeatable: false, jumping: true },
  { dr: -2, dc: 1, repeatable: false, jumping: true },
  { dr: 2, dc: -1, repeatable: false, jumping: true },
  { dr: 2, dc: 1, repeatable: false, jumping: true },
  { dr: -1, dc: -2, repeatable: false, jumping: true },
  { dr: -1, dc: 2, repeatable: false, jumping: true },
  { dr: 1, dc: -2, repeatable: false, jumping: true },
  { dr: 1, dc: 2, repeatable: false, jumping: true },
];

/**
 * King moves
 */
const kingMoves: PieceMove[] = [
  { dr: -1, dc: -1, repeatable: false, jumping: false },
  { dr: -1, dc: 0, repeatable: false, jumping: false },
  { dr: -1, dc: 1, repeatable: false, jumping: false },
  { dr: 0, dc: -1, repeatable: false, jumping: false },
  { dr: 0, dc: 1, repeatable: false, jumping: false },
  { dr: 1, dc: -1, repeatable: false, jumping: false },
  { dr: 1, dc: 0, repeatable: false, jumping: false },
  { dr: 1, dc: 1, repeatable: false, jumping: false },
];

/**
 * Alfil moves
 */
const alfilMoves: PieceMove[] = [
  { dr: -2, dc: -2, repeatable: false, jumping: true },
  { dr: -2, dc: 2, repeatable: false, jumping: true },
  { dr: 2, dc: -2, repeatable: false, jumping: true },
  { dr: 2, dc: 2, repeatable: false, jumping: true },
];

/**
 * Camel moves
 */
const camelMoves: PieceMove[] = [
  { dr: -3, dc: -1, repeatable: false, jumping: true },
  { dr: -3, dc: 1, repeatable: false, jumping: true },
  { dr: 3, dc: -1, repeatable: false, jumping: true },
  { dr: 3, dc: 1, repeatable: false, jumping: true },
  { dr: -1, dc: -3, repeatable: false, jumping: true },
  { dr: -1, dc: 3, repeatable: false, jumping: true },
  { dr: 1, dc: -3, repeatable: false, jumping: true },
  { dr: 1, dc: 3, repeatable: false, jumping: true },
];

/**
 * Man (non-royal king) moves - moves like a king but is not a leader piece
 */
const manMoves: PieceMove[] = [
  { dr: -1, dc: -1, repeatable: false, jumping: false },
  { dr: -1, dc: 0, repeatable: false, jumping: false },
  { dr: -1, dc: 1, repeatable: false, jumping: false },
  { dr: 0, dc: -1, repeatable: false, jumping: false },
  { dr: 0, dc: 1, repeatable: false, jumping: false },
  { dr: 1, dc: -1, repeatable: false, jumping: false },
  { dr: 1, dc: 0, repeatable: false, jumping: false },
  { dr: 1, dc: 1, repeatable: false, jumping: false },
];

/**
 * Amazon moves - Queen + Knight
 */
const amazonMoves: PieceMove[] = [
  ...queenMoves,
  ...knightMoves,
];

/**
 * Princess moves - Bishop + Knight
 */
const princessMoves: PieceMove[] = [
  ...bishopMoves,
  ...knightMoves,
];

/**
 * Empress moves - Rook + Knight
 */
const empressMoves: PieceMove[] = [
  ...rookMoves,
  ...knightMoves,
];

/**
 * Ferz moves - Bishop but only one step (diagonal only)
 */
const ferzMoves: PieceMove[] = [
  { dr: -1, dc: -1, repeatable: false, jumping: false },
  { dr: -1, dc: 1, repeatable: false, jumping: false },
  { dr: 1, dc: -1, repeatable: false, jumping: false },
  { dr: 1, dc: 1, repeatable: false, jumping: false },
];

/**
 * Nightrider moves - Knight moves but repeatable
 */
const nightriderMoves: PieceMove[] = [
  { dr: -2, dc: -1, repeatable: true, jumping: true },
  { dr: -2, dc: 1, repeatable: true, jumping: true },
  { dr: 2, dc: -1, repeatable: true, jumping: true },
  { dr: 2, dc: 1, repeatable: true, jumping: true },
  { dr: -1, dc: -2, repeatable: true, jumping: true },
  { dr: -1, dc: 2, repeatable: true, jumping: true },
  { dr: 1, dc: -2, repeatable: true, jumping: true },
  { dr: 1, dc: 2, repeatable: true, jumping: true },
];

/**
 * Dabbabah moves - Orthogonal 2 steps, jumping
 */
const dabbabahMoves: PieceMove[] = [
  { dr: -2, dc: 0, repeatable: false, jumping: true },
  { dr: 2, dc: 0, repeatable: false, jumping: true },
  { dr: 0, dc: -2, repeatable: false, jumping: true },
  { dr: 0, dc: 2, repeatable: false, jumping: true },
];

/**
 * Berolina Pawn moves
 * Moves diagonally forward (non-capture), captures straight ahead
 * Initial move can be 2 steps diagonally forward
 */
const berolinaPawnMoves: PieceMove[] = [
  // Non-capture: diagonal forward 1
  { dr: -1, dc: -1, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: false, nonCaptureOnly: true },
  { dr: -1, dc: 1, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: false, nonCaptureOnly: true },
  // Non-capture: diagonal forward 2 (first move only)
  { dr: -2, dc: -2, repeatable: false, jumping: false, firstMoveOnly: true, captureOnly: false, nonCaptureOnly: true },
  { dr: -2, dc: 2, repeatable: false, jumping: false, firstMoveOnly: true, captureOnly: false, nonCaptureOnly: true },
  // Capture: straight forward 1
  { dr: -1, dc: 0, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: true, nonCaptureOnly: false },
];

/**
 * Sergeant moves - Moves one step straight forward (non-capture) or one step diagonally forward (capture)
 * On first move, can move two steps straight forward (non-capture)
 * This is the fairy chess piece "Sergeant" - a pawn that moves straight and captures diagonally
 */
const sergeantMoves: PieceMove[] = [
  // Forward 1 - can capture or move normally
  { dr: -1, dc: 0, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: false, nonCaptureOnly: false },
  // Diagonal forward left - can capture or move normally
  { dr: -1, dc: -1, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: false, nonCaptureOnly: false },
  // Diagonal forward right - can capture or move normally
  { dr: -1, dc: 1, repeatable: false, jumping: false, firstMoveOnly: false, captureOnly: false, nonCaptureOnly: false },
  // Forward 2 (first move only) - non-capture only
  { dr: -2, dc: 0, repeatable: false, jumping: false, firstMoveOnly: true, captureOnly: false, nonCaptureOnly: true },
];

/**
 * Centaur moves - King + Knight
 */
const centaurMoves: PieceMove[] = [
  ...kingMoves,
  ...knightMoves,
];

/**
 * Default piece definitions
 * All pieces use black Unicode symbols for both white and black pieces
 */
export const defaultPieceDefinitions: PieceDefinitions = {
  pawn: { type: "pawn", moves: pawnMoves, isLeader: false, unicode: "♟" },
  rook: { type: "rook", moves: rookMoves, isLeader: false, unicode: "♜" },
  bishop: { type: "bishop", moves: bishopMoves, isLeader: false, unicode: "♝" },
  queen: { type: "queen", moves: queenMoves, isLeader: false, unicode: "♛" },
  king: { type: "king", moves: kingMoves, isLeader: true, unicode: "♚" },
  knight: { type: "knight", moves: knightMoves, isLeader: false, unicode: "♞" },
  alfil: { type: "alfil", moves: alfilMoves, isLeader: false, unicode: "🨧" },
  camel: { type: "camel", moves: camelMoves, isLeader: false, unicode: "🨓" },
  man: { type: "man", moves: manMoves, isLeader: false, unicode: "♚" },
  amazon: {
    type: "amazon",
    moves: amazonMoves,
    isLeader: false,
    unicode: "🩑",
  },
  princess: {
    type: "princess",
    moves: princessMoves,
    isLeader: false,
    unicode: "🩓",
  },
  empress: {
    type: "empress",
    moves: empressMoves,
    isLeader: false,
    unicode: "🩒",
  },
  ferz: { type: "ferz", moves: ferzMoves, isLeader: false, unicode: "🨒" },
  nightrider: {
    type: "nightrider",
    moves: nightriderMoves,
    isLeader: false,
    unicode: "🨨",
  },
  dabbabah: {
    type: "dabbabah",
    moves: dabbabahMoves,
    isLeader: false,
    unicode: "🨑",
  },
  "berolina-pawn": {
    type: "berolina-pawn",
    moves: berolinaPawnMoves,
    isLeader: false,
    unicode: "🨩",
  },
  centaur: {
    type: "centaur",
    moves: centaurMoves,
    isLeader: false,
    unicode: "🨄",
  },
  sergeant: {
    type: "sergeant",
    moves: sergeantMoves,
    isLeader: false,
    unicode: "🨅",
  },
};

/**
 * Gets the piece definition for a piece type
 */
export const getPieceDefinition = (
  type: PieceType,
  definitions: PieceDefinitions
): PieceDefinition => definitions[type];

/**
 * Gets all valid moves for a piece at a given position
 */
export const getValidMovesForPiece = (
  board: (Piece | null)[][],
  piece: Piece,
  position: Position,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize
): Position[] => {
  const definition = getPieceDefinition(piece.type, pieceDefinitions);
  const moves: Position[] = [];

  for (const move of definition.moves) {
    if (move.firstMoveOnly && piece.hasMoved) {
      continue;
    }
    const adjustedMoves = adjustMovesForColor([move], piece.color);

    for (const adjMove of adjustedMoves) {
      if (adjMove.repeatable) {
        let currentRow = position.row + adjMove.dr;
        let currentCol = position.col + adjMove.dc;

        while (isValidPosition({ row: currentRow, col: currentCol }, boardSize)) {
          const targetPiece = board[currentRow][currentCol];
          const isCapture = targetPiece !== null && targetPiece.color !== piece.color;
          const isBlocked = targetPiece !== null;

          if (adjMove.captureOnly && !isCapture) {
            break;
          }
          if (adjMove.nonCaptureOnly && isCapture) {
            break;
          }

          if (isCapture) {
            moves.push({ row: currentRow, col: currentCol });
            break;
          }

          if (!isBlocked) {
            moves.push({ row: currentRow, col: currentCol });
          } else {
            break;
          }

          currentRow += adjMove.dr;
          currentCol += adjMove.dc;
        }
      } else {
        const targetRow = position.row + adjMove.dr;
        const targetCol = position.col + adjMove.dc;
        const targetPos = { row: targetRow, col: targetCol };

        if (!isValidPosition(targetPos, boardSize)) {
          continue;
        }

        const targetPiece = board[targetRow][targetCol];
        const isCapture = targetPiece !== null && targetPiece.color !== piece.color;
        const isBlocked = targetPiece !== null;

        if (adjMove.captureOnly && !isCapture) {
          continue;
        }
        if (adjMove.nonCaptureOnly && isCapture) {
          continue;
        }

        // For non-jumping moves that move more than 1 step, check intermediate squares
        if (!adjMove.jumping && (Math.abs(adjMove.dr) > 1 || Math.abs(adjMove.dc) > 1)) {
          const stepRow = adjMove.dr > 0 ? 1 : adjMove.dr < 0 ? -1 : 0;
          const stepCol = adjMove.dc > 0 ? 1 : adjMove.dc < 0 ? -1 : 0;
          let checkRow = position.row + stepRow;
          let checkCol = position.col + stepCol;
          let blocked = false;
          while (checkRow !== targetRow || checkCol !== targetCol) {
            if (board[checkRow][checkCol] !== null) {
              blocked = true;
              break;
            }
            checkRow += stepRow;
            checkCol += stepCol;
          }
          if (blocked) {
            continue;
          }
        }

        // For capture moves, the target being occupied is required, not blocking
        // Only block non-capture moves (or moves that are not capture-only)
        if (!isCapture && isBlocked && !adjMove.jumping) {
          continue;
        }

        if (isCapture || !isBlocked) {
          moves.push(targetPos);
        }
      }
    }
  }

  return moves;
};

/**
 * Gets a piece at a position
 */
export const getPieceAt = (
  board: (Piece | null)[][],
  position: Position
): Piece | null => {
  if (position.row < 0 || position.row >= board.length) return null;
  if (position.col < 0 || position.col >= board[0].length) return null;
  return board[position.row][position.col];
};

/**
 * Finds the leader piece for a given color
 */
export const findLeaderPiece = (
  board: (Piece | null)[][],
  color: Color,
  pieceDefinitions: PieceDefinitions
): Position | null => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const def = getPieceDefinition(piece.type, pieceDefinitions);
        if (def.isLeader) {
          return { row, col };
        }
      }
    }
  }
  return null;
};

/**
 * Checks if a color has lost their leader piece
 */
export const hasLostLeader = (
  board: (Piece | null)[][],
  color: Color,
  pieceDefinitions: PieceDefinitions
): boolean => {
  return findLeaderPiece(board, color, pieceDefinitions) === null;
};

/**
 * Gets all valid moves for a player
 */
export const getAllValidMovesForPlayer = (
  board: (Piece | null)[][],
  color: Color,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize
): { piece: Piece; from: Position; to: Position }[] => {
  const moves: { piece: Piece; from: Position; to: Position }[] = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMovesForPiece(board, piece, { row, col }, pieceDefinitions, boardSize);
        for (const to of validMoves) {
          moves.push({ piece, from: { row, col }, to });
        }
      }
    }
  }

  return moves;
};

/**
 * Filters moves to only capturing moves
 */
export const filterCaptureMoves = (
  board: (Piece | null)[][],
  moves: { piece: Piece; from: Position; to: Position }[],
  color: Color
): { piece: Piece; from: Position; to: Position }[] => {
  return moves.filter(move => {
    const target = board[move.to.row][move.to.col];
    return target !== null && target.color !== color;
  });
};

/**
 * Checks if a position is attacked by any piece of a given color
 */
export const isPositionAttacked = (
  board: (Piece | null)[][],
  position: Position,
  byColor: Color,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize
): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const moves = getValidMovesForPiece(board, piece, { row, col }, pieceDefinitions, boardSize);
        if (moves.some(m => m.row === position.row && m.col === position.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Checks if a player's leader is in check
 */
export const isLeaderInCheck = (
  board: (Piece | null)[][],
  color: Color,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize
): boolean => {
  const leaderPos = findLeaderPiece(board, color, pieceDefinitions);
  if (!leaderPos) return false;

  const opponentColor = oppositeColor(color);
  return isPositionAttacked(board, leaderPos, opponentColor, pieceDefinitions, boardSize);
};

/**
 * Checks if a player has any valid moves
 */
export const hasValidMoves = (
  board: (Piece | null)[][],
  color: Color,
  pieceDefinitions: PieceDefinitions,
  boardSize: BoardSize
): boolean => {
  const moves = getAllValidMovesForPlayer(board, color, pieceDefinitions, boardSize);
  return moves.length > 0;
};

/**
 * Checks if the game is over based on victory condition
 */
export const checkGameOver = (
  board: (Piece | null)[][],
  pieceDefinitions: PieceDefinitions,
  victoryCondition: 'capture-leader' | 'capture-all',
  currentPlayer: Color
): { gameOver: boolean; winner: 'white' | 'black' | 'draw' | null } => {
  // Check stalemate: current player has no valid moves
  const currentPlayerHasMoves = hasValidMoves(board, currentPlayer, pieceDefinitions, { rows: board.length, cols: board[0].length });
  if (!currentPlayerHasMoves) {
    // Current player cannot move - they lose (stalemate)
    return { gameOver: true, winner: oppositeColor(currentPlayer) };
  }

  if (victoryCondition === 'capture-leader') {
    const whiteHasLeader = !hasLostLeader(board, 'white', pieceDefinitions);
    const blackHasLeader = !hasLostLeader(board, 'black', pieceDefinitions);

    if (!whiteHasLeader && !blackHasLeader) {
      return { gameOver: true, winner: 'draw' };
    }
    if (!whiteHasLeader) {
      return { gameOver: true, winner: 'black' };
    }
    if (!blackHasLeader) {
      return { gameOver: true, winner: 'white' };
    }
    return { gameOver: false, winner: null };
  }

  // Capture-all victory condition: check if either side has no pieces left
  let whitePieceCount = 0;
  let blackPieceCount = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.color === 'white') whitePieceCount++;
        else blackPieceCount++;
      }
    }
  }

  if (whitePieceCount === 0 && blackPieceCount === 0) {
    return { gameOver: true, winner: 'draw' };
  }
  if (whitePieceCount === 0) {
    return { gameOver: true, winner: 'black' };
  }
  if (blackPieceCount === 0) {
    return { gameOver: true, winner: 'white' };
  }
  return { gameOver: false, winner: null };
};

/**
 * Checks if a move results in pawn promotion
 */
export const isPromotionMove = (
  piece: Piece,
  to: Position,
  boardSize: BoardSize
): boolean => {
  if (piece.type !== 'pawn') return false;

  if (piece.color === 'white') {
    return to.row === 0;
  } else {
    return to.row === boardSize.rows - 1;
  }
};

/**
 * Promotes a pawn to a queen (or other piece)
 */
export const promotePawn = (
  board: (Piece | null)[][],
  position: Position,
  promoteTo: Piece['type'] = 'queen'
): void => {
  const piece = board[position.row][position.col];
  if (piece && piece.type === 'pawn') {
    board[position.row][position.col] = { ...piece, type: promoteTo };
  }
};

// Re-export oppositeColor for convenience
export { oppositeColor };
