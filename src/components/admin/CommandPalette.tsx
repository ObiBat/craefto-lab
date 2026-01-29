"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = React.useMemo(
    () => [
      // Navigation
      {
        id: "dashboard",
        label: "Go to Dashboard",
        shortcut: "G D",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          </svg>
        ),
        action: () => router.push("/admin"),
        category: "Navigation",
      },
      {
        id: "leads",
        label: "Go to Leads",
        shortcut: "G L",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
          </svg>
        ),
        action: () => router.push("/admin/leads"),
        category: "Navigation",
      },
      {
        id: "pipeline",
        label: "Go to Content Pipeline",
        shortcut: "G P",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547" />
          </svg>
        ),
        action: () => router.push("/admin/pipeline"),
        category: "Navigation",
      },
      {
        id: "journal",
        label: "Go to Journal",
        shortcut: "G J",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        action: () => router.push("/admin/journal"),
        category: "Navigation",
      },
      {
        id: "analytics",
        label: "Go to Analytics",
        shortcut: "G A",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        ),
        action: () => router.push("/admin/analytics"),
        category: "Navigation",
      },
      {
        id: "subscribers",
        label: "Go to Subscribers",
        shortcut: "G S",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        action: () => router.push("/admin/subscribers"),
        category: "Navigation",
      },
      {
        id: "documents",
        label: "Go to Documents",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        action: () => router.push("/admin/documents"),
        category: "Navigation",
      },
      // Actions
      {
        id: "new-scan",
        label: "Run Content Scan",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        ),
        action: () => {
          router.push("/admin/pipeline");
          // Trigger scan after navigation
        },
        category: "Actions",
      },
      {
        id: "new-article",
        label: "Create New Article",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        action: () => router.push("/admin/journal?action=new"),
        category: "Actions",
      },
      {
        id: "view-site",
        label: "View Public Site",
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        ),
        action: () => window.open("/", "_blank"),
        category: "Actions",
      },
    ],
    [router]
  );

  const filteredCommands = React.useMemo(() => {
    if (!search) return commands;
    const searchLower = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(searchLower) ||
        cmd.category.toLowerCase().includes(searchLower)
    );
  }, [commands, search]);

  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setSearch("");
        setSelectedIndex(0);
      }

      // Navigate with arrow keys
      if (isOpen && filteredCommands.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
        }
        if (e.key === "Enter") {
          e.preventDefault();
          filteredCommands[selectedIndex]?.action();
          setIsOpen(false);
          setSearch("");
          setSelectedIndex(0);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selection when search changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <>
      {/* Trigger hint (optional, can be shown in sidebar) */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-2 w-full text-left text-[hsl(var(--color-foreground-muted))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))] rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-sm">Quick actions</span>
        <kbd className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-subtle))]">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setSearch("");
                setSelectedIndex(0);
              }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
            >
              <div className="bg-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--color-border))]">
                  <svg className="w-5 h-5 text-[hsl(var(--color-foreground-subtle))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search commands..."
                    className="flex-1 bg-transparent text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-foreground-subtle))] focus:outline-none"
                  />
                  <kbd className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-subtle))]">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {filteredCommands.length === 0 ? (
                    <div className="py-8 text-center text-[hsl(var(--color-foreground-subtle))]">
                      No commands found
                    </div>
                  ) : (
                    Object.entries(groupedCommands).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-3 py-2 text-xs font-medium text-[hsl(var(--color-foreground-subtle))] uppercase tracking-wider">
                          {category}
                        </div>
                        {items.map((cmd) => {
                          const globalIndex = filteredCommands.findIndex(
                            (c) => c.id === cmd.id
                          );
                          const isSelected = globalIndex === selectedIndex;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                cmd.action();
                                setIsOpen(false);
                                setSearch("");
                                setSelectedIndex(0);
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                                isSelected
                                  ? "bg-[hsl(var(--color-accent))] text-[hsl(var(--color-accent-foreground))]"
                                  : "text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-background-muted))]"
                              }`}
                            >
                              <span className={isSelected ? "text-[hsl(var(--color-accent-foreground))]" : "text-[hsl(var(--color-foreground-muted))]"}>
                                {cmd.icon}
                              </span>
                              <span className="flex-1 text-left">{cmd.label}</span>
                              {cmd.shortcut && (
                                <kbd className={`text-xs px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? "bg-white/20"
                                    : "bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground-subtle))]"
                                }`}>
                                  {cmd.shortcut}
                                </kbd>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-muted))]">
                  <div className="flex items-center gap-4 text-xs text-[hsl(var(--color-foreground-subtle))]">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 rounded bg-[hsl(var(--color-background))]">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 rounded bg-[hsl(var(--color-background))]">↵</kbd>
                      Select
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
