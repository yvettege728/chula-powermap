# Phase A — Conversation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed 3-question intake with an adaptive, turn-capped, coverage-checklist conversation (persona "Jake", glossary-only) that draws out story and feeling and ends with a reviewable structured draft; persist the transcript and language to Airtable. Typed-only — no voice (Phase B) and no new artwork (Phase C).

**Architecture:** Client keeps session state (`transcript`, `coverage`, `turn`) in `interview-state.js` (pure, unit-tested) and calls `/api/followup` each turn; the Worker returns `{ reply, coverage_update }`. The harness decides when to stop (coverage met or turn cap), then calls `/api/synthesize` to turn the transcript into a `{ kind, site, description }` draft that pre-fills the existing submit form for review/edit. `/api/submit` gains `transcript` + `language`.

**Tech Stack:** Vanilla ES modules, Cloudflare Workers (`src/index.js` + `functions/api/*`), Anthropic Claude Haiku (`claude-haiku-4-5-20251001`), Airtable REST, `node --test` (node:test) for the pure libs. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-15-conversational-intake-redesign-design.md` (Sections 4, 5, 7; decisions D1–D3).

---

## Prerequisites (manual, one-time)

- [ ] **P1 — Add Airtable columns.** In the Airtable base, add two fields to the submissions table: `Transcript` (Long text) and `Language` (Single line text). Without these, submissions with the new fields will error from Airtable. No code depends on this step until Task 9.

## File structure

| File | Responsibility | Change |
|------|----------------|--------|
| `interview-state.js` | Pure conversation state: coverage model, turn count, stop logic | Rewrite |
| `interview-state.test.js` | Unit tests for the above | Rewrite |
| `functions/_lib/claude.js` | Prompt strings + request builders + `callClaude` | Rewrite prompts + builders; keep `callClaude` |
| `functions/_lib/claude.test.js` | Unit tests for the builders | Rewrite |
| `functions/_lib/validation.js` | Request/payload validation | Add `validateTranscript`, `validateCoverage`; extend `validateSubmitPayload` |
| `functions/_lib/validation.test.js` | Unit tests for validation | Extend |
| `functions/_lib/airtable.js` | Airtable record shape | Add `Transcript` + `Language` |
| `functions/_lib/airtable.test.js` | Unit tests for record shape | Extend |
| `functions/api/followup.js` | Turn endpoint | Rewrite request/response contract |
| `functions/api/synthesize.js` | Synthesis endpoint | Rewrite to take transcript |
| `functions/api/submit.js` | Submit endpoint | No change (passes body through) |
| `interview.js` | Browser chat loop wiring | Rewrite (manual QA) |
| `contribute.html` | Intake DOM + submit payload + i18n | Edit input maxlength, submit payload, i18n keys (manual QA) |

Convention (from the repo): pure `.js` libs are unit-tested with `node --test`; DOM code (`interview.js`, `contribute.html`) is verified by manual QA, never imported by the test suite.

---

## Task 1: Rewrite `interview-state.js` (coverage + stop logic)

**Files:**
- Modify: `interview-state.js` (full rewrite)
- Test: `interview-state.test.js` (full rewrite)

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `interview-state.test.js` with:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TURN_CAP,
  COVERAGE_ITEMS,
  createInitialState,
  mergeCoverage,
  isCovered,
  shouldStop,
  turnsRemaining,
  openItems,
} from "./interview-state.js";

test("createInitialState starts empty, all coverage open, turn 0", () => {
  const s = createInitialState();
  assert.deepEqual(s.transcript, []);
  assert.equal(s.turn, 0);
  for (const item of COVERAGE_ITEMS) assert.equal(s.coverage[item], "open");
});

test("mergeCoverage applies only valid item/state pairs, ignores junk", () => {
  const base = createInitialState().coverage;
  const merged = mergeCoverage(base, { place: "covered", feeling: "touched", bogus: "covered", event: "nope" });
  assert.equal(merged.place, "covered");
  assert.equal(merged.feeling, "touched");
  assert.equal(merged.event, "open"); // invalid state ignored
  assert.equal(merged.bogus, undefined); // invalid key dropped
});

test("mergeCoverage tolerates null/undefined update", () => {
  const base = createInitialState().coverage;
  assert.deepEqual(mergeCoverage(base, null), base);
  assert.deepEqual(mergeCoverage(base, undefined), base);
});

test("shouldStop is false early on", () => {
  const s = createInitialState();
  assert.equal(shouldStop(s), false);
});

test("shouldStop requires place covered AND >=2 others covered", () => {
  const s = createInitialState();
  s.coverage = { place: "covered", relationship: "covered", event: "covered", feeling: "open" };
  assert.equal(shouldStop(s), true);
});

test("shouldStop stays false if place is not covered even when others are", () => {
  const s = createInitialState();
  s.coverage = { place: "open", relationship: "covered", event: "covered", feeling: "covered" };
  assert.equal(shouldStop(s), false);
});

test("shouldStop is true at the turn cap regardless of coverage", () => {
  const s = createInitialState();
  s.turn = TURN_CAP;
  assert.equal(shouldStop(s), true);
});

test("turnsRemaining never goes negative", () => {
  const s = createInitialState();
  s.turn = TURN_CAP + 3;
  assert.equal(turnsRemaining(s), 0);
});

test("openItems lists every item not yet covered", () => {
  const cov = { place: "covered", relationship: "touched", event: "open", feeling: "covered" };
  assert.deepEqual(openItems(cov), ["relationship", "event"]);
});

test("isCovered reflects the covered state", () => {
  assert.equal(isCovered({ place: "covered" }, "place"), true);
  assert.equal(isCovered({ place: "touched" }, "place"), false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test interview-state.test.js`
