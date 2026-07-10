/* ==============================================================
   dither.js · Shared Bayer-ordered dither background
   Purple gradient (deep → mid → light lavender)
   ============================================================== */
(function initDither() {
  const canvas = document.getElementById("ditherCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  let W = 0, H = 0, dpr = 1;
  const t0 = performance.now();

  const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ].map(r => r.map(v => (v + 0.5) / 16));

  const PIX = 9;
  // brightened purple gradient (one notch lighter than before)
  const LEVELS = [
    [26, 20, 40],
    [42, 34, 72],
    [72, 56, 105],
    [110, 84, 158],
    [148, 116, 196],
    [188, 165, 218],
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
  }
  resize();
  window.addEventListener("resize", resize);

  function render() {
    const t = (performance.now() - t0) / 1000;
    const cols = Math.ceil(W / PIX);
    const rows = Math.ceil(H / PIX);
    const blockSize = Math.max(1, Math.round(PIX * dpr));
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        const u = cx / cols;
        const v = cy / rows;
        const w1 = Math.sin((u * 4.2 + t * 0.07) * Math.PI);
        const w2 = Math.sin((v * 3.2 - t * 0.05) * Math.PI);
        const w3 = Math.sin(((u + v) * 2.5 + t * 0.10) * Math.PI);
        let val = (w1 + w2 + w3) / 3;
        val = (val + 1) / 2;
        val = val * 0.55;
        val = Math.max(0, Math.min(1, val));
        const bx = cx % 4, by = cy % 4;
        const threshold = BAYER[by][bx];
        const stepped = val + (threshold - 0.5) * (1 / LEVELS.length);
        const idx2 = Math.min(LEVELS.length - 1, Math.max(0, Math.floor(stepped * LEVELS.length)));
        const color = LEVELS[idx2];
        const px0 = cx * blockSize;
        const py0 = cy * blockSize;
        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const px = px0 + dx;
            const py = py0 + dy;
            if (px >= canvas.width || py >= canvas.height) continue;
            const ii = (py * canvas.width + px) * 4;
            data[ii] = color[0];
            data[ii + 1] = color[1];
            data[ii + 2] = color[2];
            data[ii + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(render);
  }
  render();
})();
