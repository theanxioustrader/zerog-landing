/**
 * functions/api/app-event.js — the missing half of the app analytics wiring.
 *
 * The shipped app (2.5.6, live on the App Store 2026-08-31) hardcodes
 *   POST https://zerog-ai.com/api/app-event
 * but the real handler lives on the zerog-admin Pages project. This domain
 * only served static files, so every app event bounced off the static-asset
 * fallback with a 405 and was silently dropped (the client is fire-and-forget
 * by design, so nothing ever surfaced). This function forwards the event to
 * the real handler so the fleet already on phones starts counting without an
 * app update.
 *
 * It forwards the payload byte-for-byte and adds one header: the caller's
 * edge-derived country, because the upstream stamps country from its own
 * request.cf and a proxied subrequest would otherwise read as the proxy, not
 * the user. Validation (event allowlist, size cap, id shape) stays upstream —
 * duplicating it here would just be a second copy to drift.
 */
const UPSTREAM = 'https://zerog-admin.pages.dev/api/app-event';

export async function onRequestPost({ request }) {
  try {
    const body = await request.text();
    const res = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Country': request.cf?.country || '',
      },
      body,
    });
    return new Response(null, { status: res.status });
  } catch {
    // The app treats any outcome as fine; never let the proxy 500 into logs.
    return new Response(null, { status: 204 });
  }
}
