/**
 * Main App component for Rebel Chess
 */

import { useState, useCallback, useEffect } from 'react';
import type { GameState, Position, AIProfile, VictoryCondition } from './core/types';
import {
  createGameState,
  makeRandomMoveForPiece,
  makeAIMove,
  getPiece,
  createDefaultGameConfig,
} from './core/game';
import { boardPresets, classicBoardPreset, getBoardPreset, resolveInitialSetup } from './core/presets';
import { Board } from './components/Board';
import { GameStatus } from './components/GameStatus';
import { MoveHistory } from './components/MoveHistory';
import { CapturedPieces } from './components/CapturedPieces';
import { SetupConfirmModal, SettingsModal } from './components/Modals';
import { DebugStatePanel } from './components/DebugStatePanel';
import { useResponsiveBoard } from './hooks/useResponsiveBoard';

const STORAGE_KEY = 'rebel-chess-saved-game';
const BOARD_MAX_WIDTH = 580;

// Shape of the persisted game data
interface SavedGameData {
  gameState: GameState | null;
  gameStarted: boolean;
  vsAI: boolean;
  aiProfile: AIProfile;
  moveMode: 'regular' | 'capture-first';
  victoryCondition: VictoryCondition;
  selectedBoardPreset: string;
  lastMove: { from: Position; to: Position } | null;
  hoverMovesEnabled: boolean;
  debugPanelEnabled: boolean;
}

const AI_PROFILES: AIProfile[] = ['bloodthirsty', 'random'];
const MOVE_MODES = ['regular', 'capture-first'] as const;
const VICTORY_CONDITIONS = ['capture-leader', 'capture-all'] as const;

/**
 * Minimal shape validation for data loaded from localStorage.
 * Returns null for corrupt/incompatible data instead of trusting it blindly.
 */
function validateSavedData(data: unknown): SavedGameData | null {
  if (typeof data !== 'object' || data === null) return null;
  const d = data as Record<string, unknown>;

  const gameState = d.gameState as GameState | null | undefined;
  if (gameState !== null && gameState !== undefined) {
    if (
      !Array.isArray(gameState.board) ||
      (gameState.currentPlayer !== 'white' && gameState.currentPlayer !== 'black') ||
      !Array.isArray(gameState.moveHistory) ||
      typeof gameState.boardSize?.rows !== 'number' ||
      typeof gameState.boardSize?.cols !== 'number'
    ) {
      return null;
    }
  }

  return {
    gameState: gameState ?? null,
    gameStarted: d.gameStarted === true,
    vsAI: d.vsAI === true,
    aiProfile: AI_PROFILES.includes(d.aiProfile as AIProfile) ? (d.aiProfile as AIProfile) : 'bloodthirsty',
    moveMode: MOVE_MODES.includes(d.moveMode as never) ? (d.moveMode as SavedGameData['moveMode']) : 'capture-first',
    victoryCondition: VICTORY_CONDITIONS.includes(d.victoryCondition as never)
      ? (d.victoryCondition as VictoryCondition)
      : 'capture-leader',
    selectedBoardPreset: typeof d.selectedBoardPreset === 'string' ? d.selectedBoardPreset : classicBoardPreset.id,
    lastMove: (d.lastMove as SavedGameData['lastMove']) ?? null,
    hoverMovesEnabled: d.hoverMovesEnabled !== false,
    debugPanelEnabled: d.debugPanelEnabled === true,
  };
}

function loadSavedGame(): SavedGameData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return validateSavedData(JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Failed to load saved game:', e);
  }
  return null;
}

function saveGame(data: SavedGameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
}

function clearSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear saved game:', e);
  }
}

