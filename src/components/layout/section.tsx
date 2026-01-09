import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
  as?: React.ElementType;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = "lg", as: Component = "section", children, ...props }, ref) => {
    const spacingClasses = {
      xs: "py-8 md:py-10",
      sm: "py-12 md:py-16",
      md: "py-16 md:py-20",
      lg: "py-20 md:py-24",
      xl: "py-24 md:py-32",
    };

    return (
      <Component
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Section.displayName = "Section";

export { Section };
