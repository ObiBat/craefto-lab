import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
  as?: "section" | "div" | "article" | "aside";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = "lg", as = "section", children, ...props }, ref) => {
    const spacingClasses = {
      xs: "py-8 md:py-10",
      sm: "py-12 md:py-16",
      md: "py-16 md:py-20",
      lg: "py-20 md:py-24",
      xl: "py-24 md:py-32",
    };

    const Tag = as;

    return (
      <Tag
        ref={ref as React.Ref<HTMLElement>}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Section.displayName = "Section";

export { Section };
