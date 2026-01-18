import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { resend, EMAIL_FROM, isEmailEnabled } from '@/lib/resend';
import { SubscriptionConfirmationEmail, getSubscriptionConfirmationSubject } from '@/emails/subscription-confirmation';

// Rate limiting: simple in-memory store (use Redis in production)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5; // requests per hour per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate email
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = body.email.trim().toLowerCase();

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // Honeypot check (if a hidden field is filled, it's a bot)
    if (body.website_url) {
      // Silently reject but return success to not alert bots
      return NextResponse.json({ success: true });
    }

    const supabase = createServerClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('journal_subscribers')
      .select('id, status, confirmation_token')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.status === 'confirmed') {
        return NextResponse.json({
          success: true,
          message: 'You\'re already subscribed!',
          alreadySubscribed: true,
        });
      }

      if (existing.status === 'unsubscribed') {
        // Re-subscribe: update status back to pending and generate new token
        const { error: updateError } = await supabase
          .from('journal_subscribers')
          .update({
            status: 'pending',
            confirmation_token: crypto.randomUUID(),
            unsubscribed_at: null,
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Failed to re-subscribe:', updateError);
          return NextResponse.json(
            { error: 'Failed to subscribe. Please try again.' },
            { status: 500 }
          );
        }

        // Get updated record for confirmation email
        const { data: updated } = await supabase
          .from('journal_subscribers')
          .select('confirmation_token')
          .eq('id', existing.id)
          .single();

        if (updated && isEmailEnabled()) {
          await sendConfirmationEmail(email, updated.confirmation_token);
        }

        return NextResponse.json({
          success: true,
          message: 'Please check your email to confirm your subscription.',
        });
      }

      // Status is pending - resend confirmation email
      if (isEmailEnabled()) {
        await sendConfirmationEmail(email, existing.confirmation_token);
      }

      return NextResponse.json({
        success: true,
        message: 'Please check your email to confirm your subscription.',
      });
    }

    // Create new subscriber
    const confirmationToken = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('journal_subscribers')
      .insert({
        email,
        status: 'pending',
        confirmation_token: confirmationToken,
        source: body.source || 'journal_page',
      });

    if (insertError) {
      console.error('Failed to create subscriber:', insertError);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    // Send confirmation email
    if (isEmailEnabled()) {
      await sendConfirmationEmail(email, confirmationToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Please check your email to confirm your subscription.',
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://craefto.com';
  const confirmationUrl = `${baseUrl}/api/subscribe/confirm?token=${token}`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: getSubscriptionConfirmationSubject(),
      html: SubscriptionConfirmationEmail({ confirmationUrl }),
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/subscribe',
    methods: ['POST'],
  });
}
