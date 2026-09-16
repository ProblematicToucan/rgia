import React from "react";

interface CopilotInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputMessage: string;
  setInputMessage: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isBusy: boolean;
  isResuming: boolean;
}

export function CopilotInput({
  inputRef,
  inputMessage,
  setInputMessage,
  onSubmit,
  onCancel,
  isBusy,
  isResuming,
}: CopilotInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="copilot-footer">
      <form className="copilot-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="copilot-input"
          type="text"
          placeholder={isResuming ? "Connecting..." : "Ask Copilot..."}
          value={inputMessage}
          disabled={isResuming}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {isBusy ? (
          <button
            type="button"
            className="copilot-cancel-btn"
            onClick={onCancel}
            title="Stop generating"
            aria-label="Stop generating"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            className="copilot-send-btn"
            disabled={!inputMessage.trim() || isResuming}
            title="Send message"
            aria-label="Send message"
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}

