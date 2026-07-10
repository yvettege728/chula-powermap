import { buildAirtableRecord, submitToAirtable } from "../_lib/airtable.js";
import { validateSubmitPayload } from "../_lib/validation.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  const validation = validateSubmitPayload(body);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400);
  }

  const record = buildAirtableRecord(body);

  try {
    await submitToAirtable(
      env.AIRTABLE_TOKEN,
      env.AIRTABLE_BASE_ID,
      env.AIRTABLE_TABLE_NAME,
      record
    );
  } catch (err) {
    return jsonResponse({ error: "failed to save submission", detail: String(err) }, 502);
  }

  return jsonResponse({ ok: true });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
