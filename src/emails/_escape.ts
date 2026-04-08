// Shared HTML / URL escaping helpers for email templates.
// Email templates render raw HTML strings and interpolate user-supplied data,
// so every interpolated value must pass through escapeHtml. URLs additionally
// need protocol validation to prevent javascript: / data: URI injection.

export function escapeHtml(value: string | null | undefined): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Returns a safe, escaped URL string suitable for an `href` attribute.
// Returns an empty string if the URL is missing, malformed, or uses a
// protocol other than http/https/mailto.
export function safeUrl(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = String(value).trim();
  try {
    const url = new URL(trimmed);
    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:" &&
      url.protocol !== "mailto:"
    ) {
      return "";
    }
    return escapeHtml(trimmed);
  } catch {
    return "";
  }
}
