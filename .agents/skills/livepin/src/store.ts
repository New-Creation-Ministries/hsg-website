/**
 * On-disk state, under `.livepin/` in the host project.
 *
 * Two files, with different jobs:
 *
 * - `<session>.json` is the review itself — threads, comments, and the agent's
 *   delivery cursor. It exists so a restart, a crash, or a killed poll does not
 *   discard what the human said.
 * - `current.json` is a pointer to the running proxy. The agent verbs run as
 *   separate short-lived processes and need to find the server; this is how.
 *
 * Session writes are atomic (temp file plus rename) because the alternative is a
 * truncated JSON file where a review used to be.
 */

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import type { AgentChannel, QueueSnapshot } from "./channel.js";
import type { Session, SessionSnapshot } from "./session.js";

/** Directory created inside the host project. */
export const LIVEPIN_DIR = ".livepin";

/** Name of the running-server pointer file. */
export const POINTER_FILE = "current.json";

/** Format version, so a future change can migrate rather than misread. */
export const STORE_VERSION = 1;

/** Line written into the host project's `.gitignore`. */
export const IGNORE_LINE = `${LIVEPIN_DIR}/`;

/** A persisted review. */
export interface PersistedSession {
  version: number;
  updatedAt: string;
  session: SessionSnapshot;
  queue: QueueSnapshot;
}

/**
 * Where the proxy is — or was — listening.
 *
 * Kept after shutdown with `running: false` rather than deleted, because it
 * carries two different facts: how to reach a live proxy (which expires) and
 * which session this project was last reviewing (which does not, and is what
 * `livepin start` resumes).
 */
export interface ServerPointer {
  sessionId: string;
  host: string;
  port: number;
  target: string;
  /** Process id of the proxy, for diagnostics when something is stuck. */
  pid: number;
  startedAt: string;
  /** False once the proxy has stopped. */
  running: boolean;
}

