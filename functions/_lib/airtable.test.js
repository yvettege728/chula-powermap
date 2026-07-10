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
