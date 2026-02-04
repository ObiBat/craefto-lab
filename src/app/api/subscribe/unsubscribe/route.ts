import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.craefto.com';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/unsubscribed?error=invalid_token`);
  }

  try {
    const supabase = createServerClient();

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from('journal_subscribers')
      .select('id, status')
      .eq('confirmation_token', token)
      .single();

    if (findError || !subscriber) {
      return NextResponse.redirect(`${baseUrl}/unsubscribed?error=invalid_token`);
    }

    // Already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      return NextResponse.redirect(`${baseUrl}/unsubscribed?already=true`);
    }

    // Unsubscribe
    const { error: updateError } = await supabase
      .from('journal_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Failed to unsubscribe:', updateError);
      return NextResponse.redirect(`${baseUrl}/unsubscribed?error=failed`);
    }

    return NextResponse.redirect(`${baseUrl}/unsubscribed?success=true`);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(`${baseUrl}/unsubscribed?error=failed`);
  }
}
