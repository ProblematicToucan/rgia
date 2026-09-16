import React from "react";
import type { ActionNotification } from "./types";

interface CopilotActionBannerProps {
  action: ActionNotification | null;
  onDismiss: () => void;
}

export function CopilotActionBanner({ action, onDismiss }: CopilotActionBannerProps) {
  if (!action) return null;

  return (
    <div className={`copilot-action-banner ${action.status}`}>
      <span className="copilot-action-icon">
        {action.status === "success" ? "✓" : "⚠"}
      </span>
      <span className="copilot-action-text">{action.summary}</span>
      <button
        type="button"
        className="copilot-action-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

