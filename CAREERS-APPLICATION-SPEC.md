# Careers — Application System Spec

## Goal
Build a professional, multi-step job application experience for craefto.com careers pages, with tailored qualifying questions per role, file uploads, admin review interface, and email notifications.

## Scope

### 1. Database migration: `supabase/migrations/011_job_applications.sql`

Create a single migration that:
- Creates `job_applications` table with columns:
  - `id uuid primary key default gen_random_uuid()`
  - `role_slug text not null`
  - `role_title text not null`
  - `full_name text not null`
  - `email text not null`
  - `phone text`
  - `location text` (city / country)
  - `portfolio_url text`
  - `linkedin_url text`
  - `github_url text`
  - `resume_url text` (public Supabase Storage URL)
  - `resume_filename text`
  - `cover_letter_url text` (optional)
  - `cover_letter_filename text`
  - `answers jsonb not null default '[]'` (array of `{question_id, question_text, question_type, answer}`)
  - `status text not null default 'new'` (enum: new, reviewing, shortlisted, interview, offer, rejected, hired, archived)
  - `rating smallint` (1 to 5, nullable)
  - `admin_notes text`
  - `source text default 'craefto.com'`
  - `ip_address text`
  - `user_agent text`
  - `created_at timestamptz not null default now()`
  - `reviewed_at timestamptz`
  - `updated_at timestamptz not null default now()`
- Indexes on `role_slug`, `status`, `created_at`, `email`
- RLS: service role can do everything; public cannot select
- `updated_at` trigger
- Creates storage bucket `job-applications` (public read, 10MB limit, allowed: pdf, doc, docx)
- Storage policy: anyone can upload (public form); public read

### 2. Extend `src/lib/careers.ts`

Add application question schema to each role.

```ts
export type ApplicationQuestionType = "single-select" | "multi-select" | "short-text" | "long-text" | "number";

export interface ApplicationQuestion {
  id: string;              // stable key, e.g., "experience_years"
  label: string;           // question shown to applicant
  helperText?: string;
  type: ApplicationQuestionType;
  required: boolean;
  options?: string[];      // for single-select / multi-select
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

export interface Role {
  // existing fields...
  questions: ApplicationQuestion[];
}
```

For each existing role (`creative-designer`, `copywriter`), add 6 to 8 tailored qualifying questions. Cover:
- Years of experience (single-select: 0-1, 1-2, 2-4, 4-7, 7+)
- Commitment preference (single-select: Full-time, Part-time, Contract, Project-based)
- Start date availability (single-select: Immediately, 2 weeks, 1 month, 1-2 months, Flexible)
- Rate / salary expectation (short-text)
- Location / timezone (short-text)
- Language fluency (multi-select) — especially for copywriter (Mongolian, English, both)
- Tools proficiency (multi-select) — Figma, Adobe CS, Webflow, etc. for designer
- "Why Craefto?" (long-text, 200 to 1000 chars)
- "Describe a project you shipped that you're proud of" (long-text)
- Portfolio link (short-text, required for designer)
- Writing samples link (short-text, required for copywriter)

Make the questions feel tailored and professional. Not a form dump. Each one should qualify the candidate.

### 3. Application page: `src/app/careers/[slug]/apply/page.tsx` + `client.tsx`

Multi-step form matching existing careers page design language (same typography, colors, motion, SectionLabel patterns).

**Steps:**
1. **Personal** — full name, email, phone, location, portfolio URL, LinkedIn, GitHub
2. **Questions** — dynamic render from role.questions
3. **Files** — resume (required, pdf/doc/docx, 10MB), cover letter (optional)
4. **Review** — summary of everything, edit buttons per section
5. **Submit** — loading state, success screen with confirmation

**UX requirements:**
- Progress bar at top (step X of 5)
- Smooth transitions between steps (Framer Motion)
- Inline validation per field
- "Save draft to localStorage" so refresh doesn't lose progress
- Success screen: thank you, what happens next, CTA to view other roles
- Mobile responsive
- Accessibility: labels, aria, keyboard nav
- Upload progress indicator
- File size + type validation client side
- Character counter on long-text fields

Match the aesthetic of the existing `/careers/[slug]/client.tsx`. Use the same `Container`, `Section`, `Button`, `Badge`, `AnimatedSection`, `HeroText`, `SectionLabel`, `PageTransition` primitives. Dark-on-light like the rest of the site, with the accent color for progress and active states.

### 4. Public API: `src/app/api/careers/apply/route.ts`

`POST /api/careers/apply`

- Accepts multipart form data OR JSON with base64 encoded files (choose whichever is cleaner with existing patterns; leads API uses JSON, so match that by having the client upload files directly to Supabase Storage first, then POST metadata).
- Preferred flow: client uploads files to `job-applications` bucket with a generated path like `{role_slug}/{timestamp}-{safe_filename}`, then posts the metadata + URLs.
- Server validates:
  - Required fields present
  - Email format
  - Required questions answered
  - URL format for uploaded files
