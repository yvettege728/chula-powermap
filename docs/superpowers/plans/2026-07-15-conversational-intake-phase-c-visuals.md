# Phase C — Character & Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the intake page into a place you talk to *Jake* rather than fill a form: a ~12-second, 5-beat first-person "walk-in" intro that plays once when the bot opens (skippable, replay-once, reduced-motion + plain-text fallback that includes the AI disclosure), Jake's four avatar states (idle / listening / thinking / speaking) shown in the chat, and a warm low-contrast café chat background with a dark-mode-safe variant.

**Architecture:** Pure sequencing logic lives in `intro-state.js` (which frame is showing, whether to replay, whether to reduce motion) — unit-tested with injected `storage` and `prefersReducedMotion`. `intro.js` wires that to the DOM (swaps `<img>` frames on a timer, skip button, then reveals the chat). `interview.js` sets `dataset.avatar` on the flow as the loop changes state; CSS maps each state to an image. The chat background is a CSS layer with a `prefers-color-scheme` dark variant. All new assets are static files under `images_chatbot/` and excluded from nothing (served normally).

**Tech Stack:** Vanilla ES modules, CSS (`prefers-color-scheme`, `prefers-reduced-motion`), `localStorage`, `node --test`. Builds on Phase A (chat UI). Independent of Phase B except that Phase B triggers the `listening` avatar state.

**Spec:** `docs/superpowers/specs/2026-07-15-conversational-intake-redesign-design.md` Section 8; decisions D5, D6, D7, O3 (name = Jake).

**Depends on:** Phase A. Can be built before or after Phase B; both touch `interview.js`/`contribute.html`, so implement one at a time to avoid churn.

---

## Prerequisites (manual — asset generation, per the spec's Recraft prompts)

The 5 frames already generated for the intro live in `images_chatbot/` under long prompt-derived names. Before wiring, they must be organized and the missing assets generated using the style-locked prompts in the spec's Appendix A.

- [ ] **P1 — Organize intro frames.** Rename the existing 5 files in `images_chatbot/` into ordered beat files (using the storyboard order from the spec): `intro/beat-1.png` … `intro/beat-5.png`. If you generated 2–3 held frames per beat for a truer stop-motion, name them `beat-1a.png`, `beat-1b.png`, etc.
- [ ] **P2 — Generate the four avatar states** (spec Appendix A1: `A1-idle`, `A1-listening`, `A1-thinking`, `A1-speaking`), tightly framed head-and-shoulders on a clean warm-cream background, using the saved Jake Style + reference. Save as `images_chatbot/avatar/jake-idle.png`, `jake-listening.png`, `jake-thinking.png`, `jake-speaking.png`.
- [ ] **P3 — Generate the chat background** (spec Appendix A3), light and dark variants: `images_chatbot/bg/cafe-light.png`, `images_chatbot/bg/cafe-dark.png`.

These are art tasks, not code. The code tasks below reference these exact paths; if a file is still missing at wire-up, the UI degrades gracefully (see Task 4 fallbacks).

## File structure

| File | Responsibility | Change |
|------|----------------|--------|
| `intro-state.js` | Pure: frame index, replay-once, reduced-motion decisions | Create |
| `intro-state.test.js` | Unit tests | Create |
| `intro.js` | DOM: play intro, skip, reveal chat | Create (manual QA) |
| `contribute.html` | Intro overlay markup, avatar element, background, i18n captions + disclosure, script tags | Modify (manual QA) |
| `chula-powermap.css` | Background layer, avatar-state rules, intro overlay, reduced-motion CSS | Modify (manual QA) |
| `interview.js` | Set `dataset.avatar` on state changes | Modify (manual QA) |

---

## Task 1: Pure intro sequencing (`intro-state.js`)

**Files:**
- Create: `intro-state.js`
- Test: `intro-state.test.js`

- [ ] **Step 1: Write the failing tests**

