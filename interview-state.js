// interview-state.js
// Pure state-transition logic only — no DOM references. Consumed by
// interview.js (browser, built in a later task) and by interview-state.test.js (Node).

export const FIXED_QUESTIONS = [
  "Had you heard of this place before, or is this the first time?",
  "Is there anything you remember yourself, or maybe something a family member or friend once mentioned about this area?",
  "Anything else on your mind you'd like to share — a feeling, a question, a detail, anything at all?",
];

// Same three questions, translated, for pages that carry a body[data-lang]
// attribute (currently contribute.html). Pages without that attribute (e.g.
// submit.html) fall back to the plain English FIXED_QUESTIONS above — see
// interview.js's questionsForCurrentLang().
export const FIXED_QUESTIONS_I18N = {
  en: FIXED_QUESTIONS,
  zh: [
    "你以前听说过这个地方吗，还是第一次知道？",
    "你自己有什么记忆吗？或者家人、朋友有没有跟你提起过这一带的事情？",
    "还有什么想说的吗——一种感受、一个疑问、一个细节，什么都可以。",
  ],
  th: [
    "คุณเคยได้ยินเรื่องที่นี่มาก่อนไหม หรือเพิ่งรู้จักเป็นครั้งแรก?",
    "มีอะไรที่คุณจำได้เอง หรือบางทีอาจมีคนในครอบครัวหรือเพื่อนเคยเล่าเกี่ยวกับย่านนี้ให้ฟังบ้างไหม?",
    "มีอะไรอื่นอีกไหมที่อยากแบ่งปัน — ความรู้สึก คำถาม รายละเอียดใด ๆ ก็ได้",
  ],
};

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
