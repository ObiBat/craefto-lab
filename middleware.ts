import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PORTAL_SUBDOMAIN = 'project-portal';

function isPortalSubdomain(hostname: string): boolean {
  return hostname.startsWith(PORTAL_SUBDOMAIN);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') ?? '';

  // =========================================================================
  // SUBDOMAIN REWRITING
  // If the request comes from project-portal.craefto.com (or localhost alias),
  // rewrite the path by prepending /portal so Next.js serves the right page.
  // =========================================================================

  if (isPortalSubdomain(hostname)) {
    // Already a /portal path (shouldn't happen on subdomain, but be safe)
    if (pathname.startsWith('/portal')) {
      // Continue as-is — middleware auth logic below will handle it
    } else {
      // Rewrite: /login → /portal/login, /projects/x → /portal/projects/x, / → /portal
      const rewrittenPath = pathname === '/' ? '/portal' : `/portal${pathname}`;
      const url = request.nextUrl.clone();
      url.pathname = rewrittenPath;

      // For login page on subdomain, skip auth and just rewrite
      if (pathname === '/login') {
        return NextResponse.rewrite(url);
      }

      // Auth check for non-login subdomain routes
      const authResult = await checkAuth(request, hostname);
      if (authResult) return authResult;

      return NextResponse.rewrite(url);
    }
  }

  // =========================================================================
  // STANDARD /portal/* ROUTE HANDLING (main domain)
  // =========================================================================

  // Only protect /portal routes (except /portal/login)
  if (!pathname.startsWith('/portal') || pathname === '/portal/login') {
    return NextResponse.next();
  }

  const authResult = await checkAuth(request, hostname);
  if (authResult) return authResult;

  return NextResponse.next();
}

/**
 * Check Supabase auth. Returns a redirect response if not authenticated,
 * or null if authenticated (let request continue).
 */
async function checkAuth(request: NextRequest, hostname: string): Promise<NextResponse | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode: skip auth check, let client-side handle it
  if (process.env.NEXT_PUBLIC_PORTAL_LIVE !== 'true') {
    return null;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Get the access token from cookies
  const ref = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
  const authCookieName = `sb-${ref}-auth-token`;
  const authCookie = request.cookies.get(authCookieName);

  if (!authCookie?.value) {
    const authTokenBase64 = request.cookies.get(`${authCookieName}.0`)?.value;
    if (!authTokenBase64) {
      return redirectToLogin(request, hostname);
    }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { cookie: request.headers.get('cookie') ?? '' } },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return redirectToLogin(request, hostname);
    }

    return null;
  } catch {
    return redirectToLogin(request, hostname);
  }
}

/**
 * Redirect to the login page. On subdomain, redirect to /login.
 * On main domain, redirect to /portal/login.
 */
function redirectToLogin(request: NextRequest, hostname: string): NextResponse {
  if (isPortalSubdomain(hostname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.redirect(new URL('/portal/login', request.url));
}

export const config = {
  matcher: [
    '/portal/:path*',
    // Also match subdomain root and paths (handled via hostname check)
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
