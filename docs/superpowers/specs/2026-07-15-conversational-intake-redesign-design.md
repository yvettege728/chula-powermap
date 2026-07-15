# Design: Chula Powermap — conversational intake redesign (v2)

**Date:** 2026-07-15
**Project:** `chula-powermap` (Harvard GSD — public archive documenting displacement around Chulalongkorn University, Bangkok, centered on the Chao Mae Thapthim / Mazu shrine lawsuit)
**Status:** Design — approved section by section in brainstorming; pending final spec review before writing an implementation plan.
**Supersedes the conversation portion of:** `docs/superpowers/specs/2026-07-09-ai-interview-intake-design.md` (that version: 3 fixed questions + max 1 AI follow-up).

---

## 1. Why redesign

The shipped intake asks the same 3 fixed questions regardless of what the contributor says, allows only one AI follow-up, and chases facts more than stories. The goal of v2 is a conversation that **adapts to the contributor, is bounded and predictable, draws out feeling and story — not just facts — and still produces a clean, taggable archive record**, all without the AI contaminating the contributor's memory with facts it supplies.

Framing used throughout (established with Yvette): **prompt engineering** = what we say to the model (persona, craft); **harness engineering** = the machinery around it each turn (state tracked, context injected, stop logic). v2's leverage is mostly in the harness.

## 2. Decisions locked

| # | Decision | Choice |
|---|----------|--------|
| D1 | Conversation length | **Turn cap**, AI free to move within it. Not pure-AI-decides, not user-clicks-done. |
| D2 | AI's case knowledge | **Glossary only** (site codes S01–S10). No timeline, figures, or names. Lowest contamination risk. |
| D3 | Conversation architecture | **Adaptive loop with a coverage checklist** — no fixed questions; harness tracks must-cover items + turn budget; AI phrases every question itself. |
| D4 | Voice recording | **Voice as record + transcript** — store the audio as the primary artifact AND transcribe it (Workers AI Whisper) to drive the conversation and searchable text. |
| D5 | Persona | **Community café host**, warm and casual — not an institutional "museum volunteer." Honestly disclosed as an AI; never claims its own memories of the neighborhood. |
| D6 | Character identity | A **light first name** — **Jake**. |
| D7 | Visual assets | Generated with **Recraft**, one style-locked character across intro, avatar, and background. |

## 3. Architecture overview

```
Contributor (types OR speaks)
        │  (speech → /api/voice → R2 store + Whisper transcript)
        ▼
interview-state.js  ── client-side session state {transcript, coverage, turn}
        │  each turn POSTs state
        ▼
/api/followup (Worker) ── system prompt + glossary + coverage snapshot + turns-left + transcript
        │  returns { reply, coverage_update }
        ▼
harness merges coverage, increments turn, evaluates STOP
        │  not stopped → render reply, wait
        │  stopped (coverage met OR turn cap)
        ▼
/api/synthesize ── transcript + coverage → structured draft (place tag, relationship, event, story)
        ▼
Contributor reviews & edits draft  (narrator-approves-own-words)
        ▼
/api/submit ── Airtable: structured fields + full transcript + linked R2 audio + language + consent
```

The AI only ever sees **text**. Whether the contributor typed or spoke, the loop is identical — audio is transcribed upstream and never reaches the model.

## 4. State model & turn loop (Section 1)

State lives client-side in `interview-state.js`, session-scoped, nothing persisted server-side until final submit. Sent to the Worker each turn.

**`coverage`** — checklist, each item `open` / `touched` / `covered`:
- `place` — which site (S01–S10). **The only hard-required item** — without it the record can't be filed.
- `relationship` — the contributor's connection to the place.
- `event` — what happened / what they witnessed.
- `feeling` — the emotional texture and story. *Pursued but never required* — forcing emotion is its own bias.

**`transcript`** — ordered contributor + AI turns. Each contributor turn may carry `audioRef` (R2 key) and `source: typed | spoken`.

**`turn`** — counter against the cap (default **7** contributor turns; tunable).

**Stop condition:** `coverage.place === 'covered' AND ≥2 of {relationship, event, feeling} covered`, **OR** `turn === cap`. The **model updates the checklist; the harness owns the stop decision** — this is what makes D1 (turn cap, AI moves freely within it) real.

