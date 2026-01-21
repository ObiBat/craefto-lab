"use client";

interface AdminLoaderProps {
  message?: string;
}

export function AdminLoader({ message = "Loading..." }: AdminLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-2 border-[hsl(var(--color-border))]" />
        {/* Spinning arc */}
        <div className="animate-spin absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-[hsl(var(--color-accent))]" />
      </div>
      <p className="animate-pulse text-sm text-[hsl(var(--color-foreground-muted))]">
        {message}
      </p>
    </div>
  );
}

export function AdminLoaderMinimal() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--color-border))]" />
        <div className="animate-spin absolute inset-0 w-8 h-8 rounded-full border-2 border-transparent border-t-[hsl(var(--color-accent))]" />
      </div>
    </div>
  );
}
