// functions/_lib/voice.js
// Pure helpers for the voice pipeline. No R2/AI/DOM references.

export const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // ~15 MB ≈ a few minutes of Opus
const SESSION_RE = /^[A-Za-z0-9_-]{1,64}$/;
const ALLOWED_EXT = ["webm", "ogg", "mp4", "m4a", "wav"];

export function audioKey(sessionId, turnIndex, ext) {
  if (!SESSION_RE.test(sessionId)) {
    throw new Error("invalid session id");
  }
  if (!Number.isInteger(turnIndex) || turnIndex < 0) {
    throw new Error("turnIndex must be a non-negative integer");
  }
  const safeExt = ALLOWED_EXT.includes(ext) ? ext : "webm";
  const padded = String(turnIndex).padStart(3, "0");
  return `sessions/${sessionId}/turn-${padded}.${safeExt}`;
}

export function validateAudioUpload(contentType, byteLength) {
  if (typeof contentType !== "string" || !contentType.startsWith("audio/")) {
    return { ok: false, error: "content-type must be audio/*" };
  }
  if (!Number.isFinite(byteLength) || byteLength <= 0) {
    return { ok: false, error: "empty audio upload" };
  }
  if (byteLength > MAX_AUDIO_BYTES) {
    return { ok: false, error: "audio upload too large" };
  }
  return { ok: true };
}

export function extFromContentType(contentType) {
  if (typeof contentType !== "string") return "webm";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("mp4")) return "mp4";
  if (contentType.includes("m4a") || contentType.includes("x-m4a")) return "m4a";
  if (contentType.includes("wav")) return "wav";
  return "webm";
}
