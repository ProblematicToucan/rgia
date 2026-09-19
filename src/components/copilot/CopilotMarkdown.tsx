import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { scrollToElement, navigateClient } from "./browserActions";

interface CopilotMarkdownProps {
  content: string;
  isUser?: boolean;
}

export function CopilotMarkdown({ content, isUser = false }: CopilotMarkdownProps) {
  if (isUser) {
    return <div className="copilot-markdown user-markdown">{content}</div>;
  }

  return (
    <div className="copilot-markdown assistant-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Format links and handle smooth anchor scrolling / in-site navigation
          a: ({ href, children, node: _node, ...props }) => {
            const isAnchor = href?.startsWith("#");
            const isInternalRoute = href?.startsWith("/");

            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (isAnchor && href) {
                e.preventDefault();
                scrollToElement(href);
              } else if (isInternalRoute && href) {
                e.preventDefault();
                void navigateClient(href);
              }
            };

            return (
              <a
                href={href}
                onClick={handleClick}
                target={isAnchor || isInternalRoute ? undefined : "_blank"}
                rel={isAnchor || isInternalRoute ? undefined : "noopener noreferrer"}
                className="copilot-link"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Custom code rendering: transforms section selectors like #services-ai into interactive jump pills
          code: ({ className, children, node: _node, ...props }) => {
            const text = String(children || "").trim();
            const isSelector = /^#[a-zA-Z0-9_-]+$/.test(text);

            if (isSelector) {
              return (
                <button
                  type="button"
                  className="copilot-section-pill"
                  onClick={() => scrollToElement(text)}
                  title={`Jump to section ${text}`}
                >
                  <span className="copilot-pill-hash">#</span>
                  <span>{text.slice(1)}</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </button>
              );
            }

            return (
              <code className={className ? className : "copilot-inline-code"} {...props}>
                {children}
              </code>
            );
          },

          // Code blocks with syntax container & copy action
          pre: ({ children, node: _node, ...props }) => {
            return <CodeBlock {...props}>{children}</CodeBlock>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  // Extract raw string content from code child
  let rawCode = "";
  if (
    React.isValidElement(children) &&
    (children.props as { children?: React.ReactNode })?.children
  ) {
    rawCode = String((children.props as { children?: React.ReactNode }).children).trim();
  } else if (typeof children === "string") {
    rawCode = children.trim();
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="copilot-code-block">
      <div className="copilot-code-block-header">
        <span>Code</span>
        <button
          type="button"
          className="copilot-code-copy-btn"
          onClick={handleCopy}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}
