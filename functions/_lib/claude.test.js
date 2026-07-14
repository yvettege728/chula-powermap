// functions/_lib/claude.test.js
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

test("buildSynthesizeRequest takes a transcript and asks for structured output", () => {
  const req = buildSynthesizeRequest(TRANSCRIPT, "en");
  assert.equal(req.model, "claude-haiku-4-5-20251001");
  const userText = req.messages[0].content;
  assert.match(userText, /grandmother/);
  assert.match(req.system, /only.*(reorganiz|structure|summariz|what the contributor)/i);
  assert.match(req.system, /"site"/);
  assert.match(req.system, /null/); // may set site null when unclear
});
