"use client";

import { cn } from "@/lib/utils";

interface ProjectImagePlaceholderProps {
  projectName: string;
  imageType: "hero" | "thumb" | "gallery";
  caption?: string;
  className?: string;
  accentColor?: string;
}

const typeLabels = {
  hero: "Hero Image",
  thumb: "Thumbnail",
  gallery: "Gallery",
};

const typeDimensions = {
  hero: "1920 × 1080",
  thumb: "800 × 600",
  gallery: "1600 × 900",
};

export function ProjectImagePlaceholder({
  projectName,
  imageType,
  caption,
  className,
  accentColor,
}: ProjectImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[200px] rounded-xl overflow-hidden",
        "bg-gradient-to-br from-[hsl(var(--color-background-muted))] to-[hsl(var(--color-background-subtle))]",
        "border border-[hsl(var(--color-border))]",
        "flex flex-col items-center justify-center gap-4 p-6",
        className
      )}
      style={accentColor ? {
        background: `linear-gradient(135deg, hsl(${accentColor} / 0.08) 0%, hsl(${accentColor} / 0.02) 100%)`,
        borderColor: `hsl(${accentColor} / 0.2)`,
      } : undefined}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--color-foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--color-foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Icon */}
      <div
        className="relative w-16 h-16 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: accentColor
            ? `hsl(${accentColor} / 0.1)`
            : 'hsl(var(--color-background))',
          border: `1px solid ${accentColor ? `hsl(${accentColor} / 0.2)` : 'hsl(var(--color-border))'}`,
        }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: accentColor ? `hsl(${accentColor})` : 'hsl(var(--color-foreground-subtle))' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* Text content */}
      <div className="relative text-center space-y-2">
        <p className="text-sm font-semibold text-[hsl(var(--color-foreground))]">
          {projectName}
        </p>
        <p className="text-xs text-[hsl(var(--color-foreground-muted))]">
          {typeLabels[imageType]}
        </p>
        {caption && (
          <p className="text-xs text-[hsl(var(--color-foreground-subtle))] max-w-[200px]">
            {caption}
          </p>
        )}
      </div>

      {/* Dimensions badge */}
      <div
        className="relative px-3 py-1.5 rounded-full text-xs font-mono"
        style={{
          backgroundColor: accentColor
            ? `hsl(${accentColor} / 0.1)`
            : 'hsl(var(--color-background))',
          color: accentColor
            ? `hsl(${accentColor})`
            : 'hsl(var(--color-foreground-subtle))',
          border: `1px solid ${accentColor ? `hsl(${accentColor} / 0.2)` : 'hsl(var(--color-border))'}`,
        }}
      >
        {typeDimensions[imageType]}
      </div>

      {/* Corner accents */}
      <div
        className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 rounded-tl-md"
        style={{ borderColor: accentColor ? `hsl(${accentColor} / 0.3)` : 'hsl(var(--color-border-strong))' }}
      />
      <div
        className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 rounded-tr-md"
        style={{ borderColor: accentColor ? `hsl(${accentColor} / 0.3)` : 'hsl(var(--color-border-strong))' }}
      />
      <div
        className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 rounded-bl-md"
        style={{ borderColor: accentColor ? `hsl(${accentColor} / 0.3)` : 'hsl(var(--color-border-strong))' }}
      />
      <div
        className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 rounded-br-md"
        style={{ borderColor: accentColor ? `hsl(${accentColor} / 0.3)` : 'hsl(var(--color-border-strong))' }}
      />
    </div>
  );
}
