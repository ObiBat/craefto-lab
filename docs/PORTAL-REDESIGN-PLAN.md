# Project Portal v2: Redesign Plan

**Date:** March 8, 2026
**Status:** Proposal
**Goal:** Simplify the portal into a clean, visual, client-facing experience that communicates project status at a glance.

---

## The Problem

The current portal is over-engineered for what clients actually need. It has:
- 8 separate pages (dashboard, projects, documents, payments, requests, settings, etc.)
- Complex role-based UI with demo mode toggles
- Mock data architecture alongside real data
- Task-level granularity that clients don't care about
- Feature bloat: rich text editors, sparklines, progress rings, invoice cards

**What clients actually want:** "Where does my project stand? What's next? How do I reach you?"

---

## Design Philosophy

Inspired by: **Linear** (speed + clarity), **Flowla** (client collaboration hubs), **Notion** (warm, readable), and Awwwards 2025/2026 SOTD winners.

### 2026 Design Principles Applied

1. **Warm neutrals over cold greys** — Soft beige/cream backgrounds, not sterile white. Reduces fatigue, feels premium. (Source: updivision.com/blog/ui-color-trends-2026)
2. **Single page confidence** — Client should understand project health in 3 seconds without clicking anything
3. **Visual storytelling over data tables** — Big status indicators, timeline visualization, not spreadsheet rows
4. **Asymmetric layouts** — Break grid monotony with intentional whitespace and varied card sizes
5. **Micro-interactions with purpose** — Subtle transitions that communicate state changes, not decoration
6. **Type-driven hierarchy** — Source Serif 4 for headings, Space Grotesk for data. Let typography do the heavy lifting.
7. **Adaptive color system** — Status colors that shift contextually (on-track green, at-risk amber, blocked red) as the dominant visual language

---

## Architecture: What Changes

### Remove (Kill the Complexity)

| Current | Why Remove |
|---------|-----------|
| `/portal/documents` page | Replace with Google Drive embed/links per project |
| `/portal/payments` page | Replace with simple invoice status in project view |
| `/portal/requests` system | Replace with simple contact/message form |
| `/portal/settings` page | Unnecessary for client portal |
| Role switcher / demo mode | Remove entirely (was dev tooling) |
| Rich text editor | Overkill for updates |
| Sparkline charts | Visual noise |
| Complex RLS policies | Simplify to authenticated = read access |
| Mock data system | Remove (real data only) |
| `portal_tasks` table dependency | Pull from Linear directly |
| `portal_team_members` table | Simplified, auto-sync from Linear |

### Keep (Core Value)

| Feature | Refinement |
|---------|-----------|
| Supabase auth | Keep, it works |
| Linear integration | Expand (primary data source for tasks/milestones) |
| Project cards | Redesign completely |
| Activity feed | Simplify to timeline |
| Middleware auth | Keep cookie-based SSR approach |

### Add (New)

| Feature | Purpose |
|---------|---------|
| Google Drive integration | Per-project file links (no re-uploading) |
| AI-generated project summary | One paragraph "here's where we are" per project |
| Visual timeline | Horizontal milestone view with current position marker |
| Quick message widget | Floating "Message Craefto" button (sends to you via Telegram) |
| Weekly digest email | Auto-generated summary of project changes |

---

## New Information Architecture

### Pages: 3 (down from 8)

```
/portal              → Dashboard (all projects at a glance)
/portal/project/:id  → Project Detail (single source of truth)
/portal/login        → Login (simplified)
```

That's it. Three pages.

---

## Page Designs

### 1. Dashboard (`/portal`)

**Layout:** Full-width, no sidebar. Clean top navigation with Craefto logo + user avatar + logout.

**Content (top to bottom):**

```
┌─────────────────────────────────────────────────┐
│ "Good morning, Sara."                           │
│ 3 active projects · Last updated 2h ago         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────┐  ┌─────────────────┐      │
│  │ PROJECT CARD     │  │ PROJECT CARD     │      │
│  │                  │  │                  │      │
│  │ ● On Track       │  │ ◐ At Risk        │      │
│  │ Brand Refresh    │  │ SaaS Platform    │      │
│  │                  │  │                  │      │
│  │ 72% ━━━━━━━━━░░ │  │ 45% ━━━━━░░░░░░ │      │
│  │                  │  │                  │      │
│  │ Next: Logo       │  │ Next: API fix    │      │
│  │ delivery Mar 15  │  │ review Mar 12    │      │
│  └─────────────────┘  └─────────────────┘      │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ RECENT ACTIVITY                          │    │
│  │                                          │    │
│  │ Today    Design mockups uploaded          │    │
│  │ Mar 7    Sprint review completed          │    │
│  │ Mar 5    Brand colors approved            │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [Message Craefto]                              │
└─────────────────────────────────────────────────┘
```

