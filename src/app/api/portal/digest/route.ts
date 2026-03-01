import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, EMAIL_FROM, isEmailEnabled } from "@/lib/resend";

// ============================================================================
// WEEKLY DIGEST — Sends a summary of project updates to stakeholders
// ============================================================================
//
// Trigger: Call POST /api/portal/digest with Authorization header
// or set up a cron job (Vercel Cron, external scheduler, etc.)
//
// Env vars needed:
//   PORTAL_DIGEST_SECRET — Bearer token for auth
//   RESEND_API_KEY — Resend API key
//   NEXT_PUBLIC_SUPABASE_URL — Supabase URL
//   SUPABASE_SERVICE_ROLE_KEY — Service role key
//
// ============================================================================

export async function POST(request: NextRequest) {
  // Auth check
  const secret = process.env.PORTAL_DIGEST_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isEmailEnabled()) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get updates from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: updates, error: updatesError } = await supabase
      .from("portal_updates")
      .select("*, author:portal_users(*), project:portal_projects(name, slug)")
      .gte("created_at", weekAgo.toISOString())
      .order("created_at", { ascending: false });

    if (updatesError) throw updatesError;

    if (!updates || updates.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, reason: "No updates this week" });
    }

    // Get all stakeholders
    const { data: stakeholders, error: usersError } = await supabase
      .from("portal_users")
      .select("email, full_name, role")
      .in("role", ["stakeholder", "admin", "project_manager"]);

    if (usersError) throw usersError;

    if (!stakeholders || stakeholders.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, reason: "No recipients" });
    }

    // Group updates by project
    const byProject: Record<string, { name: string; updates: typeof updates }> = {};
    for (const update of updates) {
      const projectName = update.project?.name ?? "Unknown";
      if (!byProject[projectName]) {
        byProject[projectName] = { name: projectName, updates: [] };
      }
      byProject[projectName].updates.push(update);
    }

    // Build email HTML
    const html = buildDigestHtml(byProject, updates.length);

    // Send to each stakeholder
    let sent = 0;
    for (const recipient of stakeholders) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: recipient.email,
          subject: `Weekly Project Digest — ${updates.length} update${updates.length === 1 ? "" : "s"} this week`,
          html: html.replace("{{name}}", recipient.full_name),
        });
        sent++;
      } catch (err) {
        console.error(`[Digest] Failed to send to ${recipient.email}:`, err);
      }
    }

    return NextResponse.json({ ok: true, sent, total: stakeholders.length });
  } catch (err) {
    console.error("[Digest] Error:", err);
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 });
  }
}

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

interface ProjectGroup {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: any[];
}

function buildDigestHtml(
  byProject: Record<string, ProjectGroup>,
  totalUpdates: number
): string {
  const projectSections = Object.values(byProject)
    .map(
      (group) => `
      <tr>
        <td style="padding: 24px 0 12px 0;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #1A1714; font-family: 'Space Grotesk', system-ui, sans-serif;">
            ${group.name}
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #8A8680;">
            ${group.updates.length} update${group.updates.length === 1 ? "" : "s"} this week
          </p>
        </td>
      </tr>
      ${group.updates
        .map(
          (u) => `
        <tr>
          <td style="padding: 8px 0 8px 16px; border-left: 2px solid #E8E4DF;">
            <p style="margin: 0; font-size: 14px; font-weight: 500; color: #1A1714;">
              ${escapeHtml(u.title)}
            </p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #8A8680;">
              ${u.author?.full_name ?? "Team"} · ${formatDate(u.created_at)} · ${u.type}
            </p>
          </td>
        </tr>`
        )
        .join("")}`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'DM Sans', system-ui, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; padding: 40px 24px;">
    <tr>
      <td style="padding-bottom: 32px;">
        <p style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; color: #1A1714; font-family: 'Space Grotesk', system-ui, sans-serif;">
          CRÆFTO
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1A1714; font-family: 'Space Grotesk', system-ui, sans-serif;">
          Weekly Project Digest
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #8A8680;">
          Hi {{name}}, here's what happened across your projects this week.
        </p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #8A8680;">
          ${totalUpdates} update${totalUpdates === 1 ? "" : "s"} · ${Object.keys(byProject).length} project${Object.keys(byProject).length === 1 ? "" : "s"}
        </p>
      </td>
    </tr>
    <tr><td style="padding: 16px 0;"><hr style="border: none; border-top: 1px solid #E8E4DF;" /></td></tr>
    ${projectSections}
    <tr><td style="padding: 16px 0;"><hr style="border: none; border-top: 1px solid #E8E4DF;" /></td></tr>
    <tr>
      <td style="padding: 16px 0; text-align: center;">
        <a href="https://project-portal.craefto.com" style="display: inline-block; padding: 10px 24px; background-color: #1A1714; color: #FAF7F2; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500;">
          View Portal
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 0 0 0; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #B5B0AA;">
          Sent by Cræfto · <a href="https://craefto.com" style="color: #8A8680;">craefto.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
}
