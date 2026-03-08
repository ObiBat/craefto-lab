# Portal v2 — Sprint 2+3: Dashboard + Project Detail Rebuild

Read `docs/PORTAL-REDESIGN-PLAN.md` for full context and wireframes.

Sprint 1 is done (types updated, mock data removed, Linear integration expanded, queries updated). Now build the new UI.

## Your Task

### Sprint 2: Dashboard Rebuild

**Replace** `src/app/portal/page.tsx` (currently 837 lines) with a clean, simple dashboard:

**Layout:**
- NO sidebar. Full-width, max-width 960px centered.
- Clean top nav: Craefto logo (left) + user name + logout button (right)
- Greeting: "Good morning/afternoon/evening, {firstName}."
- Subtitle: "{n} active projects · Last updated {timeAgo}"

**Project Cards (2-column grid on desktop, 1 on mobile):**
- Large colored status dot (pulsing subtly for active projects)
- Project name: Source Serif 4, 600, 30px
- One-line AI summary (from `ai_summary` field, fallback to description truncated)
- Thick rounded progress bar with gradient fill based on status color
- Next milestone with date below progress bar
- Warm card background (#FFFFFF), border (#F0EDE8), border-radius 16px, padding 32px
- Hover: translateY(-2px) + shadow increase, 200ms transition
- Click navigates to `/portal/projects/{id}`

**Recent Activity (below cards):**
- Simple list: date + update title, last 8 updates across all projects
- Each links to the project

**Floating Message Button:**
- Fixed bottom-right, "Message Craefto" with chat icon
- Opens mailto:hello@craefto.com for now (we'll add Telegram later)

### Sprint 3: Project Detail Rebuild

**Replace** `src/app/portal/projects/[id]/page.tsx` (currently 1779 lines) with a story-format single page:

**Layout:** Single column, max-width 960px, generous margins (48px between sections)

**Sections (top to bottom):**

1. **Header**
   - Back link "← Back to Projects"
   - Project name: Source Serif 4, 700, 46px
   - Status dot + "On Track · 72% complete"
   - AI summary paragraph (italic, warm grey)

2. **Timeline** (new component)
   - Horizontal milestone visualization
   - Dots connected by line, labeled below with milestone name + date
   - Current position marker (filled dot, others hollow)
   - Completed milestones get a checkmark
   - Use data from `next_milestone` / `next_milestone_date` + milestones if available

3. **What's Happening Now**
   - Current sprint/cycle name
   - Task count: "8 of 12 tasks complete"
   - Task list with status icons: ✓ done, ◐ in-progress, ○ todo
   - Pull from Linear integration (`fetchProjectWithLinear` in queries.ts)

4. **Files**
   - If `google_drive_url` exists: "Open in Google Drive →" link
   - If not: "No files linked yet" in muted text

5. **Updates**
   - List of portal_updates for this project
   - Each: date + title + content preview (2-3 lines)
   - Clean card style

6. **Invoices**
   - Simple table: number, amount, description, status (paid/due/overdue)
   - Status shown as colored text, not complex badges

7. **Floating Message Button** (same as dashboard)

### Login Page Simplification

Update `src/app/portal/login/page.tsx`:
- Remove demo credentials hint text
- Remove role switcher UI
- Keep the split-panel layout but update left panel text to "Your project, always in view."

### Remove Deprecated Pages

Delete these page files (they'll 404, which is fine):
- `src/app/portal/documents/` (entire directory)
- `src/app/portal/payments/` (entire directory) 
- `src/app/portal/requests/` (entire directory)
- `src/app/portal/settings/` (entire directory)

### Remove Deprecated Components

Delete these component files:
- `src/components/portal/document-card.tsx`
- `src/components/portal/file-upload.tsx`
- `src/components/portal/invoice-card.tsx`
- `src/components/portal/notification-settings.tsx`
- `src/components/portal/request-card.tsx`
- `src/components/portal/rich-text-editor.tsx`
- `src/components/portal/role-switcher.tsx`
- `src/components/portal/sparkline.tsx`
- `src/components/portal/tab-system.tsx`

### Update Layout + Sidebar

- `src/app/portal/layout.tsx` — Remove sidebar import if it exists in layout
- `src/components/portal/portal-sidebar.tsx` — Delete (no more sidebar)
- `src/components/portal/portal-header.tsx` — Simplify to just logo + user + logout (inline in layout or minimal component)

## Visual Design System

### Colors (CSS custom properties or Tailwind)
```
Background:     #FAF9F6
Card Surface:   #FFFFFF  
Card Border:    #F0EDE8
Text Primary:   #1A1A1A
Text Secondary: #6B6560
Accent:         #2D6A4F (Craefto green)

Status:
  On Track:     #2D6A4F
  At Risk:      #D4A843
  Blocked:      #C1553B
  Completed:    #8B9E93
```

### Typography
- H1: Source Serif 4, 700, 46px, line-height 1.1
- H2: Source Serif 4, 600, 30px, line-height 1.2
- H3: Space Grotesk, 600, 20px, line-height 1.3
- Body: Source Serif 4, 400, 18px, line-height 1.75
- Caption: Space Grotesk, 400, 14px, line-height 1.5

Import fonts if not already imported:
```css
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Space+Grotesk:wght@400;600&display=swap');
```

### Spacing
- Page max-width: 960px centered
- Section gap: 48px
- Card padding: 32px
- Card border-radius: 16px

### Animations (Framer Motion — already installed)
- Page enter: fade up 20px over 400ms
- Cards: stagger children 100ms
- Progress bar: width transition 800ms ease-out
- Status dot: pulse scale 1→1.15→1 over 2s (active projects only)
- Hover cards: translateY(-2px) + shadow increase, 200ms

## Rules
- Keep it SIMPLE. The current pages are 837 and 1779 lines. Target under 300 each.
- Mobile-first responsive design
- Use existing shadcn/ui components where they help (Button, etc.) but don't over-componentize
- Framer Motion for animations (already in package.json)
- All data fetching uses the functions from `src/lib/portal/queries.ts`
- TypeScript strict
- NO dashes in any UI copy text (project requirement)
- Commit with clear messages when done
- Run `npx next build` to verify no build errors before finishing

When completely finished, run: openclaw system event --text "Done: Portal v2 Sprint 2+3 complete" --mode now
