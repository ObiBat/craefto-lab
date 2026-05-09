# CRAEFTO — AI Marketing Video Production Stack & Playbook

> Companion to `content-engine-runbook.md`. Defines the SaaS stack, per-format production workflow, brand-fit guardrails, 4-week rollout, and productization path for AI-generated marketing video at CRAEFTO. SaaS-only — no code changes in this repo.

## Context

CRAEFTO is a creative-tech studio (Australia) selling design engineering, brand systems, security audits, and AI integration to funded startups. The existing marketing engine is a written-content flywheel: a 5-stage Gemini/OpenAI agent pipeline pushing ~2 journal articles/week, a Next.js 16 site (Paper & Ink design system: warm cream, deep ink, sage), and a project portal. There is **no video production capability today** — the careers page lists a "Video Editor" role that's still vacant.

The opportunity is to layer professional AI-generated video on top of the same flywheel: every journal article, shipped client project, and service page should have a video counterpart, and the founder's face/voice should appear on social channels weekly without requiring a shoot. The May 2026 AI-video stack (Veo 3.1, Runway Gen-4, HeyGen, ElevenLabs, Descript, OpusClip) is finally good enough to do this without a film crew, at agency-grade quality, for under $600/month.

This playbook is **SaaS-only, no code**. The deliverable is a tool stack, a per-format production workflow, brand-fit guardrails, a 4-week rollout, and a productization path so the same machine can be sold to clients later. It does not modify `craefto-lab`.

---

## Recommended Tool Stack (Pro tier, ~$430–580/mo)

| Layer | Tool | Plan | Monthly | Why this one |
|---|---|---|---|---|
| Cinematic generation + native audio | **Google Veo 3.1** (via Gemini API / Flow) | Pay-per-use | ~$100–200 | Only mainstream model that generates synced dialogue + ambient sound + SFX in one pass. True 4K@60fps. Best for brand-film hero shots. |
| Reference-driven generation, brand consistency | **Runway Gen-4 / Gen-4 Turbo** | Standard ($35) or Pro ($95) | $95 | Best character/brand consistency via reference images. Built-in editor. The agency default for marketing creatives. |
| Avatar + multilingual talking head | **HeyGen** | Team | $120 | Most lifelike avatar lip-sync in 2026, Avatar IV for founder-cloning, native translation into 30+ languages with lip-sync intact. UGC-style fits social better than Synthesia. |
| Voice clone + VO | **ElevenLabs** | Creator → Pro | $22 → $99 | Founder voice clone, multilingual, the de-facto AI voice standard. |
| Long-form edit + screen recording + voice cleanup | **Descript** | Pro | $30 | Text-based editing (delete words from transcript → cuts video). Killer for service explainers — founder records screen, edits like a Google Doc. |
| Long → short repurposing + auto-captions | **OpusClip** | Pro | $29 | 97% caption accuracy, auto-finds viral moments from long videos, 9:16 reframing for TikTok/Reels/LinkedIn. |
| Custom music beds | **Suno** | Pro | $10 | Brand-specific scoring for hero films. Avoids generic stock-music feel. |
| **Stack total** | | | **~$413–583/mo** | Sits inside the Pro band ($200–800). |

**Notes:** Do **not** add Synthesia — overlaps HeyGen and is enterprise-priced. Do **not** add Sora — OpenAI is sunsetting it (web April 26 2026, API September 24 2026). Skip Kling unless you need 2-minute single takes.

---

## Production Workflow by Format

### 1. Brand films (60–90s hero, 1 per quarter)

1. **Script** — Reuse the existing `Editorial Strategist` + `Editor Guardian` agents to draft + polish the voiceover (no code change; just feed them a "brand film" prompt template).
2. **Storyboard / shot list** — 8–12 shots, each with a reference still in Paper & Ink palette (cream/ink/sage). Generate stills in Midjourney or Flux.
3. **Shots** — Runway Gen-4 with the reference stills for branded consistency; Veo 3.1 for the 2–3 cinematic hero shots that need native ambient audio (footsteps, room tone, etc.).
4. **VO** — ElevenLabs founder voice clone reading the script.
5. **Music** — Suno custom track (instruction: "warm acoustic, restrained, atelier feel, sage-green emotional palette").
6. **Assembly** — Descript timeline; export 16:9 master + 1:1 LinkedIn cut + 9:16 social cut.
7. **Destination** — Hero slot on `craefto.com` home, pitch decks, sales-call follow-up emails (Resend).