/** Walk up from `from` looking for a `.git` entry. */
function findGitRoot(from: string): string | null {
  let dir = path.resolve(from);

  for (;;) {
    if (existsSync(path.join(dir, ".git"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Reads and writes livepin's files for one host project.
 *
 * The root is the directory the proxy was started in, which is the directory
 * the agent will also be run from — that shared assumption is what lets the
 * verbs find the session without being told where it is.
 */
export class SessionStore {
  readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  /** The `.livepin/` directory. */
  get dir(): string {
    return path.join(this.root, LIVEPIN_DIR);
  }

  /** Path of the pointer file. */
  get pointerPath(): string {
    return path.join(this.dir, POINTER_FILE);
  }

  /**
   * Path of a session file.
   *
   * @param sessionId - Session identifier.
   * @returns Absolute path.
   */
  sessionPath(sessionId: string): string {
    return path.join(this.dir, `${sessionId}.json`);
  }

  /**
   * Read the running-server pointer.
   *
   * @returns The pointer, or null if absent or unreadable. A damaged pointer is
   *   a hint that has gone stale, not a failure worth stopping for.
   */
  async readPointer(): Promise<ServerPointer | null> {
    try {
      return JSON.parse(await readFile(this.pointerPath, "utf8")) as ServerPointer;
    } catch {
      return null;
    }
  }

  /**
   * Record where the proxy is listening.
   *
   * @param pointer - Address and session of the running server.
   */
  async writePointer(pointer: ServerPointer): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await this.atomicWrite(this.pointerPath, JSON.stringify(pointer, null, 2));
  }

  /**
   * Record that the proxy has stopped, keeping which session it was serving.
   *
   * @returns True if a pointer existed to update.
   */
  async markStopped(): Promise<boolean> {
    const pointer = await this.readPointer();
    if (!pointer) return false;

    await this.writePointer({ ...pointer, running: false });
    return true;
  }

  /**
   * Load a persisted review.
   *
   * @param sessionId - Session identifier.
   * @returns The persisted state, or null if there is no such file.
   * @throws If the file exists but cannot be parsed — silently discarding a
   *   review would lose the human's comments without telling anyone.
   */
  async readSession(sessionId: string): Promise<PersistedSession | null> {
    const file = this.sessionPath(sessionId);

    let text: string;
    try {
      text = await readFile(file, "utf8");
    } catch {
      return null;
    }

    try {
      return JSON.parse(text) as PersistedSession;
    } catch {
      throw new Error(`${file} is not readable JSON — move it aside or start with --fresh`);
    }
  }

  /**
   * Write a review to disk.
   *
   * @param data - Session and queue state.
   */
  async writeSession(data: PersistedSession): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await this.atomicWrite(this.sessionPath(data.session.id), JSON.stringify(data, null, 2));
  }

  /**
   * Add `.livepin/` to the host project's `.gitignore`.
   *
   * Only inside a git repository, and only when not already ignored. Outside a
   * repository there is nothing to ignore and creating the file would just be
   * litter in someone else's directory.
   *
   * @returns True if the line was added.
   */
  async ensureIgnored(): Promise<boolean> {
    const gitRoot = findGitRoot(this.root);
    if (!gitRoot) return false;

    const file = path.join(gitRoot, ".gitignore");
    let current = "";
    try {
      current = await readFile(file, "utf8");
    } catch {
      // No .gitignore yet; one containing just this line is the right outcome.
    }

    const ignored = current
      .split("\n")
      .some((line) => line.trim() === IGNORE_LINE || line.trim() === LIVEPIN_DIR);
    if (ignored) return false;

    const prefix = current === "" || current.endsWith("\n") ? current : `${current}\n`;
    await writeFile(file, `${prefix}${IGNORE_LINE}\n`, "utf8");
    return true;
  }

  /** Write via a temp file and rename, so readers never see a partial file. */
  private async atomicWrite(file: string, contents: string): Promise<void> {
    const temp = `${file}.${process.pid}.tmp`;
    await writeFile(temp, contents, "utf8");
    await rename(temp, file);
  }
}

/** How long changes are batched before hitting the disk. */
export const SAVE_DEBOUNCE_MS = 50;

/** Options for {@link persistSession}. */
export interface PersistOptions {
  store: SessionStore;
  session: Session;
  channel: AgentChannel;
  /** Batching window in milliseconds. */
  debounceMs?: number;
  /** Returns the current time as an ISO string. */
  now?: () => string;
  /** Reports a failed write. Defaults to `console.error`. */
  onError?: (error: unknown) => void;
}

/** Handle returned by {@link persistSession}. */
export interface Persistence {
  /** Write immediately, and wait for it to land. */
  flush: () => Promise<void>;
  /** Stop watching, then write one last time. */
  stop: () => Promise<void>;
}

/**
 * Keep the session file in step with the live session.
 *
 * Writes are debounced because a single human comment produces several state
 * changes, and serialised because two overlapping writes of the same file is how
 * you end up with neither.
 *
 * @param options - Store, session, channel and tuning.
 * @returns Handle for flushing and shutting down.
 */
export function persistSession(options: PersistOptions): Persistence {
  const { store, session, channel } = options;
  const debounceMs = options.debounceMs ?? SAVE_DEBOUNCE_MS;
  const now = options.now ?? ((): string => new Date().toISOString());
  const onError = options.onError ?? ((error: unknown): void => console.error(error));

  let timer: NodeJS.Timeout | null = null;
  let writing: Promise<void> = Promise.resolve();

  const write = async (): Promise<void> => {
    try {
      await store.writeSession({
        version: STORE_VERSION,
        updatedAt: now(),
        session: session.toSnapshot(),
        queue: channel.snapshot(),
      });
    } catch (error) {
      // A review that cannot be saved is still a review worth continuing; say
      // so loudly and keep serving.
      onError(error);
    }
  };

  const save = (): Promise<void> => {
    writing = writing.then(write, write);
    return writing;
  };

  const trigger = (): void => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      void save();
    }, debounceMs);
  };

  const unsubscribe = session.subscribe(trigger);
  const previousOnChange = channel.onChange;
  channel.onChange = (): void => {
    previousOnChange();
    trigger();
  };

  const flush = async (): Promise<void> => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    await save();
  };

  return {
    flush,
    stop: async (): Promise<void> => {
      unsubscribe();
      channel.onChange = previousOnChange;
      await flush();
    },
  };
}
