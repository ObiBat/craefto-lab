import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ============================================================================
// LINEAR WEBHOOK HANDLER
// ============================================================================
//
// Receives webhook events from Linear and syncs task data to Supabase.
//
// Setup:
// 1. Go to Linear Settings → API → Webhooks
// 2. Add webhook URL: https://craefto.com/api/portal/webhooks/linear
// 3. Select events: Issues (created, updated, removed)
// 4. Copy the signing secret → set as LINEAR_WEBHOOK_SECRET env var
// 5. Set SUPABASE_SERVICE_ROLE_KEY env var for writes
//
// ============================================================================

// Linear status → Portal task status mapping
const STATUS_MAP: Record<string, string> = {
  backlog: "backlog",
  unstarted: "todo",
  started: "in_progress",
  completed: "done",
  canceled: "backlog",
  triage: "backlog",
};

function mapStatus(linearState: string | undefined): string {
  if (!linearState) return "backlog";
  const lower = linearState.toLowerCase();
  return STATUS_MAP[lower] ?? "in_progress";
}

// Linear priority (0=none, 1=urgent, 2=high, 3=medium, 4=low) → portal
const PRIORITY_MAP: Record<number, string> = {
  0: "medium",
  1: "urgent",
  2: "high",
  3: "medium",
  4: "low",
};

function mapPriority(linearPriority: number | undefined): string {
  if (linearPriority === undefined) return "medium";
  return PRIORITY_MAP[linearPriority] ?? "medium";
}

// ============================================================================
// SIGNATURE VERIFICATION
// ============================================================================

function verifySignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expected = hmac.digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const secret = process.env.LINEAR_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !supabaseUrl || !supabaseServiceKey) {
    console.error("[Linear Webhook] Missing env vars");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // Read raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("linear-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn("[Linear Webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: LinearWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle Issue events
  if (payload.type !== "Issue") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (payload.action) {
      case "create": {
        const { data: existing } = await supabase
          .from("portal_tasks")
          .select("id")
          .eq("linear_issue_id", payload.data.id)
          .maybeSingle();

        if (existing) {
          // Already synced, update instead
          await updateTask(supabase, payload.data);
        } else {
          await createTask(supabase, payload.data);
        }
        break;
      }

      case "update": {
        await updateTask(supabase, payload.data);
        break;
      }

      case "remove": {
        // Soft delete: set status to backlog (don't actually delete)
        await supabase
          .from("portal_tasks")
          .update({ status: "backlog", updated_at: new Date().toISOString() })
          .eq("linear_issue_id", payload.data.id);
        break;
      }

      default:
        return NextResponse.json({ ok: true, skipped: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Linear Webhook] Error processing:", err);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DB OPERATIONS
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createTask(
  supabase: any,
  issue: LinearIssueData
) {
  // Find the portal project by Linear project ID
  const projectId = await resolveProjectId(supabase, issue);
  if (!projectId) {
    console.warn(
      `[Linear Webhook] No portal project found for Linear issue ${issue.identifier}`
    );
    return;
  }

  await supabase.from("portal_tasks").insert({
    project_id: projectId,
    title: issue.title,
    description: issue.description ?? null,
    status: mapStatus(issue.state?.name),
    priority: mapPriority(issue.priority),
    linear_issue_id: issue.id,
    linear_identifier: issue.identifier,
    due_date: issue.dueDate ?? null,
    sort_order: issue.sortOrder ?? 0,
    created_at: issue.createdAt,
    updated_at: issue.updatedAt,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateTask(
  supabase: any,
  issue: LinearIssueData
) {
  const updateData: Record<string, unknown> = {
    title: issue.title,
    description: issue.description ?? null,
    status: mapStatus(issue.state?.name),
    priority: mapPriority(issue.priority),
    linear_identifier: issue.identifier,
    due_date: issue.dueDate ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("portal_tasks")
    .update(updateData)
    .eq("linear_issue_id", issue.id);

  if (error) {
    console.error("[Linear Webhook] Update failed:", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveProjectId(
  supabase: any,
  issue: LinearIssueData
): Promise<string | null> {
  if (issue.project?.id) {
    const { data } = await supabase
      .from("portal_projects")
      .select("id")
      .eq("linear_project_id", issue.project.id)
      .maybeSingle();
    if (data) return data.id;
  }

  if (issue.team?.id) {
    const { data } = await supabase
      .from("portal_projects")
      .select("id")
      .eq("linear_team_id", issue.team.id)
      .maybeSingle();
    if (data) return data.id;
  }

  return null;
}

// ============================================================================
// TYPES
// ============================================================================

interface LinearWebhookPayload {
  action: "create" | "update" | "remove";
  type: string;
  data: LinearIssueData;
  url?: string;
  createdAt?: string;
}

interface LinearIssueData {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority?: number;
  sortOrder?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  state?: { id: string; name: string; type: string };
  team?: { id: string; name: string; key: string };
  project?: { id: string; name: string };
  assignee?: { id: string; name: string; email: string };
}