- Inserts into `job_applications` table via Supabase service role
- Sends email notification to `obi@craefto.com` via Resend (see template below)
- Returns `{ id, message }` on success
- Returns `{ error }` with appropriate status on failure
- Rate limit: basic IP-based throttle if easy (skip if not — leads route doesn't do it)

### 5. Email notification

Beautiful HTML email template, same style as other Craefto transactional emails if they exist. If not, build a clean minimal one.

Subject: `New application: {role_title} — {full_name}`

Body sections:
- Header with Craefto logo and "New Application" label
- Role name + posted date
- Applicant name, email, phone, location
- All links (portfolio, LinkedIn, GitHub)
- All question answers in a clean table
- Resume + cover letter download links
- CTA button: "Review in Command Center" → `https://craefto.com/admin/applications/{id}`
- Footer

Send via Resend from `hello@craefto.com` (existing EMAIL_FROM) to `obi@craefto.com`.

### 6. Admin command center: `src/app/admin/applications/page.tsx`

List view matching `src/app/admin/leads/page.tsx` patterns.

Features:
- Table of applications with columns: Name, Role, Applied, Status, Rating
- Filters: role (all / designer / copywriter / etc.), status, date range
- Search: name, email
- Sort: newest first by default
- Status pills with color coding (new=blue, reviewing=yellow, shortlisted=purple, interview=orange, offer=green, rejected=red, hired=emerald, archived=gray)
- Click row → `/admin/applications/[id]`
- Count badge per status
- Empty state

### 7. Admin detail page: `src/app/admin/applications/[id]/page.tsx`

Full application review interface.

Sections:
- Header: name, role, applied date, status dropdown, rating selector (1-5 stars)
- Personal info block
- Links block (portfolio, LinkedIn, GitHub — all clickable)
- Questions + answers rendered nicely (question in muted, answer prominent)
- Resume preview (PDF embed if pdf, otherwise download link)
- Cover letter preview
- Admin notes textarea (auto-saves on blur)
- Timeline: applied, status changes
- Actions: Move to status X, Archive, Delete (with confirm)
- Back to list link

### 8. Admin API: `src/app/api/admin/applications/route.ts` + `[id]/route.ts`

- `GET /api/admin/applications` — list with filter query params
- `GET /api/admin/applications/[id]` — single
- `PATCH /api/admin/applications/[id]` — update status, rating, notes
- `DELETE /api/admin/applications/[id]` — hard delete (admin only)

Service role Supabase client, no RLS concern.

### 9. Admin nav update: `src/app/admin/layout.tsx`

Add to `NAV_ITEMS`:
```ts
{ href: "/admin/applications", label: "Applications", icon: "inbox" },
```
Add inbox icon to `NavIcon` switch (envelope or document icon fits).

### 10. Hook up apply button

Update `src/app/careers/[slug]/client.tsx` — change `applyHref` to point to `/careers/{slug}/apply` instead of mailto or whatever it currently is. Check `src/app/careers/[slug]/page.tsx` to see how `applyHref` is built, and update there.

## Design requirements

- **Match existing design language**: same fonts (whatever careers page uses), same color variables, same component primitives, same motion patterns
- **Feel like a premium brand experience**, not a generic form
- **Mobile-first responsive**
- **Accessibility**: proper labels, focus states, aria-live for validation
- **No generic shadcn defaults** — this should look custom and Craefto-branded

## Technical notes

- Use existing `createServerClient` from `@/lib/supabase` for server APIs
- Use browser Supabase client for direct file uploads (check if one exists; if not use a server-side signed upload URL pattern)
- Reuse `resend` from `@/lib/resend` for emails
- Reuse `AdminLoader` and other admin components
- All new code in TypeScript, strict types, no `any` without reason
- No lint errors
- No console.logs

## Deliverables

1. New branch: `feature/careers-applications`
2. All files above created
3. Migration runs cleanly (`npm run supabase:migrate` or whatever the command is — check package.json scripts, don't run migrations against prod)
4. Lint passes: `npm run lint`
5. Build passes: `npm run build`
6. Commit with clear message
7. Push branch
8. Open PR against `main` with summary of what's shipped, screenshots if possible, testing notes

## Do NOT

- Do not run migrations against production Supabase
- Do not modify unrelated files
- Do not add new dependencies unless strictly necessary (stick to what's in package.json)
- Do not push to `main`
- Do not email anyone from real smtp during testing — Resend sends can be tested with the key disabled (the lib already handles missing key gracefully)

## When finished

Run:
```
openclaw system event --text "Done: Careers application system ready for review on branch feature/careers-applications, PR opened" --mode now
```
