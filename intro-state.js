// intro-state.js
// Pure sequencing logic for the opening intro animation. No DOM. Storage and
// reduced-motion are injected so this is unit-testable.

export const INTRO_STORAGE_KEY = "chula_seen_jake_intro";

export function shouldPlayIntro(storage, prefersReducedMotion) {
  // Reduced motion does not skip the intro — the caller shows the final frame
  // (with the disclosure text) instantly instead of animating.
  void prefersReducedMotion;
  try {
    return storage.getItem(INTRO_STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markIntroSeen(storage) {
  try {
    storage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    /* private mode / storage disabled — intro simply replays next time */
  }
}

export function nextFrame(index, frameCount) {
  return Math.min(index + 1, frameCount - 1);
}

export function isLastFrame(index, frameCount) {
  return index >= frameCount - 1;
}
