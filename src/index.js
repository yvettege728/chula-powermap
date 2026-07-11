// src/index.js
// Cloudflare Workers entry point (the "main" script referenced in
// wrangler.jsonc). Static assets (index.html, submit.html, images, etc.)
// are served automatically by Cloudflare BEFORE this script ever runs, so
// in practice this fetch() handler only ever sees the three /api/* routes
// below — everything else already matched a real file and never reached
// here. Reuses the exact same, already-tested handler functions from
// functions/api/*.js with zero duplication (they were written for
// Cloudflare Pages Functions' onRequestPost(context) convention, and that
// function shape works unchanged when called directly like this).
import { onRequestPost as followupHandler } from "../functions/api/followup.js";
import { onRequestPost as synthesizeHandler } from "../functions/api/synthesize.js";
import { onRequestPost as submitHandler } from "../functions/api/submit.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/followup") {
      return followupHandler({ request, env });
    }
    if (request.method === "POST" && url.pathname === "/api/synthesize") {
      return synthesizeHandler({ request, env });
    }
    if (request.method === "POST" && url.pathname === "/api/submit") {
      return submitHandler({ request, env });
    }

    // Fallback: hand anything else to static asset serving. This path
    // should rarely if ever be hit given Cloudflare's default
    // assets-before-Worker routing, but it's a safe default rather than an
    // unhandled crash if it ever is.
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
