"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { cn } from "@/lib/utils";

// ============================================================================
// TOOLBAR BUTTON
// ============================================================================

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[hsl(var(--color-foreground-muted))] transition-colors duration-150 min-h-0",
        active
          ? "bg-[hsl(var(--color-background-muted))] text-[hsl(var(--color-foreground))]"
          : "hover:bg-[hsl(var(--color-background-subtle))] hover:text-[hsl(var(--color-foreground))]",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}

// ============================================================================
// TOOLBAR SEPARATOR
// ============================================================================

function ToolbarSeparator() {
  return (
    <div
      className="mx-1 h-5 w-px bg-[hsl(var(--color-border))]"
      aria-hidden="true"
    />
  );
}

// ============================================================================
// TOOLBAR
// ============================================================================

function EditorToolbar({ editor }: { editor: Editor }) {
  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] px-2 py-1.5"
      role="toolbar"
      aria-label="Text formatting"
    >
      {/* Headings */}
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Inline formatting */}
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/></svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline code"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Lists */}
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered list"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Block formatting */}
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code block"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="m10 10-2 2 2 2"/><path d="m14 14 2-2-2-2"/></svg>
      </ToolbarButton>

      <ToolbarSeparator />

      {/* Link */}
      <ToolbarButton
        active={editor.isActive("link")}
        onClick={
          editor.isActive("link")
            ? () => editor.chain().focus().unsetLink().run()
            : addLink
        }
        title={editor.isActive("link") ? "Remove link" : "Add link"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </ToolbarButton>
    </div>
  );
}

// ============================================================================
// RICH TEXT EDITOR
// ============================================================================

export interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Write your update...",
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-[hsl(var(--color-accent))] underline underline-offset-2 hover:text-[hsl(var(--color-accent-hover))]",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-[var(--radius-md)] max-w-full h-auto",
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[200px] px-4 py-3 outline-none focus:outline-none [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:my-1.5 [&_p]:leading-relaxed [&_ul]:my-2 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-[hsl(var(--color-border-strong))] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[hsl(var(--color-foreground-muted))] [&_code]:bg-[hsl(var(--color-background-muted))] [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-[hsl(var(--color-foreground))] [&_pre]:text-[hsl(var(--color-background))] [&_pre]:rounded-[var(--radius-md)] [&_pre]:p-4 [&_pre]:my-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_hr]:border-[hsl(var(--color-border))] [&_hr]:my-4 [&_a]:text-[hsl(var(--color-accent))] [&_a]:underline [&_a]:underline-offset-2",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] transition-shadow duration-200 focus-within:border-[hsl(var(--color-ring))] focus-within:shadow-[0_0_0_3px_hsl(var(--color-ring)/0.15)]",
        className,
      )}
    >
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
