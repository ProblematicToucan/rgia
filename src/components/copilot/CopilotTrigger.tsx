import React from "react";

interface CopilotTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function CopilotTrigger({ isOpen, onToggle }: CopilotTriggerProps) {
  return (
    <button
      type="button"
      className="copilot-trigger"
      onClick={onToggle}
      aria-label={isOpen ? "Close Copilot" : "Open Copilot"}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isOpen ? (
          <path d="M18 6L6 18M6 6l12 12" />
        ) : (
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        )}
      </svg>
      <span>{isOpen ? "Close Copilot" : "Ask Copilot"}</span>
    </button>
  );
}

