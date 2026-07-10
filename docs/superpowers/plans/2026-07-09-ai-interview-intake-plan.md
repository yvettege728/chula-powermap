# AI 对话式取证功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a conversational AI intake path to `submit.html` that asks three fixed questions, optionally one AI-generated follow-up, then synthesizes the answers into the existing form fields (kind/site/description) for the contributor to review and submit — backed by three Cloudflare Pages Functions and an Airtable datastore.

**Architecture:** Static frontend (`interview.js`) drives a short fixed-question flow, calling two Cloudflare Pages Functions (`/api/followup`, `/api/synthesize`) that each make exactly one Claude API call. The synthesized result populates the *existing* `#submitForm` fields instead of a new parallel UI. A third function (`/api/submit`) writes the final confirmed record to Airtable. No client ever sees the Anthropic or Airtable credentials.

**Tech Stack:** Vanilla JS (no build step, matches existing codebase), Cloudflare Pages Functions (Node-compatible edge runtime, native `fetch`), Claude API (`claude-haiku-4-5-20251001` — cheap/fast, appropriate for two bounded, well-scoped calls per submission), Airtable REST API. Tests use Node's built-in `node:test` runner (zero new dependencies) against the pure-logic helpers; the DOM-facing parts are verified with a manual QA script (see Task 10) since adding a browser-automation framework to this build-free project would be scope creep.

---

## Spec Coverage Map

Every numbered section of `docs/superpowers/specs/2026-07-09-ai-interview-intake-design.md` maps to a task below:

- §3.1 entry toggle → Task 7
- §3.2 `interview.js` conversational flow → Task 6, Task 7
- §3.3 shared confirm card (simplified to reuse `#submitForm`) → Task 7, Task 8
- §4.1 `/api/followup` → Task 3
- §4.2 `/api/synthesize` → Task 4
- §4.3 `/api/submit` → Task 5
- §5 guardrails (call cap, prompt constraints, rate limiting, transparency, human review) → Tasks 1, 2, 3, 4, 9
- §6 Airtable schema → Task 2, Task 9
- §7 test plan → Task 10
- §8 out of scope → not implemented (confirmed absent by design)

---

## Task 0: Project Scaffolding & Account Setup

**Files:**
- Create: `package.json`
- Create: `functions/` (empty directory, populated in later tasks)

No code logic yet — this task is infrastructure and account setup, not TDD.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "chula-powermap",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test functions/_lib/ interview-state.test.js"
  }
}
```

- [ ] **Step 2: Create the Airtable base**

Go to airtable.com, create a new base called "Chula Powermap Submissions". Inside it, create one table named exactly `Submissions` with these fields (types matter — Airtable will reject writes with mismatched types):

| Field name | Field type |
|---|---|
| Timestamp | Date (include time) |
| Kind | Single line text |
| Site | Single line text |
| Description | Long text |
| Contact | Single line text |
| Visibility | Single select — options: `private`, `public-anon`, `public-named` |
| Source | Single select — options: `form`, `ai-interview` |
| Status | Single select — options: `unread`, `read`, `published`, `rejected` (default `unread`) |

Then go to airtable.com/create/tokens, create a Personal Access Token scoped to this one base with `data.records:write` and `data.records:read` permissions. Copy the token (starts with `pat...`) and the base ID (starts with `app...`, visible in the base's API docs page or its URL) — you'll need both in Task 9.

- [ ] **Step 3: Get an Anthropic API key**

Go to console.anthropic.com, create an API key. You'll set this as a Cloudflare environment variable in Task 9 — never paste it into any file in this repo.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: scaffold package.json for AI interview intake feature"
```

---

## Task 1: `functions/_lib/claude.js` — Claude API request builders

**Files:**
- Create: `functions/_lib/claude.js`
- Test: `functions/_lib/claude.test.js`

The two request-builder functions are pure (no network I/O) so they're fully unit-testable. The actual `callClaude` fetch wrapper is thin and covered by manual QA (Task 10), not unit tests, since mocking `fetch` for a true external API adds little value here.

- [ ] **Step 1: Write the failing tests**

