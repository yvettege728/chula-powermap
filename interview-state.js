// interview-state.js
// Pure state-transition logic only — no DOM references. Consumed by
// interview.js (browser, built in a later task) and by interview-state.test.js (Node).

export const FIXED_QUESTIONS = [
  "Had you heard of this place before, or is this the first time?",
  "Is there anything you remember yourself, or maybe something a family member or friend once mentioned about this area?",
  "Anything else on your mind you'd like to share — a feeling, a question, a detail, anything at all?",
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
