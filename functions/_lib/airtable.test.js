import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAirtableRecord } from "./airtable.js";

test("buildAirtableRecord maps a public submission with contact", () => {
  const record = buildAirtableRecord({
    kind: "testimony",
    site: "S05",
    description: "I remember the shrine before the fence went up.",
    contact: "someone@example.com",
    visibility: "public-named",
    source: "ai-interview",
  });
  assert.equal(record.fields.Kind, "testimony");
  assert.equal(record.fields.Site, "S05");
  assert.equal(record.fields.Visibility, "public-named");
  assert.equal(record.fields.Source, "ai-interview");
  assert.equal(record.fields.Status, "unread");
  assert.equal(record.fields.Contact, "someone@example.com");
  assert.ok(record.fields.Timestamp); // ISO string, exact value not asserted
});

test("buildAirtableRecord omits Contact field entirely when not provided", () => {
  const record = buildAirtableRecord({
    kind: "photograph",
    site: "S01",
    description: "Old market photo.",
    contact: "",
    visibility: "private",
    source: "form",
  });
  assert.equal(record.fields.Contact, undefined);
});

test("buildAirtableRecord flattens transcript and includes language when present", () => {
  const { fields } = buildAirtableRecord({
    kind: "testimony",
    site: "S05",
    description: "a memory",
    visibility: "private",
    source: "ai-interview",
    language: "th",
    transcript: [
      { role: "bot", text: "hi" },
      { role: "user", text: "the shrine" },
    ],
  });
  assert.equal(fields.Language, "th");
  assert.match(fields.Transcript, /bot: hi/);
  assert.match(fields.Transcript, /user: the shrine/);
});

test("buildAirtableRecord omits Transcript/Language when absent", () => {
  const { fields } = buildAirtableRecord({
    kind: "testimony",
    site: "S05",
    description: "a memory",
    visibility: "private",
    source: "form",
  });
  assert.equal(fields.Transcript, undefined);
  assert.equal(fields.Language, undefined);
});

test("buildAirtableRecord joins audioClips into the Audio field", () => {
  const { fields } = buildAirtableRecord({
    kind: "testimony", site: "S05", description: "a memory",
    visibility: "private", source: "ai-interview",
    audioClips: ["sessions/abc/turn-000.webm", "sessions/abc/turn-001.webm"],
  });
  assert.match(fields.Audio, /turn-000\.webm/);
  assert.match(fields.Audio, /turn-001\.webm/);
});