Create `intro-state.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INTRO_STORAGE_KEY,
  shouldPlayIntro,
  markIntroSeen,
  nextFrame,
  isLastFrame,
} from "./intro-state.js";

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
}

test("plays when never seen and motion is allowed", () => {
  assert.equal(shouldPlayIntro(fakeStorage(), false), true);
});

test("does not play once marked seen", () => {
  const s = fakeStorage();
  markIntroSeen(s);
  assert.equal(s.getItem(INTRO_STORAGE_KEY), "1");
  assert.equal(shouldPlayIntro(s, false), false);
});

test("still 'plays' with reduced motion (caller shows the final frame instantly)", () => {
  assert.equal(shouldPlayIntro(fakeStorage(), true), true);
});

test("nextFrame advances and clamps at the end", () => {
  assert.equal(nextFrame(0, 5), 1);
  assert.equal(nextFrame(4, 5), 4);
});

test("isLastFrame is true only on the final index", () => {
  assert.equal(isLastFrame(4, 5), true);
  assert.equal(isLastFrame(3, 5), false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test intro-state.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `intro-state.js`:

```js
// intro-state.js
// Pure sequencing logic for the opening intro animation. No DOM. Storage and
// reduced-motion are injected so this is unit-testable.

export const INTRO_STORAGE_KEY = "chula_seen_jake_intro";

