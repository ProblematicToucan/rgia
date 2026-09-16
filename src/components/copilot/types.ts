export type ActionType = "console_log" | "scroll_to" | "navigate";

export interface BrowserActionParams {
  message?: string;
  selector?: string;
  url?: string;
}

export interface BrowserActionInput {
  action: ActionType;
  params?: BrowserActionParams;
}

export interface BrowserActionResult {
  ok: boolean;
  action: string;
  details?: string;
  error?: string;
}

export interface ActionNotification {
  id: string;
  type: ActionType;
  status: "success" | "error";
  summary: string;
}

export interface ClientContext {
  [key: string]: string | string[];
  currentUrl: string;
  pageTitle: string;
  pageSections: string[];
}

export interface CopilotProps {
  initialOpen?: boolean;
}
