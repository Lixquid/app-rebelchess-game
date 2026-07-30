/**
 * Main game logic for Rebel Chess
 */

import type {
  GameState,
  GameConfig,
  Position,
  Piece,
  Move,
  AIProfile,
  AIConfig,
} from './types';
import {
  defaultPieceDefinitions,
  getValidMovesForPiece,
  checkGameOver,
  isPromotionMove,
  promotePawn,
  getAllValidMovesForPlayer,
  filterCaptureMoves,
  oppositeColor,
  getPieceAt,
} from './pieces';
import {
  createDefaultBoard,
  createBoardFromSetup,
  movePiece,
  cloneBoard,
} from './board';
import { makeAIMove as aiMakeMove } from './ai';

/**
 * Creates a new game state with the given configuration
 */
export const createGameState = (config: GameConfig): GameState => {
  console.log('[createGameState] Creating new game state with config:', config);
  const boardSize = config.boardSize || { rows: 8, cols: 8 };
  const pieceDefinitions = config.pieceDefinitions || defaultPieceDefinitions;
  const initialSetup = config.initialSetup;
  
  let board: (Piece | null)[][];
  
  if (initialSetup && initialSetup.length > 0) {
    console.log('[createGameState] Using custom initial setup');
    board = createBoardFromSetup(initialSetup, boardSize);
  } else {
    console.log('[createGameState] Using default board setup');
    board = createDefaultBoard(boardSize);
  }

  // Apply leader type configuration
  if (config.leaderType === 'custom' && config.customLeaderType) {
    console.log('[createGameState] Setting custom leader type:', config.customLeaderType);
    pieceDefinitions[config.customLeaderType].isLeader = true;
    if (config.customLeaderType !== 'king') {
      pieceDefinitions.king.isLeader = false;
    }
  } else if (config.leaderType === 'queen') {
    console.log('[createGameState] Setting queen as leader');
    pieceDefinitions.queen.isLeader = true;
    pieceDefinitions.king.isLeader = false;
  } else {
    console.log('[createGameState] Setting king as leader (default)');
    pieceDefinitions.king.isLeader = true;
    pieceDefinitions.queen.isLeader = false;
  }

  const newState: GameState = {
    board,
    currentPlayer: 'white',
    boardSize,
    pieceDefinitions,
    gameOver: false,
    winner: null,
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    moveMode: config.moveMode || 'regular',
    victoryCondition: config.victoryCondition || 'capture-leader',
    selectedPiece: null,
    validMoves: [],
    status: 'playing',
  };
  console.log('[createGameState] Game state created:', {
    currentPlayer: newState.currentPlayer,
    boardSize: newState.boardSize,
    moveMode: newState.moveMode,
    pieceCount: board.flat().filter(p => p !== null).length
  });
  return newState;
};

/**
 * Selects a piece and shows its valid moves
 */
export const selectPiece = (
  state: GameState,
  position: Position
): GameState => {
  console.log('[selectPiece] Called with position:', position);
  const piece = getPieceAt(state.board, position);
  console.log('[selectPiece] Piece at position:', piece);
  
  if (!piece || piece.color !== state.currentPlayer) {
    console.log('[selectPiece] No valid piece or wrong color, returning deselected state');
    return { ...state, selectedPiece: null, validMoves: [] };
  }

  const validMoves = getValidMovesForPiece(
    state.board,
    piece,
    position,
    state.pieceDefinitions,
    state.boardSize
  );
  console.log('[selectPiece] All valid moves for piece:', validMoves);

  // Filter moves based on move mode
  let filteredMoves = validMoves;
  if (state.moveMode === 'capture-first') {
    console.log('[selectPiece] Capture-first mode enabled, filtering moves');
    const allMoves = getAllValidMovesForPlayer(
      state.board,
      state.currentPlayer,
      state.pieceDefinitions,
      state.boardSize
    );
    const pieceMoves = allMoves.filter(m => 
      m.from.row === position.row && m.from.col === position.col
    );
    const captureMoves = filterCaptureMoves(state.board, pieceMoves, state.currentPlayer);
    console.log('[selectPiece] Capture moves available:', captureMoves);
    if (captureMoves.length > 0) {
      filteredMoves = captureMoves.map(m => m.to);
      console.log('[selectPiece] Filtered to capture moves only:', filteredMoves);
    }
  }

  const newState = {
    ...state,
    selectedPiece: position,
    validMoves: filteredMoves,
  };
  console.log('[selectPiece] Returning new state with selectedPiece and validMoves');
  return newState;
};

/**
 * Deselects the currently selected piece
 */
export const deselectPiece = (state: GameState): GameState => {
  console.log('[deselectPiece] Deselecting piece, clearing validMoves');
  return { ...state, selectedPiece: null, validMoves: [] };
};

/**
 * Makes a move for the current player (used by human players after selecting a piece)
 */
