import type { BrowserActionInput, BrowserActionResult } from "./types";

/**
 * Navigates client using Astro View Transitions if available,
 * falling back to window.location.href.
 */
export async function navigateClient(url: string): Promise<void> {
  try {
    const { navigate } = await import("astro:transitions/client");
    await navigate(url);
  } catch {
    window.location.href = url;
  }
}

/**
 * Validates a navigation URL for origin safety to prevent open redirects.
 */
export function validateNavigationUrl(rawUrl?: string): { ok: true; url: string } | { ok: false; error: string } {
  const url = rawUrl?.trim();
  if (!url) {
    return { ok: false, error: "No destination URL provided for navigate action." };
  }

  // Security check: disallow external origins to prevent phishing
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      if (typeof window !== "undefined" && parsed.origin !== window.location.origin) {
        return {
          ok: false,
          error: `External navigation to "${url}" was blocked for security. Only site routes are permitted.`,
        };
      }
    } catch {
      return { ok: false, error: `Invalid URL format: "${url}".` };
    }
  }

  return { ok: true, url };
}

/**
 * Smoothly scrolls to an element matching the given selector or ID,
 * highlights it temporarily, or returns available section hints if not found.
 */
export function scrollToElement(rawSelector?: string): BrowserActionResult {
  const selector = rawSelector?.trim();
  if (!selector) {
    return {
      ok: false,
      action: "scroll_to",
      error: "No selector provided for scroll_to action.",
    };
  }

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

    return {
      ok: true,
      action: "scroll_to",
      details: `Scrolled to ${selector}`,
    };
  }

  const availableSections = Array.from(
    document.querySelectorAll("section[id], h1[id], h2[id], div[id]")
  )
    .map((s) => `#${s.id}`)
    .filter((id) => id !== "#container" && id !== "#news")
    .slice(0, 8)
    .join(", ");

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  return {
    ok: false,
    action: "scroll_to",
    error: `Element "${selector}" not found on page ${currentPath}. Available sections here: ${
      availableSections || "none"
    }`,
  };
}

/**
 * Logs a styled message to the browser console.
 */
export function logToConsole(message?: string): BrowserActionResult {
  console.log(
    "%c[Copilot Browser Action] console_log:",
    "color: #2563eb; font-weight: bold; font-size: 13px;",
    message
  );
  return {
    ok: true,
    action: "console_log",
    details: `Logged: "${message || ""}"`,
  };
}

/**
 * Executes a requested browser action and returns a normalized result.
 */
export async function executeBrowserAction(input: BrowserActionInput): Promise<BrowserActionResult> {
  const { action, params } = input;

  switch (action) {
    case "console_log":
      return logToConsole(params?.message);

    case "scroll_to":
      return scrollToElement(params?.selector);

    case "navigate": {
      const validation = validateNavigationUrl(params?.url);
      if (!validation.ok) {
        return {
          ok: false,
          action: "navigate",
          error: validation.error,
        };
      }

      console.log(
        "%c[Copilot Browser Action] navigate via View Transitions:",
        "color: #8b5cf6; font-weight: bold; font-size: 13px;",
        validation.url
      );

      await navigateClient(validation.url);
      return {
        ok: true,
        action: "navigate",
        details: `Navigated to ${validation.url}`,
      };
    }

    default:
      return {
        ok: false,
        action: String(action),
        error: `Unknown action type: "${action}".`,
      };
  }
}

