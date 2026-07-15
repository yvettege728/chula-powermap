# Phase B — Voice Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a contributor speak an answer instead of typing it. Record audio in the browser (with an explicit one-time consent gate), store one clip per spoken turn in Cloudflare R2, transcribe it with Workers AI Whisper, feed the transcript into the existing Phase A conversation loop, and link the audio clips to the submission. Audio is kept as the canonical record; the transcript is a correctable convenience.

**Architecture:** A new `/api/voice` Worker route receives an audio blob, stores it in an R2 bucket keyed by session+turn, runs Whisper (`@cf/openai/whisper`), and returns `{ transcript, key }`. The browser (`interview.js`) treats a spoken turn exactly like a typed one once it has the transcript, and remembers the R2 key. On submit, the keys travel with the payload; a `GET /api/audio/:key` route streams clips back for the archive so the R2 bucket stays private. Retention: kept indefinitely, deleted only on request (spec O1); one clip per turn (spec O2).

**Tech Stack:** Cloudflare Workers, R2 (`AUDIO_BUCKET` binding), Workers AI (`AI` binding, `@cf/openai/whisper`), browser `MediaRecorder`, `node --test`. Builds on Phase A.

**Spec:** `docs/superpowers/specs/2026-07-15-conversational-intake-redesign-design.md` Section 6; decisions D4, O1, O2.

**Depends on:** Phase A merged and working.

---

## Prerequisites (manual, one-time)

- [ ] **P1 — Create the R2 bucket.** `npx wrangler r2 bucket create chula-powermap-audio` (or via the Cloudflare dashboard). Note the exact bucket name for `wrangler.jsonc`.
- [ ] **P2 — Confirm Workers AI is enabled** on the account (Workers AI is available on the Workers Free/Paid plans; Whisper billed per audio-second). No key needed — it uses the `AI` binding.
- [ ] **P3 — Add an `Audio` column** (Long text) to the Airtable submissions table for the clip references.

## File structure

| File | Responsibility | Change |
|------|----------------|--------|
| `wrangler.jsonc` | Bindings | Add `r2_buckets` (`AUDIO_BUCKET`) + `ai` (`AI`) |
| `functions/_lib/voice.js` | Pure helpers: R2 key, upload validation | Create |
| `functions/_lib/voice.test.js` | Unit tests | Create |
| `functions/api/voice.js` | POST: store + transcribe; GET: stream clip | Create |
| `src/index.js` | Route `/api/voice` + `/api/audio/:key` | Modify |
| `functions/_lib/validation.js` | Accept optional `audioClips` in submit payload | Modify |
| `functions/_lib/validation.test.js` | Tests for `audioClips` | Modify |
| `functions/_lib/airtable.js` | Add `Audio` field | Modify |
| `functions/_lib/airtable.test.js` | Test `Audio` field | Modify |
| `interview.js` | Mic control, consent gate, record→upload→feed loop, track keys | Modify (manual QA) |
| `contribute.html` | Mic button, recording UI, consent copy, submit `audioClips`, i18n | Modify (manual QA) |

---

## Task 1: Add R2 + Workers AI bindings

**Files:**
- Modify: `wrangler.jsonc`

- [ ] **Step 1: Add the bindings**

In `wrangler.jsonc`, add these two top-level keys (sibling to `assets`). Use the bucket name from P1:

```jsonc
  "r2_buckets": [
    { "binding": "AUDIO_BUCKET", "bucket_name": "chula-powermap-audio" }
  ],
  "ai": { "binding": "AI" },
```

- [ ] **Step 2: Verify config parses**

Run: `npx wrangler deploy --dry-run`
Expected: no config errors; output lists the R2 bucket binding `AUDIO_BUCKET` and the AI binding.

- [ ] **Step 3: Commit**

```bash
git add wrangler.jsonc
git commit -m "chore(voice): add R2 audio bucket + Workers AI bindings"
```

---

## Task 2: Pure voice helpers (`functions/_lib/voice.js`)

**Files:**
- Create: `functions/_lib/voice.js`
- Test: `functions/_lib/voice.test.js`