**Project Cards Visual Design:**
- Large status dot (colored, pulsing subtly for active)
- Project name in Source Serif 4 (30px, bold)
- Single-line AI summary: "Brand identity finalization, entering review phase"
- Visual progress bar (thick, rounded, gradient fill)
- Next milestone with date
- Warm card background (cream/off-white) with subtle shadow
- On hover: gentle lift + shadow increase

### 2. Project Detail (`/portal/project/:id`)

**Layout:** Single column, generous margins. Scrollable story format.

```
┌─────────────────────────────────────────────────┐
│ ← Back to Projects                              │
│                                                 │
│ Meridian Brand Refresh                          │
│ ● On Track · 72% complete                      │
│                                                 │
│ "We're finalizing the logo system and moving    │
│  into the brand guidelines phase. Everything    │
│  is on schedule for the April 30 delivery."     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  TIMELINE                                       │
│  ○────●────○────○────○                          │
│  Jan   Feb   Mar   Apr   May                    │
│  Start Logo  Guide  Final Deliver               │
│        ✓     ←NOW   lines                       │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  WHAT'S HAPPENING NOW                           │
│  ┌──────────────────────────────────────┐       │
│  │ Sprint: Brand Guidelines             │       │
│  │ 8 of 12 tasks complete               │       │
│  │                                      │       │
│  │ ✓ Color palette finalized            │       │
│  │ ✓ Typography system defined          │       │
│  │ ◐ Logo usage rules (in progress)     │       │
│  │ ○ Stationery templates               │       │
│  └──────────────────────────────────────┘       │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  FILES                                          │
│  Open in Google Drive →                         │
│                                                 │
│  Recent: brand-colors-v3.pdf · logo-final.svg   │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  UPDATES                                        │
│  ┌──────────────────────────────────────┐       │
│  │ Mar 7 — Sprint Review                │       │
│  │ Presented logo variations. Client    │       │
│  │ approved Direction B. Moving to      │       │
│  │ guidelines phase.                    │       │
│  └──────────────────────────────────────┘       │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  INVOICES                                       │
│  ┌────────────────────────────────────┐         │
│  │ #001  $5,000  Deposit     ✓ Paid  │         │
│  │ #002  $3,000  Milestone 1 ✓ Paid  │         │
│  │ #003  $4,000  Milestone 2 ◐ Due   │         │
│  └────────────────────────────────────┘         │
│                                                 │
│  [Message Craefto about this project]           │
└─────────────────────────────────────────────────┘
```

### 3. Login (`/portal/login`)

Keep the current split-panel design but simplify:
- Left: Craefto branding + one-liner "Your project, always in view."
- Right: Email + password, nothing else
- Remove demo credentials hint
- Remove role switcher

---

## Data Architecture (Simplified)

### Primary Data Sources

| Data | Source | Sync Method |
|------|--------|------------|
| Projects | Linear (projects) | Webhook + on-demand |
| Tasks/Sprints | Linear (issues/cycles) | Webhook + on-demand |
| Milestones | Linear (project milestones) | Webhook |
| Updates/Notes | Supabase `portal_updates` | Direct write (Craefto posts updates) |
| Files | Google Drive (per-project folder) | Link only (no upload/storage) |
| Invoices | Supabase `portal_invoices` | Manual entry or Stripe webhook |
| Users | Supabase auth + `portal_users` | Direct |

### Tables to Keep
- `portal_users` — auth mapping + role
- `portal_projects` — cached Linear project data + Google Drive folder link + AI summary
- `portal_updates` — manual updates posted by Craefto team
- `portal_invoices` — simple invoice tracking

### Tables to Remove (after v2 stable)
- `portal_tasks` — pull from Linear on demand
- `portal_team_members` — derive from Linear project members
- `portal_documents` — replaced by Google Drive links
- `portal_requests` — replaced by message widget
- `portal_request_replies` — removed with requests
- `portal_timeline_events` — derive from Linear + updates

