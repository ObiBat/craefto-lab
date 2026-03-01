# Stakeholder Updates Portal — Build Spec

## Stack (Existing craefto-lab)
- Next.js 16.1.1, React 19, TypeScript 5.9.3
- Tailwind CSS 4, Framer Motion 12
- Supabase (already integrated: @supabase/supabase-js 2.90.1)
- Space Grotesk (headings) + DM Sans (body) + JetBrains Mono (mono)
- Vercel deployed
- Uses CVA, clsx, tailwind-merge, Radix UI

## Design System (from globals.css)
### Colors — Paper & Ink Theme
- Background: hsl(38 33% 97%) #FAF7F2 warm cream
- Foreground: hsl(30 12% 9%) #1A1714 deep ink
- Accent: hsl(145 18% 36%) muted sage green
- Border: hsl(32 14% 86%) #E5DFD6
- Success: hsl(145 25% 38%) sage green
- Warning: hsl(35 55% 50%) warm amber
- Error: hsl(5 45% 48%) soft coral
- Full neutral scale: 50-950 warm tones

### Typography
- --font-heading: Space Grotesk
- --font-sans: DM Sans
- --font-mono: JetBrains Mono

### Existing Patterns
- CSS variables for all tokens
- Admin panel has dark theme override (.admin-theme)
- Staggered nav animations, mobile nav slide-ins
- Layered hover states, spring easing

## Auth
- Supabase Auth (new — no existing auth in production site)
- Role-based: Admin, Project Manager, Stakeholder (read-only), Team Member
- Demo credentials for development: demo@craefto.com / demo123456
- Protected routes via middleware
- Secure httpOnly cookie sessions

## Data Source
- Supabase database (primary store)
- Linear integration for project/task sync (read from Linear API)
- Models: Project, Task, Update, TeamMember
- Update types: alignment, decision, blocker, milestone, task_update
- Real-time via Supabase Realtime (WebSocket)

## Pages to Build (under /portal route group)
1. `/portal` — Dashboard: project grid with status pills (on-track/at-risk/blocked), latest alignment update per project, activity feed, filters
2. `/portal/projects/[id]` — Project detail with tabs: Alignment & Decisions, Tasks (kanban + list), Team, Timeline
3. `/portal/projects/[id]/update` — Rich text composer with tags, @mentions, file attachments, preview
4. `/portal/login` — Auth page matching Paper & Ink design

## Design Requirements
- Match existing Paper & Ink aesthetic exactly
- Status colors: sage green (on-track), warm amber (at-risk), soft coral (blocked)
- Asymmetric grids, intentional negative space
- Card tiles with layered depth shadows
- Staggered reveal on page load (animation-delay cascade)
- Skeleton loading states
- Progress rings with count-up animation
- Dark mode: NO (production site is light only)
- Must look Awwwards-worthy, not generic

## Code Quality
- TypeScript strict mode
- Atomic design components
- CSS variables referencing existing design tokens
- Mobile-first responsive
- WCAG AA+ accessibility
- Error boundaries, loading states, empty states
- Optimistic UI updates

## File Structure
All new files under src/app/portal/ and src/components/portal/
- src/app/portal/layout.tsx
- src/app/portal/page.tsx (dashboard)
- src/app/portal/login/page.tsx
- src/app/portal/projects/[id]/page.tsx
- src/app/portal/projects/[id]/update/page.tsx
- src/components/portal/ (all portal components)
- src/lib/portal/ (portal utils, types, supabase queries)
- supabase/migrations/xxx-portal-tables.sql

## Deliverables
1. Working codebase integrated into existing craefto-lab repo
2. Supabase migration for portal tables
3. README section for portal setup
4. Demo seed data script
