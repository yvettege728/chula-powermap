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