- [ ] **Step 1: Write the failing tests**

Create `functions/_lib/voice.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { audioKey, validateAudioUpload, MAX_AUDIO_BYTES } from "./voice.js";

test("audioKey is namespaced by session and zero-padded turn", () => {
  const k = audioKey("abc123", 2, "webm");
  assert.match(k, /^sessions\/abc123\/turn-002\.webm$/);
});

test("audioKey rejects a bad session id", () => {
  assert.throws(() => audioKey("../etc/passwd", 1, "webm"));
  assert.throws(() => audioKey("", 1, "webm"));
});

test("audioKey rejects a non-integer turn", () => {
  assert.throws(() => audioKey("abc", 1.5, "webm"));
});

test("validateAudioUpload accepts a reasonable audio blob", () => {
  const r = validateAudioUpload("audio/webm", 500000);
  assert.equal(r.ok, true);
});

test("validateAudioUpload rejects non-audio content types", () => {
  assert.equal(validateAudioUpload("application/json", 1000).ok, false);
});

test("validateAudioUpload rejects oversize uploads", () => {
  assert.equal(validateAudioUpload("audio/webm", MAX_AUDIO_BYTES + 1).ok, false);
});

test("validateAudioUpload rejects empty uploads", () => {
  assert.equal(validateAudioUpload("audio/webm", 0).ok, false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test functions/_lib/voice.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `functions/_lib/voice.js`:

```js
// functions/_lib/voice.js
// Pure helpers for the voice pipeline. No R2/AI/DOM references.

export const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // ~15 MB ≈ a few minutes of Opus
const SESSION_RE = /^[A-Za-z0-9_-]{1,64}$/;
const ALLOWED_EXT = ["webm", "ogg", "mp4", "m4a", "wav"];

export function audioKey(sessionId, turnIndex, ext) {
  if (!SESSION_RE.test(sessionId)) {
    throw new Error("invalid session id");
  }
  if (!Number.isInteger(turnIndex) || turnIndex < 0) {
    throw new Error("turnIndex must be a non-negative integer");
  }
  const safeExt = ALLOWED_EXT.includes(ext) ? ext : "webm";
  const padded = String(turnIndex).padStart(3, "0");
  return `sessions/${sessionId}/turn-${padded}.${safeExt}`;
}

export function validateAudioUpload(contentType, byteLength) {
  if (typeof contentType !== "string" || !contentType.startsWith("audio/")) {
    return { ok: false, error: "content-type must be audio/*" };
  }
  if (!Number.isFinite(byteLength) || byteLength <= 0) {
    return { ok: false, error: "empty audio upload" };
  }
  if (byteLength > MAX_AUDIO_BYTES) {
    return { ok: false, error: "audio upload too large" };
  }
  return { ok: true };
}

