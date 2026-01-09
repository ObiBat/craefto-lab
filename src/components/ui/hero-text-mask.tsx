"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

interface HeroTextMaskProps {
  children: ReactNode;
  className?: string;
  darkClassName?: string;
  lightClassName?: string;
}

export function HeroTextMask({
  children,
  className = "",
  darkClassName = "text-[hsl(var(--color-foreground))]",
  lightClassName = "text-white",
}: HeroTextMaskProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const glRef = useRef<WebGLRenderingContext | WebGL2RenderingContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Find and cache the WebGL canvas
    const findCanvas = () => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      if (canvas && !canvasRef.current) {
        canvasRef.current = canvas;
        glRef.current = canvas.getContext("webgl", { preserveDrawingBuffer: true })
          || canvas.getContext("webgl2", { preserveDrawingBuffer: true });
      }
    };

    // Initial find
    findCanvas();

    // Retry if not found
    const retryTimeout = setTimeout(findCanvas, 500);

    return () => clearTimeout(retryTimeout);
  }, []);

  useEffect(() => {
    let animationId: number;
    const pixels = new Uint8Array(4);

    const checkOverlap = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const gl = glRef.current;

      if (!container || !canvas || !gl) {
        animationId = requestAnimationFrame(checkOverlap);
        return;
      }

      const textRect = container.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      // Sample points across the text area
      const sampleCount = 7;
      let darkPixelCount = 0;

      for (let i = 0; i < sampleCount; i++) {
        // Sample across the width of the text
        const xRatio = (i + 0.5) / sampleCount;
        const screenX = textRect.left + textRect.width * xRatio;
        const screenY = textRect.top + textRect.height * 0.5;

        // Convert to canvas coordinates
        const canvasX = Math.floor(
          ((screenX - canvasRect.left) / canvasRect.width) * canvas.width
        );
        const canvasY = Math.floor(
          canvas.height - ((screenY - canvasRect.top) / canvasRect.height) * canvas.height
        );

        if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
          try {
            gl.readPixels(canvasX, canvasY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

            const brightness = (pixels[0] + pixels[1] + pixels[2]) / 3;
            const alpha = pixels[3];

            // Dark pixel with significant alpha
            if (alpha > 100 && brightness < 60) {
              darkPixelCount++;
            }
          } catch {
            // Ignore read errors
          }
        }
      }

      // If any sample points are dark, switch to light text
      setIsDark(darkPixelCount >= 1);
      animationId = requestAnimationFrame(checkOverlap);
    };

    // Start checking after a short delay
    const startTimeout = setTimeout(() => {
      animationId = requestAnimationFrame(checkOverlap);
    }, 200);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={isDark ? lightClassName : darkClassName}
        style={{ transition: "color 0.1s ease-out" }}
      >
        {children}
      </div>
    </div>
  );
}
