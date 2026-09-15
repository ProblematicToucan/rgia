import React, { useState, useRef, useEffect, useCallback } from "react";
import { useEveAgent } from "eve/react";
import type { MessageStreamEvent } from "eve/client";
import "./Copilot.css";

export interface CopilotProps {
  initialOpen?: boolean;
}

interface ActionNotification {
  id: string;
  type: "console_log" | "scroll_to" | "navigate";
  summary: string;
}

export function Copilot({ initialOpen = false }: CopilotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [inputMessage, setInputMessage] = useState("");
  const [lastAction, setLastAction] = useState<ActionNotification | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const executedCallIds = useRef<Set<string>>(new Set());

  const publicEveHost = (import.meta as unknown as { env: { PUBLIC_EVE_HOST?: string } }).env
    ?.PUBLIC_EVE_HOST;

  const handleBrowserAction = useCallback(
    (input: {
      action: "console_log" | "scroll_to" | "navigate";
      params?: { message?: string; selector?: string; url?: string };
    }) => {
      const { action, params } = input;

      if (action === "console_log") {
        console.log(
          "%c[Copilot Browser Action] console_log:",
          "color: #2563eb; font-weight: bold; font-size: 13px;",
          params?.message
        );
        setLastAction({
          id: Math.random().toString(),
          type: "console_log",
          summary: `Logged: "${params?.message || ""}"`,
        });
      } else if (action === "scroll_to") {
        const selector = params?.selector;
        if (selector) {
          let el = document.querySelector(selector);
          if (!el && !selector.startsWith("#") && !selector.startsWith(".")) {
            el = document.getElementById(selector);
          }
          if (el) {
            console.log(
              "%c[Copilot Browser Action] scroll_to:",
              "color: #10b981; font-weight: bold; font-size: 13px;",
              selector
            );
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("copilot-highlight");
            setTimeout(() => el?.classList.remove("copilot-highlight"), 2500);

            setLastAction({
              id: Math.random().toString(),
              type: "scroll_to",
              summary: `Scrolled to ${selector}`,
            });
          } else {
            console.warn("[Copilot] Element not found for selector:", selector);
          }
        }
      } else if (action === "navigate") {
        const url = params?.url;
        if (url) {
          console.log(
            "%c[Copilot Browser Action] navigate:",
            "color: #8b5cf6; font-weight: bold; font-size: 13px;",
            url
          );
          setLastAction({
            id: Math.random().toString(),
            type: "navigate",
            summary: `Navigating to ${url}...`,
          });
          setTimeout(() => {
            window.location.href = url;
          }, 600);
        }
      }
    },
    []
  );

  const agent = useEveAgent({
    host: publicEveHost || undefined,
    prepareSend: (input) => {
      const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
      const title = typeof document !== "undefined" ? document.title : "";
      const headings =
        typeof document !== "undefined"
          ? Array.from(document.querySelectorAll("h1, h2, h3, section[id]"))
              .map((el) => {
                const id = el.getAttribute("id");
                const tag = el.tagName.toLowerCase();
                const text = el.textContent?.trim().slice(0, 40);
                return id ? `${tag}#${id} (${text})` : `${tag} (${text})`;
              })
              .filter(Boolean)
              .slice(0, 10)
          : [];

      return {
        ...input,
        clientContext: {
          currentUrl: pathname,
          pageTitle: title,
          pageSections: headings,
        },
      };
    },
    onEvent: (event: MessageStreamEvent) => {
      if (event.type === "actions.requested") {
        for (const action of event.data.actions) {
          if (action.kind === "tool-call" && action.toolName === "browser_action") {
            if (!executedCallIds.current.has(action.callId)) {
              executedCallIds.current.add(action.callId);
              const input = action.input as {
                action: "console_log" | "scroll_to" | "navigate";
                params?: { message?: string; selector?: string; url?: string };
              };
              handleBrowserAction(input);
            }
          }
        }
      }
    },
  });

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
                onClick={() => {
                  executedCallIds.current.clear();
                  setLastAction(null);
                  agent.reset();
                }}
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

          {/* Action Notification Banner */}
          {lastAction && (
            <div className="copilot-action-banner">
              <span className="copilot-action-icon">⚡</span>
              <span className="copilot-action-text">{lastAction.summary}</span>
              <button
                type="button"
                className="copilot-action-dismiss"
                onClick={() => setLastAction(null)}
              >
                ×
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="copilot-messages">
            {agent.data.messages.length === 0 ? (
              <div className="copilot-empty-state">
                <div className="copilot-empty-icon">✨</div>
                <strong>How can I help you today?</strong>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  Ask me to scroll to sections, log messages to console, or navigate!
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

            {/* In-flight typing/streaming indicator */}
            {isBusy &&
              agent.data.messages[agent.data.messages.length - 1]?.role !== "assistant" && (
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
                <strong>Error:</strong>{" "}
                {agent.error.message || "Failed to communicate with agent."}
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