export function extFromContentType(contentType) {
  if (typeof contentType !== "string") return "webm";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("m4a") || contentType.includes("x-m4a")) return "m4a";
  if (contentType.includes("wav")) return "wav";
  return "webm";
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test functions/_lib/voice.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/voice.js functions/_lib/voice.test.js
git commit -m "feat(voice): pure R2-key + upload-validation helpers"
```

---

## Task 3: The `/api/voice` + `/api/audio/:key` handlers

**Files:**
- Create: `functions/api/voice.js`

Endpoint (manual verification). POST contract: query `?session=<id>&turn=<n>&language=<code>`, body = raw audio bytes with an `audio/*` content-type → response `{ transcript, key }`. GET `/api/audio/:key` streams the stored clip.

- [ ] **Step 1: Write the handlers**

Create `functions/api/voice.js`:

```js
// functions/api/voice.js
import { audioKey, validateAudioUpload, extFromContentType } from "../_lib/voice.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const session = url.searchParams.get("session") || "";
  const turn = Number(url.searchParams.get("turn"));
  const language = url.searchParams.get("language") || "en";

  const contentType = request.headers.get("content-type") || "";
  const bytes = new Uint8Array(await request.arrayBuffer());

  const check = validateAudioUpload(contentType, bytes.byteLength);
  if (!check.ok) return jsonResponse({ error: check.error }, 400);

  let key;
  try {
    key = audioKey(session, turn, extFromContentType(contentType));
  } catch (err) {
    return jsonResponse({ error: String(err.message || err) }, 400);
  }

  try {
    await env.AUDIO_BUCKET.put(key, bytes, {
      httpMetadata: { contentType },
    });
  } catch (err) {
    return jsonResponse({ error: "failed to store audio", detail: String(err) }, 502);
  }

  let transcript = "";
  try {
    const result = await env.AI.run("@cf/openai/whisper", { audio: [...bytes] });
    transcript = (result && result.text ? result.text : "").trim();
  } catch (err) {
    // Store succeeded but transcription failed — return the key with an empty
    // transcript so the client keeps the audio and lets the user type instead.
    return jsonResponse({ key, transcript: "", warning: "transcription failed", detail: String(err) });
  }

  return jsonResponse({ key, transcript });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/api\/audio\//, ""));
  if (!key.startsWith("sessions/")) {
    return new Response("not found", { status: 404 });
  }
  const object = await env.AUDIO_BUCKET.get(key);
  if (!object) return new Response("not found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || "audio/webm",
      "cache-control": "private, max-age=3600",
    },
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
```

Note on the Whisper input: `@cf/openai/whisper` expects `audio` as an array of unsigned byte values (`[...bytes]`). If the deployed model variant differs, adjust to the current Workers AI docs — verify the return shape has a `.text` field with the curl in Step 3.

- [ ] **Step 2: Route it in `src/index.js`**

In `src/index.js`, add imports and routes. After the existing `submit` import add:

```js
import { onRequestPost as voicePostHandler, onRequestGet as audioGetHandler } from "../functions/api/voice.js";
```

Inside `fetch`, before the static-asset fallback, add:

```js
    if (request.method === "POST" && url.pathname === "/api/voice") {
      return voicePostHandler({ request, env });
    }
    if (request.method === "GET" && url.pathname.startsWith("/api/audio/")) {
      return audioGetHandler({ request, env });
    }
```

- [ ] **Step 3: Verify locally**

Run `npx wrangler dev` (Workers AI + R2 run against the real bindings even in dev; ensure you're logged in). Record or grab a short webm/wav clip as `clip.webm`, then:

```bash
curl -s -X POST "http://localhost:8787/api/voice?session=testsession&turn=0&language=en" \
  -H 'content-type: audio/webm' --data-binary @clip.webm
```

Expected: HTTP 200 with `{ "key": "sessions/testsession/turn-000.webm", "transcript": "..." }`. Then:

```bash
curl -s -o out.webm -w "%{http_code} %{content_type}\n" \
  "http://localhost:8787/api/audio/sessions/testsession/turn-000.webm"
```

Expected: `200 audio/webm` and `out.webm` plays back your clip.

- [ ] **Step 4: Verify a bad upload is rejected**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "http://localhost:8787/api/voice?session=x&turn=0" \
  -H 'content-type: application/json' --data '{}'
```

Expected: `400`.

- [ ] **Step 5: Commit**

```bash
git add functions/api/voice.js src/index.js
git commit -m "feat(voice): /api/voice store+transcribe and /api/audio stream"
```

---

## Task 4: Carry audio clips into the submission

**Files:**
- Modify: `functions/_lib/validation.js` (+ test)
- Modify: `functions/_lib/airtable.js` (+ test)

- [ ] **Step 1: Write the failing tests**

Append to `functions/_lib/validation.test.js`:

```js
test("validateSubmitPayload accepts an audioClips array of R2 keys", () => {
  const r = validateSubmitPayload({
    kind: "testimony", site: "S05", description: "a memory",
    visibility: "private", source: "ai-interview",
    audioClips: ["sessions/abc/turn-000.webm", "sessions/abc/turn-001.webm"],
  });
  assert.equal(r.ok, true);
});

test("validateSubmitPayload rejects audioClips that aren't strings", () => {
  const r = validateSubmitPayload({
    kind: "testimony", site: "S05", description: "a memory",
    visibility: "private", source: "ai-interview", audioClips: [42],
  });
  assert.equal(r.ok, false);
});
```

Append to `functions/_lib/airtable.test.js`:

```js
test("buildAirtableRecord joins audioClips into the Audio field", () => {
  const { fields } = buildAirtableRecord({
    kind: "testimony", site: "S05", description: "a memory",
    visibility: "private", source: "ai-interview",
    audioClips: ["sessions/abc/turn-000.webm", "sessions/abc/turn-001.webm"],
  });
  assert.match(fields.Audio, /turn-000\.webm/);
  assert.match(fields.Audio, /turn-001\.webm/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test functions/_lib/validation.test.js functions/_lib/airtable.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `functions/_lib/validation.js`, inside `validateSubmitPayload`, before the final `return { ok: true };`, add:

```js
  if (payload.audioClips !== undefined) {
    if (!Array.isArray(payload.audioClips) || payload.audioClips.some((c) => typeof c !== "string")) {
      return { ok: false, error: "audioClips must be an array of strings" };
    }
  }
```

In `functions/_lib/airtable.js`, inside `buildAirtableRecord`, before `return { fields };`, add:

```js
  if (Array.isArray(payload.audioClips) && payload.audioClips.length > 0) {
    fields.Audio = payload.audioClips.join("\n");
  }
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test functions/_lib/validation.test.js functions/_lib/airtable.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/validation.js functions/_lib/validation.test.js functions/_lib/airtable.js functions/_lib/airtable.test.js
git commit -m "feat(voice): carry audioClips into submission + Airtable"
```

---

## Task 5: Consent gate + record UI + copy (`contribute.html`)

**Files:**
- Modify: `contribute.html` (interview flow markup + i18n; manual QA)

- [ ] **Step 1: Add the mic control and consent copy to the interview flow**

Inside `#interviewFlow`, next to `#interviewNext`, add a mic button and a hidden recording indicator:

```html
<button type="button" class="btn-secondary" id="interviewMic" data-i18n="intake.mic" aria-label="Record voice">🎙 Speak instead</button>
<span class="interview-recording" id="interviewRecording" hidden aria-live="polite">
  <span data-i18n="intake.recording">Recording…</span> <span id="interviewRecTime">0:00</span>
  <button type="button" id="interviewRecStop" data-i18n="intake.stop">Stop</button>
</span>
```

Add a one-time consent line above the thread (hidden until the mic is first used):

```html
<div class="interview-consent" id="interviewConsent" hidden data-i18n="intake.consent">
  Your voice recording is kept as part of your story and stays in the archive unless you ask us to remove it. You can re-record or delete a clip before you send. Tap the mic to agree and start.
</div>
```

- [ ] **Step 2: Add i18n keys**

In each of the three `I18N` language blocks in `contribute.html`, add `intake.mic`, `intake.recording`, `intake.stop`, `intake.consent`, and `intake.consentAgree`. English values:

```
"intake.mic": "🎙 Speak instead",
"intake.recording": "Recording…",
"intake.stop": "Stop",
"intake.consent": "Your voice recording is kept as part of your story and stays in the archive unless you ask us to remove it. You can re-record or delete a clip before you send. Tap the mic again to agree and start.",
"intake.consentAgree": "Agree and record",
```

Provide 中文 and ไทย translations following the tone of the existing keys. (The AI-disclosure and consent must be readable text, not only spoken — this satisfies the spec's screen-reader requirement.)

- [ ] **Step 3: Extend the submit payload with audioClips**

In the submit handler, after the `payload.transcript` block added in Phase A, add:

```js
  if (form.dataset.audioClips) {
    try { payload.audioClips = JSON.parse(form.dataset.audioClips); } catch {}
  }
```

- [ ] **Step 4: Manual QA deferred to Task 7.** Commit with Task 6.

---

## Task 6: Recording + upload loop (`interview.js`)

**Files:**
- Modify: `interview.js` (manual QA)

- [ ] **Step 1: Add a session id and audio-clip tracking**

At the top of `initInterviewFlow`, after `let state = createInitialState();`, add:

```js
  const sessionId = (crypto.randomUUID && crypto.randomUUID().slice(0, 12)) ||
    String(Date.now());
  const audioClips = []; // R2 keys, one per spoken turn
  let consented = false;
  let mediaRecorder = null;
```

- [ ] **Step 2: Wire the mic button (consent → record → stop → upload)**

Add handlers that: on first tap, reveal `#interviewConsent` and require a second tap to consent; once consented, call `navigator.mediaDevices.getUserMedia({ audio: true })`, start a `MediaRecorder`, show `#interviewRecording` with a running timer, and set the avatar to a "listening" state (`document.getElementById("interviewFlow").dataset.avatar = "listening"` — Phase C renders it). On stop, assemble the `Blob`, POST it:

```js
  async function uploadClip(blob) {
    const res = await fetch(
      `/api/voice?session=${encodeURIComponent(sessionId)}&turn=${state.turn}&language=${currentLang()}`,
      { method: "POST", headers: { "content-type": blob.type || "audio/webm" }, body: blob }
    );
    if (!res.ok) throw new Error(`voice upload failed: ${res.status}`);
    return res.json(); // { key, transcript, warning? }
  }
```

On a successful upload: push `data.key` to `audioClips`, then run the SAME path as a typed answer using `data.transcript` as the value — i.e. add the user bubble, push `{ role: "user", text: transcript }` to `state.transcript`, increment `state.turn`, and continue into the follow-up/stop logic. If `data.transcript` is empty (transcription failed but audio saved), keep the clip, show the recording in the thread as "(voice recorded)", and prompt the user to type what they said so the loop still has text.

- [ ] **Step 3: Include audioClips on handoff to the form**

In both `applyDraftToForm` and `fallbackToForm`, add:

```js
    if (audioClips.length) submitForm.dataset.audioClips = JSON.stringify(audioClips);
```

- [ ] **Step 4: Graceful mic-denied fallback**

If `getUserMedia` rejects (permission denied or no device), hide the recording UI, keep the text box fully usable, and show a brief inline note (i18n) that typing is available. Never block the conversation on the mic.

- [ ] **Step 5: Commit**

```bash
git add interview.js contribute.html
git commit -m "feat(voice): consent gate, MediaRecorder capture, upload+transcribe into the loop"
```

---

## Task 7: Full verification

- [ ] **Step 1: Unit suite**

Run: `npm test`
Expected: PASS (Phase A tests + new `voice.test.js` + `audioClips` tests).

- [ ] **Step 2: Browser QA matrix** (`wrangler dev`, `http://localhost:8787/contribute.html`, not `file://`):
  - [ ] Tap mic → consent line appears → second tap starts recording (timer runs, avatar shows listening).
  - [ ] Stop → clip uploads → Jake's next reply arrives based on the transcribed speech; the spoken turn appears in the thread.
  - [ ] Mixed conversation (some typed, some spoken) reaches synthesis normally.
  - [ ] Submit → payload includes `audioClips` (array of keys) → Airtable `Audio` column lists the keys → each `GET /api/audio/<key>` plays back.
  - [ ] Deny mic permission → typing still works, friendly note shown, nothing blocks.
  - [ ] Force a Whisper failure (e.g. upload a silent/garbage clip) → audio is still stored, user is asked to type; nothing is lost.
  - [ ] Thai and Mandarin speech transcribe into the right language turns.

- [ ] **Step 3: `.assetsignore` check.** `functions` and `src` remain excluded (no change needed — `/api/audio` is served by the Worker, not as a static file).

- [ ] **Step 4: `superpowers:verification-before-completion`** before declaring done — run the commands, confirm output. If audio fails, check the R2 bucket exists (P1), Workers AI is enabled (P2), and you're testing on the live URL, not `file://`.

- [ ] **Step 5: Push** (user runs from their Terminal):

```bash
git push
```

Then verify one full spoken conversation on the deployed Worker URL.

---

## Out of scope for Phase B

- Jake avatar art + intro animation → **Phase C** (Phase B only sets `dataset.avatar = "listening"` during recording; Phase C renders the image).
- Automated deletion / retention tooling → not built; withdrawal is a manual volunteer action per spec O1.