## 5. The AI's turn — harness + prompt (Section 2)

Each turn `/api/followup` assembles context in fixed order: (1) system prompt, (2) glossary S01–S10 (only external knowledge), (3) coverage snapshot ("still open: feeling, event"), (4) turns remaining, (5) transcript. Returns `{ reply, coverage_update }`.

- **Prompt engineering — the craft.** Café-host persona + oral-history reflective listening: reflect back what was said, one open question at a time, invite elaboration. Hard rule: **never introduce a fact, date, name, or number the contributor didn't say.** Never claim personal memory of the area.
- **Harness engineering — the control.** Coverage snapshot and turns-remaining are computed by code and injected fresh; the AI reads them, doesn't own them.

Draft system prompts in Appendix B.

## 6. Voice pipeline (Section 3)

1. **Consent gate** — mic inert until one-time opt-in ("your voice is kept as part of your story; you can review or delete it before submitting"). Consent flag stored for the session.
2. **Record** — browser `MediaRecorder`; live state drives the "listening" avatar, timer, waveform. Per-turn cap ~2–3 min with a gentle nudge.
3. **Review before send** — clip stays client-side; replay / re-record / delete before anything uploads.
4. **Upload + store** — blob → `/api/voice` → **Cloudflare R2** under session id → returns audio reference.
5. **Transcribe** — Worker runs **Workers AI Whisper** (`@cf/openai/whisper`) in the chosen language → transcript.
6. **Feed the loop** — transcript becomes that turn's contributor text; enters the Section 4/5 loop unchanged.
7. **Archive linkage** — at submit, Airtable record carries synthesized text + linked R2 clip(s).

**Load-bearing principle:** *audio is canonical, transcript is a correctable convenience.* Whisper will fumble Thai names and code-switching; the contributor can edit the transcript, and the real voice is preserved as source of truth — which also defuses transcription error as an integrity risk.

**Graceful failure:** mic denied → fall back to typing; transcription fails → keep the audio, let them type a correction so a recording is never lost.

## 7. Synthesis, submission, errors, testing (Section 4)

