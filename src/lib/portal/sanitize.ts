import DOMPurify from 'isomorphic-dompurify';
import type { Config } from 'dompurify';

// ============================================================================
// INPUT SANITIZATION — prevents XSS in user-generated content
// ============================================================================

/**
 * Allowed HTML tags for rich content (update bodies, descriptions).
 * Permits basic formatting but strips scripts, iframes, event handlers.
 */
const RICH_CONTENT_CONFIG: Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'span',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'img',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'class', 'id',
    'src', 'alt', 'width', 'height',
    'colspan', 'rowspan',
  ],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

/**
 * Plain-text only config — strips ALL HTML tags.
 * Use for titles, names, short text fields.
 */
const PLAIN_TEXT_CONFIG: Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
};

/**
 * Sanitize rich HTML content (update bodies, project descriptions).
 * Preserves safe formatting tags, strips dangerous content.
 */
export function sanitizeRichContent(dirty: string): string {
  return DOMPurify.sanitize(dirty, RICH_CONTENT_CONFIG);
}

/**
 * Sanitize plain text — strips ALL HTML tags.
 * Use for titles, task names, short-form fields.
 */
export function sanitizePlainText(dirty: string): string {
  return DOMPurify.sanitize(dirty, PLAIN_TEXT_CONFIG);
}

/**
 * Sanitize a CreateUpdateInput-shaped object before storage.
 */
export function sanitizeUpdateInput<T extends { title: string; content: string }>(
  input: T,
): T {
  return {
    ...input,
    title: sanitizePlainText(input.title),
    content: sanitizeRichContent(input.content),
  };
}

/**
 * Sanitize a task description before storage.
 */
export function sanitizeTaskInput<T extends { title: string; description?: string | null }>(
  input: T,
): T {
  return {
    ...input,
    title: sanitizePlainText(input.title),
    description: input.description ? sanitizeRichContent(input.description) : input.description,
  };
}