Expected: FAIL — imports like `createInitialState` are not defined (old file only exports `FIXED_QUESTIONS`, `FIXED_QUESTIONS_I18N`, `nextStep`).

- [ ] **Step 3: Write the implementation**

Replace the entire contents of `interview-state.js` with:

```js
// interview-state.js
// Pure state logic for the adaptive intake conversation. No DOM. Consumed by
// interview.js (browser) and interview-state.test.js (Node). See
// docs/superpowers/specs/2026-07-15-conversational-intake-redesign-design.md.

// Max contributor turns before the harness wraps up regardless of coverage.
export const TURN_CAP = 7;

// Things worth drawing out. `place` is the only item required for a filable
// record; `feeling` is pursued but never forces a stop.
export const COVERAGE_ITEMS = ["place", "relationship", "event", "feeling"];

const COVERAGE_STATES = ["open", "touched", "covered"];

export function createInitialState() {
  const coverage = {};
  for (const item of COVERAGE_ITEMS) coverage[item] = "open";
  return { transcript: [], coverage, turn: 0 };
}

export function mergeCoverage(coverage, update) {
  const next = { ...coverage };
  if (update && typeof update === "object") {
    for (const item of COVERAGE_ITEMS) {
      if (COVERAGE_STATES.includes(update[item])) next[item] = update[item];
    }
  }
  return next;
}

export function isCovered(coverage, item) {
  return coverage[item] === "covered";
}

export function openItems(coverage) {
  return COVERAGE_ITEMS.filter((item) => coverage[item] !== "covered");
}

export function turnsRemaining(state, cap = TURN_CAP) {
  return Math.max(0, cap - state.turn);
}

// Stop when we hit the turn cap, or when `place` is covered AND at least two
// of the remaining three items are covered.
export function shouldStop(state, cap = TURN_CAP) {
  if (state.turn >= cap) return true;
  if (!isCovered(state.coverage, "place")) return false;
  const others = ["relationship", "event", "feeling"].filter((item) =>
    isCovered(state.coverage, item)
  );
  return others.length >= 2;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test interview-state.test.js`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add interview-state.js interview-state.test.js
git commit -m "feat(intake): replace fixed-question state with adaptive coverage model"
```

---

## Task 2: Rewrite the follow-up prompt + builder in `claude.js`

**Files:**
- Modify: `functions/_lib/claude.js` (shared glossary const, new `FOLLOWUP_SYSTEM`, rewrite `buildFollowupRequest`)
- Test: `functions/_lib/claude.test.js`

- [ ] **Step 1: Write the failing test**

Replace the `buildFollowupRequest` test block at the top of `functions/_lib/claude.test.js` with:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFollowupRequest, buildSynthesizeRequest } from "./claude.js";

const TRANSCRIPT = [
  { role: "bot", text: "Tell me about a place that matters to you." },
  { role: "user", text: "The shrine by the canal. My grandmother took me every new year." },
];
const COVERAGE = { place: "touched", relationship: "covered", event: "open", feeling: "open" };

test("buildFollowupRequest uses Haiku, embeds the transcript and open items, caps output", () => {
  const req = buildFollowupRequest(TRANSCRIPT, COVERAGE, 5, "en");
  assert.equal(req.model, "claude-haiku-4-5-20251001");
  assert.ok(req.max_tokens <= 500, "follow-up replies should stay short");
  const userText = req.messages[0].content;
  assert.match(userText, /grandmother/);
  assert.match(userText, /place/); // an open coverage item is surfaced
  assert.match(userText, /5/); // turns remaining is passed through
});

test("buildFollowupRequest system prompt forbids inventing facts and names Jake", () => {
  const req = buildFollowupRequest(TRANSCRIPT, COVERAGE, 5, "en");
  assert.match(req.system, /Jake/);
  assert.match(req.system, /never.*(introduce|invent|add).*(fact|date|name|number)/i);
  assert.match(req.system, /coverage_update/); // instructs the JSON return shape
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test functions/_lib/claude.test.js`
Expected: FAIL — `buildFollowupRequest` still expects a 3-element `answers` array; assertions on Jake / transcript / turns-remaining fail.

- [ ] **Step 3: Write the implementation**

In `functions/_lib/claude.js`, keep `const MODEL = "claude-haiku-4-5-20251001";` and the existing `callClaude` function unchanged. Add a shared glossary constant near the top (below `MODEL`):

