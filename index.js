/* ==============================================================
   index.js · Landing page interactions (v6)
   - spotlight cards
   - trilingual switch (EN / 中 / ไทย)
   - drop-in image-slot fallback
   ============================================================== */

/* ---- Spotlight cards: track mouse for radial highlight ---- */
(function initSpotlight() {
  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", e.clientX - rect.left + "px");
      card.style.setProperty("--mouse-y", e.clientY - rect.top + "px");
    });
  });
})();

/* ---- Trilingual switch ----
   Every translatable node carries class "i18n" + data-en / data-zh / data-th.
   Values may contain inline markup (<em>, <strong>, <b>), so we use innerHTML.
   The content is authored, not user-supplied. Choice persists in localStorage. */
(function initLanguage() {
  const LANGS = ["en", "zh", "th"];
  const STORE_KEY = "cpm-lang";
  const nodes = document.querySelectorAll(".i18n");
  const buttons = document.querySelectorAll(".lang-switch [data-setlang]");

  function apply(lang) {
    if (!LANGS.includes(lang)) lang = "en";
    document.body.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-Hans" : lang === "th" ? "th" : "en");
    nodes.forEach((el) => {
      const val = el.dataset[lang];
      if (val != null) el.innerHTML = val;
    });
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setlang === lang)));
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.setlang)));

  let initial = "en";
  try { initial = localStorage.getItem(STORE_KEY) || "en"; } catch (e) {}
  apply(initial);
})();

/* ---- Image-slot fallback ----
   Each <img class="genimg"> is followed by a .slot-ph placeholder.
   If the file is missing/unloadable, reveal the labelled placeholder so the
   layout still reads and shows exactly which file to drop in. */
(function initImageSlots() {
  document.querySelectorAll("img.genimg").forEach((img) => {
    const fail = () => img.classList.add("is-missing");
    // Already errored before this script ran?
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener("error", fail);
    // Empty/invalid src guard
    if (!img.getAttribute("src")) fail();
  });
})();
