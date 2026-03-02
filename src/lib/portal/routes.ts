// ============================================================================
// PORTAL ROUTES — Subdomain-aware path helper
// ============================================================================
//
// On the main domain (craefto.com), portal routes are at /portal/*.
// On the subdomain (project-portal.craefto.com), routes are at /*.
// This helper returns the correct path depending on the current hostname.

const PORTAL_SUBDOMAIN = 'project-portal';

/**
 * Detect whether the current page is being served from the portal subdomain.
 */
export function isPortalSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.startsWith(PORTAL_SUBDOMAIN);
}

/**
 * Build a portal-aware path.
 *
 * Always returns /portal/* paths for internal Next.js routing. The middleware
 * rewrites subdomain requests (project-portal.craefto.com/*) to /portal/*
 * on the server, but client-side router.push bypasses middleware. Using
 * /portal/* paths everywhere ensures client navigation always resolves to
 * real routes. The browser URL stays clean on the subdomain because the
 * middleware handles incoming requests.
 */
export function portalPath(path: string = '/'): string {
  const normalized = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

  // On subdomain, return clean paths (no /portal prefix).
  // The middleware rewrites these to /portal/* server-side,
  // and the catch-all route at src/app/(portal-alias) handles client-side.
  if (isPortalSubdomain()) {
    return normalized || '/';
  }

  return `/portal${normalized}`;
}

/**
 * The login path, accounting for subdomain.
 */
export function portalLoginPath(): string {
  return portalPath('/login');
}

/**
 * The dashboard (root) path, accounting for subdomain.
 */
export function portalDashboardPath(): string {
  return portalPath('/');
}
