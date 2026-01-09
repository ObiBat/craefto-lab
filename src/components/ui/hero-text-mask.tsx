"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

interface HeroTextMaskProps {
  children: ReactNode;
  className?: string;
  darkClassName?: string;
  lightClassName?: string;
}

interface Blob {
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
  const [isOverlapping, setIsOverlapping] = useState(false);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const checkOverlap = () => {
      const container = containerRef.current;
      if (!container) {
        animationId = requestAnimationFrame(checkOverlap);
        return;
      }

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const t = elapsed * 1.2; // Match shader time multiplier

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Calculate metaball container center based on CSS positioning
      // Mobile: full width + translate-x-[30%]
      // Desktop (md+): right 55% of screen
      let centerX: number;
      let centerY: number;
      let scale: number;

      if (vw >= 768) {
        // Desktop: positioned at right 55%, so center is at 72.5% from left
        centerX = vw * 0.725;
        centerY = vh * 0.5;
        scale = Math.min(vw * 0.55, vh) * 0.4;
      } else {
        // Mobile: centered + 30% offset to right
        centerX = vw * 0.5 + vw * 0.3;
        centerY = vh * 0.5;
        scale = Math.min(vw, vh) * 0.35;
      }

      // Calculate blob positions matching shader exactly
      const blobs: Blob[] = [
        // Core with breathing
        {
          x: centerX,
          y: centerY,
          r: scale * (0.22 + Math.sin(t * 3.0) * 0.04) * 2.2,
        },
        // Orbiter 1
        {
          x: centerX + (Math.sin(t * 1.4) * 0.35 + Math.cos(t * 2.1) * 0.1) * scale,
          y: centerY - Math.cos(t * 1.2) * 0.25 * scale,
          r: scale * (0.16 + Math.sin(t * 2.5) * 0.03) * 2.2,
        },
        // Orbiter 2
        {
          x: centerX + Math.cos(t * 1.6) * 0.3 * scale,
          y: centerY - (Math.sin(t * 1.8) * 0.2 + Math.cos(t * 2.4) * 0.1) * scale,
          r: scale * (0.14 + Math.cos(t * 2.8) * 0.025) * 2.2,
        },
        // Small particle
        {
          x: centerX + Math.sin(t * 2.5) * 0.4 * scale,
          y: centerY - Math.cos(t * 2.2) * 0.3 * scale,
          r: scale * (0.08 + Math.sin(t * 4.0) * 0.02) * 2.2,
        },
      ];

      // Get text element bounds
      const textRect = container.getBoundingClientRect();
      const textCenterX = textRect.left + textRect.width * 0.5;
      const textCenterY = textRect.top + textRect.height * 0.5;

      // Check multiple points along the text
      const samplePoints = [
        { x: textRect.left + textRect.width * 0.2, y: textCenterY },
        { x: textRect.left + textRect.width * 0.4, y: textCenterY },
        { x: textCenterX, y: textCenterY },
        { x: textRect.left + textRect.width * 0.6, y: textCenterY },
        { x: textRect.left + textRect.width * 0.8, y: textCenterY },
      ];

      // Check if any sample point is inside any blob
      let hasOverlap = false;
      for (const point of samplePoints) {
        for (const blob of blobs) {
          const dx = point.x - blob.x;
          const dy = point.y - blob.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < blob.r) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) break;
      }

      setIsOverlapping(hasOverlap);
      animationId = requestAnimationFrame(checkOverlap);
    };

    animationId = requestAnimationFrame(checkOverlap);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className={`${className}`}>
      <div
        className={isOverlapping ? lightClassName : darkClassName}
        style={{ transition: "color 0.15s ease-out" }}
      >
        {children}
      </div>
    </div>
  );
}
