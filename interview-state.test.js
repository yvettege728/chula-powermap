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
