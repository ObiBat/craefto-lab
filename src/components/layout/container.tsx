import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  as?: "div" | "section" | "article" | "main";
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "full", as = "div", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "max-w-2xl",
      md: "max-w-3xl",
      lg: "max-w-5xl",
      xl: "max-w-6xl",
      full: "max-w-[87.5rem]",
    };

    const Tag = as;

    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Container.displayName = "Container";

export { Container };
