"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = React.useState(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const text = preRef.current?.textContent || "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity text-foreground-muted hover:text-foreground"
        aria-label="Copy code"
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <pre
        ref={preRef}
        className={cn(
          "overflow-x-auto rounded-lg bg-[#1a1a1d] p-4 text-sm leading-relaxed",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
