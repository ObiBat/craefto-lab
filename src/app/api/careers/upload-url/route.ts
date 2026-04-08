import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRoleBySlug } from "@/lib/careers";

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const STORAGE_BUCKET = "job-applications";

interface UploadUrlRequest {
  role_slug?: string;
  filename?: string;
  size?: number;
  type?: string;
  kind?: "resume" | "cover_letter";
}

function sanitizeFilename(name: string): string {
  // Strip any path separators and constrain to a safe character set.
  const base = name.split(/[\\/]/).pop() ?? name;
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function randomNonce(): string {
  // 12 hex chars of cryptographic randomness, no Node-only deps required.
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  let body: UploadUrlRequest;
  try {
    body = (await request.json()) as UploadUrlRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const role = body.role_slug ? getRoleBySlug(body.role_slug) : null;
  if (!role) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (!body.filename || typeof body.filename !== "string") {
    return NextResponse.json({ error: "Filename is required." }, { status: 400 });
  }

  if (typeof body.size !== "number" || body.size <= 0 || body.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be between 1 byte and 10 MB." },
      { status: 400 }
    );
  }

  if (!body.type || !ACCEPTED_MIME_TYPES.has(body.type)) {
    return NextResponse.json(
      { error: "Only PDF, DOC, and DOCX files are accepted." },
      { status: 400 }
    );
  }

  const kind = body.kind === "cover_letter" ? "cover_letter" : "resume";
  const safeName = sanitizeFilename(body.filename);
  if (!safeName) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  // Server controls the path entirely. The client cannot influence anything
  // outside of the original filename suffix, which is sanitized above.
  const path = `${role.slug}/${kind}/${Date.now()}-${randomNonce()}-${safeName}`;

  let supabase;
  try {
    supabase = createServerClient();
  } catch {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not create upload URL." },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  });
}
