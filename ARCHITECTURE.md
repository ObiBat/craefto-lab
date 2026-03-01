# Architecture — Cræfto Stakeholder Portal

> project-portal.craefto.com

## Overview

The Stakeholder Updates Portal is a real-time project communication layer built into the Cræfto website (craefto.com). It provides clients, team members, and stakeholders with transparent visibility into project progress, decisions, and blockers.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| UI | React 19, Framer Motion 12 |
| Styling | Tailwind CSS 4, CSS custom properties |
| Auth | Supabase Auth (email/password, httpOnly cookies via SSR) |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime (Postgres changes) |
| Rich Text | TipTap (ProseMirror) |
| Deployment | Vercel |
| Domain | project-portal.craefto.com (CNAME) |

## Project Structure

```
src/
├── app/
│   ├── portal/                    # All portal pages
│   │   ├── page.tsx               # Dashboard (project grid + activity feed)
│   │   ├── layout.tsx             # AuthProvider + ToastProvider wrapper
│   │   ├── login/page.tsx         # Login page
│   │   └── projects/
│   │       └── [id]/
│   │           ├── page.tsx       # Project detail (tabs: updates, tasks, team, timeline)
│   │           └── update/page.tsx # Update composer (rich text + file upload)
│   └── api/
│       └── portal/
│           └── webhooks/
│               └── linear/route.ts # Linear webhook sync
├── components/
│   └── portal/                    # Portal-specific components
│       ├── portal-header.tsx      # Top navigation bar
│       ├── portal-sidebar.tsx     # Desktop sidebar with project list
│       ├── project-card.tsx       # Dashboard project card with sparkline
│       ├── activity-item.tsx      # Activity feed entry
│       ├── horizontal-timeline.tsx # Snap-scroll timeline
│       ├── sparkline.tsx          # SVG activity sparkline chart
│       ├── status-pill.tsx        # Status badge (on_track, at_risk, blocked, completed)
│       ├── progress-ring.tsx      # Circular progress indicator
│       ├── update-type-badge.tsx  # Update type label
│       ├── rich-text-editor.tsx   # TipTap-based editor
│       ├── file-upload.tsx        # Drag-and-drop file uploads
│       ├── toast.tsx              # Toast notification system
│       ├── skeleton.tsx           # Loading skeletons
│       └── empty-state.tsx        # Empty state placeholder
├── lib/
│   └── portal/
│       ├── auth-context.tsx       # React context: user, role, permissions
│       ├── queries.ts            # Supabase queries (or mock data fallback)
│       ├── mock-data.ts          # Demo mode data
│       ├── types.ts              # TypeScript interfaces
│       ├── routes.ts             # portalPath() helper
│       ├── realtime.ts           # Supabase Realtime hooks
│       └── sanitize.ts           # HTML sanitization for rich content
└── middleware.ts                  # Subdomain rewrite + auth guard
```

## Routing — Subdomain Architecture

The portal uses a subdomain pattern:

- **Subdomain:** `project-portal.craefto.com/*` (what clients see)
- **Internal:** `craefto.com/portal/*` (actual Next.js routes)

### How It Works

1. DNS CNAME points `project-portal.craefto.com` → Vercel
2. Vercel routes the request to the Next.js app
3. `middleware.ts` detects the subdomain via `Host` header
4. Middleware **rewrites** `/login` → `/portal/login`, `/projects/abc` → `/portal/projects/abc`
5. Next.js serves the page from `src/app/portal/`

### Client-Side Navigation

`portalPath()` in `src/lib/portal/routes.ts` always returns `/portal/*` paths. This ensures `router.push()` (which bypasses middleware) resolves to real routes. The middleware then redirects `/portal/*` back to clean URLs on the subdomain.

Flow: `router.push('/portal/projects/abc')` → middleware redirects to `/projects/abc` → middleware rewrites to `/portal/projects/abc` → page renders.

## Authentication

### Live Mode (`NEXT_PUBLIC_PORTAL_LIVE=true`)

1. Middleware checks Supabase session via `@supabase/ssr` (httpOnly cookies)
2. Unauthenticated requests redirect to `/login`
3. `AuthProvider` context exposes: `user`, `portalUser`, `loading`, `hasPermission()`
4. Role-based UI: Admin sees everything, Stakeholders see read-only views

