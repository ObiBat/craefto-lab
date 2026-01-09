"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

interface HeroTextMaskProps {
  children: ReactNode;
  className?: string;
  darkClassName?: string;
  lightClassName?: string;
}

interface BlobPosition {
  x: number;
  y: number;
  r: number;
}

export function HeroTextMask({
  children,
  className = "",
  darkClassName = "text-[hsl(var(--color-foreground))]",
  lightClassName = "text-white",
}: HeroTextMaskProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blobs, setBlobs] = useState<BlobPosition[]>([]);
  const [maskId] = useState(() => `hero-mask-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let animationId: number;
    const startTime = performance.now();

    const animate = () => {
      if (!containerRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = (performance.now() - startTime) / 1000;
      const t = elapsed * 1.2;

      // Get the metaball container position relative to viewport
      // The metaballs are positioned at: md:right-0 md:w-[55%] or translate-x-[30%] on mobile
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate metaball container bounds
      let metaballCenterX: number;
      let metaballCenterY: number;
      let scale: number;

      if (viewportWidth >= 768) {
        // Desktop: right 55% of screen
        metaballCenterX = viewportWidth * 0.725; // center of right 55%
        metaballCenterY = viewportHeight * 0.5;
        scale = Math.min(viewportWidth * 0.55, viewportHeight) * 0.35;
      } else {
        // Mobile: full width but translated 30% right
        metaballCenterX = viewportWidth * 0.5 + viewportWidth * 0.3;
        metaballCenterY = viewportHeight * 0.5;
        scale = Math.min(viewportWidth, viewportHeight) * 0.3;
      }

      // Convert to container-relative coordinates
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = rect.left;
      const offsetY = rect.top;

      // Calculate blob positions (matching shader math)
      const newBlobs: BlobPosition[] = [
        // Core
        {
          x: metaballCenterX - offsetX,
          y: metaballCenterY - offsetY,
          r: scale * (0.22 + Math.sin(t * 3.0) * 0.04) * 2.5,
        },
        // Orbiter 1
        {
          x: metaballCenterX - offsetX + (Math.sin(t * 1.4) * 0.35 + Math.cos(t * 2.1) * 0.1) * scale,
          y: metaballCenterY - offsetY - Math.cos(t * 1.2) * 0.25 * scale,
          r: scale * (0.16 + Math.sin(t * 2.5) * 0.03) * 2.5,
        },
        // Orbiter 2
        {
          x: metaballCenterX - offsetX + Math.cos(t * 1.6) * 0.3 * scale,
          y: metaballCenterY - offsetY - (Math.sin(t * 1.8) * 0.2 + Math.cos(t * 2.4) * 0.1) * scale,
          r: scale * (0.14 + Math.cos(t * 2.8) * 0.025) * 2.5,
        },
        // Particle
        {
          x: metaballCenterX - offsetX + Math.sin(t * 2.5) * 0.4 * scale,
          y: metaballCenterY - offsetY - Math.cos(t * 2.2) * 0.3 * scale,
          r: scale * (0.08 + Math.sin(t * 4.0) * 0.02) * 2.5,
        },
      ];

      setBlobs(newBlobs);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* SVG Mask Definition */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            {/* White background = visible, black = hidden */}
            <rect x="0" y="0" width="100%" height="100%" fill="black" />
            {blobs.map((blob, i) => (
              <circle
                key={i}
                cx={blob.x}
                cy={blob.y}
                r={blob.r}
                fill="white"
              />
            ))}
          </mask>
        </defs>
      </svg>

      {/* Dark text layer (always visible) */}
      <div className={darkClassName}>
        {children}
      </div>

      {/* Light text layer (only visible where blobs are) */}
      <div
        className={`absolute inset-0 ${lightClassName}`}
        style={{ mask: `url(#${maskId})`, WebkitMask: `url(#${maskId})` }}
      >
        {children}
      </div>
    </div>
  );
}