```js
const SITE_GLOSSARY = `Site glossary — use ONLY to recognise which place the contributor means, never to add facts, dates, or details they did not say:
  - S05 = Chao Mae Thapthim shrine (also called the Mazu shrine), Block 33
  - S01 = Scala Theatre (a demolished cinema)
  - S04 = Samyan Mitrtown (shopping complex; former Sam Yan retail area)
  - S09 = Chulalongkorn Centenary Park
  - S10 = Suanluang shophouses
  - S08 = Block 33 parcel (the broader redevelopment site containing the shrine)
  - S03 = Chamchuri Square
  - S06 = I-House
  - S07 = Suan Luang School`;
```

Replace `FOLLOWUP_SYSTEM` with:

```js
const FOLLOWUP_SYSTEM = `You are Jake, the friendly person behind the counter at a small neighborhood café near Chulalongkorn University in Bangkok. You are an AI helping a community archive gather people's stories about places around Sam Yan. You are open about being an AI and you never pretend to have your own memories of the area. You are warm, unhurried, and genuinely curious — talk like a caring neighbor over coffee, not like an interviewer.

Your job: help the contributor tell the story of a place that matters to them, and gently draw out how it FELT, not just what happened. Reflect back what they said. Ask ONE open question at a time. Invite them to go a little deeper ("what do you remember most about that?").

Hard rules:
- Never introduce a fact, date, name, number, or event the contributor did not say. Never correct their memory.
- Never claim to remember the neighborhood yourself.
- If they stay factual and don't want to share feelings, respect it — do not push for emotion.
- Keep your reply short and conversational, under 60 words.

You are also quietly tracking coverage of four things, so the archive gets a usable record: place (which site), relationship (their connection to it), event (what happened / what they saw), feeling (the emotional texture). Steer gently toward what is still open, but follow the contributor's lead first.

${SITE_GLOSSARY}

Respond with ONLY a JSON object of this exact shape and nothing else:
{"reply": string, "coverage_update": {"place": "open"|"touched"|"covered", "relationship": ..., "event": ..., "feeling": ...}}
Include only the coverage keys whose state you are updating this turn.`;
```

Replace `buildFollowupRequest` with:

