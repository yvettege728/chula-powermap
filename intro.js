// intro.js
// Plays the opening walk-in intro once, then reveals the chat. Uses
// intro-state.js for the pure decisions. Not unit tested — manual QA.
import { shouldPlayIntro, markIntroSeen, nextFrame, isLastFrame } from "./intro-state.js";

const FRAMES = [
  "images_chatbot/intro/beat-1.png",
  "images_chatbot/intro/beat-2.png",
  "images_chatbot/intro/beat-3.png",
  "images_chatbot/intro/beat-4.png",
  "images_chatbot/intro/beat-5.png",
];
const CAPTION_KEYS = ["intro.beat1", "intro.beat2", "intro.beat3", "intro.beat4", "intro.beat5"];
const FRAME_MS = 2400; // ~12s across 5 beats

function applyCaptionI18n(el) {
  // Re-apply the page's own i18n so the caption shows in the current language.
  const key = el.getAttribute("data-i18n");
  const dict = window.__CONTRIBUTE_I18N__ && window.__CONTRIBUTE_I18N__[document.body.dataset.lang || "en"];
  if (dict && dict[key] != null) el.innerHTML = dict[key];
}

function initIntro() {
  const intro = document.getElementById("jakeIntro");
  const frameEl = document.getElementById("jakeIntroFrame");
  const captionEl = document.getElementById("jakeIntroCaption");
  const skipBtn = document.getElementById("jakeIntroSkip");
  const toggle = document.getElementById("intakeToggle");
  if (!intro || !frameEl || !captionEl || !toggle) return;

  const interviewBtn = toggle.querySelector('[data-mode="interview"]');
  if (!interviewBtn) return;

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;
  let i = 0;

  function show(idx) {
    frameEl.src = FRAMES[idx];
    captionEl.setAttribute("data-i18n", CAPTION_KEYS[idx]);
    applyCaptionI18n(captionEl);
  }

  function end() {
    if (timer) clearInterval(timer);
    timer = null;
    intro.hidden = true;
    markIntroSeen(window.localStorage);
  }

  function playFrom(idx) {
    i = idx;
    show(i);
    timer = setInterval(() => {
      if (isLastFrame(i, FRAMES.length)) return end();
      i = nextFrame(i, FRAMES.length);
      show(i);
    }, FRAME_MS);
  }

  interviewBtn.addEventListener(
    "click",
    () => {
      if (!shouldPlayIntro(window.localStorage, reduce)) {
        intro.hidden = true;
        return;
      }
      intro.hidden = false;
      if (reduce) {
        show(FRAMES.length - 1); // final frame + disclosure, no motion
      } else {
        playFrom(0);
      }
    },
    { once: true }
  );

  skipBtn.addEventListener("click", end);
}

document.addEventListener("DOMContentLoaded", initIntro);