export const makeMove = (
  state: GameState,
  from: Position,
  to: Position
): GameState => {
  console.log('[makeMove] Called with from:', from, 'to:', to);
  console.log('[makeMove] Current player:', state.currentPlayer, 'validMoves:', state.validMoves);
  const piece = getPieceAt(state.board, from);
  if (!piece || piece.color !== state.currentPlayer) {
    console.log('[makeMove] No piece or wrong color at from position');
    return state;
  }

  // Check if target is a valid move
  const isValidMove = state.validMoves.some(
    move => move.row === to.row && move.col === to.col
  );
  console.log('[makeMove] isValidMove check:', isValidMove);

  if (!isValidMove) {
    console.log('[makeMove] Invalid move, returning state unchanged');
    return state;
  }

  console.log('[makeMove] Move is valid, executing...');
  return executeMove(state, from, to, piece);
};

/**
 * Internal function to execute a move without validation
 * Used by AI, random moves, etc.
 */
export const executeMove = (
  state: GameState,
  from: Position,
  to: Position,
  piece: Piece
): GameState => {
  console.log('[executeMove] Executing move from:', from, 'to:', to, 'piece:', piece.type, piece.color);
  // Make the move
  const newBoard = cloneBoard(state.board);
  const capturedPiece = movePiece(newBoard, from, to);
  console.log('[executeMove] Captured piece:', capturedPiece);
  
  // Handle pawn promotion
  const movedPiece = getPieceAt(newBoard, to);
  if (movedPiece && isPromotionMove(movedPiece, to, state.boardSize)) {
    console.log('[executeMove] Pawn promotion at:', to);
    promotePawn(newBoard, to, 'queen');
  }

  // Create move record
  const move: Move = {
    from: { ...from },
    to: { ...to },
    piece: { ...piece },
    capturedPiece: capturedPiece ? { ...capturedPiece } : undefined,
    timestamp: Date.now(),
  };
  console.log('[executeMove] Move record created:', move);

  // Update captured pieces
  const newCapturedPieces = { ...state.capturedPieces };
  if (capturedPiece) {
    const color = capturedPiece.color === 'white' ? 'white' : 'black';
    newCapturedPieces[color] = [...newCapturedPieces[color], { ...capturedPiece }];
    console.log('[executeMove] Updated captured pieces:', newCapturedPieces);
  }

  // Check for game over
  const nextPlayer = oppositeColor(state.currentPlayer);
  const { gameOver, winner } = checkGameOver(newBoard, state.pieceDefinitions, state.victoryCondition, nextPlayer);
  console.log('[executeMove] Game over check:', { gameOver, winner });
  console.log('[executeMove] Next player:', nextPlayer);

  // Animation duration in milliseconds
  const ANIMATION_DURATION = 300;

  const newState: GameState = {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    moveHistory: [...state.moveHistory, move],
    capturedPieces: newCapturedPieces,
    gameOver,
    winner,
    selectedPiece: null,
    validMoves: [],
    status: gameOver ? (winner === 'draw' ? 'draw' : 'checkmate') : 'playing',
    animatingMove: {
      piece: { ...piece },
      from: { ...from },
      to: { ...to },
      startTime: Date.now(),
      duration: ANIMATION_DURATION,
    },
  };
  console.log('[executeMove] Returning new state, move history length:', newState.moveHistory.length);
  return newState;
};

/**
 * Makes a random move for the current player
 */
export const makeRandomMove = (state: GameState): GameState => {
  console.log('[makeRandomMove] Called, currentPlayer:', state.currentPlayer, 'gameOver:', state.gameOver);
  if (state.gameOver) return state;

  const allMoves = getAllValidMovesForPlayer(
    state.board,
    state.currentPlayer,
    state.pieceDefinitions,
    state.boardSize
  );
  console.log('[makeRandomMove] All valid moves for player:', allMoves.length);

  if (allMoves.length === 0) {
    console.log('[makeRandomMove] No valid moves, checking game over');
    const { gameOver, winner } = checkGameOver(state.board, state.pieceDefinitions, state.victoryCondition, state.currentPlayer);
    return { ...state, gameOver, winner };
  }

  // Filter based on move mode
  let movesToChoose = allMoves;
  if (state.moveMode === 'capture-first') {
    console.log('[makeRandomMove] Capture-first mode, filtering for captures');
    const captureMoves = filterCaptureMoves(state.board, allMoves, state.currentPlayer);
    if (captureMoves.length > 0) {
      movesToChoose = captureMoves;
      console.log('[makeRandomMove] Capture moves available:', captureMoves.length);
    }
  }

  const randomMove = movesToChoose[Math.floor(Math.random() * movesToChoose.length)];
  console.log('[makeRandomMove] Selected random move:', randomMove);
  
  const piece = getPieceAt(state.board, randomMove.from);
  console.log('[makeRandomMove] Piece to move:', piece);
  return executeMove(state, randomMove.from, randomMove.to, piece!);
};

/**
 * Makes an AI move
 */