```js
function renderTranscript(transcript) {
  return transcript
    .map((t) => `${t.role === "bot" ? "Jake" : "Contributor"}: ${t.text}`)
    .join("\n");
}

export function buildFollowupRequest(transcript, coverage, turnsRemaining, lang = "en") {
  const stillOpen =
    Object.keys(coverage).filter((k) => coverage[k] !== "covered").join(", ") || "none";
  const userText = [
    `Conversation so far:\n${renderTranscript(transcript)}`,
    `Still worth gently drawing out (do not force): ${stillOpen}`,
    `Turns remaining before you should warmly wrap up: ${turnsRemaining}`,
    `Reply in the contributor's language (code: ${lang}).`,
  ].join("\n\n");

  return {
    model: MODEL,
    max_tokens: 400,
    system: FOLLOWUP_SYSTEM,
    messages: [{ role: "user", content: userText }],
  };
}
```

(Leave `buildSynthesizeRequest` in place for now; Task 3 rewrites it. The import in the test already references it.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test functions/_lib/claude.test.js`
Expected: the two `buildFollowupRequest` tests PASS. (Old `buildSynthesizeRequest` tests may still pass or fail depending on Task 3 — they are replaced in Task 3.)

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/claude.js functions/_lib/claude.test.js
git commit -m "feat(intake): Jake follow-up prompt driven by transcript + coverage"
```

---

## Task 3: Rewrite the synthesis prompt + builder in `claude.js`

**Files:**
- Modify: `functions/_lib/claude.js` (`SYNTHESIZE_SYSTEM`, `buildSynthesizeRequest`)
- Test: `functions/_lib/claude.test.js`

- [ ] **Step 1: Write the failing test**

Append to `functions/_lib/claude.test.js`:

```js
test("buildSynthesizeRequest takes a transcript and asks for structured output", () => {
  const req = buildSynthesizeRequest(TRANSCRIPT, "en");
  assert.equal(req.model, "claude-haiku-4-5-20251001");
  const userText = req.messages[0].content;
  assert.match(userText, /grandmother/);
  assert.match(req.system, /only.*(reorganiz|structure|summariz|what the contributor)/i);
  assert.match(req.system, /"site"/);
  assert.match(req.system, /null/); // may set site null when unclear
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test functions/_lib/claude.test.js`
Expected: FAIL — current `buildSynthesizeRequest(answers, followupAnswer)` expects an array of answers, and the old tests referencing `["A","B","C"]` no longer describe the contract.

Remove the two obsolete `buildSynthesizeRequest` tests that pass `["A", "B", "C"]` (the "includes the optional follow-up answer" and "omits follow-up section" tests) — they test a contract that no longer exists.

- [ ] **Step 3: Write the implementation**

Replace `SYNTHESIZE_SYSTEM` with:

```js
const SYNTHESIZE_SYSTEM = `You are helping organize what a contributor shared in a warm conversation for Chula Powermap, a public archive documenting land, development, and displacement around Chulalongkorn University in Bangkok. You are given the full conversation transcript and must produce one structured entry.

Rules you must follow:
- Use ONLY what the contributor actually said. Do not add any fact, name, place, date, or detail they did not mention. Do not embellish.
- Preserve their first-person voice and wording as much as possible.
- For "kind", choose the single best match from: testimony, photograph, document, drawing, link, other.
- For "site", use the glossary below to identify which place the contributor is describing, then use its code. If no site is clearly identifiable, set "site" to null (do not guess).
- For "description", write a clean, readable synthesis (not a bullet list) in the contributor's own words, including how the place mattered to them and how it felt where they said so.

${SITE_GLOSSARY}

Respond with ONLY a JSON object of this exact shape and nothing else:
{"kind": string, "site": string | null, "description": string}`;
```

Replace `buildSynthesizeRequest` with:

```js
export function buildSynthesizeRequest(transcript, lang = "en") {
  const userText = [
    `Conversation transcript:\n${renderTranscript(transcript)}`,
    `Write the description in the contributor's language (code: ${lang}) where natural, preserving their own words.`,
  ].join("\n\n");

  return {
    model: MODEL,
    max_tokens: 900,
    system: SYNTHESIZE_SYSTEM,
    messages: [{ role: "user", content: userText }],
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test functions/_lib/claude.test.js`
Expected: PASS (all remaining tests green).

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/claude.js functions/_lib/claude.test.js
git commit -m "feat(intake): synthesize structured draft from full transcript"
```

---

## Task 4: Extend `validation.js` (transcript, coverage, submit payload)

**Files:**
- Modify: `functions/_lib/validation.js`
- Test: `functions/_lib/validation.test.js`

- [ ] **Step 1: Write the failing tests**

The existing file imports only `validateAnswers`. Add a second import line for the functions this task exercises (`validateSubmitPayload` is defined in `validation.js` but not yet imported by the test), then append the new tests. Append to `functions/_lib/validation.test.js` (keep existing tests):

```js
import { validateSubmitPayload, validateTranscript, validateCoverage } from "./validation.js";

test("validateTranscript rejects non-arrays and empty arrays", () => {
  assert.equal(validateTranscript(null).ok, false);
  assert.equal(validateTranscript([]).ok, false);
});

test("validateTranscript accepts well-formed turns", () => {
  const r = validateTranscript([
    { role: "bot", text: "hi" },
    { role: "user", text: "the shrine" },
  ]);
  assert.equal(r.ok, true);
});

test("validateTranscript rejects bad roles and empty text", () => {
  assert.equal(validateTranscript([{ role: "system", text: "x" }]).ok, false);
  assert.equal(validateTranscript([{ role: "user", text: "  " }]).ok, false);
});

test("validateCoverage accepts valid maps and rejects bad states", () => {
  assert.equal(validateCoverage({ place: "covered" }).ok, true);
  assert.equal(validateCoverage({ place: "definitely" }).ok, false);
  assert.equal(validateCoverage("nope").ok, false);
});

test("validateSubmitPayload accepts optional transcript + language", () => {
  const r = validateSubmitPayload({
    kind: "testimony",
    site: "S05",
    description: "a memory",
    visibility: "private",
    source: "ai-interview",
    language: "zh",
    transcript: [{ role: "user", text: "the shrine" }],
  });
  assert.equal(r.ok, true);
});

test("validateSubmitPayload rejects an unknown language", () => {
  const r = validateSubmitPayload({
    kind: "testimony",
    site: "S05",
    description: "a memory",
    visibility: "private",
    source: "ai-interview",
    language: "fr",
  });
  assert.equal(r.ok, false);
});
```


- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test functions/_lib/validation.test.js`
Expected: FAIL — `validateTranscript` / `validateCoverage` are not exported; the language cases fail because `validateSubmitPayload` ignores `language`.

- [ ] **Step 3: Write the implementation**

In `functions/_lib/validation.js`, add near the top:

```js
const VALID_ROLES = ["bot", "user"];
const VALID_COVERAGE_STATES = ["open", "touched", "covered"];
const COVERAGE_KEYS = ["place", "relationship", "event", "feeling"];
const VALID_LANGUAGE = ["en", "zh", "th"];
const MAX_TURN_LENGTH = 4000;
```

Add two new exported functions:

```js
export function validateTranscript(transcript) {
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return { ok: false, error: "transcript must be a non-empty array" };
  }
  for (const turn of transcript) {
    if (!turn || typeof turn !== "object") {
      return { ok: false, error: "each transcript turn must be an object" };
    }
    if (!VALID_ROLES.includes(turn.role)) {
      return { ok: false, error: "each turn role must be 'bot' or 'user'" };
    }
    if (typeof turn.text !== "string" || turn.text.trim().length === 0) {
      return { ok: false, error: "each turn text must be a non-empty string" };
    }
    if (turn.text.length > MAX_TURN_LENGTH) {
      return { ok: false, error: `each turn text must be ${MAX_TURN_LENGTH} characters or fewer` };
    }
  }
  return { ok: true };
}

export function validateCoverage(coverage) {
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    return { ok: false, error: "coverage must be an object" };
  }
  for (const key of Object.keys(coverage)) {
    if (!COVERAGE_KEYS.includes(key)) {
      return { ok: false, error: `unknown coverage key: ${key}` };
    }
    if (!VALID_COVERAGE_STATES.includes(coverage[key])) {
      return { ok: false, error: `coverage.${key} must be open, touched, or covered` };
    }
  }
  return { ok: true };
}
```

In `validateSubmitPayload`, add these checks just before the final `return { ok: true };`:

```js
  if (payload.language !== undefined && !VALID_LANGUAGE.includes(payload.language)) {
    return { ok: false, error: `language must be one of ${VALID_LANGUAGE.join(", ")}` };
  }
  if (payload.transcript !== undefined) {
    const t = validateTranscript(payload.transcript);
    if (!t.ok) return t;
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test functions/_lib/validation.test.js`
Expected: PASS (existing + new tests green).

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/validation.js functions/_lib/validation.test.js
git commit -m "feat(intake): validate transcript, coverage, and submit language"
```

---

## Task 5: Add `Transcript` + `Language` to the Airtable record

**Files:**
- Modify: `functions/_lib/airtable.js` (`buildAirtableRecord`)
- Test: `functions/_lib/airtable.test.js`

- [ ] **Step 1: Write the failing test**

Append to `functions/_lib/airtable.test.js`:

```js
test("buildAirtableRecord flattens transcript and includes language when present", () => {
  const { fields } = buildAirtableRecord({
    kind: "testimony",
    site: "S05",
    description: "a memory",
    visibility: "private",
    source: "ai-interview",
    language: "th",
    transcript: [
      { role: "bot", text: "hi" },
      { role: "user", text: "the shrine" },
    ],
  });
  assert.equal(fields.Language, "th");
  assert.match(fields.Transcript, /bot: hi/);
  assert.match(fields.Transcript, /user: the shrine/);
});

test("buildAirtableRecord omits Transcript/Language when absent", () => {
  const { fields } = buildAirtableRecord({
    kind: "testimony",
    site: "S05",
    description: "a memory",
    visibility: "private",
    source: "form",
  });
  assert.equal(fields.Transcript, undefined);
  assert.equal(fields.Language, undefined);
});
```

If `functions/_lib/airtable.test.js` does not yet import `buildAirtableRecord`, add at the top:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAirtableRecord } from "./airtable.js";
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test functions/_lib/airtable.test.js`
Expected: FAIL — record has no `Transcript`/`Language` fields.

- [ ] **Step 3: Write the implementation**

In `functions/_lib/airtable.js`, inside `buildAirtableRecord`, after the existing `if (payload.contact) { ... }` block and before `return { fields };`, add:

```js
  if (payload.language) {
    fields.Language = payload.language;
  }
  if (payload.transcript) {
    fields.Transcript = Array.isArray(payload.transcript)
      ? payload.transcript.map((t) => `${t.role}: ${t.text}`).join("\n\n")
      : String(payload.transcript);
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test functions/_lib/airtable.test.js`
Expected: PASS.

- [ ] **Step 5: Run the whole suite and commit**

Run: `npm test` (i.e. `node --test`)
Expected: PASS across all `*.test.js`.

```bash
git add functions/_lib/airtable.js functions/_lib/airtable.test.js
git commit -m "feat(intake): persist transcript and language to Airtable"
```

---

## Task 6: Rewrite the `/api/followup` endpoint contract

**Files:**
- Modify: `functions/api/followup.js`

Endpoints are not unit-tested in this repo; verify with a local `curl`. Contract: request `{ transcript, coverage, turn }` → response `{ reply, coverage_update }`.

- [ ] **Step 1: Rewrite the handler**

Replace the body of `functions/api/followup.js` with:

```js
// functions/api/followup.js
import { buildFollowupRequest, callClaude } from "../_lib/claude.js";
import { validateTranscript, validateCoverage } from "../_lib/validation.js";
import { turnsRemaining } from "../../interview-state.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  const t = validateTranscript(body.transcript);
  if (!t.ok) return jsonResponse({ error: t.error }, 400);

  const coverage = body.coverage ?? {};
  const c = validateCoverage(coverage);
  if (!c.ok) return jsonResponse({ error: c.error }, 400);

  const turn = Number.isInteger(body.turn) ? body.turn : 0;
  const lang = typeof body.language === "string" ? body.language : "en";

  const claudeRequest = buildFollowupRequest(
    body.transcript,
    coverage,
    turnsRemaining({ turn }),
    lang
  );

  let text;
  try {
    text = await callClaude(env.ANTHROPIC_API_KEY, claudeRequest);
  } catch (err) {
    return jsonResponse({ error: "AI assistant unavailable", detail: String(err) }, 502);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Fail safe: a neutral nudge, no coverage change.
    return jsonResponse({ reply: "", coverage_update: {} });
  }

  return jsonResponse({
    reply: typeof parsed.reply === "string" ? parsed.reply : "",
    coverage_update: parsed.coverage_update ?? {},
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
```

Note: importing `turnsRemaining` from the repo-root `interview-state.js` reuses the single source of truth for the cap. `interview-state.js` has no DOM references, so it is safe to import server-side.

- [ ] **Step 2: Verify locally**

Run in one terminal: `npx wrangler dev` (serves the Worker + static assets locally).
In another terminal:

```bash
curl -s -X POST http://localhost:8787/api/followup \
  -H 'content-type: application/json' \
  -d '{"transcript":[{"role":"bot","text":"Tell me about a place that matters to you."},{"role":"user","text":"The shrine by the canal, my grandmother took me every new year."}],"coverage":{"place":"touched"},"turn":1,"language":"en"}'
```

Expected: HTTP 200 with a JSON body containing a non-empty `reply` string and a `coverage_update` object. (Requires `ANTHROPIC_API_KEY` in `.dev.vars` or the dashboard; if billing is unfunded you'll get a 502 with an `invalid_request_error` detail — top up, per the last session's root cause.)

- [ ] **Step 3: Verify a bad request is rejected**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8787/api/followup \
  -H 'content-type: application/json' -d '{"transcript":[]}'
```

Expected: `400`.

- [ ] **Step 4: Commit**

```bash
git add functions/api/followup.js
git commit -m "feat(intake): /api/followup takes transcript+coverage, returns reply+coverage_update"
```

---

## Task 7: Rewrite the `/api/synthesize` endpoint contract

**Files:**
- Modify: `functions/api/synthesize.js`

Contract: request `{ transcript, language }` → response `{ kind, site, description }` (`site` may be `null`).

- [ ] **Step 1: Rewrite the handler**

Replace the body of `functions/api/synthesize.js` with:

```js
import { buildSynthesizeRequest, callClaude } from "../_lib/claude.js";
import { validateTranscript } from "../_lib/validation.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  const t = validateTranscript(body.transcript);
  if (!t.ok) return jsonResponse({ error: t.error }, 400);

  const lang = typeof body.language === "string" ? body.language : "en";
  const claudeRequest = buildSynthesizeRequest(body.transcript, lang);

  const fallbackDescription = body.transcript
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.text)
    .join("\n\n");

  let text;
  try {
    text = await callClaude(env.ANTHROPIC_API_KEY, claudeRequest);
  } catch (err) {
    return jsonResponse({ error: "AI assistant unavailable", detail: String(err) }, 502);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return jsonResponse({ kind: "other", site: null, description: fallbackDescription });
  }

  return jsonResponse({
    kind: parsed.kind ?? "other",
    site: parsed.site ?? null,
    description: parsed.description ?? fallbackDescription,
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
```

- [ ] **Step 2: Verify locally**

```bash
curl -s -X POST http://localhost:8787/api/synthesize \
  -H 'content-type: application/json' \
  -d '{"transcript":[{"role":"bot","text":"Tell me about a place."},{"role":"user","text":"The Chao Mae Thapthim shrine. My grandmother took me every new year and I felt safe there."}],"language":"en"}'
```

Expected: HTTP 200 with `{ "kind": ..., "site": "S05", "description": "..." }` (site should resolve to S05 for a clear shrine mention; may be `null` for a vague transcript).

- [ ] **Step 3: Commit**

```bash
git add functions/api/synthesize.js
git commit -m "feat(intake): /api/synthesize builds a draft from the transcript"
```

---

## Task 8: Rewrite the browser loop in `interview.js`

**Files:**
- Modify: `interview.js` (full rewrite of the flow; manual QA)

The existing DOM ids are reused: `intakeToggle`, `interviewFlow`, `interviewThread`, `interviewAnswer`, `interviewNext`, `interviewStatus`, `aiDraftNotice`, `submitForm`, and form fields `kind`, `site`, `description`.

- [ ] **Step 1: Replace `interview.js` with the adaptive loop**

Replace the entire file with:

```js
// interview.js
// DOM wiring for the adaptive intake conversation. Not unit tested — verified
// via manual QA. Never imported by the Node test suite.
import { createInitialState, mergeCoverage, shouldStop } from "./interview-state.js";

const OPENING = {
  en: "Hi, I'm Jake — I help look after this archive. No forms here, just tell me about a place near Sam Yan that matters to you.",
  zh: "嗨，我是 Jake，帮忙照看这个档案。这里没有表格——跟我说说三养（Sam Yan）附近一个对你重要的地方吧。",
  th: "สวัสดี ผมชื่อเจค ผมช่วยดูแลคลังเรื่องราวนี้ ที่นี่ไม่มีแบบฟอร์ม เล่าให้ฟังหน่อยได้ไหมว่ามีที่ไหนแถวสามย่านที่มีความหมายกับคุณ",
};

const STATUS_TEXT = {
  en: { thinking: "Jake is thinking…", organizing: "Organizing your story…" },
  zh: { thinking: "Jake 正在想…", organizing: "正在整理你的故事…" },
  th: { thinking: "เจคกำลังคิด…", organizing: "กำลังเรียบเรียงเรื่องของคุณ…" },
};

const FALLBACK_ALERT_TEXT = {
  en: "Jake is temporarily unavailable, so we've carried what you shared into the form below — please review and send it directly.",
  zh: "Jake 暂时无法使用，我们已把你分享的内容填入下方表单——请检查后直接发送。",
  th: "เจคไม่พร้อมใช้งานชั่วคราว เราจึงนำสิ่งที่คุณเล่ามาใส่ในแบบฟอร์มด้านล่างแล้ว — โปรดตรวจสอบแล้วส่งได้เลย",
};

function currentLang() {
  return document.body.dataset.lang || "en";
}
function pick(map) {
  const lang = currentLang();
  return map[lang] || map.en;
}

function initInterviewFlow() {
  if (initInterviewFlow._initialized) return;
  initInterviewFlow._initialized = true;

  const toggle = document.getElementById("intakeToggle");
  const interviewFlow = document.getElementById("interviewFlow");
  const submitForm = document.getElementById("submitForm");
  if (!toggle || !interviewFlow || !submitForm) return; // not on this page

  const threadEl = document.getElementById("interviewThread");
  const answerEl = document.getElementById("interviewAnswer");
  const nextBtn = document.getElementById("interviewNext");
  const statusEl = document.getElementById("interviewStatus");
  const aiDraftNotice = document.getElementById("aiDraftNotice");

  let state = createInitialState();
  let started = false;

  toggle.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggle.querySelectorAll("[data-mode]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const mode = btn.dataset.mode;
      interviewFlow.hidden = mode !== "interview";
      submitForm.hidden = mode === "interview";
      if (mode === "interview" && !started) {
        started = true;
        addMessage(pick(OPENING), "bot");
        state.transcript.push({ role: "bot", text: pick(OPENING) });
        enableInput();
      }
    });
  });

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "interview-msg interview-msg-" + who;
    el.textContent = text;
    threadEl.appendChild(el);
    threadEl.scrollTop = threadEl.scrollHeight;
  }

  function enableInput() {
    answerEl.value = "";
    answerEl.disabled = false;
    nextBtn.disabled = false;
    statusEl.textContent = "";
    answerEl.focus();
  }

  function busy(key) {
    nextBtn.disabled = true;
    answerEl.disabled = true;
    statusEl.textContent = pick(STATUS_TEXT)[key];
  }

  async function handleNext() {
    const value = answerEl.value.trim();
    if (!value) return;

    addMessage(value, "user");
    state.transcript.push({ role: "user", text: value });
    state.turn += 1;
    answerEl.value = "";

    if (shouldStop(state)) return synthesize();

    busy("thinking");
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transcript: state.transcript,
          coverage: state.coverage,
          turn: state.turn,
          language: currentLang(),
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`followup failed: ${res.status} ${errBody}`);
      }
      const data = await res.json();
      state.coverage = mergeCoverage(state.coverage, data.coverage_update);
      if (data.reply) {
        addMessage(data.reply, "bot");
        state.transcript.push({ role: "bot", text: data.reply });
      }
      if (shouldStop(state)) return synthesize();
      enableInput();
    } catch (err) {
      console.error("[interview] /api/followup failed:", err);
      fallbackToForm();
    }
  }

  async function synthesize() {
    busy("organizing");
    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript: state.transcript, language: currentLang() }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`synthesize failed: ${res.status} ${errBody}`);
      }
      const draft = await res.json();
      applyDraftToForm(draft);
    } catch (err) {
      console.error("[interview] /api/synthesize failed:", err);
      fallbackToForm();
    }
  }

  function applyDraftToForm(draft) {
    if (draft.kind) document.getElementById("kind").value = draft.kind;
    const siteEl = document.getElementById("site");
    if (draft.site) siteEl.value = draft.site;
    document.getElementById("description").value = draft.description || "";
    submitForm.dataset.transcript = JSON.stringify(state.transcript);
    submitForm.dataset.language = currentLang();
    submitForm.dataset.source = "ai-interview";
    aiDraftNotice.hidden = false;
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    // If the AI couldn't resolve a site, make the contributor choose it.
    if (!draft.site) {
      siteEl.value = "other";
      siteEl.focus();
    }
    submitForm.scrollIntoView({ behavior: "smooth" });
  }

  function fallbackToForm() {
    statusEl.textContent = "";
    const userText = state.transcript
      .filter((t) => t.role === "user")
      .map((t) => t.text)
      .join("\n\n");
    document.getElementById("description").value = userText;
    submitForm.dataset.transcript = JSON.stringify(state.transcript);
    submitForm.dataset.language = currentLang();
    submitForm.dataset.source = "form";
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    alert(pick(FALLBACK_ALERT_TEXT));
    submitForm.scrollIntoView({ behavior: "smooth" });
  }

  nextBtn.addEventListener("click", handleNext);
  answerEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!nextBtn.disabled) handleNext();
    }
  });
}

document.addEventListener("DOMContentLoaded", initInterviewFlow);
```

- [ ] **Step 2: Manual QA (deferred to Task 10's matrix).** No commit yet if paired with Task 9; otherwise:

```bash
git add interview.js
git commit -m "feat(intake): adaptive client loop over transcript + coverage"
```

---

## Task 9: Wire `transcript` + `language` into the submit payload (`contribute.html`)

**Files:**
- Modify: `contribute.html` (submit handler at ~line 724; input maxlength at line 387; new i18n keys)

- [ ] **Step 1: Extend the submit payload**

In `contribute.html`, in the `submitForm` submit handler, replace the `payload` object (currently lines ~724–731) with:

```js
  const payload = {
    kind: document.getElementById("kind").value,
    site: document.getElementById("site").value,
    description: document.getElementById("description").value,
    contact: document.getElementById("contact").value,
    visibility: form.querySelector('input[name="visibility"]:checked').value,
    source: form.dataset.source || "form",
  };
  if (form.dataset.language) payload.language = form.dataset.language;
  if (form.dataset.transcript) {
    try { payload.transcript = JSON.parse(form.dataset.transcript); } catch {}
  }
```

- [ ] **Step 2: Raise the answer box limit for storytelling**

On line 387, change `maxlength="2000"` on `#interviewAnswer` to `maxlength="4000"` (matches `MAX_TURN_LENGTH` in validation).

- [ ] **Step 3: Update the interview notice copy (optional but recommended)**

The `intake.notice` string (line 385, key `intake.notice`) still says "guided by an AI assistant." Update its EN/中/ไทย values in the page's inline `I18N` dictionary to introduce Jake and the honest AI framing, e.g. EN: "You're chatting with Jake, an AI helper for this archive. A human volunteer reads everything before anything is published." Keep the existing `data-i18n="intake.notice"` binding.

- [ ] **Step 4: Manual QA — full matrix on the deployed preview**

Run `npx wrangler dev`, open `http://localhost:8787/contribute.html` (NOT `file://` — ES module imports are blocked on `file://`, per last session). Verify:

- [ ] Switch to "Have a conversation instead" → Jake's opening bubble appears.
- [ ] A clear shrine story over 3–4 turns → Jake asks adaptive follow-ups (not the old fixed questions) → conversation wraps → the form pre-fills with `kind`, `site=S05`, and a `description` in your words; `aiDraftNotice` is visible.
- [ ] A vague transcript where no site is clear → on wrap, the `site` select lands on "other" and is focused (missing-place handling).
- [ ] Reach the turn cap (keep answering) → conversation wraps at 7 contributor turns even if coverage is incomplete.
- [ ] Submit the reviewed draft → network shows `POST /api/submit` with `transcript` (array) and `language` in the body → success state shows → the Airtable row has `Transcript` and `Language` populated.
- [ ] Repeat the happy path in 中文 and ไทย (switch language before starting) → Jake replies in that language; `language` in the submit payload matches.
- [ ] Force a follow-up error (temporarily point `ANTHROPIC_API_KEY` at an unfunded key or block the route) → the fallback form appears with your answers preserved in `description`; nothing is lost.

- [ ] **Step 5: Commit**

```bash
git add contribute.html interview.js
git commit -m "feat(intake): submit transcript+language; Jake intro copy; longer answer box"
```

---

## Task 10: Full verification + deploy check

- [ ] **Step 1: Run the whole unit suite**

Run: `npm test`
Expected: PASS across `interview-state.test.js`, `functions/_lib/claude.test.js`, `functions/_lib/validation.test.js`, `functions/_lib/airtable.test.js`.

- [ ] **Step 2: Confirm `.assetsignore` still excludes server-only code.** No new server directories were added in Phase A, so `.assetsignore` needs no change. Verify `functions`, `src`, `docs`, `*.test.js` are still listed.

- [ ] **Step 3: Invoke `superpowers:verification-before-completion`** before declaring Phase A done — run the commands above and confirm output, don't assert from memory. Three of three "bugs" last session were environment issues (`file://` vs live URL, unpushed commits, Anthropic billing); check those first if something looks broken.

- [ ] **Step 4: Push (user runs this from their own Terminal).** The sandbox cannot push (egress blocked). Hand the user:

```bash
git push
```

Then verify one full conversation on the deployed Worker URL (`https://chula-powermap.yvette-geyanqin.workers.dev/contribute.html`), not just locally.

---

## Out of scope for Phase A (tracked for later)

- Voice recording, consent gate, `/api/voice`, R2, Whisper, audio in the submission → **Phase B**.
- Jake avatar states, chat background, the ~12-second intro animation → **Phase C**.
- Retention policy and per-turn vs stitched audio (open questions O1/O2 in the spec) → decided before Phase B.
