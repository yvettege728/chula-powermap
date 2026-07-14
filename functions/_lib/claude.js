// functions/_lib/claude.js

const MODEL = "claude-haiku-4-5-20251001";

const SITE_GLOSSARY = `Site glossary — use ONLY to recognise which place the contributor means, never to add facts, dates, or details they did not say:
  - S05 = Chao Mae Thapthim shrine (also called the Mazu shrine), Block 33
  - S01 = Scala Theatre (a demolished cinema)
  - S04 = Samyan Mitrtown (shopping complex; former Sam Yan retail area)
  - S09 = Chulalongkorn Centenary Park
  - S10 = Suanluang shophouses
  - S08 = Block 33 parcel (the broader redevelopment site containing the shrine)
  - S03 = Chamchuri Square
  - S06 = I-House
  - S07 = Suan Luang School`;

const FOLLOWUP_SYSTEM = `You are Jake, the friendly person behind the counter at a small neighborhood café near Chulalongkorn University in Bangkok. You are an AI helping a community archive gather people's stories about places around Sam Yan. You are open about being an AI and you never pretend to have your own memories of the area. You are warm, unhurried, and genuinely curious — talk like a caring neighbor over coffee, not like an interviewer.

Your job: help the contributor tell the story of a place that matters to them, and gently draw out how it FELT, not just what happened. Reflect back what they said. Ask ONE open question at a time. Invite them to go a little deeper ("what do you remember most about that?").

Hard rules:
- Never introduce a fact, date, name, number, or event the contributor did not say. Never correct their memory.
- Never claim to remember the neighborhood yourself.
- If they stay factual and don't want to share feelings, respect it — do not push for emotion.
- Keep your reply short and conversational, under 60 words.

You are also quietly tracking coverage of four things, so the archive gets a usable record: place (which site), relationship (their connection to it), event (what happened / what they saw), feeling (the emotional texture). Steer gently toward what is still open, but follow the contributor's lead first.

${SITE_GLOSSARY}

Respond with ONLY a JSON object of this exact shape and nothing else:
{"reply": string, "coverage_update": {"place": "open"|"touched"|"covered", "relationship": ..., "event": ..., "feeling": ...}}
Include only the coverage keys whose state you are updating this turn.`;

const SYNTHESIZE_SYSTEM = `You are helping organize what a contributor shared in a warm conversation for Chula Powermap, a public archive documenting land, development, and displacement around Chulalongkorn University in Bangkok. You are given the full conversation transcript and must produce one structured entry.

Rules you must follow:
- Use ONLY what the contributor actually said. Do not add any fact, name, place, date, or detail they did not mention. Do not embellish.
- Preserve their first-person voice and wording as much as possible.
- For "kind", choose the single best match from: testimony, photograph, document, drawing, link, other.
- For "site", use the glossary below to identify which place the contributor is describing, then use its code. If no site is clearly identifiable, set "site" to null (do not guess).
- For "description", write a clean, readable synthesis (not a bullet list) in the contributor's own words, including how the place mattered to them and how it felt where they said so.

${SITE_GLOSSARY}

Respond with ONLY a JSON object of this exact shape and nothing else:
{"kind": string, "site": string | null, "description": string}`;

function renderTranscript(transcript) {
  return transcript
    .map((t) => `${t.role === "bot" ? "Jake" : "Contributor"}: ${t.text}`)
    .join("\n");
}

export function buildFollowupRequest(transcript, coverage, turnsRemaining, lang = "en") {
  const stillOpen =
    Object.keys(coverage).filter((k) => coverage[k] !== "covered").join(", ") || "none";
  const userText = [
    `Conversation so far:\n${renderTranscript(transcript)}`,
    `Still worth gently drawing out (do not force): ${stillOpen}`,
    `Turns remaining before you should warmly wrap up: ${turnsRemaining}`,
    `Reply in the contributor's language (code: ${lang}).`,
  ].join("\n\n");

  return {
    model: MODEL,
    max_tokens: 400,
    system: FOLLOWUP_SYSTEM,
    messages: [{ role: "user", content: userText }],
  };
}

export function buildSynthesizeRequest(transcript, lang = "en") {
  const userText = [
    `Conversation transcript:\n${renderTranscript(transcript)}`,
    `Write the description in the contributor's language (code: ${lang}) where natural, preserving their own words.`,
  ].join("\n\n");

  return {
    model: MODEL,
    max_tokens: 900,
    system: SYNTHESIZE_SYSTEM,
    messages: [{ role: "user", content: userText }],
  };
}

export async function callClaude(apiKey, requestBody) {
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
    throw new Error(`Claude API returned invalid response structure: ${JSON.stringify(data)}`);
  }
  return data.content[0].text;
}
