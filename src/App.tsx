/**
 * Main App component for Rebel Chess
 */

import { useState, useCallback, useEffect } from 'react';
import type { GameState, Position, AIProfile, VictoryCondition } from './core/types';
import { 
  createGameState, 
  makeRandomMoveForPiece,
  makeAIMove, 
  deselectPiece, 
  getPiece, 
  createDefaultGameConfig
} from './core/game';
import { boardPresets, classicBoardPreset, getBoardPreset, resolveInitialSetup } from './core/types';
import { Board } from './components/Board';
import { GameStatus } from './components/GameStatus';
import { MoveHistory } from './components/MoveHistory';
import { CapturedPieces } from './components/CapturedPieces';
import { useResponsiveBoard } from './hooks/useResponsiveBoard';

const STORAGE_KEY = 'rebel-chess-saved-game';
const BOARD_MAX_WIDTH = 580;

// Types for saved game data
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
}

function loadSavedGame(): SavedGameData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as SavedGameData;
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

// Confirmation modal for leaving game
function SetupConfirmModal({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: '#f5f0e1',
          borderRadius: '12px',
          border: '2px solid #3d2914',
          padding: 32,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px', color: '#3d2914', fontSize: '1.3rem' }}>Return to Setup?</h3>
        <p style={{ margin: '0 0 24px', color: '#555', lineHeight: 1.5 }}>You have an active game in progress. Are you sure you want to return to game setup? Your current game will be lost.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: '#8b7355',
              color: '#f5f0e1',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: '#c0392b',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Yes, Return to Setup
          </button>
        </div>
      </div>
    </div>
  );
}

