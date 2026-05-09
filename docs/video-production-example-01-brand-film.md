# CRAEFTO — First Production Example: 75-Second Brand Film, Fully Prompted

> Tactical companion to `video-production-runbook.md`. This document walks through the very first piece of CRAEFTO marketing video end-to-end with every prompt, every voice line, every camera direction, and every export setting. Follow it top-to-bottom on a single working day to produce the home-page hero film.

---

## Part 1 — What world-class brands are actually doing with AI video (May 2026)

Brief survey of the benchmarks worth copying:

| Brand / Agency | What they did | Lesson for CRAEFTO |
|---|---|---|
| **Coca-Cola** | Re-released the 1995 "Holidays Are Coming" ad fully AI-generated, run through three studios (LA, SF, KL) staffed by "creative technologists" trained on both gen-AI tools and storytelling. Beat their own and competitor Christmas benchmarks. | Pair gen-AI with **directing discipline**. Creative technologists > prompt engineers. |
| **Mango (Sunset Dream)** | Photographed the real garments first, then trained a generative model on those photos to produce editorial-quality campaign images across 95 markets. | **Reference-driven generation** beats text-only. Always anchor in real photography of the subject. |
| **Toys "R" Us** | 66-second Geoffrey-the-Giraffe origin film entirely from text prompts (Sora at the time). Cinematic on a lean budget. | A **single hero film** is the proof artefact for the whole pipeline. |
| **Heinz** | DALL·E 2 ketchup imagery → 850M impressions, higher engagement than past campaigns. | AI video earns reach **because** the AI-ness is part of the talkable hook — but only if it's on-brand. |
| **Nike (Serena 1999 vs 2017)** | Recreated a virtual match between two eras of the same athlete using AI motion analysis. | **Specific, narratively-charged premise** beats generic "look what AI can do". |
| **FIS × Marketbridge (2026)** | Three-part cinematic ABM video series mixing live action, immersive sound, stylized animation, AI-assisted design. | Hybrid wins. **AI for impossible shots, human craft for everything that touches feeling.** |

The pattern: world-class AI video is **director-led, reference-anchored, narratively specific, and hybrid**. CRAEFTO's brand film below uses all four principles.

---

## Part 2 — Trending formats that actually fit CRAEFTO

The 2026 dominant formats are: tier-ranking, UGC-style AI avatars, faceless storytelling, POV recreations, AI celebrity interviews, fake Netflix trailers, dash-cam moments, high-dopamine edits. Not all of those fit a B2B creative-tech studio. The five that **do** fit:

1. **Cinematic origin / brand anthem** (this doc — for hero film).
2. **UGC-style founder talking head** via HeyGen Avatar IV (weekly journal pairing).
3. **Faceless POV storytelling** — first-person hands at keyboard / wireframe / shipped product (excellent for case studies).
4. **Process tier-rank** — "ranking the 10 SaaS landing pages we audited this month, S to F" (high CTR, fits security-audit positioning).
5. **AI vubbing** (visual dubbing) — translate top-performing journal videos into ID/ES/JP for SEA/global reach. HeyGen handles this natively.

The four 2026 hook archetypes that win the first 3 seconds (and 63% of high-CTR videos rely on these):

- **Pattern interrupt + curiosity gap**: visually unexpected opener + an unanswered question.
- **Pain-point declaration**: name the audience's problem in the first 1.5s.
- **Receipts hook**: open on a numeric proof point ("$2.3M of pipeline this changed…").
- **Insider POV**: "Inside the studio that ships software like a brand."

Our brand film uses **insider POV + pattern interrupt** — opens on a letterpress, immediately cuts to code on the same press's paper, breaking the "design vs. engineering" frame in the first 4 seconds.

---

## Part 3 — The two prompt grammars you need to learn

### Veo 3.1 — Google's official 5-part formula

```
[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]
```

