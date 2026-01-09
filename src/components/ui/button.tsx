import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-accent))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--color-foreground))] text-[hsl(var(--color-background))] rounded-full btn-magnetic btn-fill-hover",
        accent:
          "bg-[hsl(var(--color-accent))] text-white rounded-full btn-magnetic btn-fill-hover",
        secondary:
          "bg-transparent text-[hsl(var(--color-foreground))] rounded-full border border-[hsl(var(--color-border-strong))] btn-magnetic btn-border-hover",
        ghost:
          "text-[hsl(var(--color-foreground))] rounded-full hover:bg-[hsl(var(--color-background-muted))] btn-magnetic",
        link: "text-[hsl(var(--color-foreground))] underline-offset-4 hover:underline hover:text-[hsl(var(--color-accent))]",
      },
      size: {
        sm: "h-10 px-5 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  hoverText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, disabled, children, hoverText, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isAnimated = variant !== "link" && !loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : isAnimated && !asChild ? (
          <span className="btn-text-wrapper">
            <span className="btn-text-primary">{children}</span>
            <span className="btn-text-secondary" aria-hidden="true">{hoverText || children}</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
