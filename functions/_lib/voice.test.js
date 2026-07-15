import { test } from "node:test";
import assert from "node:assert/strict";
import { audioKey, validateAudioUpload, extFromContentType, MAX_AUDIO_BYTES } from "./voice.js";

test("audioKey is namespaced by session and zero-padded turn", () => {
  const k = audioKey("abc123", 2, "webm");
  assert.match(k, /^sessions\/abc123\/turn-002\.webm$/);
});

test("audioKey rejects a bad session id", () => {
  assert.throws(() => audioKey("../etc/passwd", 1, "webm"));
  assert.throws(() => audioKey("", 1, "webm"));
});

test("audioKey rejects a non-integer turn", () => {
  assert.throws(() => audioKey("abc", 1.5, "webm"));
});

test("audioKey falls back to webm for an unknown extension", () => {
  assert.match(audioKey("abc", 0, "exe"), /turn-000\.webm$/);
});

test("validateAudioUpload accepts a reasonable audio blob", () => {
  const r = validateAudioUpload("audio/webm", 500000);
  assert.equal(r.ok, true);
});

test("validateAudioUpload rejects non-audio content types", () => {
  assert.equal(validateAudioUpload("application/json", 1000).ok, false);
});

test("validateAudioUpload rejects oversize uploads", () => {
  assert.equal(validateAudioUpload("audio/webm", MAX_AUDIO_BYTES + 1).ok, false);
});

test("validateAudioUpload rejects empty uploads", () => {
  assert.equal(validateAudioUpload("audio/webm", 0).ok, false);
});

test("extFromContentType maps common audio types", () => {
  assert.equal(extFromContentType("audio/webm;codecs=opus"), "webm");
  assert.equal(extFromContentType("audio/ogg"), "ogg");
  assert.equal(extFromContentType("audio/mp4"), "mp4");
  assert.equal(extFromContentType("audio/wav"), "wav");
  assert.equal(extFromContentType(undefined), "webm");
});