### 2. Service explainers & case study walkthroughs (60–180s, recurring)

1. Founder records screen + voice in **Descript** (live, no script needed — speak from a 5-bullet outline).
2. Descript transcribes → founder deletes filler words and rambling sections from the transcript (cuts apply automatically).
3. **HeyGen avatar IV** intro card (5s): "I'm \[Founder\], here's how we shipped X for Y."
4. Insert 2–3 **Runway** b-roll cuts where the screen recording would be visually flat (e.g. abstract sage-toned motion behind benefits list).
5. Captions via Descript or OpusClip.
6. **Destination** — `/services/<slug>` page (one per service), `/journal/<slug>` posts that announce a case study, and the project portal.

### 3. Social shorts — TikTok / Reels / LinkedIn (15–45s, 2–4/week)

1. Source: pipe each new long-form asset (brand films, explainers, founder talking heads) through **OpusClip Pro** → auto-extracts 5–10 hook-driven clips with captions, 9:16 reframed.
2. Operator picks 2–3 winners per source, tweaks hook copy.
3. Post directly from OpusClip's scheduler (or Buffer) to LinkedIn, TikTok, X, Instagram, YouTube Shorts.
4. **Cadence aligns 1:1 with the existing 2-articles/week content engine** — every article ships with at least one short.

### 4. Founder talking-head / thought leadership (1–2/week)

1. **Source script** = the TL;DR of each new journal article (already drafted by `Editor Guardian` agent — no extra writing).
2. **HeyGen Avatar IV** with founder's cloned face + ElevenLabs voice clone reads it.
3. Auto-translate into 2–3 priority languages (e.g. EN-AU, EN-US, ID for SEA market) — HeyGen preserves lip-sync.
4. Repurpose through OpusClip into 2–3 micro-clips per source.
5. **Destination** — embedded at top of each journal article, posted on LinkedIn/X with article link, fed into nurture sequences.

---

## Brand-Fit Guardrails (Paper & Ink in motion)

These prevent "generic AI gloss" — the #1 reason AI video reads as cheap:

- **Color**: lock a HeyGen brand kit + Runway style references using exact hex from the Paper & Ink system (cream `#F5F0E8`-ish, deep ink, sage). Reject any generation drifting to neon/teal/purple.
- **Texture**: prompt for paper grain, ink wash, hand-letterpress motifs, restrained motion. Avoid lens flares, particles, "epic" camera moves.
- **Pacing**: slow cuts (1.5–3s) for brand films, snappy cuts (0.4–0.8s) for social. Never the AI-default 1s metronome.
- **Voice direction**: ElevenLabs voice clone — set stability ~0.45, similarity ~0.75 ("conversational authority", not radio-DJ).
- **Music**: Suno prompts should specify "acoustic, atelier, restrained, no drop, no EDM". Lean folk/ambient.
- **Avatar**: HeyGen Avatar IV trained on at least 5 minutes of founder footage in good light, neutral background — re-record if the result has the "AI plastic" tell.
- **Captions**: minimal — single-line, sage-on-cream, sentence case (not the OpusClip default ALL CAPS YELLOW).

---

## Operating Model

- **Owner**: founder for week 1–4 (build the muscle), then hand to the Video Editor hire from the careers page once filled.
- **Cadence**: weekly Friday "video block" — 1 founder talking head + 1 service explainer or case study + auto-generated social shorts off both. Quarterly brand film.
- **Storage**: Google Drive folder structure mirrored to Supabase storage if/when the workflow is wired into `craefto-lab` later.
- **Approval**: founder reviews everything in week 1–2; after that, the Video Editor publishes social shorts directly and only escalates brand films + case studies.

