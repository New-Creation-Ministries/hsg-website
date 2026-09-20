/**
 * Producing the overlay JavaScript the proxy serves.
 *
 * Two situations have to work:
 *
 * - **Installed package** — `dist/overlay.js` was built at publish time and is
 *   simply read from disk. esbuild is a devDependency and will not be present.
 * - **Working from source** — `npm run dev` runs the CLI through tsx with no
 *   build step, so the bundle is produced on demand. esbuild does this in a few
 *   milliseconds, which keeps the "no build step" development story honest.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/** Entry point of the overlay source tree. */
const OVERLAY_ENTRY = new URL("./overlay/index.ts", import.meta.url);

/**
 * Places a prebuilt bundle may sit, relative to this module.
 *
 * The first covers running from `dist/`; the second covers running from `src/`
 * after someone has run a build.
 */
const PREBUILT_CANDIDATES = ["./overlay.js", "../dist/overlay.js"];

/** Read the first prebuilt bundle that exists. */
async function readPrebuilt(): Promise<string | null> {
  for (const candidate of PREBUILT_CANDIDATES) {
    try {
      return await readFile(new URL(candidate, import.meta.url), "utf8");
    } catch {
      // Try the next location.
    }
  }
  return null;
}

/**
 * Bundle the overlay from source with esbuild.
 *
 * @returns The bundled IIFE source.
 * @throws If esbuild is unavailable, which means neither a prebuilt bundle nor
 *   a way to make one — a broken install rather than a recoverable state.
 */
export async function buildOverlayFromSource(): Promise<string> {
  const esbuild = await import("esbuild").catch(() => {
    throw new Error("no prebuilt overlay found and esbuild is unavailable — run `npm run build`");
  });

  const result = await esbuild.build({
    entryPoints: [fileURLToPath(OVERLAY_ENTRY)],
    bundle: true,
    format: "iife",
    target: "es2020",
    platform: "browser",
    write: false,
    // Sourcemap inlined so a stack trace in the host page points at real
    // overlay source rather than a single bundled line.
    sourcemap: "inline",
    logLevel: "silent",
  });

  const output = result.outputFiles?.[0]?.text;
  if (!output) throw new Error("esbuild produced no output for the overlay");
  return output;
}

/**
 * True when this module is running out of the source tree (tsx) rather than
 * from a compiled `dist/`.
 *
 * This decides whether a prebuilt bundle may be trusted. Running from source
 * with a stale `dist/overlay.js` present would otherwise serve yesterday's
 * overlay while you edit today's — a confusing failure that looks like the
 * overlay ignoring your changes.
 */
export const RUNNING_FROM_SOURCE = import.meta.url.includes("/src/");

/**
 * Get the overlay bundle.
 *
 * Prefers a prebuilt bundle when running from `dist/`, and always rebuilds when
 * running from source so edits take effect on reload.
 *
 * @param options.forceRebuild - Override the source-tree detection.
 * @returns Bundled overlay source.
 */
export async function loadOverlayBundle(options: { forceRebuild?: boolean } = {}): Promise<string> {
  const rebuild = options.forceRebuild ?? RUNNING_FROM_SOURCE;
  if (!rebuild) {
    const prebuilt = await readPrebuilt();
    if (prebuilt) return prebuilt;
  }
  return buildOverlayFromSource();
}
