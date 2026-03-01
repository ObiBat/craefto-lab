"use client";

import {
  use,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { portalPath } from "@/lib/portal/routes";
import { useAuth, getRoleLabel } from "@/lib/portal/auth-context";
import {
  createUpdate,
  fetchAllPortalUsers,
  fetchProjectDetail,
} from "@/lib/portal/queries";
import type { UpdateType, PortalUser } from "@/lib/portal/types";
import { PortalHeader } from "@/components/portal/portal-header";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { UpdateTypeBadge } from "@/components/portal/update-type-badge";
import { Button } from "@/components/ui/button";

// ============================================================================
// CONSTANTS
// ============================================================================

const UPDATE_TYPES: {
  value: UpdateType;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: "alignment",
    label: "Alignment",
    icon: CompassIcon,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    value: "decision",
    label: "Decision",
    icon: GavelIcon,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    value: "blocker",
    label: "Blocker",
    icon: AlertTriangleIcon,
    color: "text-[hsl(var(--color-error))]",
    bg: "bg-[hsl(var(--color-error-subtle))]",
    border: "border-[hsl(var(--color-error))]/20",
  },
  {
    value: "milestone",
    label: "Milestone",
    icon: FlagIcon,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    value: "task_update",
    label: "Task Update",
    icon: CheckCircleIcon,
    color: "text-[hsl(var(--color-success))]",
    bg: "bg-[hsl(var(--color-success-subtle))]",
    border: "border-[hsl(var(--color-success))]/20",
  },
];

const PRESET_TAGS = [
  "strategy",
  "design",
  "engineering",
  "launch",
  "budget",
  "timeline",
];

// ============================================================================
// INLINE SVG ICONS
// ============================================================================

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx={12} cy={12} r={10} />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function GavelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
      <path d="m9 7 8 8" />
      <path d="m21 11-8-8" />
    </svg>
  );
}

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function FlagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1={4} x2={4} y1={22} y2={15} />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function AtSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx={12} cy={12} r={4} />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

function TagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx={7.5} cy={7.5} r={0.5} fill="currentColor" />
    </svg>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}

function PenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    </svg>
  );
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}

// ============================================================================
// ANIMATION HELPERS
// ============================================================================

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const smoothTransition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};

const instantTransition = { duration: 0.01 };

// ============================================================================
// AUTO-EXPANDING TEXTAREA HOOK
// ============================================================================

