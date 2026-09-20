/**
 * Opening the review URL in the human's default browser.
 *
 * Deliberately dependency-free: the three platform commands are a handful of
 * lines, and a spawn failure here must never take the proxy down with it.
 */

import { spawn } from "node:child_process";

/** A resolved platform command for opening a URL. */
export interface OpenCommand {
  command: string;
  args: string[];
}

/**
 * Pick the shell command that opens a URL in the default browser.
 *
 * @param url - Absolute URL to open.
 * @param platform - A `process.platform` value.
 * @returns Command and arguments for {@link spawn}.
 */
export function browserOpenCommand(url: string, platform: NodeJS.Platform): OpenCommand {
  switch (platform) {
    case "darwin":
      return { command: "open", args: [url] };
    case "win32":
      // The empty string is `start`'s title argument. Without it, a quoted URL
      // is treated as the window title and no browser opens.
      return { command: "cmd", args: ["/c", "start", "", url] };
    default:
      return { command: "xdg-open", args: [url] };
  }
}

/** Narrow shape of {@link spawn} that {@link openInBrowser} depends on. */
export type SpawnLike = typeof spawn;

/**
 * Open `url` in the default browser, detached from this process.
 *
 * Failure is reported, never thrown: a headless box with no `xdg-open` is a
 * perfectly normal place to run the proxy, and the URL is always printed to the
 * terminal as well.
 *
 * @param url - Absolute URL to open.
 * @param platform - A `process.platform` value. Injectable for tests.
 * @param spawnFn - Process spawner. Injectable so tests can exercise the
 *   success path without actually opening a browser window.
 * @returns Whether the opener process was spawned successfully.
 */
export async function openInBrowser(
  url: string,
  platform: NodeJS.Platform = process.platform,
  spawnFn: SpawnLike = spawn,
): Promise<boolean> {
  const { command, args } = browserOpenCommand(url, platform);

  return new Promise<boolean>((resolve) => {
    let settled = false;
    /** Resolve once — spawn can emit both 'error' and 'exit'. */
    const settle = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    try {
      const child = spawnFn(command, args, { detached: true, stdio: "ignore" });
      child.once("error", () => settle(false));
      child.once("spawn", () => {
        child.unref();
        settle(true);
      });
    } catch {
      settle(false);
    }
  });
}
