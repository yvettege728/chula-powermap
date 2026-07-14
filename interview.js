// interview.js
// DOM wiring for the adaptive intake conversation. Not unit tested — verified
// via manual QA. Never imported by the Node test suite.
import { createInitialState, mergeCoverage, shouldStop } from "./interview-state.js";

const OPENING = {
  en: "Hi, I'm Jake — I help look after this archive. No forms here, just tell me about a place near Sam Yan that matters to you.",
  zh: "嗨，我是 Jake，帮忙照看这个档案。这里没有表格——跟我说说三养（Sam Yan）附近一个对你重要的地方吧。",
  th: "สวัสดี ผมชื่อเจค ผมช่วยดูแลคลังเรื่องราวนี้ ที่นี่ไม่มีแบบฟอร์ม เล่าให้ฟังหน่อยได้ไหมว่ามีที่ไหนแถวสามย่านที่มีความหมายกับคุณ",
};

const STATUS_TEXT = {
  en: { thinking: "Jake is thinking…", organizing: "Organizing your story…" },
  zh: { thinking: "Jake 正在想…", organizing: "正在整理你的故事…" },
  th: { thinking: "เจคกำลังคิด…", organizing: "กำลังเรียบเรียงเรื่องของคุณ…" },
};

const FALLBACK_ALERT_TEXT = {
  en: "Jake is temporarily unavailable, so we've carried what you shared into the form below — please review and send it directly.",
  zh: "Jake 暂时无法使用，我们已把你分享的内容填入下方表单——请检查后直接发送。",
  th: "เจคไม่พร้อมใช้งานชั่วคราว เราจึงนำสิ่งที่คุณเล่ามาใส่ในแบบฟอร์มด้านล่างแล้ว — โปรดตรวจสอบแล้วส่งได้เลย",
};

function currentLang() {
  return document.body.dataset.lang || "en";
}
function pick(map) {
  const lang = currentLang();
  return map[lang] || map.en;
}

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

  let state = createInitialState();
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
        addMessage(pick(OPENING), "bot");
        state.transcript.push({ role: "bot", text: pick(OPENING) });
        enableInput();
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

  function enableInput() {
    answerEl.value = "";
    answerEl.disabled = false;
    nextBtn.disabled = false;
    statusEl.textContent = "";
    answerEl.focus();
  }

  function busy(key) {
    nextBtn.disabled = true;
    answerEl.disabled = true;
    statusEl.textContent = pick(STATUS_TEXT)[key];
  }

  async function handleNext() {
    const value = answerEl.value.trim();
    if (!value) return;

    addMessage(value, "user");
    state.transcript.push({ role: "user", text: value });
    state.turn += 1;
    answerEl.value = "";

    if (shouldStop(state)) return synthesize();

    busy("thinking");
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transcript: state.transcript,
          coverage: state.coverage,
          turn: state.turn,
          language: currentLang(),
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`followup failed: ${res.status} ${errBody}`);
      }
      const data = await res.json();
      state.coverage = mergeCoverage(state.coverage, data.coverage_update);
      if (data.reply) {
        addMessage(data.reply, "bot");
        state.transcript.push({ role: "bot", text: data.reply });
      }
      if (shouldStop(state)) return synthesize();
      enableInput();
    } catch (err) {
      console.error("[interview] /api/followup failed:", err);
      fallbackToForm();
    }
  }

  async function synthesize() {
    busy("organizing");
    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript: state.transcript, language: currentLang() }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`synthesize failed: ${res.status} ${errBody}`);
      }
      const draft = await res.json();
      applyDraftToForm(draft);
    } catch (err) {
      console.error("[interview] /api/synthesize failed:", err);
      fallbackToForm();
    }
  }

  function applyDraftToForm(draft) {
    if (draft.kind) document.getElementById("kind").value = draft.kind;
    const siteEl = document.getElementById("site");
    if (draft.site) siteEl.value = draft.site;
    document.getElementById("description").value = draft.description || "";
    submitForm.dataset.transcript = JSON.stringify(state.transcript);
    submitForm.dataset.language = currentLang();
    submitForm.dataset.source = "ai-interview";
    aiDraftNotice.hidden = false;
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    // If the AI couldn't resolve a site, make the contributor choose it.
    if (!draft.site) {
      siteEl.value = "other";
      siteEl.focus();
    }
    submitForm.scrollIntoView({ behavior: "smooth" });
  }

  function fallbackToForm() {
    statusEl.textContent = "";
    const userText = state.transcript
      .filter((t) => t.role === "user")
      .map((t) => t.text)
      .join("\n\n");
    document.getElementById("description").value = userText;
    submitForm.dataset.transcript = JSON.stringify(state.transcript);
    submitForm.dataset.language = currentLang();
    submitForm.dataset.source = "form";
    interviewFlow.hidden = true;
    submitForm.hidden = false;
    alert(pick(FALLBACK_ALERT_TEXT));
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