---

## Cost Model

| Scenario | Stack monthly | Output volume |
|---|---|---|
| **Lean ramp (month 1)** | ~$280 (HeyGen Creator, Runway Standard, ElevenLabs Creator, Descript, OpusClip) | 1 brand film + 4 explainers + 8 shorts + 4 talking heads |
| **Steady state (month 2+)** | ~$430–580 | 1 brand film/quarter + 2 explainers/mo + 12–16 shorts/mo + 4–8 talking heads/mo |
| **Productized (10 clients)** | ~$1,200–1,800 (HeyGen Enterprise, Runway Pro multi-seat, ElevenLabs Scale) | Above + per-client brand kits, white-label exports |

---

## 4-Week Rollout

- **Week 1 — Foundation**
  - Subscribe to all tools (Pro tier).
  - Record 5 min of founder footage (good light, neutral wall) → train HeyGen Avatar IV.
  - Capture 30 min of founder voice → train ElevenLabs voice clone.
  - Build brand kits in HeyGen + Runway (Paper & Ink palette, logo, fonts).
  - Write 1-page Brand-Fit Guardrails SOP (lift from this doc).

- **Week 2 — Hero proof**
  - Produce the first **brand film** end-to-end (Veo + Runway + Suno + ElevenLabs + Descript). Ship to home page.
  - Produce **2 service explainers** (Descript-led, founder-recorded). Ship to `/services/*` pages.

- **Week 3 — Volume proof**
  - Run all week-2 outputs through OpusClip → publish 8–12 social shorts across LinkedIn / TikTok / X.
  - Produce 4 founder talking-head shorts off the most recent 4 journal articles.
  - Translate top performer into 2 languages via HeyGen.

- **Week 4 — Operationalize**
  - Set the Friday cadence calendar.
  - Define KPIs (below) and stand up a tracking doc.
  - Decide if/when to graduate the workflow into the existing agent pipeline as a 6th agent (subject of a separate plan).

---

## Verification (how to know it's working)

End-to-end checks before declaring success:

1. **Brand film on `craefto.com` home** — measure bounce rate before/after, target ≥10% reduction; video completion rate ≥40%.
2. **Service explainer pages** — time-on-page on `/services/*` up ≥30%; sales-call requests attributable to those pages tracked in Supabase.
3. **Social shorts** — week-on-week follower growth on LinkedIn (primary) and TikTok (secondary); CTR from social to journal articles tracked via UTM.
4. **Talking-head + journal pairing** — A/B test articles with vs. without embedded talking-head video using the existing A/B testing system in the admin panel; target ≥15% lift in time-on-page or scroll depth.
5. **Production-cycle time** — by end of week 4, target: brand film ≤ 3 working days, service explainer ≤ 4 hours, social short ≤ 30 minutes, talking head ≤ 1 hour. Track in this doc.
6. **Brand consistency audit** — at end of week 4, founder reviews all outputs and flags any that read as "AI-generic". If >20%, tighten guardrails before scaling.

---

## Productization Path (when ready)

Once the internal pipeline is humming, the same stack productizes for clients with three additions:

- **Client intake form** (Tally/Typeform → Supabase) → brief → assigned brand kit slot in HeyGen/Runway.
- **White-label exports** (HeyGen + Descript both support custom branding).
- **A 6th agent in the existing pipeline** ("Video Producer" agent next to Editorial Writer / Topic Scout) that turns a journal article or brief into a Runway/HeyGen API call. This is the moment to wire the SaaS stack into `craefto-lab` properly — and would be the subject of a separate plan.

---

## Out of Scope (intentionally)

- Any code changes in `craefto-lab`.
- Building a custom video studio UI under `/lab` or `/admin`.
- Integration with the existing 5-stage agent pipeline.
- Synthesia, Sora, Kling (rejected — see Stack notes).
- Self-hosting open-source models (Mochi, LTX-Video, etc.) — not worth the ops cost at this volume.
