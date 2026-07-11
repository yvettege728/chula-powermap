// functions/_lib/claude.js

const MODEL = "claude-haiku-4-5-20251001";

const FOLLOWUP_SYSTEM = `You are a warm, curious volunteer at a small community history project, having a casual conversation with a visitor — not conducting an interview or an investigation. You are given three things a visitor shared about a memory or impression related to a place.

Decide whether there is one gentle, natural follow-up that would help you understand their story a little better — for example a rough sense of timing, what the place meant to them, or a detail they mentioned that seems worth hearing more about. Only ask if it would feel natural in a real conversation, never as a checklist item.

Rules you must follow:
- Do not ask for the visitor's real name, contact information, or any identifying detail.
- Do not ask a leading question that presupposes blame or a conclusion.
- Do not ask them to clarify or confirm whether they were personally present, a witness, or heard about it secondhand — let them share however they naturally would.
- Ask at most one question, warm and conversational, under 30 words.
- If nothing more feels natural to ask, respond with exactly: null

Respond with ONLY a JSON object of the shape {"followup_question": string | null}. No other text.`;

const SYNTHESIZE_SYSTEM = `You are helping organize what a visitor shared in a casual conversation for Chula Powermap, a public archive documenting land, development, and displacement around Chulalongkorn University in Bangkok. You are given their answers and must reorganize them into a structured entry.

Rules you must follow:
- Only reorganize and summarize what the visitor actually said. Do not add any fact, name, place, or detail they did not mention.
- Preserve their first-person voice and tone.
- For "kind", choose the single best match from: testimony, photograph, document, drawing, link, other.
- For "site", use this glossary to identify which place (if any) the visitor is describing, then use its code. If no site is clearly identifiable, use "other". Use this glossary only to pick the correct code — never to add facts, dates, or details the visitor did not say themselves.
  - S05 = Chao Mae Thapthim shrine (also called the Mazu shrine), Block 33
  - S01 = Scala Theatre (a demolished cinema)
  - S04 = Samyan Mitrtown (shopping complex; former Sam Yan retail area)
  - S09 = Chulalongkorn Centenary Park
  - S10 = Suanluang shophouses
  - S08 = Block 33 parcel (the broader redevelopment site containing the shrine)
  - S03 = Chamchuri Square
  - S06 = I-House
  - S07 = Suan Luang School
- For "description", write a clean, readable synthesis (not a bullet list) preserving the visitor's own words as much as possible.

Respond with ONLY a JSON object of the shape {"kind": string, "site": string, "description": string}. No other text.`;

export function buildFollowupRequest(answers) {
  const [heardBefore, memory, anythingElse] = answers;
  const userText = [
    `Answer 1 (had they heard of this place before): ${heardBefore}`,
    `Answer 2 (a memory or something they were told): ${memory}`,
    `Answer 3 (anything else on their mind): ${anythingElse}`,
  ].join("\n\n");

  return {
    model: MODEL,
    max_tokens: 200, // ~30-word response cap at ~6 tokens/word; 200 is a conservative buffer
    system: FOLLOWUP_SYSTEM,
    messages: [{ role: "user", content: userText }],
  };
}

export function buildSynthesizeRequest(answers, followupAnswer) {
  const [heardBefore, memory, anythingElse] = answers;
  const parts = [
    `Answer 1 (had they heard of this place before): ${heardBefore}`,
    `Answer 2 (a memory or something they were told): ${memory}`,
    `Answer 3 (anything else on their mind): ${anythingElse}`,
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
