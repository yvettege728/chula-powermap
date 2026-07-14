// interview-state.js
// Pure state logic for the adaptive intake conversation. No DOM. Consumed by
// interview.js (browser) and interview-state.test.js (Node). See
// docs/superpowers/specs/2026-07-15-conversational-intake-redesign-design.md.

// Max contributor turns before the harness wraps up regardless of coverage.
export const TURN_CAP = 7;

// Things worth drawing out. `place` is the only item required for a filable
// record; `feeling` is pursued but never forces a stop.
export const COVERAGE_ITEMS = ["place", "relationship", "event", "feeling"];

const COVERAGE_STATES = ["open", "touched", "covered"];

export function createInitialState() {
  const coverage = {};
  for (const item of COVERAGE_ITEMS) coverage[item] = "open";
  return { transcript: [], coverage, turn: 0 };
}

export function mergeCoverage(coverage, update) {
  const next = { ...coverage };
  if (update && typeof update === "object") {
    for (const item of COVERAGE_ITEMS) {
      if (COVERAGE_STATES.includes(update[item])) next[item] = update[item];
    }
  }
  return next;
}

export function isCovered(coverage, item) {
  return coverage[item] === "covered";
}

export function openItems(coverage) {
  return COVERAGE_ITEMS.filter((item) => coverage[item] !== "covered");
}

export function turnsRemaining(state, cap = TURN_CAP) {
  return Math.max(0, cap - state.turn);
}

// Stop when we hit the turn cap, or when `place` is covered AND at least two
// of the remaining three items are covered.
export function shouldStop(state, cap = TURN_CAP) {
  if (state.turn >= cap) return true;
  if (!isCovered(state.coverage, "place")) return false;
  const others = ["relationship", "event", "feeling"].filter((item) =>
    isCovered(state.coverage, item)
  );
  return others.length >= 2;
}
