import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /portal routes (except /portal/login)
  if (!pathname.startsWith('/portal') || pathname === '/portal/login') {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode: skip auth check, let client-side handle it
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Get the access token from cookies
  const ref = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
  const authCookieName = `sb-${ref}-auth-token`;
  const authCookie = request.cookies.get(authCookieName);

  if (!authCookie?.value) {
    const authTokenBase64 = request.cookies.get(`${authCookieName}.0`)?.value;
    if (!authTokenBase64) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { cookie: request.headers.get('cookie') ?? '' } },
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
