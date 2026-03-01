"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { smoothTransition, instantTransition } from "@/components/ui/motion";
import type { TimelineEvent, PortalUser } from "@/lib/portal/types";

// ============================================================================
// CONSTANTS
// ============================================================================

const TIMELINE_TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; statusColor: string }
> = {
  update: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1H2a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V2a1 1 0 00-1-1z" />
        <path d="M4 4h6M4 7h4" />
      </svg>
    ),
    color: "bg-[hsl(var(--color-accent))]",
    statusColor: "border-[hsl(var(--color-accent))]",
  },
  task_completed: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 7.5l2.5 2.5 4.5-5" />
      </svg>
    ),
    color: "bg-[hsl(var(--color-success))]",
    statusColor: "border-[hsl(var(--color-success))]",
  },
  status_change: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 7h12M9 3l4 4-4 4" />
      </svg>
    ),
    color: "bg-[hsl(var(--color-warning))]",
    statusColor: "border-[hsl(var(--color-warning))]",
  },
  member_joined: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="4.5" r="2.5" />
        <path d="M2 13c0-2.8 2.2-4 5-4s5 1.2 5 4" />
      </svg>
    ),
    color: "bg-[hsl(var(--color-neutral-500))]",
    statusColor: "border-[hsl(var(--color-neutral-400))]",
  },
  milestone: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2v10M2 2l5 3-5 3" />
      </svg>
    ),
    color: "bg-[hsl(var(--color-success))]",
    statusColor: "border-[hsl(var(--color-success))]",
  },
};

// ============================================================================
// HELPERS
// ============================================================================

function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-AU", { month: "short", day: "numeric" });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================================================
// TIMELINE CARD
// ============================================================================

function TimelineCard({
  event,
  index,
}: {
  event: TimelineEvent;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const config = TIMELINE_TYPE_CONFIG[event.type] ?? TIMELINE_TYPE_CONFIG.update;

  return (
    <motion.div
      ref={ref}
      role="listitem"
      aria-label={`${event.title}, ${formatDate(event.timestamp)}`}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={
        isInView
          ? { opacity: 1, y: 0 }
          : prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 16 }
      }
      transition={
        prefersReducedMotion
          ? instantTransition
          : { ...smoothTransition, delay: index * 0.06 }
      }
      className={cn(
        "group relative flex-shrink-0 snap-center",
        "w-72 md:w-80",
        "max-md:w-full max-md:snap-align-none"
      )}
    >
      {/* Dot on the connector line */}
      <div className="relative mb-4 flex items-center justify-center max-md:hidden">
        <div
          className={cn(
            "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-transform duration-200 group-hover:scale-110",
            config.color
          )}
        >
          {config.icon}
        </div>
      </div>

      {/* Card */}
      <div
        className={cn(
          "rounded-xl border-2 bg-[hsl(var(--color-background))] p-4 shadow-xs transition-all duration-200",
          "group-hover:shadow-md group-hover:-translate-y-0.5",
          config.statusColor
        )}
      >
        {/* Mobile: icon inline */}
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-white md:hidden",
              config.color
            )}
          >
            {config.icon}
          </div>
          <span className="font-heading text-sm font-semibold text-[hsl(var(--color-foreground))]">
            {event.title}
          </span>
        </div>

        {event.description && (
          <p className="mb-3 text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))] line-clamp-3">
            {event.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          {event.actor && (
            <>
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--color-accent-subtle))] text-[9px] font-semibold text-[hsl(var(--color-accent))]"
                aria-label={event.actor.full_name}
              >
                {event.actor.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <span className="text-xs text-[hsl(var(--color-foreground-muted))]">
                {event.actor.full_name}
              </span>
              <span className="text-[hsl(var(--color-neutral-300))]">&middot;</span>
            </>
          )}
          <time className="text-xs text-[hsl(var(--color-foreground-subtle))]">
            {relativeTime(event.timestamp)}
          </time>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// HORIZONTAL TIMELINE
// ============================================================================

export function HorizontalTimeline({ events }: { events: TimelineEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, events]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scroll("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scroll("right");
      }
    },
    [scroll]
  );

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="relative py-2" role="region" aria-label="Project timeline">
      {/* Connector line (desktop only) */}
      <div className="absolute left-0 right-0 top-[calc(1rem+16px)] hidden h-0.5 bg-[hsl(var(--color-border))] md:block" />

      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll timeline left"
          className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-2 shadow-md transition-colors hover:bg-[hsl(var(--color-background-muted))] md:flex"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 4l-4 4 4 4" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll timeline right"
          className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-2 shadow-md transition-colors hover:bg-[hsl(var(--color-background-muted))] md:flex"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="list"
        aria-label="Timeline events"
        className={cn(
          "md:flex md:gap-6 md:overflow-x-auto md:scroll-smooth md:snap-x md:snap-mandatory",
          "md:px-4 md:pb-4 md:pt-2",
          "md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden",
          "max-md:flex max-md:flex-col max-md:gap-4",
          "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-accent))] focus-visible:ring-offset-2"
        )}
      >
        {events.map((event, index) => (
          <TimelineCard key={event.id} event={event} index={index} />
        ))}
      </div>
    </div>
  );
}
