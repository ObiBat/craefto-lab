import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full appearance-none rounded-xl border bg-[hsl(var(--color-background))] px-4 py-3 text-base transition-colors duration-[var(--duration-fast)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-background))]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat pr-12",
          error
            ? "border-[hsl(var(--color-error))] focus-visible:ring-[hsl(var(--color-error))]"
            : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-strong))]",
          className
        )}
        ref={ref}
        aria-invalid={ariaInvalid ?? error}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
