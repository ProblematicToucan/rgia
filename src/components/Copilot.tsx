import React, { useState, useRef, useEffect } from "react";
import { useEveAgent } from "eve/react";
import "./Copilot.css";

export interface CopilotProps {
  initialOpen?: boolean;
}

export function Copilot({ initialOpen = false }: CopilotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const publicEveHost = (import.meta as unknown as { env: { PUBLIC_EVE_HOST?: string } }).env
    ?.PUBLIC_EVE_HOST;

  const agent = useEveAgent(
    publicEveHost ? { host: publicEveHost } : undefined
  );

  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const isResuming = agent.status === "resuming";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, agent.data.messages, agent.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isResuming) return;

    setInputMessage("");
    try {
      await agent.send(text, isBusy ? { turnPolicy: "steer" } : undefined);
    } catch (err) {
      console.error("Failed to send message to Eve agent:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  return (
    <div className="copilot-container">
      {/* Floating Toggle Button */}
      <button
        type="button"
        className="copilot-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
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

      {/* Floating Window */}
      {isOpen && (
        <div className="copilot-window">
          {/* Header */}
          <div className="copilot-header">
            <div className="copilot-title-group">
              <span
                className={`copilot-status-dot ${isBusy ? "busy" : ""} ${
                  agent.error ? "error" : ""
                }`}
                title={`Status: ${agent.status}`}
              />
              <span className="copilot-title">Copilot</span>
            </div>

            <div className="copilot-header-actions">
              <button
                type="button"
                className="copilot-icon-btn"
                onClick={() => agent.reset()}
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
                onClick={() => setIsOpen(false)}
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

          {/* Messages */}
          <div className="copilot-messages">
            {agent.data.messages.length === 0 ? (
              <div className="copilot-empty-state">
                <div className="copilot-empty-icon">✨</div>
                <strong>How can I help you today?</strong>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  Ask questions or chat with your Eve copilot.
                </p>
              </div>
            ) : (
              agent.data.messages.map((message) => (
                <div
                  key={message.id}
                  className={`copilot-message ${message.role}`}
                >
                  <div className="copilot-bubble">
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return <React.Fragment key={index}>{part.text}</React.Fragment>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))
            )}

            {/* In-flight typing/streaming indicator if no partial text yet */}
            {isBusy && agent.data.messages[agent.data.messages.length - 1]?.role !== "assistant" && (
              <div className="copilot-message assistant">
                <div className="copilot-bubble">
                  <div className="copilot-typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {agent.error && (
              <div className="copilot-error">
                <strong>Error:</strong> {agent.error.message || "Failed to communicate with agent."}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Form */}
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
                  onClick={() => agent.cancel()}
                  title="Stop generating"
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
        </div>
      )}
    </div>
  );
}

