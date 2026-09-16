import React from "react";

interface CopilotHeaderProps {
  isBusy: boolean;
  status: string;
  hasError: boolean;
  onReset: () => void;
  onClose: () => void;
}

export function CopilotHeader({
  isBusy,
  status,
  hasError,
  onReset,
  onClose,
}: CopilotHeaderProps) {
  return (
    <div className="copilot-header">
      <div className="copilot-title-group">
        <span
          className={`copilot-status-dot ${isBusy ? "busy" : ""} ${
            hasError ? "error" : ""
          }`}
          title={`Status: ${status}`}
        />
        <span className="copilot-title">Copilot</span>
      </div>

      <div className="copilot-header-actions">
        <button
          type="button"
          className="copilot-icon-btn"
          onClick={onReset}
          title="Reset conversation"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <button
          type="button"
          className="copilot-icon-btn"
          onClick={onClose}
          title="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

