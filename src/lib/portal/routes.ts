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
 * - On subdomain: portalPath('/projects/abc') → '/projects/abc'
 * - On main domain: portalPath('/projects/abc') → '/portal/projects/abc'
 * - portalPath('/') → '/' on subdomain, '/portal' on main domain
 */
export function portalPath(path: string = '/'): string {
  const normalized = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

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
