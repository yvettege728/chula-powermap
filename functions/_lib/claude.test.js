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
