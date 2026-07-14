import { buildSynthesizeRequest, callClaude } from "../_lib/claude.js";
import { validateTranscript } from "../_lib/validation.js";

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

  const lang = typeof body.language === "string" ? body.language : "en";
  const claudeRequest = buildSynthesizeRequest(body.transcript, lang);

  const fallbackDescription = body.transcript
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.text)
    .join("\n\n");

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
    return jsonResponse({ kind: "other", site: null, description: fallbackDescription });
  }

  return jsonResponse({
    kind: parsed.kind ?? "other",
    site: parsed.site ?? null,
    description: parsed.description ?? fallbackDescription,
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
