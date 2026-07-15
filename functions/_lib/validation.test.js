import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAnswers, validateSubmitPayload, validateTranscript, validateCoverage } from "./validation.js";

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
