/**
 * Modal dialog components
 */

interface ModalOverlayProps {
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

/**
 * Shared modal overlay: click on the backdrop closes the modal
 */
const ModalOverlay = ({ onClose, children, width = 400 }: ModalOverlayProps) => (
  <div className="modal-overlay" onClick={onClose}>
    <div
      className="modal-box"
      style={{ maxWidth: width }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

interface SetupConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SetupConfirmModal({ isOpen, onConfirm, onCancel }: SetupConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={onCancel}>
      <h3>Return to Setup?</h3>
      <p>
        You have an active game in progress. Are you sure you want to return to
        game setup? Your current game will be lost.
      </p>
      <div className="modal-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Yes, Return to Setup</button>
      </div>
    </ModalOverlay>
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hoverMovesEnabled: boolean;
  onHoverMovesToggle: () => void;
  debugPanelEnabled: boolean;
  onDebugPanelToggle: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  hoverMovesEnabled,
  onHoverMovesToggle,
  debugPanelEnabled,
  onDebugPanelToggle,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={onClose} width={360}>
      <h3 className="modal-title-center">⚙️ Settings</h3>
      <div className="modal-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={hoverMovesEnabled}
            onChange={onHoverMovesToggle}
          />
          <span>Show Move Preview on Hover</span>
        </label>
        <p className="setting-hint">
          When enabled, hovering a piece shows its possible moves (amber dots
          for moves, red rings for captures).
        </p>
      </div>
      <div className="modal-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={debugPanelEnabled}
            onChange={onDebugPanelToggle}
          />
          <span>Show Debug Panel</span>
        </label>
        <p className="setting-hint">
          When enabled, a panel containing the raw game state as JSON is shown
          below the board for debugging purposes.
        </p>
      </div>
      <div className="modal-actions modal-actions-end">
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </ModalOverlay>
  );
}