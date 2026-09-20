import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";

import type { SpawnLike } from "../src/open-browser.js";
import { browserOpenCommand, openInBrowser } from "../src/open-browser.js";

describe("browserOpenCommand", () => {
  it("uses `open` on macOS", () => {
    expect(browserOpenCommand("http://x/", "darwin")).toEqual({
      command: "open",
      args: ["http://x/"],
    });
  });

  it("uses `cmd /c start` on Windows, with the empty title argument", () => {
    const { command, args } = browserOpenCommand("http://x/", "win32");
    expect(command).toBe("cmd");
    // Without the empty title, `start` treats the URL as a window title.
    expect(args).toEqual(["/c", "start", "", "http://x/"]);
  });

  it("uses `xdg-open` everywhere else", () => {
    expect(browserOpenCommand("http://x/", "linux")).toEqual({
      command: "xdg-open",
      args: ["http://x/"],
    });
    expect(browserOpenCommand("http://x/", "freebsd").command).toBe("xdg-open");
  });
});

describe("openInBrowser", () => {
  // A real spawn is never used here: these tests must not pop a browser window
  // on the machine running `npm test`.

  it("reports success and unrefs the child when the opener spawns", async () => {
    let unreffed = false;
    const fake = fakeSpawn({ emit: "spawn", onUnref: () => (unreffed = true) });

    expect(await openInBrowser("http://x/", "linux", fake.spawnFn)).toBe(true);
    expect(fake.calls).toEqual([{ command: "xdg-open", args: ["http://x/"] }]);
    // Left reffed, the detached opener would keep the CLI process alive.
    expect(unreffed).toBe(true);
  });

  it("reports failure when the opener errors instead of throwing", async () => {
    const fake = fakeSpawn({ emit: "error" });
    expect(await openInBrowser("http://x/", "linux", fake.spawnFn)).toBe(false);
  });

  it("reports failure when spawn throws synchronously", async () => {
    const throwing = (() => {
      throw new Error("ENOENT");
    }) as unknown as SpawnLike;
    expect(await openInBrowser("http://x/", "linux", throwing)).toBe(false);
  });

  it("resolves once even if the child emits both spawn and error", async () => {
    const fake = fakeSpawn({ emit: "both" });
    expect(await openInBrowser("http://x/", "linux", fake.spawnFn)).toBe(true);
  });
});

/** Build a {@link SpawnLike} that emits a chosen lifecycle event. */
function fakeSpawn(opts: { emit: "spawn" | "error" | "both"; onUnref?: () => void }) {
  const calls: { command: string; args: string[] }[] = [];

  const spawnFn = ((command: string, args: string[]) => {
    calls.push({ command, args });
    const child = new EventEmitter() as EventEmitter & { unref: () => void };
    child.unref = () => opts.onUnref?.();

    queueMicrotask(() => {
      if (opts.emit === "spawn" || opts.emit === "both") child.emit("spawn");
      if (opts.emit === "error" || opts.emit === "both") child.emit("error", new Error("boom"));
    });

    return child;
  }) as unknown as SpawnLike;

  return { spawnFn, calls };
}
