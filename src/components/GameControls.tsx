/**
 * Game controls component
 */

export interface GameControlsProps {
  onNewGame: () => void;
  onAIMove?: () => void;
  onRandomMove?: () => void;
  vsAI: boolean;
  aiProfile: string;
  moveMode: 'regular' | 'capture-first';
  onMoveModeChange: (mode: 'regular' | 'capture-first') => void;
  onAIProfileChange: (profile: string) => void;
  onVsAIToggle: (enabled: boolean) => void;
  selectedBoardPreset: string;
  onBoardPresetChange: (presetId: string) => void;
  boardPresets: { id: string; name: string; description: string }[];
}

export const GameControls = ({
  onNewGame,
  onAIMove,
  onRandomMove,
  vsAI,
  aiProfile,
  moveMode,
  onMoveModeChange,
  onAIProfileChange,
  onVsAIToggle,
  selectedBoardPreset,
  onBoardPresetChange,
  boardPresets,
}: GameControlsProps) => {
  return (
    <div className="game-controls" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 12,
      padding: 16,
      backgroundColor: '#f5f0e1',
      borderRadius: '8px',
      border: '2px solid #3d2914',
    }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onNewGame} style={buttonStyle}>
          🔄 New Game
        </button>
        {onAIMove && (
          <button onClick={onAIMove} style={buttonStyle}>
            🤖 AI Move
          </button>
        )}
        {onRandomMove && (
          <button onClick={onRandomMove} style={buttonStyle}>
            🎲 Random Move
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={vsAI}
            onChange={(e) => onVsAIToggle(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          <span>Play vs AI (Black)</span>
        </label>
        
        {vsAI && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '0.9rem' }}>AI Profile:</label>
            <select 
              value={aiProfile} 
              onChange={(e) => onAIProfileChange(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '0.9rem' }}
            >
              <option value="bloodthirsty">🩸 Bloodthirsty</option>
              <option value="random">🎲 Random</option>
            </select>
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.9rem' }}>Move Mode:</label>
          <select 
            value={moveMode} 
            onChange={(e) => onMoveModeChange(e.target.value as 'regular' | 'capture-first')}
            style={{ padding: '4px 8px', fontSize: '0.9rem' }}
          >
            <option value="regular">Regular</option>
            <option value="capture-first">Capture First</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.9rem' }}>Board Preset:</label>
          <select 
            value={selectedBoardPreset} 
            onChange={(e) => onBoardPresetChange(e.target.value)}
            style={{ padding: '4px 8px', fontSize: '0.9rem' }}
          >
            {boardPresets.map(preset => (
              <option key={preset.id} value={preset.id} title={preset.description}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '8px 16px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  backgroundColor: '#3d2914',
  color: '#f5f0e1',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};