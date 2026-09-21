# Case Study Extraction Prompt

Paste everything below the line into a Claude Code session opened at the root of a client project repo. It investigates the repo and writes one Markdown file to the Desktop containing a ready-to-add entry for the Craefto `/work` case study section, a shot list, and the questions only the client can answer. Bring that file back to the craefto-lab repo to have the case study added.

---

You are preparing a professional case study for the Craefto studio website (craefto.com). Your job is to extract every fact from this repository, then write a complete case study entry that matches the exact data schema below. Do not invent facts. Anything you cannot verify from the codebase, git history, docs, or config goes into an "Open questions" list at the end instead of the case study.

## Step 1. Investigate the project thoroughly

Work through all of these before writing anything. Read files, do not skim directory names.

**Identity and scope**
- Project name, product name, and the client or company behind it. Check `package.json`, README, docs, legal or about pages, email templates, meta tags, `manifest.json`, and any brand or design documents.
- What the product does, who it is for, and which industry it sits in.
- Whether it is live. Look for production URLs in env examples, `next.config`, `vercel.json`, `robots.txt`, `sitemap`, README, or deployment config.

**Timeline**
- Run `git log --reverse --format='%ad %s' --date=short | head -20` and `git log --format='%ad %s' --date=short | head -20` to get the first and latest commits.
- Run `git shortlog -sn` to see contributors.
- Run `git log --format='%ad' --date=format:'%Y-%m' | sort | uniq -c` to see how effort was distributed over months.
- Identify the current state: in development, launched, completed, or maintained.

**Services delivered**
Determine which of these Craefto actually did, with file-level evidence for each: Brand Strategy, Logo Design, Visual Identity, Motion Design, UI/UX Design, Design System, Frontend Development, Backend Development, Mobile Development, API Integration, Database Design, Authentication, Payments, CMS, SEO, Analytics, Deployment and DevOps, Content, Copywriting. Only include what the repo shows.

**Tech stack**
- Read `package.json` dependencies with exact major versions for the framework, language, UI library, styling, animation, database, auth, payments, email, hosting, and any notable third-party APIs.
- Check for `supabase/`, `prisma/`, `drizzle/`, `firebase`, Stripe, Resend, Sanity, and similar integrations.
- Check deploy target from `vercel.json`, `netlify.toml`, Dockerfiles, or CI workflows.

**Design and brand**
- Find the design tokens: colors, fonts, spacing, radius. Look in `globals.css`, `tailwind.config`, theme files, and font imports. Record the primary brand color as HSL components in the form `"H S% L%"` with no `hsl()` wrapper.
- Find logo files, favicons, and any brand guidelines or design system documentation pages.
- Count reusable UI components, animation components, and pages or routes.

**Features and complexity**
- List the main user-facing features by reading the routes and components.
- Note anything technically distinctive: real-time features, 3D, complex animation, AI integration, multi-currency, i18n, offline support, complex data models, third-party integrations.
- Gather countable facts that could become metrics: number of components, pages, animations, supported languages or currencies, API endpoints, database tables, test coverage, Lighthouse scores if recorded, bundle size, or anything else quantifiable from the repo.

**Problem and outcome**
- Read the README, docs, planning files, issue templates, PRDs, specs, changelogs, and commit messages for the original brief, the problem being solved, decisions made, and pivots.
- Look for any recorded results: analytics, testimonials, launch notes, client feedback in docs or comments.

## Step 2. Write the case study entry

Produce a single TypeScript object that matches this interface exactly. Every required field must be filled. Optional fields are included only when backed by evidence.

```ts
interface CaseStudy {
  slug: string;                 // kebab-case, from the product name
  title: string;                // product or project name as branded
  description: string;          // one sentence, 80 to 120 characters, for the card on the /work index
  category: "Brand" | "Web" | "Product" | "SaaS" | "Creative";
  client: string;               // legal or trading name, or "Internal Product"
  industry: string;             // e.g. "Fintech / Family Finance"
  timeline: string;             // "Completed", "In Development", "Ongoing", or a range like "Jan 2026 – Apr 2026"
  year: number;                 // year of launch or most recent major work
  featured: boolean;            // default false, flag as a question
  services: string[];           // from the verified services list above
  techStack: string[];          // names with major versions, e.g. "Next.js 15", "Supabase"
  liveUrl?: string;
  githubUrl?: string;           // only if the repo is public
  challenge: string;            // 80 to 120 words
  approach: string;             // 80 to 120 words
  solution: string;             // 80 to 120 words
  outcome: string;              // 60 to 100 words
  heroImage: string;            // "/images/projects/{slug}/{slug}-hero.jpg"
  thumbnail: string;            // "/images/projects/{slug}/{slug}-thumb.jpg"
  gallery: { src: string; alt: string; caption?: string }[];  // 3 to 6 items, numbered {slug}-gallery-01.jpg and so on, .mp4 allowed for motion
  metrics?: { label: string; value: string }[];               // 3 to 4 items, only repo-verifiable numbers
  testimonial?: { quote: string; author: string; role: string; company: string };  // only if a real quote exists in the repo
  awards?: string[];
  accentColor?: string;         // HSL components only, e.g. "195 78% 38%"
}
```

**Writing rules for the four narrative fields**
- Write in third person about the client and in first person plural about the studio ("we").
- Challenge: the client's situation and the specific problem, including constraints such as timeline, audience, trust requirements, or technical limits.
- Approach: how we thought about it. Research, key design or architecture decisions, and why. Name real decisions from the repo.
- Solution: what was actually delivered. Be concrete: name the components, systems, integrations, and features. Use specifics from the code.
- Outcome: what changed for the client. Only claim results you can support. If results are unknown, describe the delivered capability and its intended effect, and put the result question in Open questions.
- Sentence case for everything. No exclamation marks, no superlatives like "stunning" or "amazing", no marketing filler. Confident, plain, specific.

## Step 3. Write the deliverables to one file

Do not print the results in the terminal. Write a single Markdown file to the Desktop at:

`~/Desktop/craefto-case-study-{slug}.md`

Use the slug you chose in Step 2. Overwrite the file if it already exists. The file must contain these five sections in this order, with these exact headings so it can be parsed later.

### 1. Case study entry
The full TypeScript object inside a ```ts code block, ready to paste into the `caseStudies` array.

### 2. Index card entry
A second smaller object inside a ```ts code block for the `/work` index list with only: slug, title, description, category, industry, year, featured, accentColor, thumbnail.

### 3. Image shot list
A table with one row per image path referenced in the entry. Columns: Path, What to capture, Source file or route in this repo, Viewport and theme, Caption intent. Recommended sizes: hero 2400×1350, thumbnail 1200×900, gallery 2000×1250. Below the table, list any existing brand assets in this repo that can be reused directly, with their paths.

### 4. Open questions for the client
A numbered list of every fact you could not verify, phrased as a direct question. Typical items: business results and numbers, a testimonial quote with the person's name and title, permission to name the client publicly, permission to show screenshots, whether the product is live, and whether this should be a featured case study.

### 5. Evidence and confidence
A short list of the key files and commits you relied on, then one paragraph on your confidence in the entry and which sections rely most on assumptions.

If the repo contains ready-to-use brand assets such as logos, icons, or exported screenshots, also copy them into `~/Desktop/craefto-case-study-{slug}-assets/` and reference them in section 3.

When the file is written, print only its full path and a one-line summary of what it contains.