- **Cinematography** — shot type, camera move, lens. *e.g. "Slow dolly-in, 35mm, shallow depth of field"*
- **Subject** — the focal element, described concretely.
- **Action** — what happens, with physics ("hands gently lift the metal type").
- **Context** — environment, props, time of day.
- **Style & ambiance** — mood, color, grain, era, lighting source.

Length: **3–6 sentences, 100–150 words** per shot is the sweet spot.

**Audio syntax (Veo 3.1's killer feature — synced audio in the same pass):**
- Dialogue: `A woman says, "We have to leave now."` — quotation marks are mandatory.
- SFX: `SFX: thunder cracks in the distance` — prefix `SFX:` literally.
- Ambience: `Ambient noise: the quiet hum of a starship bridge.`

**Negative prompts:** describe what should be absent positively. Say "a desolate landscape with no buildings" not "no buildings".

**Multi-shot sequences with timestamps** (Veo respects these):
```
[00:00–00:02] Medium shot of …
[00:02–00:04] Reverse shot of …
```

### Runway Gen-4 — reference-driven, not text-driven

- Upload 1–6 reference images. Tag them in the prompt as `image_1`, `image_2`, …
- **Don't write conversational prose** — Runway penalises it. Write declarative visual detail.
- One reference image carries character/brand consistency across an entire campaign (40% better fidelity than Gen-3).

**Reference example:**
```
Using image_1 (the founder), image_2 (the studio environment), and image_3
(the Paper & Ink color palette), create a slow tracking shot of the founder
walking through the studio, hand brushing a paper sample on the wall,
4-second clip, soft window light from the left.
```

**Use Runway when:** you need the same character/space across many shots, or you need to ground a generation in a specific real photo. **Use Veo 3.1 when:** you need synced audio, cinematic motion, or shots that nothing in your reference library covers.

---

## Part 4 — The first deliverable: 75-second brand film, fully prompted

### 4.1 Concept

**Title:** *The Craft of Code*

**Logline:** A 75-second hero film positioning CRAEFTO as the studio where letterpress-grade craft meets shipped software — not a metaphor, a working method.

**Premise structure:** Open on letterpress (craft). Cut to code typed onto the same paper (engineering). Code resolves into UI, UI ships, ships becomes a real customer using the product. End on the studio mark.

**Why this works:** It's an **insider POV + pattern interrupt** in the first 4 seconds (letterpress → code on the same medium is the visual surprise). It's reference-anchored to the Paper & Ink design system. It earns the brand promise of *"we ship software like a brand ships a campaign"* without saying it as a tagline.

### 4.2 Voiceover script (founder, 75s, ElevenLabs voice clone)

Total: ~135 words at conversational 110wpm = ~73 seconds. Leave 2s of musical landing at the end.

```
[00:03] Most studios pick a side.
[00:07] They're either a design studio… or a dev shop.
[00:12] We never bought that.
[00:16] Because the brief is always the same:
[00:19] ship something the world wants to use.
[00:24] So we set the type, and we wrote the code.
[00:30] On the same paper.
[00:34] Forty thousand lines under a wordmark you'd actually want on a t-shirt.
[00:42] Security review on the same Friday as the launch trailer.
[00:48] One studio, one craft, one ship date.
[01:00] CRAEFTO.
[01:05] Where craft means it works.
```

### 4.3 Shot list — 12 shots, 75 seconds

| # | Time | Tool | Aspect | Purpose |
|---|---|---|---|---|
| 01 | 00:00–00:04 | Veo 3.1 | 16:9 | Hook: hands at letterpress |
| 02 | 00:04–00:08 | Veo 3.1 | 16:9 | Pattern interrupt: code on same paper |
| 03 | 00:08–00:13 | Runway Gen-4 | 16:9 | Code → UI dissolve |
| 04 | 00:13–00:18 | Runway Gen-4 | 16:9 | Studio wide — sage walls, Paper & Ink |
| 05 | 00:18–00:24 | Veo 3.1 | 16:9 | Founder at desk, on phone with client |
| 06 | 00:24–00:30 | Runway Gen-4 | 16:9 | Designer + engineer sharing a screen |
| 07 | 00:30–00:36 | Veo 3.1 | 16:9 | Wordmark debossing onto cream paper |
| 08 | 00:36–00:44 | Runway Gen-4 | 16:9 | Code editor screen, lines flying past |
| 09 | 00:44–00:50 | Veo 3.1 | 16:9 | Security audit checklist + green ticks |
| 10 | 00:50–01:00 | Runway Gen-4 | 16:9 | Real user using the shipped product |
| 11 | 01:00–01:08 | Veo 3.1 | 16:9 | Studio wordmark reveal on cream paper |
| 12 | 01:08–01:15 | Static (Descript) | 16:9 | URL + CTA card |

### 4.4 Per-shot prompts — copy/paste ready

> **Brand variables to substitute everywhere**
> `<CREAM>` = `#F4EEDD` (warm paper)
> `<INK>` = `#1B1A17` (deep ink)
> `<SAGE>` = `#8C9E83`
> `<FOUNDER_REF>` = your trained founder reference image (`image_1` in Runway)
> `<STUDIO_REF>` = wide photo of your studio space (`image_2`)
> `<PALETTE_REF>` = a flat 3-swatch image of the three colors above (`image_3`)
> `<WORDMARK_REF>` = a high-res transparent PNG of the CRAEFTO wordmark (`image_4`)

#### Shot 01 — Hands at letterpress *(Veo 3.1)*

```
Slow dolly-in, 50mm lens, shallow depth of field. A craftsman's hands,
warm light tan skin, gently lift a single piece of metal type from a
wooden compositor's tray and place it into a forme. The studio is dim,
lit by a single warm window from camera-left at 4 PM, dust motes
visible in the beam. Cream paper (#F4EEDD), brass type, deep ink-black
shadows, sage-green felt lining the tray. Photorealistic, 35mm film
grain, restrained warmth, atelier mood.
SFX: a soft metallic click as the type seats; faint distant traffic;
ambient noise of an empty workshop at late afternoon.
Negative: no neon, no shiny chrome, no lens flare, no people's faces.
```

#### Shot 02 — Code on the same paper *(Veo 3.1)*

```
Continuation of the previous scene, same lighting and lens. Macro
close-up. The same letterpress press now slowly stamps a sheet of
cream paper (#F4EEDD), but the impression that lands is not a logo —
it is three lines of monospaced code in deep ink black: the JSX of a
React component. The press lifts, paper rests, ink glistens for a
half-second before settling matte. Camera holds, then a 2-degree push
on the page.
SFX: the heavy mechanical thunk of the press; the slow exhale of a
spring; a single soft typewriter-like tick at the moment the press
lands.
Style: 35mm film grain, warm cream / deep ink, sage felt visible at
the edge of frame.
Negative: no glowing screens, no holograms, no digital effects.
```

#### Shot 03 — Code dissolves into UI *(Runway Gen-4, image references)*

```
Using image_3 (Paper & Ink palette: cream #F4EEDD, ink #1B1A17, sage
#8C9E83) and image_4 (CRAEFTO wordmark) as the only color and brand
reference. Macro shot of the same printed page from the previous beat.
The printed code lines slowly dissolve into a clean dashboard UI in
the same color palette — a real-looking SaaS analytics interface,
typeset in a serif/sans pairing, no fake-looking Latin placeholder
text. The page texture remains visible underneath the UI, as if the
interface were printed onto paper. 4 seconds, no camera move, slow
crossfade transition.
Negative: no glow, no neon, no animated cursors, no generic dashboard
purple/blue.
```

#### Shot 04 — Studio wide *(Runway Gen-4)*

```
Using image_2 (the CRAEFTO studio reference) and image_3 (Paper & Ink
palette). Wide static shot of the studio interior at late afternoon:
sage-green wall on the left, cream paper samples pinned in a 3x3 grid,
two long oak desks, soft north-facing window light, no overhead
fluorescents. Two figures faintly visible in deep background, out of
focus, working. 5-second hold, no camera move. Photorealistic, 35mm
film stock, warm grain, archival mood.
Negative: no studio cliches (no neon signs, no exposed Edison bulbs,
no plant walls), no people in sharp focus.
```

#### Shot 05 — Founder on call *(Veo 3.1, with founder dialogue)*

```
Medium close-up, 35mm, eye-level, very shallow depth of field. The
founder (mid-30s, see image_1) sits at a cream-paper-covered desk in
the same sage-walled studio, headset on, looking down at a sketch.
He's mid-conversation, calm, leaning slightly forward. Soft window
light from the left. The founder says quietly, "Then we ship it
Friday. Whole thing — brand, build, audit." Naturalistic delivery, no
sales-y inflection.
Ambient noise: faint mechanical keyboard tap from a colleague off-
screen, a kettle just clicking off in the distance.
Style: photorealistic, 35mm grain, warm cream, restrained.
Negative: no exaggerated facial expressions, no fast cuts, no music
swell yet.
```

> **Note:** Veo 3.1's voice may not match your founder. Better path: generate the visual *without* dialogue, then dub the voice using ElevenLabs (clone) over the Descript timeline. Prompt becomes: *"…leans slightly forward, lips moving as he speaks, no audio dialogue, only ambient room tone and faint keyboard."*

#### Shot 06 — Designer + engineer collaborating *(Runway Gen-4)*

```
Using image_2 (studio) and image_3 (palette). Over-the-shoulder shot,
two people sharing a single laptop screen at the long oak desk. The
laptop displays a Figma frame on the left half and a code editor on
the right half — both visibly in the cream/ink/sage palette. One
person points at the design, the other scrolls the code. Faces are
not the focal point and are softly out of frame on top edge. 6
seconds, very slow 1-degree dolly-in.
Negative: no stock-photo smiles, no high-fives, no laughter cliches,
no purple/blue UI.
```

#### Shot 07 — Wordmark deboss *(Veo 3.1)*

```
Extreme macro, 100mm lens, shallow depth of field. A heavy brass die
descends slowly onto a sheet of thick cream cotton paper (#F4EEDD)
and debosses the CRAEFTO wordmark into it (use image_4 as reference
for the letterforms). Deep ink-black shadows in the indented letters,
no foil, no color — just paper and pressure. The die lifts.
SFX: a single, satisfying low-frequency thunk; the soft exhale of the
press releasing.
Style: 35mm film grain, near-silent, atelier reverence, warm
restrained light.
Negative: no metallic sparkle, no rainbow foil, no glow.
```

#### Shot 08 — Code editor in motion *(Runway Gen-4)*

```
Using image_3 (Paper & Ink palette) as the only color reference.
Tight over-the-shoulder of a code editor on a 14" laptop. Lines of
TypeScript scroll slowly upward — readable for 1.5 seconds, then a
soft motion blur as they accelerate, then resolve to a single line:
`export const CRAEFTO = 'craft';`. The editor chrome is in the cream
+ ink + sage palette. 8 seconds. Camera does not move; only the code
moves.
Negative: no green-on-black hacker aesthetic, no terminal, no
animated cursors flying, no purple syntax highlighting.
```

#### Shot 09 — Security audit ticks *(Veo 3.1)*

```
Top-down macro shot of a printed cream paper checklist titled
"PRE-LAUNCH AUDIT", typeset in a serif. A real human hand holding a
sage-green felt-tip pen ticks five items in sequence, each tick
crisp and decisive. The items read: "OWASP top-10 verified",
"Auth flow signed off", "PII pathway clean", "Bundle audit",
"Brand QA". 6 seconds.
SFX: five distinct soft pen-on-paper ticks, exactly timed; faint room
tone underneath.
Style: 35mm grain, warm cream, restrained.
Negative: no glowing checkmarks, no animation, no UI mockup — this is
real paper.
```

#### Shot 10 — Real user with the product *(Runway Gen-4)*

```
Using image_3 (Paper & Ink palette, only as a soft accent — the user
is in a real environment, not the studio). Medium shot of a young
professional (early 30s, neutral wardrobe) in a daylit kitchen,
laptop open on the counter, scrolling through the dashboard from
shot 03. They smile — small, real, not stock-photo. They scroll, see
something, lean in. 10 seconds, very slow 2-degree push-in.
Negative: no fake laughter, no high-fives, no over-styling, no thumbs-
up to camera.
```

#### Shot 11 — CRAEFTO wordmark on cream *(Veo 3.1)*

```
Static centered shot, 50mm. The CRAEFTO wordmark (use image_4 as
reference) appears slowly debossed into a single sheet of cream cotton
paper (#F4EEDD), held against a softly lit sage-green wall. No
animation other than a 1-degree breathing motion as if the paper is
gently held. Hold for 8 seconds.
SFX: ambient room tone, the very faint distant sound of a press
mechanism returning to rest.
Style: 35mm grain, atelier silence, deep ink shadow inside each
letter.
```

#### Shot 12 — End card *(Static, Descript)*

A held still over the previous shot, layered in Descript:
- Top line, in deep ink, sentence case: *Craft means it works.*
- Bottom line, in sage: `craefto.com`
- Hold 7 seconds, then fade to cream.

### 4.5 Music — Suno prompt

```
Style: minimal acoustic atelier score. Single nylon-string guitar
arpeggio in Em7 → Cmaj7 → G → Dsus4. Sparse upright piano joins at
0:30. Soft brushed snare enters at 0:50. No drop, no EDM, no
synthetic strings, no swells over +3dB. Texture: warm, restrained,
folk-ambient, slightly tape-saturated. Length: 1:18. Final 4 seconds:
all instruments soften, leaving only the nylon guitar resolving on a
sustained Em7. Mood: quiet confidence, craftsperson at work.
Lyrics: instrumental, no vocals.
```

Generate 4 variants in Suno Pro. Pick the one whose chord changes
align with the cuts at 0:08, 0:24, 0:50, 1:00.

### 4.6 Voiceover — ElevenLabs settings

- **Voice**: founder voice clone (Instant Voice Clone, trained on 30+ minutes of clean speech).
- **Model**: Eleven Multilingual v3 (best for nuanced English-AU).
- **Stability**: 0.42 (allows natural inflection).
- **Similarity**: 0.78 (preserves founder timbre).
- **Style exaggeration**: 0.15 (low — we want conversational, not performance).
- **Speaker boost**: on.
- Render each line as a separate clip for easy timing in Descript.

### 4.7 Captions — Descript / OpusClip settings

- **Style**: single line, sentence case (NOT all caps).
- **Color**: deep ink `#1B1A17` text on a 60%-opacity cream `#F4EEDD` rounded pill.
- **Position**: bottom 22% of the frame, centered.
- **Font**: the same sans you use on craefto.com.
- **Highlight color** (active word): sage `#8C9E83`.
- **Reject** OpusClip's defaults: yellow caps, animated word-pop, emoji insertion.

---

## Part 5 — Step-by-step execution (one working day)

### Hour 0 — Pre-flight (30 min)

1. Subscribe / confirm logins for: HeyGen Team, Runway Pro, Google AI Studio (Veo 3.1 access via Gemini API), ElevenLabs Creator+, Descript Pro, OpusClip Pro, Suno Pro.
2. Prepare the four reference images:
   - `image_1` — founder portrait, neutral background, soft daylight, 1024×1024.
   - `image_2` — wide photo of your actual studio (or a curated dribbble pin in your aesthetic), 1920×1080.
   - `image_3` — flat 3-swatch image with the exact hex values labelled.
   - `image_4` — CRAEFTO wordmark, transparent PNG, 2048px wide.
3. Confirm the founder voice clone in ElevenLabs is trained and tested with the script lines above.

### Hour 1 — Generate Veo 3.1 shots (60 min)

For each Veo shot (01, 02, 05, 07, 09, 11):
1. Open Google AI Studio → Veo 3.1.
2. Paste the prompt verbatim from §4.4.
3. Set: 4K, 16:9, 24fps, duration matches the shot list.
4. Generate **3 variants** per shot (Veo 3.1 has high variance; selecting from 3 is the established practice).
5. Download the best of three. Name files `shot-01_v1.mp4`, etc.
6. **If a shot fails twice** (wrong style, AI gloss, dialogue mismatch): tighten the negative prompt and re-run. Do not "prompt engineer harder" — restructure the 5-part formula.

### Hour 2 — Generate Runway Gen-4 shots (60 min)

For each Runway shot (03, 04, 06, 08, 10):
1. Open Runway → Gen-4 References.
2. Upload all four reference images, label them `image_1` through `image_4`.
3. Paste the prompt verbatim from §4.4.
4. Set: 4K, 16:9, duration per shot list.
5. Generate **2 variants** per shot.
6. Download best of two.

### Hour 3 — Voice + Music (45 min)

1. **ElevenLabs**: paste each voiceover line from §4.2 into the cloned voice with the §4.6 settings. Render each line as its own MP3.
2. **Suno**: paste the prompt from §4.5. Generate 4 variants. Pick the one whose chord transitions feel native to your cut points. Download as WAV.

### Hour 4 — Assemble in Descript (90 min)

1. New Descript project, 1920×1080, 24fps.
2. Drag all 11 video shots in order, snap to the timestamps in §4.3.
3. Import voiceover clips, place each on the timestamp from the script in §4.2.
4. Import the Suno track, lay under the entire timeline at -18 LUFS bed, ducking under voiceover by -6dB automatically.
5. Use Descript's transcript editor to nudge any phrase that runs long.
6. Add the §4.7 captions (Descript → "Add captions" → restyle to spec).
7. Add Shot 12 end card as a frame composition (Descript → Composition → text layers).
8. Render: 4K H.264 master, 16:9. Save as `craefto-brand-film-v1.mp4`.

### Hour 5 — Repurpose with OpusClip (30 min)

1. Upload the 4K master to OpusClip Pro.
2. Run "AI Highlights" — it will auto-extract 6–10 short clips with hooks.
3. Generate **two manual cuts** of your own:
   - **9:16 LinkedIn cut**: 28 seconds, opens on shot 02 (the pattern interrupt), ends on shot 11 + end card.
   - **1:1 X / IG cut**: 45 seconds, full arc compressed.
4. Apply the §4.7 caption style across all cuts. Re-style if OpusClip ignores your brand kit (it sometimes does on first try — re-apply).
5. Export all cuts at 4K H.264.

### Hour 6 — Ship (30 min)

1. **Home page**: replace the current hero with the 16:9 master. Use a poster frame from shot 11 (wordmark on cream).
2. **LinkedIn**: post the 28-second 9:16 cut. Caption opens with: *"Most studios pick a side. We never bought that."*
3. **X**: post the 45-second 1:1 cut. Same opening line.
4. **Sales follow-up email** (Resend): embed a thumbnail-with-play-button link to the 4K master, hosted on Vercel.
5. **Pitch deck**: drop the 16:9 master into slide 1.
6. **Project portal**: place under "About CRAEFTO".

---

## Part 6 — Quality gates before publishing (15-min audit)

Reject and re-shoot any shot that fails ANY of these:

- [ ] **AI-gloss test** — does any shot have the plastic AI look (over-smooth skin, perfectly symmetrical face, glassy reflections)? If yes, re-generate with more film-grain language.
- [ ] **Palette drift** — does any shot drift to teal/purple/orange? If yes, tighten negative prompts.
- [ ] **Cut rhythm** — are brand-film cuts ≥1.5s? Snappier cuts read as social, not brand.
- [ ] **Audio sync** — is every voiceover line locked to its visual beat? Drift >120ms is noticeable.
- [ ] **Caption legibility** — captions readable at 320px wide (mobile feed)?
- [ ] **Brand-mark accuracy** — does the wordmark in shots 07 and 11 actually spell CRAEFTO correctly? (AI commonly misspells brand marks; this is mandatory to verify.)
- [ ] **Faces** — if any face appears, is it on-brand? No stock-photo smiles, no AI-uncanny eyes.
- [ ] **CTA on end card** — does `craefto.com` resolve in a browser test?
- [ ] **No watermarks** — Runway and Veo can stamp watermarks on free tier; verify Pro export.
- [ ] **Sound check** — listen on phone speakers AND headphones. Voiceover at -16 LUFS, music bed at -22 LUFS.

If 8 / 10 pass, ship. If <8, identify the failed gate and re-run only the affected shot.

---

## Part 7 — KPI tracking (set up day-of)

In your existing admin panel / Supabase, log these for the brand film:

| Metric | Target by D+30 | Where measured |
|---|---|---|
| Home-page bounce rate | -10% vs. control | GA4 / your analytics |
| Hero video completion | ≥40% | Vercel video analytics |
| LinkedIn 9:16 view-through | ≥35% (above LinkedIn benchmark) | LinkedIn native |
| Sales-call requests cited "saw the film" | ≥3 in first 30 days | Manual tag in HubSpot / Linear |
| Cost-per-second of finished video | ≤$8 | Total tool cost ÷ 75s |

If hero completion <30% by D+14: the opener is wrong, re-shoot shot 01–02.
If LinkedIn view-through <20%: the 9:16 cut isn't hooking — re-edit the first 1.5s.

---

## Part 8 — What to do next (after shipping the brand film)

Once this is live, the natural next three productions in priority order:

1. **Service explainer #1** — your highest-margin service, recorded by founder in Descript, ~3 hours. Ship to `/services/<top-service>`. Use this doc's caption + brand-fit specs.
2. **First founder talking-head** — pick the best journal article from the last month, generate via HeyGen Avatar IV + ElevenLabs voice. Embed at top of that article. Measure scroll-depth lift in your A/B testing system.
3. **First batch of 6 social shorts** — run the brand film, the explainer, and the talking head through OpusClip Pro. Schedule M/W/F for two weeks.

By the end of week 2 you'll have shipped one of every format and earned the data to decide what to scale.

---

## Appendix — Prompt library you'll reuse

These are the modular prompt fragments to keep in a Notion/Linear "Prompt Library". Reuse across all future CRAEFTO videos.

**The CRAEFTO style stem (paste into every Veo / Runway prompt):**
```
Photorealistic, 35mm film grain, restrained warmth. Color palette
limited to cream #F4EEDD, deep ink #1B1A17, sage green #8C9E83.
Lighting: motivated by single warm window source, no overhead
fluorescents. Atelier mood, quiet confidence, no AI gloss.
Negative: no neon, no chrome, no lens flare, no purple/teal/orange,
no glowing UI, no stock-photo smiles, no fake laughter.
```

**The CRAEFTO sound stem (paste into every Veo prompt with audio):**
```
Ambient noise: empty workshop room tone, faint distant traffic,
occasional soft mechanical keyboard tap. No music in-frame; music
will be added in post.
```

**The CRAEFTO motion stem (for brand films):**
```
Camera moves are restrained: ≤2-degree dollies, no whip-pans, no
crane reveals. Cuts are slow (1.5–3 seconds). Subjects move at
real-world speed; no slow-motion unless explicitly noted.
```

Lock these into your `craefto-lab/docs/` as `video-prompt-library.md` once they survive 3 productions unchanged.
