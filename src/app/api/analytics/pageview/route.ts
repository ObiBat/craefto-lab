import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      path,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
    } = body;

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get visitor info from headers
    const userAgent = request.headers.get('user-agent') || null;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Generate session ID based on IP and user agent (simple session tracking)
    const sessionId = Buffer.from(`${ip}-${userAgent}-${new Date().toDateString()}`).toString('base64').slice(0, 32);

    // Insert page view
    const { error } = await supabase.from('page_views').insert({
      path,
      referrer,
      user_agent: userAgent,
      session_id: sessionId,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
    });

    if (error) {
      console.error('Error logging page view:', error);
      // Don't return error to client - analytics should fail silently
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    // Fail silently
    return NextResponse.json({ success: true });
  }
}
