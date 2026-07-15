// interview.js
// DOM wiring for the adaptive intake conversation, with optional voice input.
// Not unit tested — verified via manual QA. Never imported by the Node test suite.
import { createInitialState, mergeCoverage, shouldStop, TURN_CAP } from "./interview-state.js";

const OPENING = {
  en: "Hi, I'm Jake — I help look after this archive. No forms here, just tell me about a place near Sam Yan that matters to you.",
  zh: "嗨，我是 Jake，帮忙照看这个档案。这里没有表格——跟我说说三养（Sam Yan）附近一个对你重要的地方吧。",
  th: "สวัสดี ผมชื่อเจค ผมช่วยดูแลคลังเรื่องราวนี้ ที่นี่ไม่มีแบบฟอร์ม เล่าให้ฟังหน่อยได้ไหมว่ามีที่ไหนแถวสามย่านที่มีความหมายกับคุณ",
};

const STATUS_TEXT = {
  en: { thinking: "Jake is thinking…", organizing: "Organizing your story…", transcribing: "Listening back…" },
  zh: { thinking: "Jake 正在想…", organizing: "正在整理你的故事…", transcribing: "正在识别语音…" },
  th: { thinking: "เจคกำลังคิด…", organizing: "กำลังเรียบเรียงเรื่องของคุณ…", transcribing: "กำลังถอดเสียง…" },
};

const FALLBACK_ALERT_TEXT = {
  en: "Jake is temporarily unavailable, so we've carried what you shared into the form below — please review and send it directly.",
  zh: "Jake 暂时无法使用，我们已把你分享的内容填入下方表单——请检查后直接发送。",
  th: "เจคไม่พร้อมใช้งานชั่วคราว เราจึงนำสิ่งที่คุณเล่ามาใส่ในแบบฟอร์มด้านล่างแล้ว — โปรดตรวจสอบแล้วส่งได้เลย",
};

const MIC_DENIED_TEXT = {
  en: "No problem — you can type your answers instead.",
  zh: "没关系——你可以改用打字回答。",
  th: "ไม่เป็นไร — คุณพิมพ์คำตอบแทนได้",
};

const VOICE_RECORDED_PLACEHOLDER = {
  en: "(voice recorded — couldn't hear it clearly, what did you say?)",
  zh: "（已录音——没太听清，你说的是？）",
  th: "(อัดเสียงแล้ว — ฟังไม่ชัด คุณพูดว่าอะไรนะ?)",
};

