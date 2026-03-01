"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/lib/portal/types";

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

const ACCEPT_STRING = ACCEPTED_TYPES.join(",");

function isImageType(type: string) {
  return type.startsWith("image/");
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// FILE UPLOAD COMPONENT
// ============================================================================

export interface FileUploadProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  attachments,
  onChange,
  className,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddMore = attachments.length < MAX_FILES;

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      // Validate count
      const remaining = MAX_FILES - attachments.length;
      if (fileArray.length > remaining) {
        setError(`You can only add ${remaining} more file${remaining === 1 ? "" : "s"}`);
        return;
      }

      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`${file.name} exceeds 10MB limit`);
          return;
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`${file.name} has an unsupported file type`);
          return;
        }
        validFiles.push(file);
      }

      // Demo mode: convert to base64 data URLs
      const newAttachments: Attachment[] = await Promise.all(
        validFiles.map(async (file) => ({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          url: await fileToDataUrl(file),
          type: file.type,
          size: file.size,
        })),
      );

      onChange([...attachments, ...newAttachments]);
    },
    [attachments, onChange],
  );

  const removeFile = useCallback(
    (id: string) => {
      onChange(attachments.filter((a) => a.id !== id));
    },
    [attachments, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [disabled, processFiles],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload files"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed px-4 py-6 transition-all duration-200",
            isDragging
              ? "border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent-subtle))]"
              : "border-[hsl(var(--color-border))] bg-[hsl(var(--color-background-subtle))] hover:border-[hsl(var(--color-border-strong))] hover:bg-[hsl(var(--color-background-muted))]",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[hsl(var(--color-foreground-subtle))]"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-[hsl(var(--color-foreground-muted))]">
              {isDragging ? "Drop files here" : "Drag files here or click to browse"}
            </p>
            <p className="mt-0.5 text-xs text-[hsl(var(--color-foreground-subtle))]">
              Images, PDFs, docs — up to 10MB each, {MAX_FILES} files max
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_STRING}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFiles(e.target.files);
                e.target.value = "";
              }
            }}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-[hsl(var(--color-error))]" role="alert">
          {error}
        </p>
      )}

      {/* File previews */}
      <AnimatePresence mode="popLayout">
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-[var(--radius-md)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))]"
              >
                {/* Preview */}
                {isImageType(attachment.type) ? (
                  <div className="aspect-[4/3] overflow-hidden bg-[hsl(var(--color-background-muted))]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-[hsl(var(--color-background-subtle))]">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[hsl(var(--color-foreground-subtle))]"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" x2="8" y1="13" y2="13" />
                      <line x1="16" x2="8" y1="17" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                )}

                {/* File info */}
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs font-medium text-[hsl(var(--color-foreground))]">
                    {attachment.name}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--color-foreground-subtle))]">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>

                {/* Remove button */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeFile(attachment.id)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--color-foreground))]/80 text-[hsl(var(--color-background))] opacity-0 transition-opacity duration-150 group-hover:opacity-100 min-h-0"
                    aria-label={`Remove ${attachment.name}`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" x2="6" y1="6" y2="18" />
                      <line x1="6" x2="18" y1="6" y2="18" />
                    </svg>
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
