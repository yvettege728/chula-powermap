/* ==============================================================
   portrait.js · Shared pixel portrait drawing
   Used by index.html, persona.html, and anywhere faces appear
   ============================================================== */

const PORTRAIT_SIZE = 14;

function seedRng(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function drawFace(canvas, seed) {
  const ctx = canvas.getContext("2d");
  canvas.width = PORTRAIT_SIZE;
  canvas.height = PORTRAIT_SIZE;
  const rng = seedRng(seed * 7919);

  // background = deep purple
  ctx.fillStyle = "#0c0a14";
  ctx.fillRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);

  const faceColor = "#e2d6f0";
  const hairColor = "#1a1428";

  const headWidth = 6 + Math.floor(rng() * 2);
  const headLeft = Math.floor((PORTRAIT_SIZE - headWidth) / 2);
  const headTop = 3;
  const headHeight = 7;

  // face shape
  for (let y = headTop; y < headTop + headHeight; y++) {
    const isTop = y === headTop;
    const isBot = y === headTop + headHeight - 1;
    let w = headWidth;
    if (isTop) w = headWidth - 2;
    if (isBot) w = headWidth - 1;
    const left = Math.floor(headLeft + (headWidth - w) / 2);
    for (let x = left; x < left + w; x++) {
      ctx.fillStyle = faceColor;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // hair styles
  const hairStyle = Math.floor(rng() * 4);
  ctx.fillStyle = hairColor;
  if (hairStyle === 0) {
    for (let x = headLeft; x < headLeft + headWidth; x++) {
      ctx.fillRect(x, headTop, 1, 1);
      if (rng() > 0.4) ctx.fillRect(x, headTop + 1, 1, 1);
    }
  } else if (hairStyle === 1) {
    ctx.fillRect(headLeft + 2, headTop - 1, 3, 2);
    for (let x = headLeft; x < headLeft + headWidth; x++) ctx.fillRect(x, headTop, 1, 1);
  } else if (hairStyle === 2) {
    for (let x = headLeft; x < headLeft + headWidth; x++) ctx.fillRect(x, headTop, 1, 1);
    ctx.fillRect(headLeft, headTop + 1, 1, 4);
    ctx.fillRect(headLeft + headWidth - 1, headTop + 1, 1, 4);
  } else {
    for (let x = headLeft + 1; x < headLeft + headWidth - 1; x++) {
      if (rng() > 0.6) ctx.fillRect(x, headTop, 1, 1);
    }
  }

  // eyes
  ctx.fillStyle = hairColor;
  const eyeY = headTop + 3;
  ctx.fillRect(headLeft + 1, eyeY, 1, 1);
  ctx.fillRect(headLeft + headWidth - 2, eyeY, 1, 1);

  // mouth
  const mouthStyle = Math.floor(rng() * 3);
  const mouthY = headTop + 5;
  if (mouthStyle === 0) ctx.fillRect(headLeft + 2, mouthY, 2, 1);
  else if (mouthStyle === 1) ctx.fillRect(headLeft + 2, mouthY, 3, 1);
  else ctx.fillRect(headLeft + 3, mouthY, 1, 1);

  // shoulders/body
  ctx.fillStyle = hairColor;
  const shoulderY = headTop + headHeight;
  if (shoulderY < PORTRAIT_SIZE) {
    ctx.fillRect(headLeft - 1, shoulderY, headWidth + 2, 1);
    if (shoulderY + 1 < PORTRAIT_SIZE) {
      ctx.fillRect(headLeft - 2, shoulderY + 1, headWidth + 4, PORTRAIT_SIZE - shoulderY - 1);
    }
  }
}