```js
// functions/_lib/claude.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFollowupRequest, buildSynthesizeRequest } from "./claude.js";

test("buildFollowupRequest embeds all three answers and caps output size", () => {
  const req = buildFollowupRequest([
    "I saw the eviction notice posted on the shrine door.",
    "Around June 2020, at Block 33.",
    "My neighbor Somchai was there too, but he moved away.",
  ]);
  assert.equal(req.model, "claude-haiku-4-5-20251001");
  assert.ok(req.max_tokens <= 300, "follow-up responses should be short");
  assert.match(req.system, /do not.*(name|contact)/i);
  const userText = req.messages[0].content;
  assert.match(userText, /eviction notice/);
  assert.match(userText, /Block 33/);
  assert.match(userText, /Somchai/);
});

test("buildSynthesizeRequest includes the optional follow-up answer when present", () => {
  const req = buildSynthesizeRequest(
    ["A", "B", "C"],
    "It was definitely a lease non-renewal, not a fire."
  );
  assert.match(req.messages[0].content, /lease non-renewal/);
  assert.match(req.system, /only.*(reorganiz|structure|summariz)/i);
});

test("buildSynthesizeRequest omits follow-up section when there is none", () => {
  const req = buildSynthesizeRequest(["A", "B", "C"], undefined);
  assert.doesNotMatch(req.messages[0].content, /Follow-up/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test functions/_lib/claude.test.js`
