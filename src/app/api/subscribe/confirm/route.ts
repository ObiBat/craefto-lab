import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { resend, EMAIL_FROM, isEmailEnabled } from '@/lib/resend';
import { SubscriptionWelcomeEmail, getSubscriptionWelcomeSubject } from '@/emails/subscription-welcome';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.craefto.com';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/journal?error=invalid_token`);
  }

  try {
    const supabase = createServerClient();

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from('journal_subscribers')
      .select('id, email, status')
      .eq('confirmation_token', token)
      .single();

    if (findError || !subscriber) {
      return NextResponse.redirect(`${baseUrl}/journal?error=invalid_token`);
    }

    // Already confirmed
    if (subscriber.status === 'confirmed') {
      return NextResponse.redirect(`${baseUrl}/journal?subscribed=true&already=true`);
    }

    // Confirm subscription
    const { error: updateError } = await supabase
      .from('journal_subscribers')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Failed to confirm subscription:', updateError);
      return NextResponse.redirect(`${baseUrl}/journal?error=confirmation_failed`);
    }

    // Send welcome email
    if (isEmailEnabled()) {
      const unsubscribeUrl = `${baseUrl}/api/subscribe/unsubscribe?token=${token}`;

      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: subscriber.email,
          subject: getSubscriptionWelcomeSubject(),
          html: SubscriptionWelcomeEmail({ unsubscribeUrl }),
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    return NextResponse.redirect(`${baseUrl}/journal?subscribed=true`);
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.redirect(`${baseUrl}/journal?error=confirmation_failed`);
  }
}
