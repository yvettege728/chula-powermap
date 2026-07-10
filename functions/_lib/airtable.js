export function buildAirtableRecord(payload) {
  const fields = {
    Timestamp: new Date().toISOString(),
    Kind: payload.kind,
    Site: payload.site,
    Description: payload.description,
    Visibility: payload.visibility,
    Source: payload.source,
    Status: "unread",
  };
  if (payload.contact) {
    fields.Contact = payload.contact;
  }
  return { fields };
}

export async function submitToAirtable(token, baseId, tableName, record) {
  if (!token || !baseId) {
    throw new Error("Airtable token and baseId must both be set");
  }
  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ records: [record] }),
    }
  );
  if (!res.ok) {
    throw new Error(`Airtable API error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
