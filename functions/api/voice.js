// functions/api/voice.js
import { audioKey, validateAudioUpload, extFromContentType } from "../_lib/voice.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const session = url.searchParams.get("session") || "";
  const turn = Number(url.searchParams.get("turn"));

  const contentType = request.headers.get("content-type") || "";
  const bytes = new Uint8Array(await request.arrayBuffer());

  const check = validateAudioUpload(contentType, bytes.byteLength);
  if (!check.ok) return jsonResponse({ error: check.error }, 400);

  let key;
  try {
    key = audioKey(session, turn, extFromContentType(contentType));
  } catch (err) {
    return jsonResponse({ error: String(err.message || err) }, 400);
  }

  try {
    await env.AUDIO_BUCKET.put(key, bytes, {
      httpMetadata: { contentType },
    });
  } catch (err) {
    return jsonResponse({ error: "failed to store audio", detail: String(err) }, 502);
  }

  let transcript = "";
  try {
    const result = await env.AI.run("@cf/openai/whisper", { audio: [...bytes] });
    transcript = (result && result.text ? result.text : "").trim();
  } catch (err) {
    // Store succeeded but transcription failed — return the key with an empty
    // transcript so the client keeps the audio and lets the user type instead.
    return jsonResponse({ key, transcript: "", warning: "transcription failed", detail: String(err) });
  }

  return jsonResponse({ key, transcript });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/api\/audio\//, ""));
  if (!key.startsWith("sessions/")) {
    return new Response("not found", { status: 404 });
  }
  const object = await env.AUDIO_BUCKET.get(key);
  if (!object) return new Response("not found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType || "audio/webm",
      "cache-control": "private, max-age=3600",
    },
  });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