- **Synthesis** — `/api/synthesize` turns transcript + coverage into a structured draft: place tag, relationship, event summary, story in the contributor's own words. Same no-invention guardrail.
- **Review gate** — draft shown for edit/confirm before submit (narrator approves own words). Any field editable.
- **Missing `place`** — if turn cap hit before it was tagged, synthesis flags it and the review screen asks the contributor to pick from S01–S10. The AI never guesses it.
- **Submit** — `/api/submit` writes Airtable: structured fields + full transcript + linked audio + language + consent + timestamp.
- **Errors** — client-side state means transcripts are never lost on API failure; the Anthropic-credit case surfaces as a clear user message, not a silent 502 (root cause of last session's bug); keep the `console.error` debug logging on API paths.
- **i18n** — all UI strings + scaffolding in EN / 中 / ไทย; transcription follows selected language.
- **Testing** — `interview-state.js` is pure → unit tests for coverage transitions, stop logic, turn cap. Manual matrix: typed / spoken / mixed, mic-denied fallback, transcription-fail fallback, turn-cap-early (missing place), all three languages. Verify on the **deployed URL, not file://**; confirm Anthropic credit, R2 binding, Whisper binding. Run `superpowers:verification-before-completion` before claiming done.

## 8. Character & visual system

- **Persona (D5):** a community café host — the person behind the counter who has time to listen. Warm, casual, curious. Lowers the power gap that makes people give tidy facts instead of stories; thematically apt since a neighborhood café is the kind of place this archive mourns.
- **Honesty (D5):** disclosed as an AI, gracefully, inside the intro — and, critically, **also as plain text** so screen-reader users are told too. Never claims lived memory of Sam Yan.
- **~12-second POV "walk-in" intro (the bot's own entry animation, not the whole page):** a first-person vignette in **5 short beats (~2–2.5s each).** **Beat 1 — walk in:** from the street to the doorway of a small corner café (café only; the shrine and the case context now live on the wall, not the exterior). **Beat 2 — order:** at the counter you place an order and first meet Jake, the barista. **Beat 3 — the wall:** while you wait, the view drifts along a wall of framed photos — old street scenes, the Mazu shrine and its rituals, neighborhood faces — so background is delivered *environmentally, seen not narrated.* **Beat 4 — the coffee:** Jake sets a warm cup in front of you. **Beat 5 — start chatting:** Jake leans in, says who he is — an AI that helps this archive gather stories, not a real barista — and invites "tell me about a place that matters to you," flowing into the chat. Skippable, replays only once (localStorage), reduced-motion + plain-text fallback (the wall's context + Jake's AI disclosure must also exist as text for screen readers).
- **Fixed intro context ≠ AI knowledge.** The wall/background is the project's editorial voice, identical for everyone, so it carries no interviewer-bias risk — distinct from D2 (the AI itself stays glossary-only). Keep the wall **evocative, not hyper-specific** (no explicit years, sums, or names on display), so it orients without priming the contributor's memory.
- **Avatar:** the same character reused as the chat avatar, with four states the UI switches between — idle, listening (mic on), thinking (API call), speaking.
- **Chat background:** low-contrast warm café texture behind the thread; must stay readable and have a dark-mode-safe variant.
- **Deploy:** assets ship as static files — keep `.assetsignore` in sync (per last session's Pages→Workers gotcha).

## 9. Open editorial questions (Yvette's calls, marked open)

- **O1 — Audio retention policy:** resolved — **keep indefinitely, delete on the contributor's request** (consistent with the site's existing "withdraw anytime" promise). Consent copy reflects this; a withdrawal path is a manual/volunteer action, not automated in Phase B.
- **O2 — Clip granularity:** resolved — **one clip per spoken turn**, each aligned to its transcript turn.
- **O3 — Character name:** resolved — **Jake**.

## 10. File / impact map

| File | Change |
|------|--------|
| `interview-state.js` | Replace fixed-question machine with coverage-checklist + turn-loop state. |
| `interview.js` | Chat UI: adaptive turns, voice controls, avatar states, intro sequence, review/edit screen. |
| `functions/_lib/claude.js` | Rewrite `FOLLOWUP_SYSTEM` / `SYNTHESIZE_SYSTEM` (café-host persona, coverage-aware, no-invention rule). |
| `functions/api/followup.js` | Accept state, return `{ reply, coverage_update }`. |
| `functions/api/synthesize.js` | Structured draft from transcript + coverage; flag missing place. |
| `functions/api/voice.js` | **New** — store audio in R2, transcribe via Workers AI Whisper. |
| `functions/api/submit.js` | Add transcript + audio links + consent + language. |
| `src/index.js` | Route `/api/voice`; bind R2 + Workers AI. |
| `wrangler.jsonc` | Add R2 bucket + Workers AI bindings. |
| `.assetsignore` | Keep server-only dirs excluded; add any new asset dirs. |
| `contribute.html` | Conversational layout, intro sequence, background, i18n keys for all new strings (EN/中/ไทย). |
| `assets/` (new) | Recraft-generated character sheet, intro frames, background. |

---

## Appendix A — Recraft prompts (style-locked)

**Shared style descriptor** (paste into every prompt, or set as a Recraft style reference after generating the character sheet first):

> Warm hand-drawn crayon / colored-pencil illustration with visible strokes and subtle paper texture. Muted Bangkok old-shophouse palette: terracotta, warm cream, teal-green, ochre, soft yellow light. Soft natural morning light, gentle rounded shapes, simple confident linework, cozy and human. Not flat vector, not photorealistic, no harsh shadows, no text, no watermark.

> Realized reference: see approved Jake anchor (2026-07-15) — lock as Recraft style/character reference and apply to all subsequent assets.

**A1 — Jake, two steps.** Step 1: generate ONE anchor image to fix his design and save it as a Recraft style/character reference. Step 2: generate the four UI states as **separate** images using that reference, so each is a ready-to-use avatar and none drifts. Keep identical framing (upper body, centered, same warm-cream background) across all four so the swap looks stable.

- *A1-anchor:* Single friendly Thai-Chinese neighborhood café host named Jake — age-ambiguous, approachable, short dark hair, simple apron over a plain shirt, a coffee cup nearby. Upper body, centered, neutral warm-cream background, relaxed idle smile. [shared style descriptor]
- *A1-idle:* Jake, upper body, warm relaxed idle smile, looking at the viewer. [shared style descriptor]
- *A1-listening:* Jake, upper body, leaning in and listening attentively, head slightly tilted, engaged. [shared style descriptor]
- *A1-thinking:* Jake, upper body, thoughtful, looking slightly up, a gentle "let me think" expression. [shared style descriptor]
- *A1-speaking:* Jake, upper body, mid-speaking with a small welcoming open-hand gesture. [shared style descriptor]

**A2 — Intro keyframes: first-person "walk-in" vignette (5 beats; generate 2–3 near-identical frames of each for the stop-motion swap). Style-line only + concrete scene anchors — the saved Style carries the aesthetic. Attach the Jake reference for Beats 2, 4, 5.** Full enriched prompts kept in `/assets/intro/prompts.md`; summaries here:
> Beat 1 (walk in): POV from the street to a small corner café doorway — hand-painted sign, chalkboard menu, half-raised shutter, potted plants + monstera, parked motorbike, worn threshold, bench; through the door a glimpse of counter, espresso machine, bean jars, drip stand, mugs, pendant lamp, string lights, stools, a curled cat. Warm morning light and haze. No people. [style line]
> Beat 2 (order): POV at the counter ordering; Jake (reference) behind the espresso machine, warm smile, taking your order; chalkboard menu, bean jar, drip stand, tip jar, marigolds; pendant light. [style line]
> Beat 3 (the wall): POV drifting along a warmly lit wall of crooked framed photos — old street scenes, the Mazu shrine with incense and lion dance, red lanterns and offering tables, family portraits and faces; mementos between frames (paper fan, red envelope, dried marigolds, brass key, amulet); shelf with plant and mugs below. Evocative, no readable text or dates. [style line]
> Beat 4 (the coffee): POV seated at a small wooden table; Jake (reference) setting down a warm cup with a curl of steam and simple latte art, saucer and spoon, a welcoming lean; blurred cozy interior. [style line]
> Beat 5 (start chatting): POV across the small table from Jake (reference), leaning in with an open friendly gesture, mid-conversation, the cup between you; warm interior softly behind. [style line]

**A3 — Chat background (light + dark variants):**
> Light: a very low-contrast, faint background texture of a Bangkok shophouse café — soft ghosted outlines of a window, hanging lamps, and plants on a warm cream field, roughly 12% contrast, nothing sharp, designed to sit behind body text and stay fully readable. No focal point, no people, no text. [shared style descriptor]
> Dark: same faint motif on a deep warm charcoal field, thin warm-toned lines at low contrast, dark-mode safe, text stays readable on top. No people, no text. [shared style descriptor]

*Production notes:* generate A1 first; use Recraft's style reference / style_id from it to lock A2 and A3 so the character and world match. Export at 2× for retina. Keep the background exports as separate light/dark files wired to `prefers-color-scheme`.

## Appendix B — draft system prompts

**FOLLOWUP_SYSTEM (sketch):**
> You are Jake, the friendly person behind the counter at a neighborhood café near Chulalongkorn University. You are an AI helping this community archive gather people's stories about places around Sam Yan — you are open about being an AI and you never pretend to have your own memories of the area. You are warm, unhurried, and genuinely curious. Talk like a caring neighbor, not an interviewer.
> Your job: help the contributor tell the story of a place that matters to them, and draw out how it *felt*, not just what happened. Reflect back what they say. Ask ONE open question at a time. Invite them to go deeper ("what do you remember most about that?").
> Hard rules: Never introduce a fact, date, name, number, or event the contributor did not say. Never correct their memory. If they stay factual, respect it — don't push for emotion. You know only the site glossary below; use it silently to understand which place they mean.
> [glossary S01–S10]
> [coverage snapshot: still open = …] [turns remaining: N]
> Return JSON: { "reply": <your next message>, "coverage_update": { place|relationship|event|feeling: open|touched|covered } }.

**SYNTHESIZE_SYSTEM (sketch):**
> From the conversation transcript, produce a structured archive submission using ONLY what the contributor said. Do not invent, infer beyond, or embellish. Preserve their voice and wording in the story field. If the place (S01–S10) is unclear, set place to null and do not guess.
> Return JSON: { place, relationship, event_summary, story, language }.
