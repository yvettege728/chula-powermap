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

test("survives a throwing storage (private mode) by defaulting to play", () => {
  const throwing = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.equal(shouldPlayIntro(throwing, false), true);
  assert.doesNotThrow(() => markIntroSeen(throwing));
});

test("nextFrame advances and clamps at the end", () => {
  assert.equal(nextFrame(0, 5), 1);
  assert.equal(nextFrame(4, 5), 4);
});

test("isLastFrame is true only on the final index", () => {
  assert.equal(isLastFrame(4, 5), true);
  assert.equal(isLastFrame(3, 5), false);
});
