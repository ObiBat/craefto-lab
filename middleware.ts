import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PORTAL_SUBDOMAIN = 'project-portal';

function isPortalSubdomain(hostname: string): boolean {
  return hostname.startsWith(PORTAL_SUBDOMAIN);
}

// ============================================================================
// SECURITY HEADERS — applied to all /portal routes
// ============================================================================

const PORTAL_SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(PORTAL_SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') ?? '';

  // =========================================================================
  // SUBDOMAIN REWRITING
  // If the request comes from project-portal.craefto.com (or localhost alias),
  // rewrite the path by prepending /portal so Next.js serves the right page.
  // =========================================================================

  if (isPortalSubdomain(hostname)) {
    // Client-side router.push uses /portal/* paths. On the subdomain, redirect
    // to the clean URL (without /portal prefix) so the address bar stays tidy.
    // The clean URL will hit this middleware again and get rewritten back to /portal/*.
    if (pathname.startsWith('/portal')) {
      const cleanPath = pathname.replace(/^\/portal/, '') || '/';
      const url = request.nextUrl.clone();
      url.pathname = cleanPath;
      return NextResponse.redirect(url);
    } else {
      // Rewrite: /login → /portal/login, /projects/x → /portal/projects/x, / → /portal
      const rewrittenPath = pathname === '/' ? '/portal' : `/portal${pathname}`;
      const url = request.nextUrl.clone();
      url.pathname = rewrittenPath;

      // For login page on subdomain, skip auth and just rewrite
      if (pathname === '/login') {
        return applySecurityHeaders(NextResponse.rewrite(url));
      }

      // Auth check for non-login subdomain routes
      const { response: authResponse, supabaseResponse } = await checkAuth(request, hostname);
      if (authResponse) return applySecurityHeaders(authResponse);

      // Merge Supabase cookie updates into the rewrite response
      const rewriteResponse = NextResponse.rewrite(url);
      supabaseResponse?.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return applySecurityHeaders(rewriteResponse);
    }
  }

  // =========================================================================
  // STANDARD /portal/* ROUTE HANDLING (main domain)
  // =========================================================================

  // Only protect /portal routes (except /portal/login)
  if (!pathname.startsWith('/portal') || pathname === '/portal/login') {
    // Still apply security headers to portal login
    if (pathname === '/portal/login') {
      return applySecurityHeaders(NextResponse.next());
    }
    return NextResponse.next();
  }

  const { response: authResponse, supabaseResponse } = await checkAuth(request, hostname);
  if (authResponse) return applySecurityHeaders(authResponse);

  // Use the Supabase response (carries refreshed cookie updates)
  const finalResponse = supabaseResponse ?? NextResponse.next();
  return applySecurityHeaders(finalResponse);
}

// ============================================================================
// AUTH CHECK — SSR-based via @supabase/ssr with httpOnly cookies
// ============================================================================

interface AuthCheckResult {
  /** Non-null if the user should be redirected (not authenticated). */
  response: NextResponse | null;
  /** The Supabase SSR response carrying any refreshed cookies. */
  supabaseResponse: NextResponse | null;
}

async function checkAuth(request: NextRequest, hostname: string): Promise<AuthCheckResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode: skip auth check, let client-side handle it
  if (process.env.NEXT_PUBLIC_PORTAL_LIVE !== 'true') {
    return { response: null, supabaseResponse: null };
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return { response: null, supabaseResponse: null };
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update the request cookies for downstream middleware/routes
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Update the response cookies so the browser receives them
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
            }),
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { response: redirectToLogin(request, hostname), supabaseResponse: null };
    }

    return { response: null, supabaseResponse };
  } catch {
    return { response: redirectToLogin(request, hostname), supabaseResponse: null };
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
