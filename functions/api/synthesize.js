import { buildSynthesizeRequest, callClaude } from "../_lib/claude.js";
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
  if (body.followup_answer !== undefined) {
    if (typeof body.followup_answer !== "string") {
      return jsonResponse({ error: "followup_answer must be a string when present" }, 400);
    }
    if (body.followup_answer.length > 2000) {
      return jsonResponse({ error: "followup_answer must be 2000 characters or fewer" }, 400);
    }
  }

  const claudeRequest = buildSynthesizeRequest(body.answers, body.followup_answer);

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
    // Fail-safe: hand the raw answers back as an unstructured draft rather than erroring out.
    return jsonResponse({
      kind: "other",
      site: "other",
      description: body.answers.join("\n\n"),
    });
  }

  return jsonResponse({
    kind: parsed.kind ?? "other",
    site: parsed.site ?? "other",
    description: parsed.description ?? body.answers.join("\n\n"),
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