export const makeAIMove = (
  state: GameState,
  profile: AIProfile = 'bloodthirsty'
): GameState => {
  console.log('[makeAIMove] Called with profile:', profile, 'currentPlayer:', state.currentPlayer);
  if (state.gameOver) return state;

  const config: AIConfig = { profile };
  const result = aiMakeMove(
    state.board,
    state.currentPlayer,
    state.pieceDefinitions,
    state.boardSize,
    config
  );
  console.log('[makeAIMove] AI move result:', result);

  if (!result) {
    console.log('[makeAIMove] No AI move returned, checking game over');
    const { gameOver, winner } = checkGameOver(state.board, state.pieceDefinitions, state.victoryCondition, state.currentPlayer);
    return { ...state, gameOver, winner };
  }

  return executeMove(state, result.from, result.to, result.piece);
};

/**
 * Gets all valid moves for the current player
 */
export const getCurrentPlayerMoves = (state: GameState): Move[] => {
  const allMoves = getAllValidMovesForPlayer(
    state.board,
    state.currentPlayer,
    state.pieceDefinitions,
    state.boardSize
  );
  
  return allMoves.map(m => ({
    from: m.from,
    to: m.to,
    piece: m.piece,
    capturedPiece: state.board[m.to.row][m.to.col] || undefined,
    timestamp: 0,
  }));
};

/**
 * Makes a random move for a specific piece at the given position
 */
export const makeRandomMoveForPiece = (
  state: GameState,
  from: Position
): GameState => {
  console.log('[makeRandomMoveForPiece] Called with from:', from, 'currentPlayer:', state.currentPlayer);
  if (state.gameOver) return state;

  const piece = getPieceAt(state.board, from);
  console.log('[makeRandomMoveForPiece] Piece at from position:', piece);
  if (!piece || piece.color !== state.currentPlayer) {
    console.log('[makeRandomMoveForPiece] No piece or wrong color, returning state');
    return state;
  }

  let validMoves = getValidMovesForPiece(
    state.board,
    piece,
    from,
    state.pieceDefinitions,
    state.boardSize
  );
  console.log('[makeRandomMoveForPiece] All valid moves for piece:', validMoves);

  // Filter based on move mode
  if (state.moveMode === 'capture-first') {
    console.log('[makeRandomMoveForPiece] Capture-first mode enabled');
    const allMoves = getAllValidMovesForPlayer(
      state.board,
      state.currentPlayer,
      state.pieceDefinitions,
      state.boardSize
    );
    const pieceMoves = allMoves.filter(m =>
      m.from.row === from.row && m.from.col === from.col
    );
    const captureMoves = filterCaptureMoves(state.board, pieceMoves, state.currentPlayer);
    if (captureMoves.length > 0) {
      validMoves = captureMoves.map(m => m.to);
      console.log('[makeRandomMoveForPiece] Filtered to capture moves only:', validMoves);
    }
  }

  if (validMoves.length === 0) {
    console.log('[makeRandomMoveForPiece] No valid moves, returning state');
    return { ...state, selectedPiece: null, validMoves: [] };
  }

  const randomTo = validMoves[Math.floor(Math.random() * validMoves.length)];
  console.log('[makeRandomMoveForPiece] Selected random move to:', randomTo);
  return executeMove(state, from, randomTo, piece);
};

/**
 * Resets the game to initial state
 */
export const resetGame = (config: GameConfig): GameState => {
  return createGameState(config);
};

/**
 * Gets the game status text
 */
export const getGameStatusText = (state: GameState): string => {
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

/**
 * Checks if a move is valid in the current state
 */
export const isValidMove = (
  state: GameState,
  from: Position,
  to: Position
): boolean => {
  const piece = getPieceAt(state.board, from);
  if (!piece || piece.color !== state.currentPlayer) {
    return false;
  }
  
  const validMoves = getValidMovesForPiece(
    state.board,
    piece,
    from,
    state.pieceDefinitions,
    state.boardSize
  );
  return validMoves.some(m => m.row === to.row && m.col === to.col);
};

/**
 * Gets a piece at a position
 */
export const getPiece = (state: GameState, position: Position): Piece | null => {
  return getPieceAt(state.board, position);
};

/**
 * Gets valid moves for a square
 */
export const getValidMoves = (state: GameState, position: Position): Position[] => {
  const piece = getPieceAt(state.board, position);
  if (!piece || piece.color !== state.currentPlayer) {
    return [];
  }
  return getValidMovesForPiece(
    state.board,
    piece,
    position,
    state.pieceDefinitions,
    state.boardSize
  );
};

/**
 * Creates a default game configuration
 */
export const createDefaultGameConfig = (overrides: Partial<GameConfig> = {}): GameConfig => ({
  boardSize: { rows: 8, cols: 8 },
  pieceDefinitions: defaultPieceDefinitions,
  leaderType: 'king',
  moveMode: 'regular',
  victoryCondition: 'capture-leader',
  ...overrides,
});