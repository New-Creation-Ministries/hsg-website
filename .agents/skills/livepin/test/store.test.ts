import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AgentChannel } from "../src/channel.js";
import { GLOBAL_THREAD_ID, Session } from "../src/session.js";
import {
  IGNORE_LINE,
  LIVEPIN_DIR,
  persistSession,
  SessionStore,
  STORE_VERSION,
  type PersistedSession,
  type ServerPointer,
} from "../src/store.js";

const NOW = "2026-08-07T00:00:00.000Z";

let dir: string;
let store: SessionStore;

/** A pointer with every field filled in. */
function pointer(overrides: Partial<ServerPointer> = {}): ServerPointer {
  return {
    sessionId: "s_test",
    host: "127.0.0.1",
    port: 4850,
    target: "http://localhost:3000",
    pid: 1234,
    startedAt: NOW,
    running: true,
    ...overrides,
  };
}

/** A session, a channel, and a store, wired for persistence. */
function reviewSetup(): { session: Session; channel: AgentChannel } {
  const session = new Session({ id: "s_test", now: () => NOW });
  return { session, channel: new AgentChannel(session, { now: () => NOW }) };
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "livepin-store-"));
  store = new SessionStore(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("paths", () => {
  it("resolves a relative root, so later reads do not depend on the cwd", () => {
    expect(path.isAbsolute(new SessionStore(".").root)).toBe(true);
  });

  it("puts everything under .livepin", () => {
    expect(store.dir).toBe(path.join(dir, LIVEPIN_DIR));
    expect(store.sessionPath("s_x")).toBe(path.join(dir, LIVEPIN_DIR, "s_x.json"));
  });
});

describe("pointer", () => {
  it("round-trips", async () => {
    await store.writePointer(pointer());
    expect(await store.readPointer()).toEqual(pointer());
  });

  it("returns null when there is none", async () => {
    expect(await store.readPointer()).toBeNull();
  });

  it("treats a damaged pointer as absent, since it is only a hint", async () => {
    await mkdir(store.dir, { recursive: true });
    await writeFile(store.pointerPath, "{ truncated");

    expect(await store.readPointer()).toBeNull();
  });

  it("marks a stop without forgetting which session was served", async () => {
    await store.writePointer(pointer());

    expect(await store.markStopped()).toBe(true);
    expect(await store.readPointer()).toMatchObject({ running: false, sessionId: "s_test" });
  });

  it("reports nothing to mark when no proxy ever ran here", async () => {
    expect(await store.markStopped()).toBe(false);
  });
});

describe("session file", () => {
  /** A minimal persisted review. */
  function persisted(): PersistedSession {
    const { session, channel } = reviewSetup();
    session.createThread(null, "http://app/", "hello");
    return {
      version: STORE_VERSION,
      updatedAt: NOW,
      session: session.toSnapshot(),
      queue: channel.snapshot(),
    };
  }

  it("round-trips a review", async () => {
    const data = persisted();
    await store.writeSession(data);

    expect(await store.readSession("s_test")).toEqual(data);
  });

  it("returns null for a session that was never written", async () => {
    expect(await store.readSession("s_missing")).toBeNull();
  });

  it("refuses a corrupt file rather than silently starting over", async () => {
    await mkdir(store.dir, { recursive: true });
    await writeFile(store.sessionPath("s_test"), "{ not json");

    // Discarding it would throw away the human's comments without saying so.
    await expect(store.readSession("s_test")).rejects.toThrow(/not readable JSON/);
  });

  it("leaves no temp files behind", async () => {
    await store.writeSession(persisted());

    const entries = await readdir(store.dir);
    expect(entries.filter((name) => name.includes(".tmp"))).toEqual([]);
  });
});

describe("ensureIgnored", () => {
  it("adds the line inside a git repository", async () => {
    await mkdir(path.join(dir, ".git"), { recursive: true });

    expect(await store.ensureIgnored()).toBe(true);
    expect(await readFile(path.join(dir, ".gitignore"), "utf8")).toBe(`${IGNORE_LINE}\n`);
  });

  it("appends without joining onto an unterminated last line", async () => {
    await mkdir(path.join(dir, ".git"), { recursive: true });
    await writeFile(path.join(dir, ".gitignore"), "node_modules");

    await store.ensureIgnored();
    expect(await readFile(path.join(dir, ".gitignore"), "utf8")).toBe(
      `node_modules\n${IGNORE_LINE}\n`,
    );
  });

  it("is idempotent", async () => {
    await mkdir(path.join(dir, ".git"), { recursive: true });
    await store.ensureIgnored();

    expect(await store.ensureIgnored()).toBe(false);
    expect(await readFile(path.join(dir, ".gitignore"), "utf8")).toBe(`${IGNORE_LINE}\n`);
  });

  it("accepts an existing entry written without the trailing slash", async () => {
    await mkdir(path.join(dir, ".git"), { recursive: true });
    await writeFile(path.join(dir, ".gitignore"), `${LIVEPIN_DIR}\n`);

    expect(await store.ensureIgnored()).toBe(false);
  });

  it("writes the repository root's .gitignore, not the subdirectory's", async () => {
    await mkdir(path.join(dir, ".git"), { recursive: true });
    const app = path.join(dir, "apps", "web");
    await mkdir(app, { recursive: true });

    expect(await new SessionStore(app).ensureIgnored()).toBe(true);
    expect(await readFile(path.join(dir, ".gitignore"), "utf8")).toBe(`${IGNORE_LINE}\n`);
  });

  it("leaves a non-repository directory alone", async () => {
    // Nothing tracks these files, so a .gitignore here would just be litter.
    expect(await store.ensureIgnored()).toBe(false);
    await expect(readFile(path.join(dir, ".gitignore"), "utf8")).rejects.toThrow();
  });
});

describe("persistSession", () => {
  it("writes the session after a change", async () => {
    const { session, channel } = reviewSetup();
    const persistence = persistSession({ store, session, channel, debounceMs: 1, now: () => NOW });

    session.createThread(null, "http://app/", "save me");
    await persistence.flush();

    const stored = await store.readSession("s_test");
    expect(stored?.session.threads.flatMap((t) => t.comments.map((c) => c.text))).toContain(
      "save me",
    );
    await persistence.stop();
  });

  it("persists the delivery cursor, which no session event describes", async () => {
    const { session, channel } = reviewSetup();
    const persistence = persistSession({ store, session, channel, debounceMs: 1, now: () => NOW });

    session.addComment(GLOBAL_THREAD_ID, "human", "seen");
    channel.acknowledge(1);
    await persistence.flush();

    expect((await store.readSession("s_test"))?.queue).toEqual({ items: [], deliveredSeq: 1 });
    await persistence.stop();
  });

  it("batches a burst of changes into one write", async () => {
    const { session, channel } = reviewSetup();
    const write = vi.spyOn(store, "writeSession");
    const persistence = persistSession({ store, session, channel, debounceMs: 20, now: () => NOW });

    session.addComment(GLOBAL_THREAD_ID, "human", "one");
    session.addComment(GLOBAL_THREAD_ID, "human", "two");
    session.addComment(GLOBAL_THREAD_ID, "human", "three");
    await persistence.flush();

    expect(write).toHaveBeenCalledTimes(1);
    await persistence.stop();
  });

  it("writes on the debounce timer without being flushed", async () => {
    const { session, channel } = reviewSetup();
    const persistence = persistSession({ store, session, channel, debounceMs: 1, now: () => NOW });

    session.addComment(GLOBAL_THREAD_ID, "human", "eventually");
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(await store.readSession("s_test")).not.toBeNull();
    await persistence.stop();
  });

  it("stops watching after stop, and writes one last time", async () => {
    const { session, channel } = reviewSetup();
    const persistence = persistSession({ store, session, channel, debounceMs: 1, now: () => NOW });

    session.addComment(GLOBAL_THREAD_ID, "human", "before stop");
    await persistence.stop();

    const write = vi.spyOn(store, "writeSession");
    session.addComment(GLOBAL_THREAD_ID, "human", "after stop");
    channel.acknowledge(2);
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(write).not.toHaveBeenCalled();
    expect(
      (await store.readSession("s_test"))?.session.threads
        .flatMap((t) => t.comments.map((c) => c.text))
        .includes("before stop"),
    ).toBe(true);
  });

  it("reports a failed write and keeps the review going", async () => {
    const { session, channel } = reviewSetup();
    const onError = vi.fn();
    vi.spyOn(store, "writeSession").mockRejectedValue(new Error("disk full"));
    const persistence = persistSession({ store, session, channel, debounceMs: 1, onError });

    session.addComment(GLOBAL_THREAD_ID, "human", "unsaveable");
    await persistence.flush();

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "disk full" }));
    // The comment is still in the session; only the copy on disk is missing.
    expect(session.getThread(GLOBAL_THREAD_ID)?.comments).toHaveLength(1);
    await persistence.stop();
  });
});
