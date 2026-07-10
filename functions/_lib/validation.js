// functions/_lib/validation.js

const MAX_ANSWER_LENGTH = 2000;

export function validateAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== 3) {
    return { ok: false, error: "answers must be an array of exactly 3 strings" };
  }
  for (const a of answers) {
    if (typeof a !== "string" || a.trim().length === 0) {
      return { ok: false, error: "each answer must be a non-empty string" };
    }
    if (a.length > MAX_ANSWER_LENGTH) {
      return { ok: false, error: `each answer must be ${MAX_ANSWER_LENGTH} characters or fewer` };
    }
  }
  return { ok: true };
}

export function validateSubmitPayload(payload) {
  const VALID_VISIBILITY = ["private", "public-anon", "public-named"];
  const VALID_SOURCE = ["form", "ai-interview"];
  const VALID_KIND = ["testimony", "photograph", "document", "drawing", "link", "other"];
  const VALID_SITE = ["S05", "S01", "S04", "S09", "S10", "S08", "S03", "S06", "S07", "other"];

  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "payload must be an object" };
  }
  if (!VALID_KIND.includes(payload.kind)) {
    return { ok: false, error: `kind must be one of ${VALID_KIND.join(", ")}` };
  }
  if (!VALID_SITE.includes(payload.site)) {
    return { ok: false, error: `site must be one of ${VALID_SITE.join(", ")}` };
  }
  if (typeof payload.description !== "string" || payload.description.trim().length === 0) {
    return { ok: false, error: "description is required" };
  }
  if (!VALID_VISIBILITY.includes(payload.visibility)) {
    return { ok: false, error: `visibility must be one of ${VALID_VISIBILITY.join(", ")}` };
  }
  if (!VALID_SOURCE.includes(payload.source)) {
    return { ok: false, error: `source must be one of ${VALID_SOURCE.join(", ")}` };
  }
  if (payload.description.length > 20000) {
    return { ok: false, error: "description must be 20000 characters or fewer" };
  }
  if (payload.contact !== undefined && typeof payload.contact !== "string") {
    return { ok: false, error: "contact must be a string when present" };
  }
  return { ok: true };
}
