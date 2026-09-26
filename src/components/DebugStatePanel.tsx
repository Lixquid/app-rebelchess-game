/**
 * Debug panel: shows the raw game state as pretty-printed JSON
 */

import { useState } from 'react';
import type { GameState } from '../core/types';

interface DebugStatePanelProps {
  gameState: GameState;
}

export function DebugStatePanel({ gameState }: DebugStatePanelProps) {
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(gameState, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn('Failed to copy debug state:', e);
    }
  };

  return (
    <div className="debug-panel">
      <div className="debug-panel-header">
        <span>🐛 Debug — Raw Game State</span>
        <button className="btn btn-small" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy JSON'}
        </button>
      </div>
      <pre className="debug-panel-json">{json}</pre>
    </div>
  );
}