const MAX_RECORDING_SECONDS = 180;

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
  const guideCol = document.getElementById("guideCol");
  const typingEl = document.getElementById("interviewTyping");
  const progressEl = document.getElementById("chatProgress");

  // Voice elements (present only when Phase B markup is in the page).
  const micBtn = document.getElementById("interviewMic");
  const consentEl = document.getElementById("interviewConsent");
  const recordingEl = document.getElementById("interviewRecording");
  const recTimeEl = document.getElementById("interviewRecTime");
  const recStopBtn = document.getElementById("interviewRecStop");

  let state = createInitialState();
  let started = false;

  // Voice state
  const sessionId = (crypto.randomUUID && crypto.randomUUID().replace(/-/g, "").slice(0, 12)) || String(Date.now());
  const audioClips = []; // R2 keys, one per spoken turn
  let consentAgreed = false;
  let mediaRecorder = null;
  let recChunks = [];
  let recTimer = null;
  let recStart = 0;

  function setAvatar(stateName) {
    interviewFlow.dataset.avatar = stateName;
  }

  toggle.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      toggle.hidden = true; // collapse the choice screen once chosen
      if (guideCol) guideCol.hidden = mode !== "form";
      interviewFlow.hidden = mode !== "interview";
      submitForm.hidden = mode === "interview";
      if (mode === "interview" && !started) {
        started = true;
        addMessage(pick(OPENING), "bot");
        state.transcript.push({ role: "bot", text: pick(OPENING) });
        updateProgress();
        enableInput();
      }
    });
  });

  function addMessage(text, who) {
    if (who === "bot") hideTyping();
    const row = document.createElement("div");
    row.className = "chat-row chat-row-" + who;
    if (who === "bot") {
      const av = document.createElement("div");
      av.className = "chat-msg-avatar";
      row.appendChild(av);
    }
    const bubble = document.createElement("div");
    bubble.className = "interview-msg interview-msg-" + who;
    bubble.textContent = text;
    row.appendChild(bubble);
    threadEl.appendChild(row);
    threadEl.scrollTop = threadEl.scrollHeight;
  }

  function updateProgress() {
    if (!progressEl) return;
    const n = Math.min(state.turn + 1, TURN_CAP);
    progressEl.textContent = `${n} / ${TURN_CAP}`;
  }

  function showTyping() {
    if (typingEl) {
      typingEl.hidden = false;
      threadEl.scrollTop = threadEl.scrollHeight;
    }
  }

  function hideTyping() {
    if (typingEl) typingEl.hidden = true;
  }

  function enableInput() {
    hideTyping();
    answerEl.value = "";
    answerEl.disabled = false;
    nextBtn.disabled = false;
    if (micBtn) micBtn.hidden = false;
    statusEl.textContent = "";
    setAvatar("idle");
    answerEl.focus();
  }

  function busy(key) {
    nextBtn.disabled = true;
    answerEl.disabled = true;
    if (micBtn) micBtn.hidden = true;
    statusEl.textContent = pick(STATUS_TEXT)[key];
    if (key === "thinking") showTyping();
  }

  // Shared path for a contributor turn, whether typed or transcribed from speech.
  async function submitUserTurn(text) {
    addMessage(text, "user");
    state.transcript.push({ role: "user", text });
    state.turn += 1;
    updateProgress();
    answerEl.value = "";

    if (shouldStop(state)) return synthesize();

    busy("thinking");
    setAvatar("thinking");
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
        setAvatar("speaking");
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

  function handleNext() {
    const value = answerEl.value.trim();
    if (!value) return;
    submitUserTurn(value);
  }

  // ---- Voice ----

  function fmtTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function showRecordingUI() {
    if (micBtn) micBtn.hidden = true;
    nextBtn.disabled = true;
    answerEl.disabled = true;
    if (recordingEl) recordingEl.hidden = false;
    recStart = Date.now();
    if (recTimeEl) recTimeEl.textContent = "0:00";
    recTimer = setInterval(() => {
      const secs = Math.floor((Date.now() - recStart) / 1000);
      if (recTimeEl) recTimeEl.textContent = fmtTime(secs);
      if (secs >= MAX_RECORDING_SECONDS && mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, 500);
  }

  function hideRecordingUI() {
    if (recTimer) clearInterval(recTimer);
    recTimer = null;
    if (recordingEl) recordingEl.hidden = true;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size) recChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recChunks, { type: mediaRecorder.mimeType || "audio/webm" });
        handleRecordedBlob(blob);
      };
      mediaRecorder.start();
      showRecordingUI();
      setAvatar("listening");
    } catch (err) {
      console.error("[interview] mic unavailable:", err);
      hideRecordingUI();
      statusEl.textContent = pick(MIC_DENIED_TEXT);
      answerEl.disabled = false;
      nextBtn.disabled = false;
      answerEl.focus();
    }
  }

  async function uploadClip(blob) {
    const res = await fetch(
      `/api/voice?session=${encodeURIComponent(sessionId)}&turn=${state.turn}&language=${currentLang()}`,
      { method: "POST", headers: { "content-type": blob.type || "audio/webm" }, body: blob }
    );
    if (!res.ok) throw new Error(`voice upload failed: ${res.status}`);
    return res.json(); // { key, transcript, warning? }
  }

  async function handleRecordedBlob(blob) {
    hideRecordingUI();
    busy("transcribing");
    setAvatar("thinking");
    try {
      const data = await uploadClip(blob);
      if (data.key) audioClips.push(data.key);
      if (data.transcript) {
        await submitUserTurn(data.transcript);
      } else {
        // Audio saved but transcription empty — keep the clip, ask them to type.
        statusEl.textContent = "";
        answerEl.value = "";
        answerEl.disabled = false;
        nextBtn.disabled = false;
        if (micBtn) micBtn.hidden = false;
        answerEl.setAttribute("placeholder", pick(VOICE_RECORDED_PLACEHOLDER));
        answerEl.focus();
      }
    } catch (err) {
      console.error("[interview] voice upload failed:", err);
      enableInput();
    }
  }

  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording") return;
      if (!consentAgreed) {
        if (consentEl) consentEl.hidden = false;
        consentAgreed = true;
        return; // first tap shows consent; next tap starts recording
      }
      startRecording();
    });
  }
  if (recStopBtn) {
    recStopBtn.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop();
    });
  }

  // ---- Synthesis + handoff to the form ----

  async function synthesize() {
    busy("organizing");
    setAvatar("thinking");
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
    if (audioClips.length) submitForm.dataset.audioClips = JSON.stringify(audioClips);
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
    if (audioClips.length) submitForm.dataset.audioClips = JSON.stringify(audioClips);
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
