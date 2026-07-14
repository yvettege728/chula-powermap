// functions/_lib/validation.js

const MAX_ANSWER_LENGTH = 2000;

const VALID_ROLES = ["bot", "user"];
const VALID_COVERAGE_STATES = ["open", "touched", "covered"];
const COVERAGE_KEYS = ["place", "relationship", "event", "feeling"];
const VALID_LANGUAGE = ["en", "zh", "th"];
const MAX_TURN_LENGTH = 4000;

export function validateTranscript(transcript) {
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return { ok: false, error: "transcript must be a non-empty array" };
  }
  for (const turn of transcript) {
    if (!turn || typeof turn !== "object") {
      return { ok: false, error: "each transcript turn must be an object" };
    }
    if (!VALID_ROLES.includes(turn.role)) {
      return { ok: false, error: "each turn role must be 'bot' or 'user'" };
    }
    if (typeof turn.text !== "string" || turn.text.trim().length === 0) {
      return { ok: false, error: "each turn text must be a non-empty string" };
    }
    if (turn.text.length > MAX_TURN_LENGTH) {
      return { ok: false, error: `each turn text must be ${MAX_TURN_LENGTH} characters or fewer` };
    }
  }
  return { ok: true };
}

export function validateCoverage(coverage) {
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    return { ok: false, error: "coverage must be an object" };
  }
  for (const key of Object.keys(coverage)) {
    if (!COVERAGE_KEYS.includes(key)) {
      return { ok: false, error: `unknown coverage key: ${key}` };
    }
    if (!VALID_COVERAGE_STATES.includes(coverage[key])) {
      return { ok: false, error: `coverage.${key} must be open, touched, or covered` };
    }
  }
  return { ok: true };
}

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
  if (payload.language !== undefined && !VALID_LANGUAGE.includes(payload.language)) {
    return { ok: false, error: `language must be one of ${VALID_LANGUAGE.join(", ")}` };
  }
  if (payload.transcript !== undefined) {
    const t = validateTranscript(payload.transcript);
    if (!t.ok) return t;
  }
  return { ok: true };
}
