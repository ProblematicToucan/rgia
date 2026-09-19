import React from "react";
import type { useCopilotAgent } from "./useCopilotAgent";
import { CopilotMarkdown } from "./CopilotMarkdown";

interface CopilotMessagesProps {
  messages: ReturnType<typeof useCopilotAgent>["messages"];
  isBusy: boolean;
  error: ReturnType<typeof useCopilotAgent>["error"];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSendMessage?: (text: string) => void;
}

export function CopilotMessages({
  messages,
  isBusy,
  error,
  messagesEndRef,
  onSendMessage,
}: CopilotMessagesProps) {
  const showTypingIndicator =
    isBusy && messages[messages.length - 1]?.role !== "assistant";

  return (
    <div className="copilot-messages">
      {messages.length === 0 ? (
        <div className="copilot-empty-state">
          <div className="copilot-empty-icon">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <strong className="copilot-empty-title">How can I help you today?</strong>
          <p className="copilot-empty-desc">
            Explore RGIA&apos;s enterprise services, jump directly to sections, or discuss technical solutions.
          </p>

          {onSendMessage && (
            <div className="copilot-suggestions">
              <button
                type="button"
                className="copilot-suggestion-btn"
                onClick={() => onSendMessage("What core services does RGIA provide?")}
              >
                💼 What core services does RGIA provide?
              </button>
              <button
                type="button"
                className="copilot-suggestion-btn"
                onClick={() => onSendMessage("Tell me about your AI & Emerging Tech capabilities")}
              >
                🤖 Tell me about AI capabilities
              </button>
              <button
                type="button"
                className="copilot-suggestion-btn"
                onClick={() => onSendMessage("Show me your client proof points and case studies")}
              >
                📊 Show me case studies
              </button>
            </div>
          )}
        </div>
      ) : (
        messages.map((message) => {
          const textContent = message.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("");

          if (!textContent) return null;

          return (
            <div key={message.id} className={`copilot-message ${message.role}`}>
              {message.role === "assistant" && (
                <div className="copilot-avatar" aria-hidden="true" title="RGIA Copilot">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                  >
                    <path d="M12 2L14.7 8.5L21.5 9.3L16.4 14L17.8 20.8L12 17.3L6.2 20.8L7.6 14L2.5 9.3L9.3 8.5L12 2Z" />
                  </svg>
                </div>
              )}
              <div className="copilot-bubble">
                <CopilotMarkdown
                  content={textContent}
                  isUser={message.role === "user"}
                />
              </div>
            </div>
          );
        })
      )}

      {/* In-flight typing/streaming indicator */}
      {showTypingIndicator && (
        <div className="copilot-message assistant">
          <div className="copilot-avatar" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M12 2L14.7 8.5L21.5 9.3L16.4 14L17.8 20.8L12 17.3L6.2 20.8L7.6 14L2.5 9.3L9.3 8.5L12 2Z" />
            </svg>
          </div>
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
      {error && (
        <div className="copilot-error">
          <strong>Error:</strong> {error.message || "Failed to communicate with agent."}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
