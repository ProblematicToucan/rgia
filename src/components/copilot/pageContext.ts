import type { ClientContext } from "./types";

/**
 * Extracts ephemeral browser context to provide to the Copilot agent,
 * including current URL path, page title, and visible headings/sections.
 */
export function getPageContext(): ClientContext {
  const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

  const currentUrl = isBrowser ? window.location.pathname : "/";
  const pageTitle = isBrowser ? document.title : "";
  const pageSections = isBrowser
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
    currentUrl,
    pageTitle,
    pageSections,
  };
}

