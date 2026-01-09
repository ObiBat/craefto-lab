import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[140px] w-full rounded-xl border bg-[hsl(var(--color-background))] px-4 py-3 text-base transition-colors duration-[var(--duration-fast)]",
          "placeholder:text-[hsl(var(--color-foreground-subtle))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-background))]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          error
            ? "border-[hsl(var(--color-error))] focus-visible:ring-[hsl(var(--color-error))]"
            : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-strong))]",
          className
        )}
        ref={ref}
        aria-invalid={ariaInvalid ?? error}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
