import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /portal routes (except /portal/login)
  if (!pathname.startsWith('/portal') || pathname === '/portal/login') {
    return NextResponse.next();
  }

  // Check for Supabase auth token in cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL('/portal/login', request.url));
  }

  // Get the access token from cookies
  // Supabase stores the session in sb-<ref>-auth-token cookie
  const ref = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
  const authCookieName = `sb-${ref}-auth-token`;
  const authCookie = request.cookies.get(authCookieName);

  if (!authCookie?.value) {
    // Try the base64 cookie format
    const authTokenBase64 = request.cookies.get(`${authCookieName}.0`)?.value;
    if (!authTokenBase64) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  // Verify the token with Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          cookie: request.headers.get('cookie') ?? '',
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/portal/login', request.url));
  }
}

export const config = {
  matcher: ['/portal/:path*'],
};