Expected: FAIL — `Cannot find module './claude.js'` (file doesn't exist yet)

- [ ] **Step 3: Write the implementation**

```js
// functions/_lib/claude.js

const MODEL = "claude-haiku-4-5-20251001";

const FOLLOWUP_SYSTEM = `You are an archival-intake assistant for a public history project documenting displacement in Bangkok. You are given three answers a contributor gave about a piece of evidence they are sharing.

Decide whether ONE critical fact is missing: a specific place, an approximate year, or whether the contributor was a direct witness, a participant, or heard about it secondhand.

Rules you must follow:
- Do not ask for the contributor's real name, contact information, or any identifying detail.
- Do not ask a leading question that presupposes blame or a conclusion.
- Ask at most one question, in plain neutral language, under 30 words.
- If nothing critical is missing, respond with exactly: null

Respond with ONLY a JSON object of the shape {"followup_question": string | null}. No other text.`;

const SYNTHESIZE_SYSTEM = `You are an archival-intake assistant. You are given a contributor's answers about a piece of evidence and must reorganize them into a structured entry.

Rules you must follow:
- Only reorganize and summarize what the contributor actually said. Do not add any fact, name, place, or detail they did not mention.
- Preserve their first-person voice and tone.
- For "kind", choose the single best match from: testimony, photograph, document, drawing, link, other.
- For "site", choose the single best match from: S05, S01, S04, S09, S10, S08, S03, S06, S07, other. If unclear, use "other".
- For "description", write a clean, readable synthesis (not a bullet list) preserving the contributor's own words as much as possible.

Respond with ONLY a JSON object of the shape {"kind": string, "site": string, "description": string}. No other text.`;

export function buildFollowupRequest(answers) {
  const [what, whenWhere, whoElse] = answers;
  const userText = [
    `Answer 1 (what happened): ${what}`,
    `Answer 2 (when/where): ${whenWhere}`,
    `Answer 3 (who else witnessed or experienced this): ${whoElse}`,
  ].join("\n\n");

  return {
    model: MODEL,
    max_tokens: 200,
    system: FOLLOWUP_SYSTEM,
    messages: [{ role: "user", content: userText }],
  };
}

export function buildSynthesizeRequest(answers, followupAnswer) {
  const [what, whenWhere, whoElse] = answers;
  const parts = [
    `Answer 1 (what happened): ${what}`,
    `Answer 2 (when/where): ${whenWhere}`,
    `Answer 3 (who else witnessed or experienced this): ${whoElse}`,
  ];
  if (followupAnswer) {
    parts.push(`Follow-up answer: ${followupAnswer}`);
  }

  return {
    model: MODEL,
    max_tokens: 800,
    system: SYNTHESIZE_SYSTEM,
    messages: [{ role: "user", content: parts.join("\n\n") }],
  };
}

export async function callClaude(apiKey, requestBody) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.content[0].text;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test functions/_lib/claude.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/claude.js functions/_lib/claude.test.js
git commit -m "feat: add Claude request builders with guardrail system prompts"
```

---

## Task 2: `functions/_lib/airtable.js` — Airtable record builder

**Files:**
- Create: `functions/_lib/airtable.js`
- Test: `functions/_lib/airtable.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// functions/_lib/airtable.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAirtableRecord } from "./airtable.js";

test("buildAirtableRecord maps a public submission with contact", () => {
  const record = buildAirtableRecord({
    kind: "testimony",
    site: "S05",
    description: "I remember the shrine before the fence went up.",
    contact: "someone@example.com",
    visibility: "public-named",
    source: "ai-interview",
  });
  assert.equal(record.fields.Kind, "testimony");
  assert.equal(record.fields.Site, "S05");
  assert.equal(record.fields.Visibility, "public-named");
  assert.equal(record.fields.Source, "ai-interview");
  assert.equal(record.fields.Status, "unread");
  assert.equal(record.fields.Contact, "someone@example.com");
  assert.ok(record.fields.Timestamp); // ISO string, exact value not asserted
});

test("buildAirtableRecord omits Contact field entirely when not provided", () => {
  const record = buildAirtableRecord({
    kind: "photograph",
    site: "S01",
    description: "Old market photo.",
    contact: "",
    visibility: "private",
    source: "form",
  });
  assert.equal(record.fields.Contact, undefined);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test functions/_lib/airtable.test.js`
Expected: FAIL — `Cannot find module './airtable.js'`

- [ ] **Step 3: Write the implementation**

```js
// functions/_lib/airtable.js

export function buildAirtableRecord(payload) {
  const fields = {
    Timestamp: new Date().toISOString(),
    Kind: payload.kind,
    Site: payload.site,
    Description: payload.description,
    Visibility: payload.visibility,
    Source: payload.source,
    Status: "unread",
  };
  if (payload.contact) {
    fields.Contact = payload.contact;
  }
  return { fields };
}

export async function submitToAirtable(token, baseId, tableName, record) {
  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ records: [record] }),
    }
  );
  if (!res.ok) {
    throw new Error(`Airtable API error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test functions/_lib/airtable.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/airtable.js functions/_lib/airtable.test.js
git commit -m "feat: add Airtable record builder"
```

---

## Task 3: `functions/api/followup.js` — Cloudflare Pages Function

**Files:**
- Create: `functions/api/followup.js`
- Test: `functions/api/validation.test.js` (validation logic extracted so it's testable without a live HTTP request)
- Create: `functions/_lib/validation.js`

Cloudflare Pages Functions route by file path: this file becomes `POST /api/followup` automatically once deployed. Input validation is pulled into a pure function in `_lib/validation.js` so it can be unit tested; the Cloudflare-specific `onRequestPost` wrapper is thin and verified manually (Task 10).

- [ ] **Step 1: Write the failing test for validation**

```js
// functions/_lib/validation.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAnswers } from "./validation.js";

test("validateAnswers accepts exactly three non-empty strings under the length cap", () => {
  const result = validateAnswers(["a", "b", "c"]);
  assert.equal(result.ok, true);
});

test("validateAnswers rejects wrong count", () => {
  const result = validateAnswers(["a", "b"]);
  assert.equal(result.ok, false);
  assert.match(result.error, /exactly 3/);
});

test("validateAnswers rejects empty strings", () => {
  const result = validateAnswers(["a", "", "c"]);
  assert.equal(result.ok, false);
});

test("validateAnswers rejects answers over 2000 characters", () => {
  const tooLong = "x".repeat(2001);
  const result = validateAnswers(["a", "b", tooLong]);
  assert.equal(result.ok, false);
  assert.match(result.error, /2000/);
});

test("validateAnswers accepts answers at exactly 2000 characters", () => {
  const atLimit = "x".repeat(2000);
  const result = validateAnswers(["a", "b", atLimit]);
  assert.equal(result.ok, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test functions/_lib/validation.test.js`
Expected: FAIL — `Cannot find module './validation.js'`

- [ ] **Step 3: Write the validation implementation**

```js
// functions/_lib/validation.js

const MAX_ANSWER_LENGTH = 2000;

export function validateAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== 3) {
    return { ok: false, error: "answers must be an array of exactly 3 strings" };
  }
  for (const a of answers) {
    if (typeof a !== "string" || a.trim().length === 0) {
      return { ok: false, error: "each answer must be a non-empty string" };
    }
    if (a.length > MAX_ANSWER_LENGTH) {
      return { ok: false, error: `each answer must be ${MAX_ANSWER_LENGTH} characters or fewer` };
    }
  }
  return { ok: true };
}

export function validateSubmitPayload(payload) {
  const VALID_VISIBILITY = ["private", "public-anon", "public-named"];
  const VALID_SOURCE = ["form", "ai-interview"];

  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "payload must be an object" };
  }
  if (typeof payload.kind !== "string" || payload.kind.trim().length === 0) {
    return { ok: false, error: "kind is required" };
  }
  if (typeof payload.site !== "string" || payload.site.trim().length === 0) {
    return { ok: false, error: "site is required" };
  }
  if (typeof payload.description !== "string" || payload.description.trim().length === 0) {
    return { ok: false, error: "description is required" };
  }
  if (!VALID_VISIBILITY.includes(payload.visibility)) {
    return { ok: false, error: `visibility must be one of ${VALID_VISIBILITY.join(", ")}` };
  }
  if (!VALID_SOURCE.includes(payload.source)) {
    return { ok: false, error: `source must be one of ${VALID_SOURCE.join(", ")}` };
  }
  if (payload.description.length > 20000) {
    return { ok: false, error: "description must be 20000 characters or fewer" };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test functions/_lib/validation.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Write `functions/api/followup.js`**

```js
// functions/api/followup.js
import { buildFollowupRequest, callClaude } from "../_lib/claude.js";
import { validateAnswers } from "../_lib/validation.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  const validation = validateAnswers(body.answers);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400);
  }

  const claudeRequest = buildFollowupRequest(body.answers);

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
    // If Claude didn't return valid JSON, fail safe: no follow-up question.
    return jsonResponse({ followup_question: null });
  }

  return jsonResponse({ followup_question: parsed.followup_question ?? null });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
```

- [ ] **Step 6: Commit**

```bash
git add functions/api/followup.js functions/_lib/validation.js functions/_lib/validation.test.js
git commit -m "feat: add /api/followup Cloudflare Pages Function"
```

---

## Task 4: `functions/api/synthesize.js` — Cloudflare Pages Function

**Files:**
- Create: `functions/api/synthesize.js`

Reuses `validateAnswers` from Task 3 — no new pure logic to test here beyond what Task 3 already covers, so this task is implementation-only (the request/response shape is verified in Task 10's manual QA).

- [ ] **Step 1: Write `functions/api/synthesize.js`**

```js
// functions/api/synthesize.js
import { buildSynthesizeRequest, callClaude } from "../_lib/claude.js";
import { validateAnswers } from "../_lib/validation.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  const validation = validateAnswers(body.answers);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400);
  }
  if (body.followup_answer !== undefined && typeof body.followup_answer !== "string") {
    return jsonResponse({ error: "followup_answer must be a string when present" }, 400);
  }

  const claudeRequest = buildSynthesizeRequest(body.answers, body.followup_answer);

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
    // Fail safe: hand the raw answers back as an unstructured draft rather than erroring out.
    return jsonResponse({
      kind: "other",
      site: "other",
      description: body.answers.join("\n\n"),
    });
  }

  return jsonResponse({
    kind: parsed.kind ?? "other",
    site: parsed.site ?? "other",
    description: parsed.description ?? body.answers.join("\n\n"),
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add functions/api/synthesize.js
git commit -m "feat: add /api/synthesize Cloudflare Pages Function"
```

---

## Task 5: `functions/api/submit.js` — Cloudflare Pages Function

**Files:**
- Create: `functions/api/submit.js`

Uses `validateSubmitPayload` (already written and tested in Task 3) and `buildAirtableRecord`/`submitToAirtable` (Task 2).

- [ ] **Step 1: Write `functions/api/submit.js`**

```js
// functions/api/submit.js
import { buildAirtableRecord, submitToAirtable } from "../_lib/airtable.js";
import { validateSubmitPayload } from "../_lib/validation.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  const validation = validateSubmitPayload(body);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400);
  }

  const record = buildAirtableRecord(body);

  try {
    await submitToAirtable(
      env.AIRTABLE_TOKEN,
      env.AIRTABLE_BASE_ID,
      env.AIRTABLE_TABLE_NAME,
      record
    );
  } catch (err) {
    return jsonResponse({ error: "failed to save submission", detail: String(err) }, 502);
  }

  return jsonResponse({ ok: true });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add functions/api/submit.js
git commit -m "feat: add /api/submit Cloudflare Pages Function"
```

---

## Task 6: `interview-state.js` — pure conversation-state logic

**Files:**
- Create: `interview-state.js`
- Test: `interview-state.test.js`

This is a standalone pure-logic module with no DOM references, kept in its own file (rather than sharing a file with the DOM-wiring code from Task 7) so that `node --test` can import it directly without a browser or jsdom — importing a file that touches `document` would throw in plain Node.

- [ ] **Step 1: Write the failing test**

```js
// interview-state.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { nextStep, FIXED_QUESTIONS } from "./interview-state.js";

test("FIXED_QUESTIONS has exactly 3 entries", () => {
  assert.equal(FIXED_QUESTIONS.length, 3);
});

test("nextStep advances through fixed questions in order", () => {
  assert.equal(nextStep({ step: "q0" }), "q1");
  assert.equal(nextStep({ step: "q1" }), "q2");
  assert.equal(nextStep({ step: "q2" }), "checking-followup");
});

test("nextStep goes to followup-question when the API returned one", () => {
  const state = { step: "checking-followup", followupQuestion: "When did this happen?" };
  assert.equal(nextStep(state), "followup-question");
});

test("nextStep skips straight to synthesizing when there is no follow-up", () => {
  const state = { step: "checking-followup", followupQuestion: null };
  assert.equal(nextStep(state), "synthesizing");
});

test("nextStep goes from followup-question to synthesizing once answered", () => {
  assert.equal(nextStep({ step: "followup-question" }), "synthesizing");
});

test("nextStep goes from synthesizing to done", () => {
  assert.equal(nextStep({ step: "synthesizing" }), "done");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test interview-state.test.js`
Expected: FAIL — `Cannot find module './interview-state.js'`

- [ ] **Step 3: Write `interview-state.js`**

```js
// interview-state.js
// Pure state-transition logic only — no DOM references. Consumed by
// interview.js (Task 7, browser) and by interview-state.test.js (Node).

export const FIXED_QUESTIONS = [
  "What happened?",
  "Roughly when and where?",
  "Did anyone else experience or witness this? (No need to name them.)",
];

const MAX_ANSWER_LENGTH = 2000;

export function nextStep(state) {
  switch (state.step) {
    case "q0": return "q1";
    case "q1": return "q2";
    case "q2": return "checking-followup";
    case "checking-followup":
      return state.followupQuestion ? "followup-question" : "synthesizing";
    case "followup-question": return "synthesizing";
    case "synthesizing": return "done";
    default: return state.step;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test interview-state.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add interview-state.js interview-state.test.js
git commit -m "feat: add interview conversation state machine"
```

---

## Task 7: `interview.js` — DOM wiring, imports `interview-state.js`

**Files:**
- Modify: `submit.html`
- Create: `interview.js`

This task is UI wiring, verified manually per the QA script in Task 10 rather than with `node:test` (no DOM test runner exists in this project, and adding one would be scope creep for a static, build-free site). `interview.js` imports the pure logic from Task 6's `interview-state.js` rather than duplicating it, and is never imported by the Node test suite, so it's safe for it to reference `document` freely.

- [ ] **Step 1: Add the entry toggle and interview container to `submit.html`**

Find this block in `submit.html` (inside `.submit-shell`, right before `<form class="submit-form" id="submitForm">`):

```html
      <form class="submit-form" id="submitForm">
```

Replace it with:

```html
      <div class="intake-toggle" id="intakeToggle">
        <button type="button" class="intake-toggle-btn is-active" data-mode="form">Fill out the form</button>
        <button type="button" class="intake-toggle-btn" data-mode="interview">Have a conversation instead</button>
      </div>

      <div class="interview-flow" id="interviewFlow" hidden>
        <div class="interview-notice">This conversation is guided by an AI assistant to help organize what you share. A human volunteer will read everything before anything is published.</div>
        <div class="interview-question" id="interviewQuestion"></div>
        <textarea class="form-textarea interview-answer" id="interviewAnswer" maxlength="2000"></textarea>
        <div class="interview-actions">
          <button type="button" class="btn-primary" id="interviewNext">Next</button>
          <span class="interview-status" id="interviewStatus"></span>
        </div>
      </div>

      <form class="submit-form" id="submitForm">
```

- [ ] **Step 2: Add supporting CSS**

Find the `<style>` block in `submit.html` (it currently ends with `.privacy-note strong { color: var(--signal-yellow); font-weight: 600; }`). Add immediately after that line:

```css
  .intake-toggle { display: flex; gap: 8px; margin-top: 24px; }
  .intake-toggle-btn {
    flex: 1; padding: 12px 16px; background: transparent;
    border: 1px solid var(--line-mid); color: var(--text-dim);
    font-family: var(--f-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: border-color 160ms, color 160ms;
  }
  .intake-toggle-btn.is-active { border-color: var(--signal-yellow); color: var(--signal-yellow); }
  .interview-flow {
    background: rgba(26, 20, 40, 0.65); border: 1px solid var(--line-mid);
    padding: 28px 32px; margin-top: 20px;
  }
  .interview-notice {
    font-family: var(--f-body); font-size: 12.5px; font-style: italic;
    color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5;
  }
  .interview-question {
    font-family: var(--f-body); font-size: 16px; color: var(--text-primary);
    margin-bottom: 12px; line-height: 1.5;
  }
  .interview-answer { min-height: 100px; }
  .interview-actions {
    margin-top: 16px; display: flex; align-items: center; gap: 16px;
  }
  .interview-status {
    font-family: var(--f-mono); font-size: 11px; color: var(--text-secondary);
  }
  .ai-draft-notice {
    background: rgba(242, 201, 76, 0.1); border-left: 3px solid var(--signal-yellow);
    padding: 12px 16px; margin-bottom: 20px;
    font-family: var(--f-body); font-size: 13px; color: var(--text-dim);
  }
```

- [ ] **Step 3: Add `id="aiDraftNotice"` placeholder above the form fields**

Find this line in `submit.html`:

```html
        <div class="form-group">
          <label class="form-label" for="kind">§ 01 · What kind of material?</label>
```

Replace it with:

```html
        <div class="ai-draft-notice" id="aiDraftNotice" hidden>AI-assisted draft — please check it over before sending. Every field below is still yours to edit.</div>

        <div class="form-group">
          <label class="form-label" for="kind">§ 01 · What kind of material?</label>
```

- [ ] **Step 4: Create `interview.js`**

```js
// interview.js
// DOM wiring for the conversational intake flow. Not unit tested — verified
// via manual QA (plan Task 10). Never imported by the Node test suite, so it
// is safe for this file to reference `document`/`fetch`-in-browser freely.
import { FIXED_QUESTIONS, nextStep } from "./interview-state.js";

function initInterviewFlow() {
  const toggle = document.getElementById("intakeToggle");
  const interviewFlow = document.getElementById("interviewFlow");
  const submitForm = document.getElementById("submitForm");
  if (!toggle || !interviewFlow || !submitForm) return; // not on this page

  const questionEl = document.getElementById("interviewQuestion");
  const answerEl = document.getElementById("interviewAnswer");
  const nextBtn = document.getElementById("interviewNext");
  const statusEl = document.getElementById("interviewStatus");
  const aiDraftNotice = document.getElementById("aiDraftNotice");

  const answers = [];
  let state = { step: "q0", followupQuestion: null };
  let followupAnswer;

  toggle.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggle.querySelectorAll("[data-mode]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const mode = btn.dataset.mode;
      interviewFlow.hidden = mode !== "interview";
      submitForm.hidden = mode === "interview";
      if (mode === "interview") renderStep();
    });
  });

  function renderStep() {
    if (state.step === "q0" || state.step === "q1" || state.step === "q2") {
      const idx = Number(state.step[1]);
      questionEl.textContent = FIXED_QUESTIONS[idx];
      answerEl.value = "";
      answerEl.disabled = false;
      nextBtn.disabled = false;
      statusEl.textContent = "";
    } else if (state.step === "followup-question") {
      questionEl.textContent = state.followupQuestion;
      answerEl.value = "";
      answerEl.disabled = false;
      nextBtn.disabled = false;
      statusEl.textContent = "";
    }
  }

  async function handleNext() {
    const value = answerEl.value.trim();
    if (!value) return;

    if (state.step === "q0" || state.step === "q1" || state.step === "q2") {
      answers.push(value);
      if (state.step === "q2") {
        nextBtn.disabled = true;
        statusEl.textContent = "Thinking…";
        try {
          const res = await fetch("/api/followup", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ answers }),
          });
          if (!res.ok) throw new Error("followup request failed");
          const data = await res.json();
          state = { step: "checking-followup", followupQuestion: data.followup_question };
        } catch {
          return fallbackToForm();
        }
      } else {
        state = { step: nextStep(state) };
        renderStep();
        return;
      }
    } else if (state.step === "followup-question") {
      followupAnswer = value;
    }

    state = { step: nextStep(state), followupQuestion: state.followupQuestion };

    if (state.step === "followup-question") {
      renderStep();
      return;
    }

    if (state.step === "synthesizing") {
      nextBtn.disabled = true;
      statusEl.textContent = "Organizing your answers…";
      try {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers, followup_answer: followupAnswer }),
        });
        if (!res.ok) throw new Error("synthesize request failed");
        const draft = await res.json();
        applyDraftToForm(draft);
        return;
      } catch {
        return fallbackToForm();
      }
    }
  }

  function applyDraftToForm(draft) {
    document.getElementById("kind").value = draft.kind;
    document.getElementById("site").value = draft.site;
    document.getElementById("description").value = draft.description;
    aiDraftNotice.hidden = false;
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    submitForm.dataset.source = "ai-interview";
    submitForm.scrollIntoView({ behavior: "smooth" });
  }

  function fallbackToForm() {
    statusEl.textContent = "";
    document.getElementById("description").value = answers.join("\n\n");
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    submitForm.dataset.source = "form";
    alert("The AI assistant is temporarily unavailable, so we've carried your answers into the form below — please review and send it directly.");
    submitForm.scrollIntoView({ behavior: "smooth" });
  }

  nextBtn.addEventListener("click", handleNext);
  renderStep();
}

document.addEventListener("DOMContentLoaded", initInterviewFlow);
```

- [ ] **Step 5: Add the script tag to `submit.html`**

Find this line near the bottom of `submit.html`:

```html
<script src="dither.js"></script>
```

Replace it with:

```html
<script src="dither.js"></script>
<script type="module" src="interview.js"></script>
```

- [ ] **Step 6: Commit**

```bash
git add submit.html interview.js interview-state.js
git commit -m "feat: wire conversational intake flow into submit.html"
```

---

## Task 8: Point the existing submit handler at `/api/submit`

**Files:**
- Modify: `submit.html`

The current handler (bottom of `submit.html`) is a fake demo that never sends anything anywhere. Replace it with a real call to `/api/submit`, keeping the existing success-message UI and adding a distinct failure state (never silently pretend success).

- [ ] **Step 1: Replace the existing submit handler**

Find this block at the bottom of `submit.html`:

```html
<script>
document.getElementById("submitForm").addEventListener("submit", (e) => {
  e.preventDefault();
  // demo only — no actual backend
  document.getElementById("submitForm").style.display = "none";
  document.getElementById("formSuccess").classList.add("show");
  window.scrollTo({ top: 200, behavior: "smooth" });
});
</script>
```

Replace it with:

```html
<script>
document.getElementById("submitForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  const payload = {
    kind: document.getElementById("kind").value,
    site: document.getElementById("site").value,
    description: document.getElementById("description").value,
    contact: document.getElementById("contact").value,
    visibility: form.querySelector('input[name="visibility"]:checked').value,
    source: form.dataset.source || "form",
  };

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("submit failed");
    form.style.display = "none";
    document.getElementById("formSuccess").classList.add("show");
    window.scrollTo({ top: 200, behavior: "smooth" });
  } catch {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send submission";
    alert("Something went wrong sending your submission. Nothing was lost — please try again in a moment.");
  }
});
</script>
```

- [ ] **Step 2: Commit**

```bash
git add submit.html
git commit -m "feat: connect submit form to /api/submit instead of demo handler"
```

---

## Task 9: Deployment configuration

**Files:** none (dashboard/console configuration only)

- [ ] **Step 1: Connect the repo to Cloudflare Pages**

In the Cloudflare dashboard: Workers & Pages → Create → Pages → connect to the GitHub repo for this project (push the local repo there first if it isn't already; this is a manual step outside this plan's scope, and outside what an agent can do on the user's behalf). Build settings: no build command, output directory `/` (repo root, since this is the build-free static site).

- [ ] **Step 2: Set environment variables**

In the Pages project's Settings → Environment variables, add for both Production and Preview:
- `ANTHROPIC_API_KEY` — from Task 0, Step 3
- `AIRTABLE_TOKEN` — from Task 0, Step 2
- `AIRTABLE_BASE_ID` — from Task 0, Step 2
- `AIRTABLE_TABLE_NAME` — value: `Submissions`

- [ ] **Step 3: Add a rate limiting rule**

In the Cloudflare dashboard for the zone serving this Pages project: Security → WAF → Rate limiting rules → create a rule matching path `/api/*`, limit 10 requests per hour per IP, action: Block. This is the enforcement layer for the design doc's abuse-prevention requirement (§5) and is deliberately kept out of the Function code — dashboard-level rate limiting is more robust than anything hand-rolled in a stateless serverless function.

- [ ] **Step 4: Deploy and verify**

Trigger a deploy (push to the connected branch). Confirm in the Cloudflare dashboard that the deploy succeeded and that `functions/api/followup.js`, `synthesize.js`, and `submit.js` are listed as detected functions.

---

## Task 10: Manual end-to-end QA

**Files:** none (manual verification against the live deployment from Task 9)

Run through each scenario on the deployed site (not `localhost`, since the Functions need real environment variables to call Claude and Airtable):

- [ ] **Scenario 1 — first-person testimony.** Click "Have a conversation instead." Answer: "I saw the eviction notice posted on the shrine door." / "June 2020, at Block 33." / "My neighbor Somchai was there too." Confirm a follow-up question appears only if genuinely useful (e.g., asking whether you witnessed it directly), confirm the synthesized description contains only facts from your three answers (no invented names, dates, or places), confirm `kind` and `site` are reasonable guesses, confirm the "AI-assisted draft" notice is visible above the form.

- [ ] **Scenario 2 — document description.** Answer as if describing a lease document you have. Confirm `kind` resolves to `document`.

- [ ] **Scenario 3 — refusal edge case.** For the "who else witnessed this" question, answer "I'd rather not say." Confirm the flow does not get stuck and still reaches a synthesized draft.

- [ ] **Visibility/contact check.** Complete the interview flow, fill in a contact value, select visibility `private`. Submit. In Airtable, confirm the record's `Visibility` is `private` and that no public-facing page displays this contact value anywhere (there is currently no public-facing display of submissions at all, so this should trivially pass — re-check this item if a public submissions view is ever added).

- [ ] **Network failure fallback.** With devtools open, throttle to "Offline" right after answering the third fixed question, click Next. Confirm the flow falls back to the plain form with your three answers already concatenated into the description field, and that no data was lost.

- [ ] **Rate limit check.** Send 11 requests to `/api/followup` from the same IP within an hour (a simple shell loop with `curl` works). Confirm the 11th is blocked by the Cloudflare rate limiting rule from Task 9.
