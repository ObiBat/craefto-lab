'use client';

import { cn } from '@/lib/utils';
import type { PortalDocument } from '@/lib/portal/types';

// ---------------------------------------------------------------------------
// Document Card — displays a single document in a grid
// ---------------------------------------------------------------------------

const FILE_TYPE_ICONS: Record<string, { color: string; label: string }> = {
  pdf: { color: 'bg-[hsl(var(--color-error-subtle))] text-[hsl(var(--color-error))]', label: 'PDF' },
  png: { color: 'bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]', label: 'PNG' },
  jpg: { color: 'bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]', label: 'JPG' },
  svg: { color: 'bg-[hsl(var(--color-success-subtle))] text-[hsl(var(--color-success))]', label: 'SVG' },
  docx: { color: 'bg-[hsl(var(--color-accent-subtle))] text-[hsl(var(--color-accent))]', label: 'DOC' },
  xlsx: { color: 'bg-[hsl(var(--color-success-subtle))] text-[hsl(var(--color-success))]', label: 'XLS' },
  zip: { color: 'bg-[hsl(var(--color-warning-subtle))] text-[hsl(var(--color-warning))]', label: 'ZIP' },
};

const DEFAULT_ICON = { color: 'bg-[hsl(var(--color-neutral-200))] text-[hsl(var(--color-neutral-700))]', label: 'FILE' };

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1={12} x2={12} y1={15} y2={3} />
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
}

export interface DocumentCardProps {
  document: PortalDocument;
  className?: string;
}

export function DocumentCard({ document, className }: DocumentCardProps) {
  const iconConfig = FILE_TYPE_ICONS[document.file_type] ?? DEFAULT_ICON;

  return (
    <div
      className={cn(
        'group rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-4 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-[hsl(var(--color-border-strong))]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {/* File type icon */}
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconConfig.color)}>
          <FileIcon />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[hsl(var(--color-foreground))] truncate" title={document.name}>
            {document.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[hsl(var(--color-foreground-subtle))]">
            <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', iconConfig.color)}>
              {iconConfig.label}
            </span>
            <span>{formatFileSize(document.size)}</span>
            <span className="hidden sm:inline">{formatDate(document.uploaded_at)}</span>
          </div>
          {document.uploader && (
            <p className="text-[11px] text-[hsl(var(--color-foreground-subtle))] mt-1">
              Uploaded by {document.uploader.full_name}
            </p>
          )}
        </div>

        {/* Download button */}
        <button
          type="button"
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
            'text-[hsl(var(--color-foreground-subtle))] hover:bg-[hsl(var(--color-background-muted))] hover:text-[hsl(var(--color-foreground))]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))]',
            'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          )}
          aria-label={`Download ${document.name}`}
        >
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
}