export function shouldPlayIntro(storage, prefersReducedMotion) {
  // Reduced motion does not skip the intro — the caller shows the final frame
  // (with the disclosure text) instantly instead of animating.
  void prefersReducedMotion;
  try {
    return storage.getItem(INTRO_STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markIntroSeen(storage) {
  try {
    storage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    /* private mode / storage disabled — intro simply replays next time */
  }
}

export function nextFrame(index, frameCount) {
  return Math.min(index + 1, frameCount - 1);
}

export function isLastFrame(index, frameCount) {
  return index >= frameCount - 1;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test intro-state.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add intro-state.js intro-state.test.js
git commit -m "feat(intro): pure sequencing + replay-once logic"
```

---

## Task 2: Intro markup, captions, disclosure (`contribute.html`)

**Files:**
- Modify: `contribute.html` (manual QA)

- [ ] **Step 1: Add the intro overlay inside `#interviewFlow`, before `#interviewThread`**

```html
<div class="jake-intro" id="jakeIntro" hidden>
  <img class="jake-intro-frame" id="jakeIntroFrame" alt="" src="images_chatbot/intro/beat-1.png" />
  <p class="jake-intro-caption" id="jakeIntroCaption" data-i18n="intro.beat1" aria-live="polite">You walk into a small café near Sam Yan.</p>
  <p class="jake-intro-disclosure" data-i18n="intro.disclosure">The person behind the counter is Jake — an AI that helps this archive listen. A human volunteer reads everything before anything is published.</p>
  <button type="button" class="jake-intro-skip" id="jakeIntroSkip" data-i18n="intro.skip">Skip</button>
</div>
```

The `intro.disclosure` paragraph is always in the DOM (not injected only during animation), so a screen-reader user gets the AI disclosure even if motion is reduced — this is the spec's accessibility requirement.

- [ ] **Step 2: Add the avatar element to the thread header**

Just inside `#interviewFlow`, before the intro or above the thread, add the persistent Jake avatar:

```html
<div class="jake-avatar" id="jakeAvatar" aria-hidden="true"></div>
```

- [ ] **Step 3: Add i18n keys** for `intro.beat1`…`intro.beat5`, `intro.disclosure`, `intro.skip` in all three `I18N` blocks. English beat captions (match the 5 beats in the spec):

```
"intro.beat1": "You walk into a small café near Sam Yan.",
"intro.beat2": "You order at the counter — and meet Jake.",
"intro.beat3": "On the wall: old street scenes, the shrine, neighbours' faces.",
"intro.beat4": "Jake sets a warm cup in front of you.",
"intro.beat5": "“Tell me about a place that matters to you.”",
"intro.disclosure": "The person behind the counter is Jake — an AI that helps this archive listen. A human volunteer reads everything before anything is published.",
"intro.skip": "Skip",
```

Provide 中文 and ไทย translations in the same tone as the existing keys.

- [ ] **Step 4: Load the intro script.** Where `interview.js` is included, add `intro.js` as a module (after it):

```html
<script type="module" src="intro.js"></script>
```

- [ ] **Step 5: Commit** with Task 4 (needs CSS + JS to verify).

---

## Task 3: Background, avatar-state, and intro CSS (`chula-powermap.css`)

**Files:**
- Modify: `chula-powermap.css` (manual QA)

- [ ] **Step 1: Chat background layer**

```css
#interviewFlow {
  position: relative;
  background-image: url("images_chatbot/bg/cafe-light.png");
  background-size: cover;
  background-position: center;
}
@media (prefers-color-scheme: dark) {
  #interviewFlow {
    background-image: url("images_chatbot/bg/cafe-dark.png");
  }
}
/* Keep text readable over the texture. */
#interviewThread { background: rgba(255, 255, 255, 0.72); border-radius: 12px; }
@media (prefers-color-scheme: dark) {
  #interviewThread { background: rgba(20, 18, 16, 0.72); }
}
```

- [ ] **Step 2: Avatar state → image mapping**

```css
.jake-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  background-size: cover; background-position: center;
  background-image: url("images_chatbot/avatar/jake-idle.png");
}
#interviewFlow[data-avatar="thinking"]  .jake-avatar { background-image: url("images_chatbot/avatar/jake-thinking.png"); }
#interviewFlow[data-avatar="listening"] .jake-avatar { background-image: url("images_chatbot/avatar/jake-listening.png"); }
#interviewFlow[data-avatar="speaking"]  .jake-avatar { background-image: url("images_chatbot/avatar/jake-speaking.png"); }
```

- [ ] **Step 3: Intro overlay + reduced motion**

```css
.jake-intro { position: relative; text-align: center; }
.jake-intro-frame { width: 100%; max-width: 420px; border-radius: 12px; }
.jake-intro-skip { position: absolute; top: 8px; right: 8px; }
@media (prefers-reduced-motion: reduce) {
  /* JS shows the final frame immediately; nothing animates. */
  .jake-intro-frame { transition: none !important; }
}
```

- [ ] **Step 4: Commit** with Task 4.

---

## Task 4: Play the intro and drive avatar state (`intro.js` + `interview.js`)

**Files:**
- Create: `intro.js` (manual QA)
- Modify: `interview.js` (manual QA)

- [ ] **Step 1: Write `intro.js`**

```js
// intro.js
// Plays the opening walk-in intro once, then reveals the chat. Uses
// intro-state.js for the pure decisions.
import { shouldPlayIntro, markIntroSeen, nextFrame, isLastFrame } from "./intro-state.js";

const FRAMES = [
  "images_chatbot/intro/beat-1.png",
  "images_chatbot/intro/beat-2.png",
  "images_chatbot/intro/beat-3.png",
  "images_chatbot/intro/beat-4.png",
  "images_chatbot/intro/beat-5.png",
];
const CAPTION_KEYS = ["intro.beat1", "intro.beat2", "intro.beat3", "intro.beat4", "intro.beat5"];
const FRAME_MS = 2400; // ~12s across 5 beats

function currentLang() {
  return document.body.dataset.lang || "en";
}

function initIntro() {
  const intro = document.getElementById("jakeIntro");
  const frameEl = document.getElementById("jakeIntroFrame");
  const captionEl = document.getElementById("jakeIntroCaption");
  const skipBtn = document.getElementById("jakeIntroSkip");
  const toggle = document.getElementById("intakeToggle");
  if (!intro || !frameEl || !toggle) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;
  let i = 0;

  function setCaption(idx) {
    // Reuse the page's own i18n dictionary via the data-i18n attribute.
    captionEl.setAttribute("data-i18n", CAPTION_KEYS[idx]);
    if (window.I18N && typeof window.I18N.t === "function") {
      // no-op: contribute.html re-applies i18n on language change
    }
    captionEl.dispatchEvent(new CustomEvent("intro-caption", { bubbles: true }));
  }

  function show(idx) {
    frameEl.src = FRAMES[idx];
    setCaption(idx);
  }

  function end() {
    if (timer) clearInterval(timer);
    intro.hidden = true;
    markIntroSeen(window.localStorage);
  }

  function playFrom(idx) {
    show(idx);
    timer = setInterval(() => {
      if (isLastFrame(i, FRAMES.length)) return end();
      i = nextFrame(i, FRAMES.length);
      show(i);
    }, FRAME_MS);
  }

  // Only run when the user opens the conversation.
  toggle.querySelector('[data-mode="interview"]').addEventListener("click", () => {
    if (!shouldPlayIntro(window.localStorage, reduce)) { intro.hidden = true; return; }
    intro.hidden = false;
    if (reduce) { i = FRAMES.length - 1; show(i); } // final frame + disclosure, no motion
    else playFrom(0);
  }, { once: true });

  skipBtn.addEventListener("click", () => { i = FRAMES.length - 1; end(); });
}

document.addEventListener("DOMContentLoaded", initIntro);
```

Note: captions render through the page's existing i18n — `contribute.html` applies `data-i18n` on load and on language change, so updating the attribute is enough. If a beat caption doesn't refresh live, call the page's `setLang(currentLang())` after `setCaption` (the function is in `contribute.html`'s scope; expose it on `window` if needed).

- [ ] **Step 2: Drive avatar state from `interview.js`**

In `interview.js`, set `dataset.avatar` on `#interviewFlow`:
- In `busy("thinking")` → `interviewFlow.dataset.avatar = "thinking"`.
- When a bot message is added (`addMessage(text, "bot")`) → briefly set `"speaking"`, then `"idle"` after a short delay.
- In `enableInput()` → `"idle"`.
- (Phase B already sets `"listening"` during recording.)

Add a one-line helper and call it at those points:

```js
  function setAvatar(stateName) {
    const flow = document.getElementById("interviewFlow");
    if (flow) flow.dataset.avatar = stateName;
  }
```

- [ ] **Step 3: Manual QA** (`wrangler dev`, live URL, not `file://`):
  - [ ] Open the conversation the first time → 5-beat intro plays (~12s), captions change per beat, disclosure text visible, Skip works, then chat appears.
  - [ ] Reload and open again → intro does NOT replay (localStorage).
  - [ ] OS "reduce motion" on → intro shows the final frame + disclosure instantly, no animation.
  - [ ] Avatar swaps: idle at rest, thinking during API calls, speaking when Jake replies (and listening while recording if Phase B is present).
  - [ ] Chat background shows warm café texture; toggle OS dark mode → dark variant loads; thread text stays readable.
  - [ ] Missing-asset check: temporarily remove an avatar file → the element falls back to the idle image / empty circle without breaking the chat.
  - [ ] Screen reader: the AI disclosure is announced from the always-present `intro.disclosure` text.

- [ ] **Step 4: Commit**

```bash
git add intro.js intro-state.js intro-state.test.js contribute.html chula-powermap.css interview.js
git commit -m "feat(intro): Jake walk-in intro, avatar states, café background"
```

---

## Task 5: Full verification

- [ ] **Step 1: Unit suite** — `npm test` → PASS (Phase A/B tests + `intro-state.test.js`).
- [ ] **Step 2:** Re-run the Task 4 QA matrix on the deployed Worker URL.
- [ ] **Step 3: `superpowers:verification-before-completion`** before declaring done — confirm the intro replay-once, reduced-motion, and dark-mode behaviours by observation, not assumption.
- [ ] **Step 4: Push** (user, from their Terminal): `git push`, then confirm on the live URL.

---

## Out of scope for Phase C

- Smooth/tweened animation between frames — this is deliberate stop-motion (hard frame swaps); Recraft stills, not video.
- Any change to the conversation logic or voice pipeline (Phases A/B).
- The `listening` avatar image is rendered here, but the *trigger* to enter that state lives in Phase B's recording flow.
