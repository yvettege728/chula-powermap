// interview.js
// DOM wiring for the conversational intake flow. Not unit tested — verified
// via manual QA. Never imported by the Node test suite, so it is safe for
// this file to reference `document`/`fetch`-in-browser freely.
import { FIXED_QUESTIONS, nextStep } from "./interview-state.js";

function initInterviewFlow() {
  const toggle = document.getElementById("intakeToggle");
  const interviewFlow = document.getElementById("interviewFlow");
  const submitForm = document.getElementById("submitForm");
  if (!toggle || !interviewFlow || !submitForm) return; // not on this page

  const questionEl = document.getElementById("interviewQuestion");
  const answerEl = document.getElementById("interviewAnswer");
  const nextBtn = document.getElementById("interviewNext");
  const statusEl = document.getElementById("interviewStatus");
  const aiDraftNotice = document.getElementById("aiDraftNotice");

  const answers = [];
  let state = { step: "q0", followupQuestion: null };
  let followupAnswer;

  toggle.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggle.querySelectorAll("[data-mode]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const mode = btn.dataset.mode;
      interviewFlow.hidden = mode !== "interview";
      submitForm.hidden = mode === "interview";
      if (mode === "interview") renderStep();
    });
  });

  function renderStep() {
    if (state.step === "q0" || state.step === "q1" || state.step === "q2") {
      const idx = Number(state.step[1]);
      questionEl.textContent = FIXED_QUESTIONS[idx];
      answerEl.value = "";
      answerEl.disabled = false;
      nextBtn.disabled = false;
      statusEl.textContent = "";
    } else if (state.step === "followup-question") {
      questionEl.textContent = state.followupQuestion;
      answerEl.value = "";
      answerEl.disabled = false;
      nextBtn.disabled = false;
      statusEl.textContent = "";
    }
  }

  async function handleNext() {
    const value = answerEl.value.trim();
    if (!value) return;

    if (state.step === "q0" || state.step === "q1" || state.step === "q2") {
      answers.push(value);
      if (state.step === "q2") {
        nextBtn.disabled = true;
        statusEl.textContent = "Thinking…";
        try {
          const res = await fetch("/api/followup", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ answers }),
          });
          if (!res.ok) throw new Error("followup request failed");
          const data = await res.json();
          state = { step: "checking-followup", followupQuestion: data.followup_question };
        } catch {
          return fallbackToForm();
        }
      } else {
        state = { step: nextStep(state) };
        renderStep();
        return;
      }
    } else if (state.step === "followup-question") {
      followupAnswer = value;
    }

    state = { step: nextStep(state), followupQuestion: state.followupQuestion };

    if (state.step === "followup-question") {
      renderStep();
      return;
    }

    if (state.step === "synthesizing") {
      nextBtn.disabled = true;
      statusEl.textContent = "Organizing your answers…";
      try {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers, followup_answer: followupAnswer }),
        });
        if (!res.ok) throw new Error("synthesize request failed");
        const draft = await res.json();
        applyDraftToForm(draft);
        return;
      } catch {
        return fallbackToForm();
      }
    }
  }

  function applyDraftToForm(draft) {
    document.getElementById("kind").value = draft.kind;
    document.getElementById("site").value = draft.site;
    document.getElementById("description").value = draft.description;
    aiDraftNotice.hidden = false;
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    submitForm.dataset.source = "ai-interview";
    submitForm.scrollIntoView({ behavior: "smooth" });
  }

  function fallbackToForm() {
    statusEl.textContent = "";
    document.getElementById("description").value = answers.join("\n\n");
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    submitForm.dataset.source = "form";
    alert("The AI assistant is temporarily unavailable, so we've carried your answers into the form below — please review and send it directly.");
    submitForm.scrollIntoView({ behavior: "smooth" });
  }

  nextBtn.addEventListener("click", handleNext);
  renderStep();
}

document.addEventListener("DOMContentLoaded", initInterviewFlow);