// Settings modal for in-game options
function SettingsModal({ isOpen, onClose, hoverMovesEnabled, onHoverMovesToggle }: { isOpen: boolean; onClose: () => void; hoverMovesEnabled: boolean; onHoverMovesToggle: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#f5f0e1',
          borderRadius: '12px',
          border: '2px solid #3d2914',
          padding: 32,
          maxWidth: 360,
          width: '90%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          textAlign: 'left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 24px', color: '#3d2914', fontSize: '1.3rem', textAlign: 'center' }}>⚙️ Settings</h3>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: '1rem', color: '#3d2914' }}>
            <input
              type="checkbox"
              checked={hoverMovesEnabled}
              onChange={onHoverMovesToggle}
              style={{ width: 20, height: 20, accentColor: '#3d2914' }}
            />
            <span>Show Move Preview on Hover</span>
          </label>
          <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#666' }}>When enabled, hovering a piece shows its possible moves (amber dots for moves, red rings for captures).</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: '#8b7355',
              color: '#f5f0e1',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
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
      setHoverMovesEnabled(saved.hoverMovesEnabled ?? true);
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
    };
    saveGame(data);
  }, [hydrated, gameState, gameStarted, vsAI, aiProfile, moveMode, victoryCondition, selectedBoardPreset, lastMove, hoverMovesEnabled]);

  // Clear animation after it completes
  useEffect(() => {
    if (gameState?.animatingMove) {
      const duration = gameState.animatingMove.duration;
      const timer = setTimeout(() => {
        setGameState(prev => prev ? { ...prev, animatingMove: null } : null);
      }, duration + 50); // Small buffer
      return () => clearTimeout(timer);
    }
  }, [gameState?.animatingMove?.startTime]);

  // Handle AI moves
  useEffect(() => {
    if (!gameState || gameState.gameOver) return;
    
    const isAITurn = vsAI && gameState.currentPlayer === 'black';
    
    if (isAITurn) {
      const timer = setTimeout(() => {
        setGameState(prev => {
          if (!prev) return null;
          const newState = makeAIMove(prev, aiProfile);
          if (newState.moveHistory.length > prev.moveHistory.length) {
            const move = newState.moveHistory[newState.moveHistory.length - 1];
            setLastMove({ from: move.from, to: move.to });
          }
          return newState;
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [gameState?.currentPlayer, gameState?.gameOver, gameState?.moveHistory.length, vsAI, aiProfile]);

  // Update move mode when it changes
  useEffect(() => {
    if (gameState) {
      setGameState(prev => prev ? { ...prev, moveMode } : null);
    }
  }, [moveMode]);

  useEffect(() => {
    if (gameState) {
      setGameState(prev => prev ? { ...prev, victoryCondition } : null);
    }
  }, [victoryCondition]);

  const handleSquareClick = useCallback((position: Position) => {
    setGameState(prev => {
      if (!prev) return null;
      // If a piece is already selected, deselect it
      if (prev.selectedPiece) {
        return deselectPiece(prev);
      }

      // No piece selected, try to select and make a random move
      const piece = getPiece(prev, position);
      if (piece && piece.color === prev.currentPlayer) {
        return makeRandomMoveForPiece(prev, position);
      }
      return prev;
    });
  }, []);

  const handleAIProfileChange = useCallback((profile: string) => {
    setAIProfile(profile as AIProfile);
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

  const handleBoardPresetChange = useCallback((presetId: string) => {
    setSelectedBoardPreset(presetId);
  }, []);

  if (!hydrated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#e8e0d0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ color: '#666', fontSize: '1.1rem' }}>Loading game...</div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#e8e0d0',
        padding: 20,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 500,
          width: '100%',
          backgroundColor: '#f5f0e1',
          borderRadius: '12px',
          border: '2px solid #3d2914',
          padding: 32,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <header style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ margin: 0, color: '#3d2914', fontSize: '2.5rem' }}>♟ Rebel Chess</h1>
            <p style={{ margin: '8px 0 0', color: '#666' }}>Capture the Leader to win!</p>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 8, color: '#3d2914' }}>
                Board Preset
              </label>
              <select 
                value={selectedBoardPreset} 
                onChange={(e) => handleBoardPresetChange(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px 16px', 
                  fontSize: '1rem',
                  border: '2px solid #3d2914',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#3d2914',
                }}
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
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 8, color: '#3d2914' }}>
                Move Mode
              </label>
              <select 
                value={moveMode} 
                onChange={(e) => setMoveMode(e.target.value as 'regular' | 'capture-first')}
                style={{ 
                  width: '100%',
                  padding: '12px 16px', 
                  fontSize: '1rem',
                  border: '2px solid #3d2914',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#3d2914',
                }}
              >
                <option value="regular">Regular - Any valid move</option>
                <option value="capture-first">Capture First - Must capture if possible</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 8, color: '#3d2914' }}>                Victory Condition              </label>
              <select 
                value={victoryCondition} 
                onChange={(e) => setVictoryCondition(e.target.value as VictoryCondition)}
                style={{ 
                  width: '100%',
                  padding: '12px 16px', 
                  fontSize: '1rem',
                  border: '2px solid #3d2914',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#3d2914',
                }}
              >
                <option value="capture-leader">Capture Leader - Win by capturing the Leader piece</option>
                <option value="capture-all">Capture All - Win by capturing all opponent pieces</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '1rem', color: '#3d2914' }}>
                <input
                  type="checkbox"
                  checked={vsAI}
                  onChange={(e) => setVsAI(e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: '#3d2914' }}
                />
                <span>Play vs AI (You play White)</span>
              </label>
            </div>

            {vsAI && (
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 8, color: '#3d2914' }}>
                  AI Profile
                </label>
                <select 
                  value={aiProfile} 
                  onChange={(e) => handleAIProfileChange(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '12px 16px', 
                    fontSize: '1rem',
                    border: '2px solid #3d2914',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: '#3d2914',
                  }}
                >
                  <option value="bloodthirsty">🩸 Bloodthirsty - Prefers captures</option>
                  <option value="random">🎲 Random - Fully random moves</option>
                </select>
              </div>
            )}

            <button 
              onClick={handleStartGame}
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: '#3d2914',
                color: '#f5f0e1',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: 8,
                transition: 'background-color 0.2s, transform 0.1s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#5a3d29'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#3d2914'; }}
            >
              🎮 Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#e8e0d0',
      padding: 20,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#3d2914', fontSize: '2rem' }}>♟ Rebel Chess</h1>
            <p style={{ margin: '4px 0 0', color: '#666' }}>Capture the Leader to win!</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              onClick={handleBackToSetup}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                backgroundColor: '#8b7355',
                color: '#f5f0e1',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#a68a6b'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#8b7355'; }}
            >
              ↩️ Return to Game Setup
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              style={{
                padding: '10px 16px',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                backgroundColor: '#8b7355',
                color: '#f5f0e1',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#a68a6b'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#8b7355'; }}
              aria-label="Settings"
            >
              <span style={{ fontSize: '1rem' }}>⚙️</span>
            </button>
          </div>
        </header>

        {gameState && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>            <GameStatus state={gameState} />
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Board
                board={gameState.board}
                boardSize={gameState.boardSize}
                squareSize={squareSize}
                selectedPiece={gameState.selectedPiece}
                validMoves={gameState.validMoves}
                lastMove={lastMove}
                checkPosition={null}
                onSquareClick={handleSquareClick}
                showLeaderIndicator={gameState.victoryCondition === 'capture-leader'}
                pieceDefinitions={gameState.pieceDefinitions}
                hoverMovesEnabled={hoverMovesEnabled}
                animatingMove={gameState.animatingMove}
              />
            </div>

            <CapturedPieces
              capturedWhite={gameState.capturedPieces.white}
              capturedBlack={gameState.capturedPieces.black}
              squareSize={squareSize}
              pieceDefinitions={gameState.pieceDefinitions}
            />

            <MoveHistory
              moves={gameState.moveHistory}
              onMoveClick={() => {}}
            />
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
        />
      </div>
    </div>
  );
};

export default App;
