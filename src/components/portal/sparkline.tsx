"use client";

import { useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// ============================================================================
// SPARKLINE — Lightweight SVG activity chart for project cards
// ============================================================================

interface SparklineProps {
  /** Array of numeric values representing activity counts */
  data: number[];
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
  /** Stroke color (CSS value) */
  color?: string;
  /** Fill gradient opacity (0-1) */
  fillOpacity?: number;
  /** Accessible label */
  label?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = "hsl(var(--color-accent))",
  fillOpacity = 0.15,
  label = "Activity over last 30 days",
}: SparklineProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();

  const { linePath, fillPath } = useMemo(() => {
    if (!data.length) return { linePath: "", fillPath: "" };

    const max = Math.max(...data, 1);
    const padding = 2;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    const points = data.map((value, i) => ({
      x: padding + (i / Math.max(data.length - 1, 1)) * usableWidth,
      y: padding + usableHeight - (value / max) * usableHeight,
    }));

    // Smooth curve using cardinal spline
    const line = smoothPath(points);
    const fill = `${line} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return { linePath: line, fillPath: fill };
  }, [data, width, height]);

  if (!data.length) return null;

  const gradientId = `sparkline-grad-${useMemo(() => Math.random().toString(36).slice(2, 8), [])}`;

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="transition-opacity duration-300 group-hover:opacity-100 opacity-70"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <motion.path
        d={fillPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
      />
      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={
          isInView
            ? { pathLength: prefersReducedMotion ? 1 : 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={{
          pathLength: { duration: prefersReducedMotion ? 0 : 0.8, ease: "easeOut" },
          opacity: { duration: 0.2 },
        }}
      />
    </svg>
  );
}

// ============================================================================
// SMOOTH PATH HELPER (cardinal spline approximation)
// ============================================================================

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const tension = 0.3;
    const cp1x = p1.x + ((p2.x - p0.x) * tension);
    const cp1y = p1.y + ((p2.y - p0.y) * tension);
    const cp2x = p2.x - ((p3.x - p1.x) * tension);
    const cp2y = p2.y - ((p3.y - p1.y) * tension);

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

// ============================================================================
// HELPER: Generate sparkline data from updates/activity timestamps
// ============================================================================

export function generateSparklineData(
  timestamps: string[],
  days: number = 30
): number[] {
  const now = new Date();
  const buckets = new Array(days).fill(0);

  for (const ts of timestamps) {
    const date = new Date(ts);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < days) {
      buckets[days - 1 - diffDays]++;
    }
  }

  return buckets;
}
