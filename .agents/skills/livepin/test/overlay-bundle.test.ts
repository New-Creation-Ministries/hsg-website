import { describe, expect, it } from "vitest";

import {
  buildOverlayFromSource,
  loadOverlayBundle,
  RUNNING_FROM_SOURCE,
} from "../src/overlay-bundle.js";

describe("buildOverlayFromSource", () => {
  it("produces a self-contained browser bundle", async () => {
    const source = await buildOverlayFromSource();

    // IIFE, so it runs on load without a module loader and leaks no globals.
    expect(source).toMatch(/^"use strict";\s*\(\(\) => \{/);
    // Bundled, not left with bare imports the browser would have to resolve.
    expect(source).not.toMatch(/^\s*import\s+.*from\s+["']\.\.?\//m);
    expect(source).not.toMatch(/^\s*export\s/m);
    // Carries the overlay's own identifiers, so it is the right entry point.
    expect(source).toContain("livepin-overlay-root");
  }, 30_000);
});

describe("loadOverlayBundle", () => {
  it("rebuilds from source when running out of the source tree", async () => {
    // Guards the DX bug this flag exists for: a stale dist/overlay.js being
    // served while the developer edits src/overlay.
    expect(RUNNING_FROM_SOURCE).toBe(true);
    const source = await loadOverlayBundle();
    expect(source).toContain("livepin-overlay-root");
  }, 30_000);

  it("honours an explicit forceRebuild", async () => {
    const source = await loadOverlayBundle({ forceRebuild: true });
    expect(source).toContain("livepin-overlay-root");
  }, 30_000);

  it("looks for a prebuilt bundle when told not to rebuild", async () => {
    // Exercises the prebuilt lookup used by an installed package. Whether a
    // dist build happens to exist or not, the caller must still get a working
    // bundle — a missing one falls back to building rather than failing.
    const source = await loadOverlayBundle({ forceRebuild: false });
    expect(source).toContain("livepin-overlay-root");
  }, 30_000);
});
