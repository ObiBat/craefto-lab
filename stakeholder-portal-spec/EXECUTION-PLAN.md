# Stakeholder Portal — Full Execution Plan
**Created:** March 1, 2026
**Owner:** Dorj (execution) + Obi (review/approval)
**Domain:** project-portal.craefto.com

---

## Architecture Decision: Subdomain

**Approach:** Same Next.js codebase, subdomain routing via middleware
- `project-portal.craefto.com/` → serves `/portal` routes
- `project-portal.craefto.com/login` → serves `/portal/login`
- `project-portal.craefto.com/projects/[id]` → serves `/portal/projects/[id]`
- Internal routes stay at `/portal/*` in codebase
- Middleware rewrites subdomain requests to /portal paths
- Vercel: add `project-portal.craefto.com` as domain alias
- DNS: CNAME record pointing to Vercel

**Why not separate app:**
- Shares design system, components, Supabase client
- Single deploy, single codebase
- No duplication of fonts, tokens, layout components

---

## Sprint 1: Production Ready (Dorj executes, Obi reviews)

### 1.1 Subdomain Setup
- [ ] Update middleware.ts: detect project-portal.craefto.com hostname
- [ ] Rewrite subdomain root (/) to /portal
- [ ] Rewrite subdomain /login to /portal/login
- [ ] Rewrite subdomain /projects/* to /portal/projects/*
- [ ] Update all portal internal links to be subdomain-aware
- [ ] Update portal-header logo link
- [ ] Update login redirect after sign-in
- [ ] Test: both /portal and subdomain work

### 1.2 Error Boundaries
- [ ] Create src/app/portal/error.tsx (client error boundary)
- [ ] Create src/app/portal/not-found.tsx
- [ ] Style both with Paper & Ink design

### 1.3 Accessibility
- [ ] Add ARIA labels to dashboard page.tsx
- [ ] Add keyboard navigation to filter pills
- [ ] Add focus management on tab switches
- [ ] Verify contrast ratios on all status colors

### 1.4 Dashboard Filters
- [ ] Add "by member" filter dropdown
- [ ] Add "by project" search/filter
- [ ] Persist filter state in URL params

### 1.5 Documentation
- [ ] Add portal section to README.md
- [ ] Setup instructions for subdomain
- [ ] Environment variables reference

### 1.6 Seed Script
- [ ] Create scripts/seed-portal-demo.ts
- [ ] Seed from mock-data.ts into Supabase
- [ ] Include all 5 projects, users, tasks, updates

### 1.7 Final QA
- [ ] Mobile: iPhone SE (375px), iPhone Pro Max (430px)
- [ ] Desktop: 1440px, 1920px
- [ ] All 4 pages functional
- [ ] Demo mode works on Vercel preview
- [ ] Create PR with full description

---

## Obi Action Items (Cannot be automated)
- [ ] Add DNS CNAME: project-portal.craefto.com → cname.vercel-dns.com
- [ ] Add domain in Vercel dashboard: project-portal.craefto.com
- [ ] Set Supabase env vars in Vercel (when ready for live data)
- [ ] Review and merge PR
