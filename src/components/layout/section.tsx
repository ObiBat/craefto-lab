import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
}

function Section({ className, spacing = "lg", children, ...props }: SectionProps) {
  const spacingClasses = {
    xs: "py-8 md:py-10",
    sm: "py-10 md:py-14",
    md: "py-14 md:py-20",
    lg: "py-16 md:py-24",
    xl: "py-24 md:py-32",
  };

  return (
    <section className={cn(spacingClasses[spacing], className)} {...props}>
      {children}
    </section>
  );
}

export { Section };
