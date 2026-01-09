import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
}

function Section({ className, spacing = "lg", children, ...props }: SectionProps) {
  const spacingClasses = {
    xs: "py-10 md:py-12",
    sm: "py-14 md:py-20",
    md: "py-20 md:py-28",
    lg: "py-24 md:py-32",
    xl: "py-32 md:py-40",
  };

  return (
    <section className={cn(spacingClasses[spacing], className)} {...props}>
      {children}
    </section>
  );
}

export { Section };
