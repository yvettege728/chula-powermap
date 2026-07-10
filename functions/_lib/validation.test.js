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
