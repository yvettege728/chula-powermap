// functions/_lib/claude.js

const MODEL = "claude-haiku-4-5-20251001";

const FOLLOWUP_SYSTEM = `You are an archival-intake assistant for a public history project documenting displacement in Bangkok. You are given three answers a contributor gave about a piece of evidence they are sharing.

Decide whether ONE critical fact is missing: a specific place, an approximate year, or whether the contributor was a direct witness, a participant, or heard about it secondhand.

Rules you must follow:
- Do not ask for the contributor's real name, contact information, or any identifying detail.
- Do not ask a leading question that presupposes blame or a conclusion.
- Ask at most one question, in plain neutral language, under 30 words.
- If nothing critical is missing, respond with exactly: null

Respond with ONLY a JSON object of the shape {"followup_question": string | null}. No other text.`;

const SYNTHESIZE_SYSTEM = `You are an archival-intake assistant. You are given a contributor's answers about a piece of evidence and must reorganize them into a structured entry.

Rules you must follow:
- Only reorganize and summarize what the contributor actually said. Do not add any fact, name, place, or detail they did not mention.
- Preserve their first-person voice and tone.
- For "kind", choose the single best match from: testimony, photograph, document, drawing, link, other.
- For "site", choose the single best match from: S05, S01, S04, S09, S10, S08, S03, S06, S07, other. If unclear, use "other".
- For "description", write a clean, readable synthesis (not a bullet list) preserving the contributor's own words as much as possible.

Respond with ONLY a JSON object of the shape {"kind": string, "site": string, "description": string}. No other text.`;

export function buildFollowupRequest(answers) {
  const [what, whenWhere, whoElse] = answers;
  const userText = [
    `Answer 1 (what happened): ${what}`,
    `Answer 2 (when/where): ${whenWhere}`,
    `Answer 3 (who else witnessed or experienced this): ${whoElse}`,
  ].join("\n\n");

  return {
    model: MODEL,
    max_tokens: 200, // ~30-word response cap at ~6 tokens/word; 200 is a conservative buffer
    system: FOLLOWUP_SYSTEM,
    messages: [{ role: "user", content: userText }],
  };
}

export function buildSynthesizeRequest(answers, followupAnswer) {
  const [what, whenWhere, whoElse] = answers;
  const parts = [
    `Answer 1 (what happened): ${what}`,
    `Answer 2 (when/where): ${whenWhere}`,
    `Answer 3 (who else witnessed or experienced this): ${whoElse}`,
  ];
  if (followupAnswer) {
    parts.push(`Follow-up answer: ${followupAnswer}`);
  }

  return {
    model: MODEL,
    max_tokens: 800,
    system: SYNTHESIZE_SYSTEM,
    messages: [{ role: "user", content: parts.join("\n\n") }],
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
