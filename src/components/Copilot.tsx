import React, { useState, useRef, useEffect } from "react";
import "./Copilot.css";
import type { CopilotProps } from "./copilot/types";
import { useCopilotAgent } from "./copilot/useCopilotAgent";
import { CopilotTrigger } from "./copilot/CopilotTrigger";
import { CopilotHeader } from "./copilot/CopilotHeader";
import { CopilotActionBanner } from "./copilot/CopilotActionBanner";
import { CopilotMessages } from "./copilot/CopilotMessages";
import { CopilotInput } from "./copilot/CopilotInput";

export type { CopilotProps };

export function Copilot({ initialOpen = false }: CopilotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    status,
    isBusy,
    isResuming,
    error,
    lastAction,
    sendMessage,
    cancel,
    reset,
    dismissAction,
  } = useCopilotAgent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom and auto-focus input when opened or messages/status update
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, status]);

  // Maintain scroll position after Astro ClientRouter page transitions
  useEffect(() => {
    const handlePageLoad = () => {
      if (isOpen) {
        scrollToBottom();
      }
    };
    document.addEventListener("astro:page-load", handlePageLoad);
    return () => document.removeEventListener("astro:page-load", handlePageLoad);
  }, [isOpen]);

  const handleSubmit = () => {
    const text = inputMessage.trim();
    if (!text) return;
    setInputMessage("");
    void sendMessage(text);
  };

  return (
    <div className="copilot-container">
      <CopilotTrigger
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
      />

      {isOpen && (
        <div className="copilot-window">
          <CopilotHeader
            isBusy={isBusy}
            status={status}
            hasError={Boolean(error)}
            onReset={reset}
            onClose={() => setIsOpen(false)}
          />

          <CopilotActionBanner
            action={lastAction}
            onDismiss={dismissAction}
          />

          <CopilotMessages
            messages={messages}
            isBusy={isBusy}
            error={error}
            messagesEndRef={messagesEndRef}
            onSendMessage={(text) => void sendMessage(text)}
          />

          <CopilotInput
            inputRef={inputRef}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSubmit={handleSubmit}
            onCancel={cancel}
            isBusy={isBusy}
            isResuming={isResuming}
          />
        </div>
      )}
    </div>
  );
}

export default Copilot;
