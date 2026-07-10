// interview-state.js
// Pure state-transition logic only — no DOM references. Consumed by
// interview.js (browser, built in a later task) and by interview-state.test.js (Node).

export const FIXED_QUESTIONS = [
  "What happened?",
  "Roughly when and where?",
  "Did anyone else experience or witness this? (No need to name them.)",
];

export function nextStep(state) {
  switch (state.step) {
    case "q0": return "q1";
    case "q1": return "q2";
    case "q2": return "checking-followup";
    case "checking-followup":
      return state.followupQuestion ? "followup-question" : "synthesizing";
    case "followup-question": return "synthesizing";
    case "synthesizing": return "done";
    default: return state.step;
  }
}
