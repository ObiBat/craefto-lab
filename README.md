This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Stakeholder Portal

The Stakeholder Portal is a client-facing project dashboard served at `project-portal.craefto.com`. It gives stakeholders real-time visibility into project progress, status updates, task tracking, and team activity — all within the same Next.js codebase using subdomain-based routing via middleware.

### Subdomain Setup

1. **DNS**: Add a CNAME record for `project-portal.craefto.com` pointing to `cname.vercel-dns.com`
2. **Vercel**: Add `project-portal.craefto.com` as a domain alias in the Vercel project settings

The middleware detects the subdomain and rewrites requests to the internal `/portal` routes. Both `project-portal.craefto.com/` and `craefto.com/portal` serve the same pages.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL. If missing, runs in demo mode. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key. If missing, runs in demo mode. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key for server-side operations. |

### Running the Migration

Apply the portal database schema via the Supabase MCP or dashboard:

```sql
-- Tables: portal_users, portal_projects, portal_tasks, portal_updates, portal_team_members, portal_timeline_events
-- See supabase/migrations/ for the full schema
```

### Seeding Demo Data

The portal includes built-in mock data that activates automatically when Supabase env vars are not set (demo mode). This includes 5 projects, 4 users, 10 tasks, and 6 updates. No separate seed script is needed for local development.

### Demo Credentials

- **Email:** `demo@craefto.com`
- **Password:** `demo123456`

These work in demo mode (no Supabase env vars configured).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
