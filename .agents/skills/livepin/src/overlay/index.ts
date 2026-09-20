/**
 * Overlay entry point. Bundled by esbuild and served at
 * `/__livepin/overlay.js`, which the proxy injects into every HTML document.
 */

import { Overlay, OVERLAY_HOST_ID } from "./ui.js";

declare global {
  interface Window {
    /** Handle for debugging and for teardown on hot reload. */
    __LIVEPIN__?: { overlay: Overlay; version: string };
  }
}

/** Mount the overlay, replacing any instance left by a previous hot reload. */
function boot(): void {
  // The injected tag is deferred, but a client-side route change or an HMR
  // update can re-run this bundle. Tear down the old instance rather than
  // stacking a second overlay on the page.
  window.__LIVEPIN__?.overlay.destroy();
  document.getElementById(OVERLAY_HOST_ID)?.remove();

  const overlay = new Overlay();
  window.__LIVEPIN__ = { overlay, version: "0.1.0" };
  void overlay.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
