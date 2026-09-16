import React from "react";
import type { useCopilotAgent } from "./useCopilotAgent";

interface CopilotMessagesProps {
  messages: ReturnType<typeof useCopilotAgent>["messages"];
  isBusy: boolean;
  error: ReturnType<typeof useCopilotAgent>["error"];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function CopilotMessages({
  messages,
  isBusy,
  error,
  messagesEndRef,
}: CopilotMessagesProps) {
  const showTypingIndicator =
    isBusy && messages[messages.length - 1]?.role !== "assistant";

  return (
    <div className="copilot-messages">
      {messages.length === 0 ? (
        <div className="copilot-empty-state">
          <div className="copilot-empty-icon">✨</div>
          <strong>How can I help you today?</strong>
          <p style={{ margin: 0, fontSize: "13px" }}>
            Ask me to scroll to sections, navigate pages, or log to console!
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className={`copilot-message ${message.role}`}>
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

      {/* In-flight typing/streaming indicator */}
      {showTypingIndicator && (
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
      {error && (
        <div className="copilot-error">
          <strong>Error:</strong> {error.message || "Failed to communicate with agent."}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