const App = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [vsAI, setVsAI] = useState(true);
  const [aiProfile, setAIProfile] = useState<AIProfile>('bloodthirsty');
  const [moveMode, setMoveMode] = useState<'regular' | 'capture-first'>('capture-first');
  const [victoryCondition, setVictoryCondition] = useState<VictoryCondition>('capture-leader');
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [selectedBoardPreset, setSelectedBoardPreset] = useState<string>(classicBoardPreset.id);
  const [gameStarted, setGameStarted] = useState(false);
  const [showSetupConfirm, setShowSetupConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [hoverMovesEnabled, setHoverMovesEnabled] = useState(true);
  const [debugPanelEnabled, setDebugPanelEnabled] = useState(false);

  // Get responsive square size for board and captured pieces
  const { squareSize } = useResponsiveBoard({
    boardCols: gameState?.boardSize.cols || 8,
    maxWidth: BOARD_MAX_WIDTH,
  });

  // Load saved game on mount
  useEffect(() => {
    const saved = loadSavedGame();
    if (saved) {
      setGameState(saved.gameState);
      setGameStarted(saved.gameStarted);
      setVsAI(saved.vsAI);
      setAIProfile(saved.aiProfile);
      setMoveMode(saved.moveMode);
      setVictoryCondition(saved.victoryCondition);
      setSelectedBoardPreset(saved.selectedBoardPreset);
      setLastMove(saved.lastMove);
      setHoverMovesEnabled(saved.hoverMovesEnabled);
      setDebugPanelEnabled(saved.debugPanelEnabled);
    }
    setHydrated(true);
  }, []);

  // Save game whenever relevant state changes
  useEffect(() => {
    if (!hydrated) return;

    const data: SavedGameData = {
      gameState,
      gameStarted,
      vsAI,
      aiProfile,
      moveMode,
      victoryCondition,
      selectedBoardPreset,
      lastMove,
      hoverMovesEnabled,
      debugPanelEnabled,
    };
    saveGame(data);
  }, [hydrated, gameState, gameStarted, vsAI, aiProfile, moveMode, victoryCondition, selectedBoardPreset, lastMove, hoverMovesEnabled, debugPanelEnabled]);

  // Clear animation after it completes
  const animatingMove = gameState?.animatingMove;
  useEffect(() => {
    if (animatingMove) {
      const timer = setTimeout(() => {
        setGameState(prev => (prev?.animatingMove ? { ...prev, animatingMove: null } : prev));
      }, animatingMove.duration + 50); // Small buffer
      return () => clearTimeout(timer);
    }
  }, [animatingMove]);

  // Handle AI moves (updater stays pure: no side effects, no randomness
  // outside the updater so StrictMode double-invocation stays consistent)
  const isAITurn = !!gameState && !gameState.gameOver && vsAI && gameState.currentPlayer === 'black';
  useEffect(() => {
    if (!isAITurn) return;

    const timer = setTimeout(() => {
      setGameState(prev => (prev && !prev.gameOver ? makeAIMove(prev, aiProfile) : prev));
    }, 300);

    return () => clearTimeout(timer);
  }, [isAITurn, aiProfile]);

  // Track the last move for board highlighting
  const lastMoveInHistory = gameState?.moveHistory[gameState.moveHistory.length - 1];
  useEffect(() => {
    if (lastMoveInHistory) {
      setLastMove({ from: lastMoveInHistory.from, to: lastMoveInHistory.to });
    }
  }, [lastMoveInHistory]);

  const handleSquareClick = useCallback((position: Position) => {
    setGameState(prev => {
      if (!prev || prev.gameOver) return prev;
      const piece = getPiece(prev, position);
      if (piece && piece.color === prev.currentPlayer) {
        return makeRandomMoveForPiece(prev, position);
      }
      return prev;
    });
  }, []);

  const handleStartGame = useCallback(() => {
    const preset = getBoardPreset(selectedBoardPreset);
    if (!preset) return;
    const config = createDefaultGameConfig({
      boardSize: preset.boardSize,
      moveMode,
      victoryCondition,
      leaderType: preset.leaderType,
      initialSetup: resolveInitialSetup(preset),
    });
    setGameState(createGameState(config));
    setLastMove(null);
    setGameStarted(true);
  }, [moveMode, victoryCondition, selectedBoardPreset]);

  const handleBackToSetup = useCallback(() => {
    const isGameActive = gameState && !gameState.gameOver && gameState.moveHistory.length > 0;
    if (isGameActive) {
      setShowSetupConfirm(true);
    } else {
      setGameStarted(false);
      setGameState(null);
      setLastMove(null);
    }
  }, [gameState]);

  const confirmBackToSetup = useCallback(() => {
    setShowSetupConfirm(false);
    setGameStarted(false);
    setGameState(null);
    setLastMove(null);
    clearSavedGame();
  }, []);

  if (!hydrated) {
    return (
      <div className="app-root app-center">
        <div className="app-loading">Loading game...</div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="app-root app-center">
        <div className="setup-panel">
          <header className="setup-header">
            <h1>♟ Rebel Chess</h1>
            <p>Capture the Leader to win!</p>
          </header>

          <div className="setup-form">
            <div>
              <label className="field-label" htmlFor="board-preset">
                Board Preset
              </label>
              <select
                id="board-preset"
                value={selectedBoardPreset}
                onChange={(e) => setSelectedBoardPreset(e.target.value)}
              >
                <optgroup label="Standard">
                  {boardPresets
                    .filter(p => p.type === 'Classic')
                    .map(preset => (
                      <option key={preset.id} value={preset.id} title={preset.description}>
                        {preset.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Variants">
                  {boardPresets
                    .filter(p => p.type === 'Variant')
                    .map(preset => (
                      <option key={preset.id} value={preset.id} title={preset.description}>
                        {preset.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Fairy">
                  {boardPresets
                    .filter(p => p.type === 'Fairy')
                    .map(preset => (
                      <option key={preset.id} value={preset.id} title={preset.description}>
                        {preset.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Large Boards">
                  {boardPresets
                    .filter(p => p.type === 'Large')
                    .map(preset => (
                      <option key={preset.id} value={preset.id} title={preset.description}>
                        {preset.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Small Boards">
                  {boardPresets
                    .filter(p => p.type === 'Small')
                    .map(preset => (
                      <option key={preset.id} value={preset.id} title={preset.description}>
                        {preset.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="move-mode">
                Move Mode
              </label>
              <select
                id="move-mode"
                value={moveMode}
                onChange={(e) => setMoveMode(e.target.value as 'regular' | 'capture-first')}
              >
                <option value="regular">Regular - Any valid move</option>
                <option value="capture-first">Capture First - Must capture if possible</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="victory-condition">
                Victory Condition
              </label>
              <select
                id="victory-condition"
                value={victoryCondition}
                onChange={(e) => setVictoryCondition(e.target.value as VictoryCondition)}
              >
                <option value="capture-leader">Capture Leader - Win by capturing the Leader piece</option>
                <option value="capture-all">Capture All - Win by capturing all opponent pieces</option>
              </select>
            </div>

            <div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={vsAI}
                  onChange={(e) => setVsAI(e.target.checked)}
                />
                <span>Play vs AI (You play White)</span>
              </label>
            </div>

            {vsAI && (
              <div>
                <label className="field-label" htmlFor="ai-profile">
                  AI Profile
                </label>
                <select
                  id="ai-profile"
                  value={aiProfile}
                  onChange={(e) => setAIProfile(e.target.value as AIProfile)}
                >
                  <option value="bloodthirsty">🩸 Bloodthirsty - Prefers captures</option>
                  <option value="random">🎲 Random - Fully random moves</option>
                </select>
              </div>
            )}

            <button className="btn btn-primary btn-start" onClick={handleStartGame}>
              🎮 Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="app-container">
        <header className="app-header">
          <div>
            <h1>♟ Rebel Chess</h1>
            <p className="app-tagline">Capture the Leader to win!</p>
          </div>
          <div className="header-actions">
            <button className="btn" onClick={handleBackToSetup}>
              ↩️ Return to Game Setup
            </button>
            <button
              className="btn btn-icon"
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </header>

        {gameState && (
          <div className="game-layout">
            <GameStatus state={gameState} />

            <div className="board-wrapper">
              <Board
                board={gameState.board}
                boardSize={gameState.boardSize}
                squareSize={squareSize}
                lastMove={lastMove}
                onSquareClick={handleSquareClick}
                showLeaderIndicator={gameState.victoryCondition === 'capture-leader'}
                pieceDefinitions={gameState.pieceDefinitions}
                hoverMovesEnabled={hoverMovesEnabled}
                animatingMove={gameState.animatingMove}
              />
            </div>

            {debugPanelEnabled && <DebugStatePanel gameState={gameState} />}

            <CapturedPieces
              capturedWhite={gameState.capturedPieces.white}
              capturedBlack={gameState.capturedPieces.black}
              squareSize={squareSize}
              pieceDefinitions={gameState.pieceDefinitions}
            />

            <MoveHistory moves={gameState.moveHistory} />
          </div>
        )}

        <SetupConfirmModal
          isOpen={showSetupConfirm}
          onConfirm={confirmBackToSetup}
          onCancel={() => setShowSetupConfirm(false)}
        />
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          hoverMovesEnabled={hoverMovesEnabled}
          onHoverMovesToggle={() => setHoverMovesEnabled(!hoverMovesEnabled)}
          debugPanelEnabled={debugPanelEnabled}
          onDebugPanelToggle={() => setDebugPanelEnabled(!debugPanelEnabled)}
        />
      </div>
    </div>
  );
};

export default App;