// functions/api/followup.js
import { buildFollowupRequest, callClaude } from "../_lib/claude.js";
import { validateTranscript, validateCoverage } from "../_lib/validation.js";
import { turnsRemaining } from "../../interview-state.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  const t = validateTranscript(body.transcript);
  if (!t.ok) return jsonResponse({ error: t.error }, 400);

  const coverage = body.coverage ?? {};
  const c = validateCoverage(coverage);
  if (!c.ok) return jsonResponse({ error: c.error }, 400);

  const turn = Number.isInteger(body.turn) ? body.turn : 0;
  const lang = typeof body.language === "string" ? body.language : "en";

  const claudeRequest = buildFollowupRequest(
    body.transcript,
    coverage,
    turnsRemaining({ turn }),
    lang
  );

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
    // Fail safe: a neutral nudge, no coverage change.
    return jsonResponse({ reply: "", coverage_update: {} });
  }

  return jsonResponse({
    reply: typeof parsed.reply === "string" ? parsed.reply : "",
    coverage_update: parsed.coverage_update ?? {},
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
