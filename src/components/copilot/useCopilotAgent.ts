import { useState, useRef } from "react";
import { useEveAgent } from "eve/react";
import type { MessageStreamEvent } from "eve/client";
import type { ActionNotification, BrowserActionInput } from "./types";
import { executeBrowserAction } from "./browserActions";
import { getPageContext } from "./pageContext";

export function useCopilotAgent() {
  const [lastAction, setLastAction] = useState<ActionNotification | null>(null);
  const executedCallIds = useRef<Set<string>>(new Set());

  const publicEveHost = (import.meta as unknown as { env: { PUBLIC_EVE_HOST?: string } }).env
    ?.PUBLIC_EVE_HOST;

  const agentRef = useRef<ReturnType<typeof useEveAgent> | null>(null);

  const agent = useEveAgent({
    host: publicEveHost || undefined,
    prepareSend: (input) => ({
      ...input,
      clientContext: getPageContext(),
    }),
    onEvent: async (event: MessageStreamEvent) => {
      if (event.type !== "actions.requested") return;

      for (const action of event.data.actions) {
        if (action.kind === "tool-call" && action.toolName === "browser_action") {
          if (executedCallIds.current.has(action.callId)) continue;
          executedCallIds.current.add(action.callId);

          const input = action.input as unknown as BrowserActionInput;
          const result = await executeBrowserAction(input);

          if (result.ok) {
            setLastAction({
              id: action.callId,
              type: input.action,
              status: "success",
              summary: result.details || "Action completed",
            });
          } else {
            setLastAction({
              id: action.callId,
              type: input.action,
              status: "error",
              summary: result.error || "Action failed",
            });

            // Two-way feedback: report execution failure back to agent for self-healing
            if (agentRef.current) {
              void agentRef.current.send(
                `[Client Action Failed]: Action "${result.action}" failed in the browser. Reason: ${result.error}. Please inform the user and suggest an alternative or correct next step.`,
                { turnPolicy: "steer" }
              );
            }
          }
        }
      }
    },
  });

  agentRef.current = agent;

  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const isResuming = agent.status === "resuming";

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isResuming) return;

    try {
      await agent.send(trimmed, isBusy ? { turnPolicy: "steer" } : undefined);
    } catch (err) {
      console.error("Failed to send message to Eve agent:", err);
    }
  };

  const reset = () => {
    executedCallIds.current.clear();
    setLastAction(null);
    agent.reset();
  };

  const cancel = () => {
    agent.cancel();
  };

  const dismissAction = () => {
    setLastAction(null);
  };

  return {
    agent,
    messages: agent.data.messages,
    status: agent.status,
    isBusy,
    isResuming,
    error: agent.error,
    lastAction,
    sendMessage,
    cancel,
    reset,
    dismissAction,
  };
}