### Demo Mode (default)

When `NEXT_PUBLIC_PORTAL_LIVE` is not `true`:
- Middleware skips auth checks
- `AuthProvider` uses mock data
- Login accepts `demo@craefto.com` / `demo123456`
- All data comes from `mock-data.ts`

### Roles & Permissions

| Role | Dashboard | Projects | Updates | Tasks | Team |
|---|---|---|---|---|---|
| Admin | Full | Full | Create/Edit | Edit status | Manage |
| Project Manager | Full | Full | Create/Edit | Edit status | View |
| Team Member | View | Assigned | Create | Edit own | View |
| Stakeholder | View | Assigned | View | View | View |

## Data Layer

### Supabase Schema

Four main tables with Row Level Security:

- `portal_users` — user profiles with roles
- `portal_projects` — project records
- `portal_tasks` — tasks linked to projects (optional Linear sync)
- `portal_updates` — rich text updates with types (alignment, decision, blocker, milestone, task_update)
- `portal_team_members` — project-to-user assignments
- `portal_attachments` — file uploads linked to updates

### Row Level Security (RLS)

- Users can only read projects they are members of
- Admins and PMs can insert/update
- Stakeholders have read-only access
- Service role key bypasses RLS (used by Linear webhook)

### Real-time

`useProjectRealtime()` hook subscribes to Supabase Realtime channels:
- `portal_tasks` changes → refresh task list
- `portal_updates` changes → refresh update feed
- Channel per project: `project:{id}`

## Design System — Paper & Ink

### Colors (CSS Custom Properties)

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#FAF7F2` (warm cream) | Page backgrounds |
| `--color-foreground` | `#1A1714` (deep ink) | Primary text |
| `--color-accent` | Sage green | Links, active states |
| `--color-success` | Sage green | On track, completed |
| `--color-warning` | Amber | At risk |
| `--color-error` | Coral | Blocked, errors |

### Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| Headings | Space Grotesk | 600-700 | 20-46px |
| Body | DM Sans | 400 | 14-16px |
| Code | JetBrains Mono | 400 | 12-14px |
| UI labels | Space Grotesk | 500 | 12-14px |

### Animation

All animations use Framer Motion with `useReducedMotion()` support:
- Page transitions: `AnimatePresence` crossfade
- Staggered reveals: 60ms delay per item
- Hover states: scale + shadow elevation
- Loading: skeleton pulse
- New items: slide-in from top with highlight glow

## Linear Integration

### Webhook Sync

`/api/portal/webhooks/linear` receives Issue events:

1. **Signature verification** — HMAC-SHA256 with `LINEAR_WEBHOOK_SECRET`
2. **Status mapping** — Linear states map to portal statuses (backlog, todo, in_progress, done)
3. **Project resolution** — matches via `linear_project_id` or `linear_team_id`
4. **Create/Update/Remove** — syncs to `portal_tasks` table

### Setup

1. Linear Settings → API → Webhooks
2. URL: `https://craefto.com/api/portal/webhooks/linear`
3. Events: Issues (created, updated, removed)
4. Copy signing secret → `LINEAR_WEBHOOK_SECRET` env var
5. Set `SUPABASE_SERVICE_ROLE_KEY` for database writes

## Deployment

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `NEXT_PUBLIC_PORTAL_LIVE` | No | Set to `true` to enable live auth |
| `SUPABASE_SERVICE_ROLE_KEY` | For webhooks | Service role key (bypasses RLS) |
| `LINEAR_WEBHOOK_SECRET` | For Linear | Webhook signing secret |

### Vercel Setup

1. Add domain: `project-portal.craefto.com`
2. DNS: CNAME `project-portal` → `cname.vercel-dns.com`
3. Set environment variables in Vercel dashboard
4. Deploy from `main` branch

## Security

- httpOnly cookies for session tokens (not localStorage)
- HMAC-SHA256 webhook signature verification
- HTML sanitization on rich text content (server + client)
- RLS policies on all portal tables
- Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff
- `robots: noindex, nofollow` on all portal pages
- No portal routes indexed by search engines
