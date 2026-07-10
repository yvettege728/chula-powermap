/* ==============================================================
   index.js · Landing page interactions
   ============================================================== */

/* ---- Spotlight cards: track mouse for radial highlight ---- */
(function initSpotlight() {
  document.querySelectorAll(".spotlight-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", (e.clientX - rect.left) + "px");
      card.style.setProperty("--mouse-y", (e.clientY - rect.top) + "px");
    });
  });
})();

/* ---- Build persona portrait strip inside main card ---- */
(function buildPersonaPortraits() {
  const grid = document.getElementById("personaPortraits");
  if (!grid) return;
  const COUNT = 24; // 2 rows × 12
  for (let i = 0; i < COUNT; i++) {
    const canvas = document.createElement("canvas");
    drawFace(canvas, i + 1);
    canvas.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = "persona.html?seed=" + (i + 1);
    });
    grid.appendChild(canvas);
  }
})();

/* ---- Draw random soul button ---- */
document.getElementById("drawRandom")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "persona.html?random=1";
});
