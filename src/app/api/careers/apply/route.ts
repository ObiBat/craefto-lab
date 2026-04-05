import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { getRoleBySlug } from "@/lib/careers";
import {
  ApplicationNotificationEmail,
  getApplicationNotificationSubject,
} from "@/emails/application-notification";

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }
  if (record.count >= RATE_LIMIT) return true;
  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate role exists
    const role = getRoleBySlug(body.role_slug);
    if (!role) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Validate required fields
    if (!body.full_name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Validate required questions answered
    const answers = body.answers || [];
    const requiredQuestions = role.questions.filter((q) => q.required);
    for (const q of requiredQuestions) {
      const answer = answers.find(
        (a: { question_id: string }) => a.question_id === q.id
      );
      if (!answer || !answer.answer || (Array.isArray(answer.answer) && answer.answer.length === 0)) {
        return NextResponse.json(
          { error: `Please answer: ${q.label}` },
          { status: 400 }
        );
      }
    }

    // Validate resume URL format if provided
    if (body.resume_url && !body.resume_url.startsWith("http")) {
      return NextResponse.json(
        { error: "Invalid resume URL." },
        { status: 400 }
      );
    }

    const applicationData = {
      role_slug: body.role_slug,
      role_title: role.title,
      full_name: body.full_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      location: body.location?.trim() || null,
      portfolio_url: body.portfolio_url?.trim() || null,
      linkedin_url: body.linkedin_url?.trim() || null,
      github_url: body.github_url?.trim() || null,
      resume_url: body.resume_url || null,
      resume_filename: body.resume_filename || null,
      cover_letter_url: body.cover_letter_url || null,
      cover_letter_filename: body.cover_letter_filename || null,
      answers: answers,
      source: "craefto.com",
      ip_address: ip,
      user_agent: request.headers.get("user-agent") || null,
    };

    const supabase = createServerClient();
    const { data: application, error: insertError } = await supabase
      .from("job_applications")
      .insert(applicationData)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to submit application. Please try again." },
        { status: 500 }
      );
    }

    // Send admin notification email
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: "obi@craefto.com",
          subject: getApplicationNotificationSubject(role.title, body.full_name),
          html: ApplicationNotificationEmail({
            application: {
              id: application.id,
              full_name: application.full_name,
              email: application.email,
              phone: application.phone,
              location: application.location,
              role_title: application.role_title,
              role_slug: application.role_slug,
              portfolio_url: application.portfolio_url,
              linkedin_url: application.linkedin_url,
              github_url: application.github_url,
              resume_url: application.resume_url,
              resume_filename: application.resume_filename,
              cover_letter_url: application.cover_letter_url,
              cover_letter_filename: application.cover_letter_filename,
              answers: application.answers,
              created_at: application.created_at,
            },
          }),
        });
      } catch {
        // Email failure should not block the application
      }
    }

    return NextResponse.json({
      id: application.id,
      message: "Application submitted successfully. We'll be in touch!",
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