function useAutoExpand(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 180)}px`;
  }, [value]);

  return ref;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/* ── Update Type Selector ─────────────────────────────────────────── */

function UpdateTypeSelector({
  selected,
  onSelect,
}: {
  selected: UpdateType | null;
  onSelect: (type: UpdateType) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]">
        Update Type
      </label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Update type">
        {UPDATE_TYPES.map((type) => {
          const isSelected = selected === type.value;
          const Icon = type.icon;

          return (
            <motion.button
              key={type.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(type.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2",
                isSelected
                  ? cn(type.bg, type.color, type.border)
                  : "border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground-subtle))] hover:border-[hsl(var(--color-border-strong))] hover:text-[hsl(var(--color-foreground-muted))]",
              )}
              whileTap={
                prefersReducedMotion ? undefined : { scale: 0.96 }
              }
              layout={!prefersReducedMotion}
            >
              <Icon width={14} height={14} />
              {type.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tag Input ───────────────────────────────────────────────────── */

function TagInput({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(
    () =>
      PRESET_TAGS.filter(
        (t) =>
          !tags.includes(t) &&
          t.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    [inputValue, tags],
  );

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (trimmed && !tags.includes(trimmed)) {
        onAdd(trimmed);
      }
      setInputValue("");
      setShowSuggestions(false);
    },
    [tags, onAdd],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]">
        <TagIcon width={13} height={13} />
        Tags
      </label>

      <div className="relative">
        <div
          className="flex min-h-[48px] flex-wrap items-center gap-1.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] px-3 py-2 transition-colors duration-200 focus-within:border-[hsl(var(--color-border-strong))] focus-within:ring-2 focus-within:ring-[hsl(var(--color-ring))]/20"
          onClick={() => inputRef.current?.focus()}
        >
          <AnimatePresence mode="popLayout">
            {tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--color-background-muted))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--color-foreground-muted))]"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(tag);
                  }}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]"
                  aria-label={`Remove tag: ${tag}`}
                >
                  <XIcon width={10} height={10} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-[hsl(var(--color-foreground))] outline-none placeholder:text-[hsl(var(--color-foreground-subtle))]"
            aria-label="Add a tag"
          />
        </div>

        {/* Suggestion dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 z-30 mt-1.5 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-1.5 shadow-[var(--shadow-lg)]"
            >
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))]">
                Suggestions
              </p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addTag(s)}
                  className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-sm text-[hsl(var(--color-foreground-muted))] transition-colors hover:bg-[hsl(var(--color-background-muted))] hover:text-[hsl(var(--color-foreground))]"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Mentions Input ──────────────────────────────────────────────── */

function MentionsInput({
  mentions,
  allUsers,
  onAdd,
  onRemove,
}: {
  mentions: string[];
  allUsers: PortalUser[];
  onAdd: (userId: string) => void;
  onRemove: (userId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredUsers = useMemo(
    () =>
      allUsers.filter(
        (u) =>
          !mentions.includes(u.id) &&
          u.full_name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, allUsers, mentions],
  );

  const mentionedUsers = useMemo(
    () =>
      mentions
        .map((id) => allUsers.find((u) => u.id === id))
        .filter(Boolean) as PortalUser[],
    [mentions, allUsers],
  );

  const handleSelect = useCallback(
    (userId: string) => {
      onAdd(userId);
      setQuery("");
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [onAdd],
  );

  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]">
        <AtSignIcon width={13} height={13} />
        Mentions
      </label>

      <div className="relative">
        <div
          className="flex min-h-[48px] flex-wrap items-center gap-1.5 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] px-3 py-2 transition-colors duration-200 focus-within:border-[hsl(var(--color-border-strong))] focus-within:ring-2 focus-within:ring-[hsl(var(--color-ring))]/20"
          onClick={() => inputRef.current?.focus()}
        >
          <AnimatePresence mode="popLayout">
            {mentionedUsers.map((user) => (
              <motion.span
                key={user.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--color-accent-subtle))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--color-accent))]"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--color-accent))]/10 text-[8px] font-bold">
                  {user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                {user.full_name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(user.id);
                  }}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-[hsl(var(--color-accent))]/10"
                  aria-label={`Remove mention: ${user.full_name}`}
                >
                  <XIcon width={10} height={10} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder={
              mentions.length === 0 ? "Type @ to mention someone..." : ""
            }
            className="min-w-[160px] flex-1 bg-transparent text-sm text-[hsl(var(--color-foreground))] outline-none placeholder:text-[hsl(var(--color-foreground-subtle))]"
            aria-label="Mention a team member"
          />
        </div>

        {/* User dropdown */}
        <AnimatePresence>
          {showDropdown && filteredUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 z-30 mt-1.5 max-h-48 w-full overflow-y-auto rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-1.5 shadow-[var(--shadow-lg)]"
            >
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))]">
                Team Members
              </p>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(user.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[hsl(var(--color-background-muted))]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-accent-subtle))] text-[10px] font-semibold text-[hsl(var(--color-accent))]">
                    {user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[hsl(var(--color-foreground))]">
                      {user.full_name}
                    </p>
                    <p className="truncate text-xs text-[hsl(var(--color-foreground-subtle))]">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Live Preview Panel ──────────────────────────────────────────── */

function LivePreview({
  type,
  title,
  content,
  tags,
  mentions,
  allUsers,
  authorName,
}: {
  type: UpdateType | null;
  title: string;
  content: string;
  tags: string[];
  mentions: string[];
  allUsers: PortalUser[];
  authorName: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const transition = prefersReducedMotion ? instantTransition : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  const mentionedUsers = useMemo(
    () =>
      mentions
        .map((id) => allUsers.find((u) => u.id === id))
        .filter(Boolean) as PortalUser[],
    [mentions, allUsers],
  );

  const isEmpty = !type && !title && !content && tags.length === 0;

  // Simple markdown-like content rendering (bold, italic, code, line breaks)
  const formattedContent = useMemo(() => {
    if (!content) return null;
    const lines = content.split("\n");
    return lines.map((line, i) => {
      // Process inline formatting
      let processed: React.ReactNode = line;

      // Code blocks (inline `code`)
      if (line.includes("`")) {
        const parts = line.split(/(`[^`]+`)/g);
        processed = parts.map((part, j) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code
                key={j}
                className="rounded-md bg-[hsl(var(--color-background-muted))] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[0.85em] text-[hsl(var(--color-accent))]"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });
      }

      // Bold (**text**)
      if (typeof processed === "string" && processed.includes("**")) {
        const parts = processed.split(/(\*\*[^*]+\*\*)/g);
        processed = parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-[hsl(var(--color-foreground))]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });
      }

      return (
        <span key={i}>
          {processed}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  }, [content]);

  return (
    <div className="space-y-5">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--color-background-muted))]">
            <EyeIcon width={24} height={24} className="text-[hsl(var(--color-foreground-subtle))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--color-foreground-muted))] font-[family-name:var(--font-heading)]">
            Live Preview
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]">
            Start writing to see your update here
          </p>
        </div>
      ) : (
        <motion.article
          layout={!prefersReducedMotion}
          transition={transition}
          className="space-y-4"
        >
          {/* Type badge */}
          <AnimatePresence mode="wait">
            {type && (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <UpdateTypeBadge type={type} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <AnimatePresence mode="wait">
            {title && (
              <motion.h2
                key={title.slice(0, 20)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="font-[family-name:var(--font-heading)] text-xl font-semibold leading-snug tracking-tight text-[hsl(var(--color-foreground))]"
              >
                {title}
              </motion.h2>
            )}
          </AnimatePresence>

          {/* Author info */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--color-accent-subtle))] text-[10px] font-semibold text-[hsl(var(--color-accent))]">
              {authorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div>
              <p className="text-xs font-medium text-[hsl(var(--color-foreground))] font-[family-name:var(--font-sans)]">
                {authorName}
              </p>
              <p className="text-[10px] text-[hsl(var(--color-foreground-subtle))]">
                Just now
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[hsl(var(--color-border))]" />

          {/* Content */}
          {content && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-sm leading-relaxed text-[hsl(var(--color-foreground-muted))] font-[family-name:var(--font-sans)] whitespace-pre-wrap"
            >
              {formattedContent}
            </motion.div>
          )}

          {/* Tags */}
          <AnimatePresence>
            {tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap gap-1.5 overflow-hidden"
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-lg bg-[hsl(var(--color-background-muted))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--color-foreground-subtle))]"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mentioned users */}
          <AnimatePresence>
            {mentionedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap items-center gap-1.5"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))]">
                  Mentioned:
                </span>
                {mentionedUsers.map((user) => (
                  <span
                    key={user.id}
                    className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--color-accent-subtle))] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--color-accent))]"
                  >
                    @{user.full_name}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.article>
      )}
    </div>
  );
}

/* ── Error Banner ────────────────────────────────────────────────── */

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      role="alert"
      className="rounded-[var(--radius-lg)] border border-[hsl(var(--color-error))]/20 bg-[hsl(var(--color-error-subtle))] px-4 py-3"
    >
      <p className="text-sm text-[hsl(var(--color-error))] font-[family-name:var(--font-sans)]">
        {message}
      </p>
    </motion.div>
  );
}

/* ── Validation Error Label ──────────────────────────────────────── */

function ValidationHint({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="text-xs text-[hsl(var(--color-error))] font-[family-name:var(--font-sans)]"
    >
      {message}
    </motion.p>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function UpdateComposerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { portalUser, signOut, hasPermission } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // ── RBAC: redirect stakeholders to dashboard ────────────────────
  useEffect(() => {
    if (portalUser && !hasPermission('create_update')) {
      router.replace(portalPath('/'));
    }
  }, [portalUser, hasPermission, router]);

  // ── Data state ──────────────────────────────────────────────────
  const [projectName, setProjectName] = useState<string>("");
  const [allUsers, setAllUsers] = useState<PortalUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // ── Form state ──────────────────────────────────────────────────
  const [updateType, setUpdateType] = useState<UpdateType | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);

  // ── UI state ────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    type: false,
    title: false,
    content: false,
  });
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  // ── Refs ────────────────────────────────────────────────────────
  const contentRef = useAutoExpand(content);

  // ── Fetch project + users on mount ──────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [projectData, users] = await Promise.all([
          fetchProjectDetail(projectId),
          fetchAllPortalUsers(),
        ]);

        if (cancelled) return;

        if (projectData?.project) {
          setProjectName(projectData.project.name);
        }
        setAllUsers(users);
      } catch {
        // Silently handle — the page still functions
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ── Validation ──────────────────────────────────────────────────
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!updateType) errors.type = "Please select an update type.";
    if (!title.trim()) errors.title = "A headline is required.";
    if (!content.trim()) errors.content = "Share some details with the team.";
    return errors;
  }, [updateType, title, content]);

  const isValid = Object.keys(validationErrors).length === 0;

  // ── Handlers ────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    setTouched({ type: true, title: true, content: true });

    if (!isValid || !updateType) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await createUpdate({
        project_id: projectId,
        type: updateType,
        title: title.trim(),
        content: content.trim(),
        tags,
        mentions,
      });

      router.push(portalPath(`/projects/${projectId}`));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to publish update.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, updateType, projectId, title, content, tags, mentions, router]);

  const handleAddTag = useCallback(
    (tag: string) => setTags((prev) => [...prev, tag]),
    [],
  );
  const handleRemoveTag = useCallback(
    (tag: string) => setTags((prev) => prev.filter((t) => t !== tag)),
    [],
  );
  const handleAddMention = useCallback(
    (userId: string) => setMentions((prev) => [...prev, userId]),
    [],
  );
  const handleRemoveMention = useCallback(
    (userId: string) =>
      setMentions((prev) => prev.filter((id) => id !== userId)),
    [],
  );

  // ── Animation config ────────────────────────────────────────────
  const motionTransition = prefersReducedMotion
    ? instantTransition
    : smoothTransition;

  const authorName = portalUser?.full_name ?? "You";

  // ── Header breadcrumbs ──────────────────────────────────────────
  const headerBreadcrumbs = dataLoading
    ? [{ label: "New Update" }]
    : [
        {
          label: projectName || "Project",
          href: portalPath(`/projects/${projectId}`),
        },
        { label: "New Update" },
      ];

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[hsl(var(--color-background))]">
      {/* Sidebar */}
      <PortalSidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <PortalHeader
          user={
            portalUser
              ? {
                  name: portalUser.full_name,
                  avatarUrl: portalUser.avatar_url ?? undefined,
                  role: getRoleLabel(portalUser.role),
                }
              : undefined
          }
          breadcrumbs={headerBreadcrumbs}
          onSignOut={signOut}
        />

        {/* Page title */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionTransition, delay: prefersReducedMotion ? 0 : 0.05 }}
          className="border-b border-[hsl(var(--color-border))] px-4 py-5 sm:px-6 lg:px-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--color-accent-subtle))]">
              <PenIcon width={18} height={18} className="text-[hsl(var(--color-accent))]" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-[hsl(var(--color-foreground))]">
                {dataLoading ? (
                  <span className="inline-block h-5 w-48 animate-pulse rounded-full bg-[hsl(var(--color-background-muted))]" />
                ) : (
                  `New Update for ${projectName}`
                )}
              </h1>
              <p className="mt-0.5 text-xs text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]">
                Compose and share an update with your stakeholders
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mobile tab toggle */}
        <div className="flex border-b border-[hsl(var(--color-border))] lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
              mobileTab === "editor"
                ? "border-b-2 border-[hsl(var(--color-accent))] text-[hsl(var(--color-accent))]"
                : "text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground-muted))]",
            )}
          >
            <PenIcon width={14} height={14} />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
              mobileTab === "preview"
                ? "border-b-2 border-[hsl(var(--color-accent))] text-[hsl(var(--color-accent))]"
                : "text-[hsl(var(--color-foreground-subtle))] hover:text-[hsl(var(--color-foreground-muted))]",
            )}
          >
            <EyeIcon width={14} height={14} />
            Preview
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Editor Panel (left) ─────────────────────────────── */}
          <div
            className={cn(
              "flex-1 overflow-y-auto",
              mobileTab === "preview" ? "hidden lg:block" : "block",
            )}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8"
            >
              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    variants={staggerItem}
                    transition={motionTransition}
                    className="mb-6"
                  >
                    <ErrorBanner message={error} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1. Update type selector */}
              <motion.div
                variants={staggerItem}
                transition={motionTransition}
                className="mb-8"
              >
                <UpdateTypeSelector
                  selected={updateType}
                  onSelect={(type) => {
                    setUpdateType(type);
                    setTouched((prev) => ({ ...prev, type: true }));
                    if (error) setError(null);
                  }}
                />
                <AnimatePresence>
                  {touched.type && validationErrors.type && (
                    <div className="mt-1.5">
                      <ValidationHint message={validationErrors.type} />
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 2. Title field */}
              <motion.div
                variants={staggerItem}
                transition={motionTransition}
                className="mb-8"
              >
                <label
                  htmlFor="update-title"
                  className="sr-only"
                >
                  Headline
                </label>
                <input
                  id="update-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, title: true }))
                  }
                  placeholder="What's the headline?"
                  className={cn(
                    "w-full border-0 border-b-2 bg-transparent pb-3 font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight text-[hsl(var(--color-foreground))] outline-none transition-colors duration-200 sm:text-3xl",
                    "placeholder:text-[hsl(var(--color-foreground-subtle))]/40",
                    "focus:border-[hsl(var(--color-accent))]",
                    touched.title && validationErrors.title
                      ? "border-[hsl(var(--color-error))]/40"
                      : "border-[hsl(var(--color-border))]",
                  )}
                  autoFocus
                  disabled={isSubmitting}
                />
                <AnimatePresence>
                  {touched.title && validationErrors.title && (
                    <div className="mt-1.5">
                      <ValidationHint message={validationErrors.title} />
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 3. Content editor */}
              <motion.div
                variants={staggerItem}
                transition={motionTransition}
                className="mb-8"
              >
                <label
                  htmlFor="update-content"
                  className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]"
                >
                  Content
                </label>
                <textarea
                  id="update-content"
                  ref={contentRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, content: true }))
                  }
                  placeholder="Share your update with the team...

You can use **bold**, `code`, and line breaks."
                  className={cn(
                    "w-full resize-none rounded-xl border bg-[hsl(var(--color-background))] px-4 py-3.5 text-[15px] leading-relaxed text-[hsl(var(--color-foreground))] outline-none transition-all duration-200 font-[family-name:var(--font-sans)]",
                    "placeholder:text-[hsl(var(--color-foreground-subtle))]/50",
                    "focus:ring-2 focus:ring-[hsl(var(--color-ring))]/20 focus:border-[hsl(var(--color-border-strong))]",
                    "min-h-[180px]",
                    touched.content && validationErrors.content
                      ? "border-[hsl(var(--color-error))]/40 focus:ring-[hsl(var(--color-error))]/15"
                      : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-strong))]",
                  )}
                  disabled={isSubmitting}
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <AnimatePresence>
                    {touched.content && validationErrors.content && (
                      <ValidationHint message={validationErrors.content} />
                    )}
                  </AnimatePresence>
                  <p className="ml-auto text-[10px] text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]">
                    Supports **bold**, `code`, and line breaks
                  </p>
                </div>
              </motion.div>

              {/* 4. Tags input */}
              <motion.div
                variants={staggerItem}
                transition={motionTransition}
                className="mb-8"
              >
                <TagInput
                  tags={tags}
                  onAdd={handleAddTag}
                  onRemove={handleRemoveTag}
                />
              </motion.div>

              {/* 5. Mentions input */}
              <motion.div
                variants={staggerItem}
                transition={motionTransition}
                className="mb-8"
              >
                <MentionsInput
                  mentions={mentions}
                  allUsers={allUsers}
                  onAdd={handleAddMention}
                  onRemove={handleRemoveMention}
                />
              </motion.div>

              {/* 6. Action bar */}
              <motion.div
                variants={staggerItem}
                transition={motionTransition}
                className="sticky bottom-0 -mx-4 mt-4 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="accent"
                    size="md"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="w-full sm:w-auto gap-2"
                  >
                    <SendIcon width={14} height={14} />
                    Publish Update
                  </Button>
                  <div className="flex items-center justify-between sm:gap-2">
                    <Button
                      variant="ghost"
                      size="md"
                      disabled={isSubmitting}
                      onClick={() => {
                        // Save draft is a no-op for now
                      }}
                    >
                      Save Draft
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() =>
                        router.push(portalPath(`/projects/${projectId}`))
                      }
                      disabled={isSubmitting}
                      className="text-[hsl(var(--color-foreground-subtle))]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* ── Preview Panel (right) ───────────────────────────── */}
          <div
            className={cn(
              "border-l border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle))]/50",
              "lg:w-[420px] lg:shrink-0 xl:w-[480px]",
              mobileTab === "editor" ? "hidden lg:block" : "flex-1 lg:w-[420px] lg:shrink-0 xl:w-[480px]",
            )}
          >
            <div className="sticky top-16 overflow-y-auto px-6 py-8 lg:max-h-[calc(100vh-64px)]">
              {/* Preview header */}
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: 12 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  ...motionTransition,
                  delay: prefersReducedMotion ? 0 : 0.2,
                }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))] font-[family-name:var(--font-sans)]">
                  <EyeIcon width={13} height={13} />
                  Preview
                </div>
              </motion.div>

              {/* Preview card */}
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: 12 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  ...motionTransition,
                  delay: prefersReducedMotion ? 0 : 0.3,
                }}
                className="rounded-[var(--radius-xl)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-6 shadow-[var(--shadow-md)]"
              >
                <LivePreview
                  type={updateType}
                  title={title}
                  content={content}
                  tags={tags}
                  mentions={mentions}
                  allUsers={allUsers}
                  authorName={authorName}
                />
              </motion.div>

              {/* Formatting hints */}
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...motionTransition,
                  delay: prefersReducedMotion ? 0 : 0.45,
                }}
                className="mt-6 rounded-[var(--radius-lg)] border border-[hsl(var(--color-border-subtle))] bg-[hsl(var(--color-background))] p-4"
              >
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--color-foreground-subtle))]">
                  Formatting Tips
                </p>
                <div className="space-y-1.5 font-[family-name:var(--font-mono)] text-[11px] text-[hsl(var(--color-foreground-subtle))]">
                  <p>
                    <span className="rounded bg-[hsl(var(--color-background-muted))] px-1 py-0.5 text-[hsl(var(--color-foreground-muted))]">
                      **bold**
                    </span>{" "}
                    for emphasis
                  </p>
                  <p>
                    <span className="rounded bg-[hsl(var(--color-background-muted))] px-1 py-0.5 text-[hsl(var(--color-foreground-muted))]">
                      `code`
                    </span>{" "}
                    for inline code
                  </p>
                  <p>
                    <span className="rounded bg-[hsl(var(--color-background-muted))] px-1 py-0.5 text-[hsl(var(--color-foreground-muted))]">
                      Enter
                    </span>{" "}
                    for line breaks
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