### New Columns on `portal_projects`
```sql
ALTER TABLE portal_projects ADD COLUMN google_drive_url TEXT;
ALTER TABLE portal_projects ADD COLUMN linear_project_id TEXT;
ALTER TABLE portal_projects ADD COLUMN ai_summary TEXT;
ALTER TABLE portal_projects ADD COLUMN next_milestone TEXT;
ALTER TABLE portal_projects ADD COLUMN next_milestone_date DATE;
```

---

## Visual Design System

### Color Palette

```
Background:     #FAF9F6 (warm off-white / "cosmic latte")
Card Surface:   #FFFFFF
Card Border:    #F0EDE8 (warm grey)
Text Primary:   #1A1A1A
Text Secondary: #6B6560 (warm grey)
Accent:         #2D6A4F (Craefto green, muted)

Status Colors:
  On Track:     #2D6A4F (green)
  At Risk:      #D4A843 (amber)
  Blocked:      #C1553B (terracotta red)
  Completed:    #8B9E93 (muted sage)
```

### Typography
Per TOOLS.md:
- **H1:** Source Serif 4, 700, 46px (project names on detail page)
- **H2:** Source Serif 4, 600, 30px (section headers)
- **H3:** Space Grotesk, 600, 20px (card titles)
- **Body:** Source Serif 4, 400, 18px
- **Caption/Meta:** Space Grotesk, 400, 14px (dates, status labels)

### Spacing
- Page max-width: 960px (centered, generous side margins)
- Section gap: 48px
- Card padding: 32px
- Card border-radius: 16px

### Animations (Framer Motion)
- Page enter: fade up 20px over 400ms
- Cards: stagger children 100ms delay
- Progress bar: width transition 800ms ease-out
- Status dot: subtle pulse (scale 1 → 1.15 → 1, 2s loop) for active projects only
- Hover: translateY(-2px) + shadow increase over 200ms

---

## Implementation Sprints

### Sprint 1: Foundation (3 days)
- [ ] Database migration: add new columns, mark deprecated tables
- [ ] Update Linear integration: fetch projects, milestones, current sprint tasks
- [ ] Remove mock data system entirely
- [ ] Remove demo mode logic from `isDemoMode()`, `isPortalDemoMode()`
- [ ] Set up Google Drive API or simple URL storage per project

### Sprint 2: Dashboard Rebuild (3 days)
- [ ] New dashboard page (replace 837-line current page)
- [ ] New project card component (visual, simple)
- [ ] Activity feed (last 10 updates across all projects)
- [ ] Responsive layout (mobile-first)
- [ ] Warm color system implementation

### Sprint 3: Project Detail (3 days)
- [ ] New project detail page (story format, single column)
- [ ] Visual timeline component (horizontal milestones)
- [ ] Current sprint tasks from Linear
- [ ] Google Drive link section
- [ ] Updates feed (per project)
- [ ] Invoice summary table
- [ ] AI summary generation (on update, re-generate with Gemini)

### Sprint 4: Polish + Cleanup (2 days)
- [ ] Message widget (floating button → sends to Telegram)
- [ ] Remove all deprecated pages (documents, payments, requests, settings)
- [ ] Remove deprecated components (role-switcher, rich-text-editor, sparkline, etc.)
- [ ] Login page simplification
- [ ] Remove deprecated database tables
- [ ] Performance audit (bundle size, Lighthouse)
- [ ] Deploy + test with real client data

---

## Migration Safety

- No existing data deleted until v2 is stable
- Deprecated tables kept but unused for 2 weeks, then dropped
- All changes behind feature flag if needed: `NEXT_PUBLIC_PORTAL_V2=true`

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Pages | 8 | 3 |
| Components | 20+ | 10 |
| Time to understand project status | ~30 seconds (click through) | 3 seconds (glance) |
| Code lines (portal) | ~3,500 | ~1,200 |
| Client friction points | Complex role UI, empty states, confusing nav | Zero learning curve |

---

## References

- Linear: Speed + clarity philosophy (linear.app)
- Flowla: Client collaboration hub model (flowla.com)
- UI Color Trends 2026: Warm neutrals, adaptive systems (updivision.com)
- Moxo, Bonsai, ManyRequests: Agency portal patterns
- Awwwards SOTD 2025/2026: Asymmetric layouts, type-driven hierarchy
- SaaSFrame: 166 dashboard UI examples (saasframe.io)
