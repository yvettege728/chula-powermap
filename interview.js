// interview.js
// DOM wiring for the conversational intake flow. Not unit tested — verified
// via manual QA. Never imported by the Node test suite, so it is safe for
// this file to reference `document`/`fetch`-in-browser freely.
import { FIXED_QUESTIONS, nextStep } from "./interview-state.js";

function initInterviewFlow() {
  if (initInterviewFlow._initialized) return;
  initInterviewFlow._initialized = true;

  const toggle = document.getElementById("intakeToggle");
  const interviewFlow = document.getElementById("interviewFlow");
  const submitForm = document.getElementById("submitForm");
  if (!toggle || !interviewFlow || !submitForm) return; // not on this page

  const threadEl = document.getElementById("interviewThread");
  const answerEl = document.getElementById("interviewAnswer");
  const nextBtn = document.getElementById("interviewNext");
  const statusEl = document.getElementById("interviewStatus");
  const aiDraftNotice = document.getElementById("aiDraftNotice");

  const answers = [];
  let state = { step: "q0", followupQuestion: null };
  let followupAnswer;
  let started = false;

  toggle.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggle.querySelectorAll("[data-mode]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const mode = btn.dataset.mode;
      interviewFlow.hidden = mode !== "interview";
      submitForm.hidden = mode === "interview";
      if (mode === "interview" && !started) {
        started = true;
        askCurrentQuestion();
      }
    });
  });

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "interview-msg interview-msg-" + who;
    el.textContent = text;
    threadEl.appendChild(el);
    threadEl.scrollTop = threadEl.scrollHeight;
  }

  function askCurrentQuestion() {
    if (state.step === "q0" || state.step === "q1" || state.step === "q2") {
      addMessage(FIXED_QUESTIONS[Number(state.step[1])], "bot");
    } else if (state.step === "followup-question") {
      addMessage(state.followupQuestion, "bot");
    }
    answerEl.value = "";
    answerEl.disabled = false;
    nextBtn.disabled = false;
    statusEl.textContent = "";
    answerEl.focus();
  }

  async function handleNext() {
    const value = answerEl.value.trim();
    if (!value) return;

    addMessage(value, "user");
    answerEl.value = "";

    if (state.step === "q0" || state.step === "q1" || state.step === "q2") {
      answers.push(value);
      if (state.step === "q2") {
        nextBtn.disabled = true;
        answerEl.disabled = true;
        statusEl.textContent = "Thinking…";
        try {
          const res = await fetch("/api/followup", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ answers }),
          });
          if (!res.ok) {
            const errBody = await res.text().catch(() => "");
            throw new Error(`followup request failed: ${res.status} ${errBody}`);
          }
          const data = await res.json();
          state = { step: "checking-followup", followupQuestion: data.followup_question };
        } catch (err) {
          console.error("[interview] /api/followup failed:", err);
          return fallbackToForm();
        }
      } else {
        state = { step: nextStep(state), followupQuestion: null };
        askCurrentQuestion();
        return;
      }
    } else if (state.step === "followup-question") {
      followupAnswer = value;
    }

    state = { step: nextStep(state), followupQuestion: state.followupQuestion };

    if (state.step === "followup-question") {
      askCurrentQuestion();
      return;
    }

    if (state.step === "synthesizing") {
      nextBtn.disabled = true;
      answerEl.disabled = true;
      statusEl.textContent = "Organizing your answers…";
      try {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers, followup_answer: followupAnswer }),
        });
        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          throw new Error(`synthesize request failed: ${res.status} ${errBody}`);
        }
        const draft = await res.json();
        applyDraftToForm(draft);
        return;
      } catch (err) {
        console.error("[interview] /api/synthesize failed:", err);
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
    const parts = [...answers];
    if (followupAnswer) parts.push(followupAnswer);
    document.getElementById("description").value = parts.join("\n\n");
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    submitForm.dataset.source = "form";
    alert("The AI assistant is temporarily unavailable, so we've carried your answers into the form below — please review and send it directly.");
    submitForm.scrollIntoView({ behavior: "smooth" });
  }

  nextBtn.addEventListener("click", handleNext);
  answerEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!nextBtn.disabled) handleNext();
    }
  });
}

document.addEventListener("DOMContentLoaded", initInterviewFlow);
