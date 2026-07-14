import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TURN_CAP,
  COVERAGE_ITEMS,
  createInitialState,
  mergeCoverage,
  isCovered,
  shouldStop,
  turnsRemaining,
  openItems,
} from "./interview-state.js";

test("createInitialState starts empty, all coverage open, turn 0", () => {
  const s = createInitialState();
  assert.deepEqual(s.transcript, []);
  assert.equal(s.turn, 0);
  for (const item of COVERAGE_ITEMS) assert.equal(s.coverage[item], "open");
});

test("mergeCoverage applies only valid item/state pairs, ignores junk", () => {
  const base = createInitialState().coverage;
  const merged = mergeCoverage(base, { place: "covered", feeling: "touched", bogus: "covered", event: "nope" });
  assert.equal(merged.place, "covered");
  assert.equal(merged.feeling, "touched");
  assert.equal(merged.event, "open"); // invalid state ignored
  assert.equal(merged.bogus, undefined); // invalid key dropped
});

test("mergeCoverage tolerates null/undefined update", () => {
  const base = createInitialState().coverage;
  assert.deepEqual(mergeCoverage(base, null), base);
  assert.deepEqual(mergeCoverage(base, undefined), base);
});

test("shouldStop is false early on", () => {
  const s = createInitialState();
  assert.equal(shouldStop(s), false);
});

test("shouldStop requires place covered AND >=2 others covered", () => {
  const s = createInitialState();
  s.coverage = { place: "covered", relationship: "covered", event: "covered", feeling: "open" };
  assert.equal(shouldStop(s), true);
});

test("shouldStop stays false if place is not covered even when others are", () => {
  const s = createInitialState();
  s.coverage = { place: "open", relationship: "covered", event: "covered", feeling: "covered" };
  assert.equal(shouldStop(s), false);
});

test("shouldStop is true at the turn cap regardless of coverage", () => {
  const s = createInitialState();
  s.turn = TURN_CAP;
  assert.equal(shouldStop(s), true);
});

test("turnsRemaining never goes negative", () => {
  const s = createInitialState();
  s.turn = TURN_CAP + 3;
  assert.equal(turnsRemaining(s), 0);
});

test("openItems lists every item not yet covered", () => {
  const cov = { place: "covered", relationship: "touched", event: "open", feeling: "covered" };
  assert.deepEqual(openItems(cov), ["relationship", "event"]);
});

test("isCovered reflects the covered state", () => {
  assert.equal(isCovered({ place: "covered" }, "place"), true);
  assert.equal(isCovered({ place: "touched" }, "place"), false);
});
