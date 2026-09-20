// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  captureElement,
  describeCapture,
  ORPHAN_GRACE_MS,
  Overlay,
  OVERLAY_HOST_ID,
  PANEL_WIDTH_PX,
} from "../../src/overlay/ui.js";
import type { StreamMessage } from "../../src/overlay/transport.js";
import type { CapturedData, ElementRef, SessionState, Thread } from "../../src/types.js";

/** Build a session state containing only the global thread. */
function emptyState(): SessionState {
  return {
    id: "s_test",
    ended: false,
    threads: [
      {
        id: "global",
        element: null,
        url: "",
        resolved: false,
        orphaned: false,
        createdAt: "",
        comments: [],
      },
    ],
  };
}

function makeThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: "t_001",
    element: {
      selector: '[data-testid="row-91"]',
      text: "Dr. Okafor",
      bbox: [10, 20, 100, 20],
      tag: "li",
    },
    url: "http://app/",
    resolved: false,
    orphaned: false,
    createdAt: "",
    comments: [{ id: "c_001", author: "human", text: "padding is wrong", createdAt: "" }],
    ...overrides,
  };
}

/** Stubbed transport plus a hook to push stream messages into the overlay. */
function makeDeps() {
  let push: (message: StreamMessage) => void = () => {};
  // Parameters are declared on each mock so `mock.calls` carries their types.
  const deps = {
    fetchState: vi.fn(async () => emptyState()),
    createThread: vi.fn(async (_element: ElementRef | null, _text: string, _data?: CapturedData) =>
      makeThread(),
    ),
    addComment: vi.fn(async (_threadId: string, _text: string) => ({
      id: "c_x",
      author: "human" as const,
      text: "",
      createdAt: "",
    })),
    setResolved: vi.fn(async (_threadId: string, _resolved: boolean) => ({})),
    setOrphaned: vi.fn(async (_threadId: string, _orphaned: boolean) => ({})),
    endSession: vi.fn(async () => ({})),
    fetchConfig: vi.fn(async () => ({ redactUrls: [] as string[], redactFields: [] as string[] })),
    openEventStream: vi.fn((handler: (m: StreamMessage) => void) => {
      push = handler;
      return () => {};
    }),
  };
  return { deps, emit: (message: StreamMessage) => push(message) };
}

let overlay: Overlay;
let harness: ReturnType<typeof makeDeps>;

/** The overlay's shadow root. */
function shadow(): ShadowRoot {
  const host = document.getElementById(OVERLAY_HOST_ID);
  if (!host?.shadowRoot) throw new Error("overlay not mounted");
  return host.shadowRoot;
}

function q<T extends Element = Element>(selector: string): T | null {
  return shadow().querySelector<T>(selector);
}

let originalFetch: typeof window.fetch;

beforeEach(async () => {
  document.body.innerHTML = `
    <main>
      <ul data-testid="visit-list">
        <li data-testid="row-91">Dr. Okafor</li>
        <li data-testid="row-92">Dr. Lindqvist</li>
      </ul>
    </main>`;

  // Stubbed before the overlay mounts, so it patches this rather than happy-dom's
  // real fetch — which would try to resolve api.example.com.
  originalFetch = window.fetch;
  window.fetch = vi.fn(
    async () =>
      new Response(JSON.stringify({ visits: [{ id: 91 }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  ) as typeof window.fetch;

  harness = makeDeps();
  overlay = new Overlay(harness.deps);
  await overlay.start();
});

afterEach(() => {
  overlay.destroy();
  window.fetch = originalFetch;
  document.body.innerHTML = "";
});

describe("mounting", () => {
  it("mounts into a shadow root so it cannot restyle the page", () => {
    const host = document.getElementById(OVERLAY_HOST_ID);
    expect(host?.shadowRoot).toBeTruthy();
    // Styles live inside the shadow root, never in the document.
    expect(document.querySelector("style")).toBeNull();
    expect(shadow().querySelector("style")).toBeTruthy();
  });

  it("renders the toolbar controls", () => {
    expect(q('[data-action="inspect"]')).toBeTruthy();
    expect(q('[data-action="panel"]')).toBeTruthy();
    expect(q('[data-action="end"]')).toBeTruthy();
  });

  it("removes everything it owns on destroy", () => {
    overlay.destroy();
    expect(document.getElementById(OVERLAY_HOST_ID)).toBeNull();
    // Re-created in afterEach's destroy call; guard against a double remove.
    overlay = new Overlay(harness.deps);
  });

  it("re-attaches itself if the page wipes the body", () => {
    // A full-body replacement would otherwise strand every comment written so
    // far with no way to get the overlay back.
    document.body.innerHTML = "<main>rebuilt from scratch</main>";
    expect(document.getElementById(OVERLAY_HOST_ID)).toBeNull();

    overlay.render();
    expect(document.getElementById(OVERLAY_HOST_ID)).toBeTruthy();
  });
});

describe("panel and the page underneath", () => {
  it("starts closed so the application is fully usable", () => {
    // Regression: an open-by-default panel covered the portal's login button
    // and swallowed the click, making the app unusable through the proxy.
    expect(q(".panel")?.hasAttribute("hidden")).toBe(true);
    expect(document.documentElement.style.marginRight).toBe("");
  });

  it("insets the page while open, rather than covering it", () => {
    q<HTMLButtonElement>('[data-action="panel"]')!.click();
    expect(q(".panel")?.hasAttribute("hidden")).toBe(false);
    expect(document.documentElement.style.marginRight).toBe(`${PANEL_WIDTH_PX}px`);
  });

  it("restores the page when closed again", () => {
    const button = q<HTMLButtonElement>('[data-action="panel"]')!;
    button.click();
    button.click();
    expect(document.documentElement.style.marginRight).toBe("");
  });

  it("preserves a margin the host page had set itself", () => {
    document.documentElement.style.marginRight = "12px";
    const button = q<HTMLButtonElement>('[data-action="panel"]')!;
    button.click();
    button.click();
    expect(document.documentElement.style.marginRight).toBe("12px");
    document.documentElement.style.marginRight = "";
  });

  it("hands the width back on destroy", () => {
    q<HTMLButtonElement>('[data-action="panel"]')!.click();
    overlay.destroy();
    expect(document.documentElement.style.marginRight).toBe("");
    overlay = new Overlay(harness.deps);
  });

  it("hands the width back when the session ends", () => {
    q<HTMLButtonElement>('[data-action="panel"]')!.click();
    harness.emit({ type: "session-ended" });
    expect(document.documentElement.style.marginRight).toBe("");
  });
});

describe("inspect mode", () => {
  it("toggles and reflects state on the button", () => {
    const button = q('[data-action="inspect"]')!;
    expect(button.getAttribute("aria-pressed")).toBe("false");
    overlay.toggleInspect(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    overlay.toggleInspect(false);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("opens a composer when an element is clicked", () => {
    // Regression: openComposer used to clear the pending target before reading
    // it, so the composer could never appear.
    overlay.toggleInspect(true);
    document
      .querySelector('[data-testid="row-91"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(q('[data-role="composer-input"]')).toBeTruthy();
    expect(q(".composer-target")?.textContent).toContain("row-91");
  });

  it("leaves inspect mode once an element has been picked", () => {
    overlay.toggleInspect(true);
    document
      .querySelector('[data-testid="row-91"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(q('[data-action="inspect"]')?.getAttribute("aria-pressed")).toBe("false");
  });

  it("submits the captured element with the comment", async () => {
    overlay.toggleInspect(true);
    document
      .querySelector('[data-testid="row-91"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    q<HTMLTextAreaElement>('[data-role="composer-input"]')!.value = "should show last visit";
    q<HTMLButtonElement>('[data-action="composer-save"]')!.click();
    await vi.waitFor(() => expect(harness.deps.createThread).toHaveBeenCalled());

    const [ref, text] = harness.deps.createThread.mock.calls[0]!;
    expect(text).toBe("should show last visit");
    expect(ref?.selector).toContain("row-91");
    expect(ref?.tag).toBe("li");
  });

  it("does not submit an empty comment", () => {
    overlay.toggleInspect(true);
    document
      .querySelector('[data-testid="row-91"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    q<HTMLButtonElement>('[data-action="composer-save"]')!.click();
    expect(harness.deps.createThread).not.toHaveBeenCalled();
  });

  it("dismisses the composer on cancel and on Escape", () => {
    overlay.toggleInspect(true);
    document
      .querySelector('[data-testid="row-91"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    q<HTMLButtonElement>('[data-action="composer-cancel"]')!.click();
    expect(q(".composer")).toBeNull();

    overlay.toggleInspect(true);
    document
      .querySelector('[data-testid="row-92"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(q(".composer")).toBeNull();
  });

  it("ignores clicks on its own chrome", () => {
    overlay.toggleInspect(true);
    q('[data-action="panel"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(q(".composer")).toBeNull();
  });
});

describe("context toggle", () => {
  /** Attach a fiber to a page element the way React would. */
  function reactify(selector: string): void {
    const element = document.querySelector(selector)!;
    Object.defineProperty(element, "__reactFiber$test", {
      value: {
        type: function VisitRow(): null {
          return null;
        },
        memoizedProps: { visit: { id: 91, provider: "Dr. Okafor" } },
        _debugSource: { fileName: "/proj/components/VisitRow.tsx", lineNumber: 42 },
      },
      enumerable: true,
      configurable: true,
    });
  }

  /** Enter inspect mode and click a page element. */
  function pick(selector: string): void {
    overlay.toggleInspect(true);
    document
      .querySelector(selector)!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }

  it("starts off, because props are the application's data", () => {
    expect(q('[data-action="context"]')?.getAttribute("aria-pressed")).toBe("false");
    expect(q('[data-action="context"]')?.textContent).toBe("Context: off");
  });

  it("sends no data while off, even on a React element", async () => {
    reactify('[data-testid="row-91"]');
    pick('[data-testid="row-91"]');

    q<HTMLTextAreaElement>('[data-role="composer-input"]')!.value = "no context please";
    q<HTMLButtonElement>('[data-action="composer-save"]')!.click();
    await vi.waitFor(() => expect(harness.deps.createThread).toHaveBeenCalled());

    expect(harness.deps.createThread.mock.calls[0]?.[2]).toBeUndefined();
  });

  it("attaches source, stack and props once on", async () => {
    overlay.setContextLevel("data");
    reactify('[data-testid="row-91"]');
    pick('[data-testid="row-91"]');

    q<HTMLTextAreaElement>('[data-role="composer-input"]')!.value = "show the last visit date";
    q<HTMLButtonElement>('[data-action="composer-save"]')!.click();
    await vi.waitFor(() => expect(harness.deps.createThread).toHaveBeenCalled());

    expect(harness.deps.createThread.mock.calls[0]?.[2]).toMatchObject({
      source: { file: "/proj/components/VisitRow.tsx", line: 42 },
      componentStack: ["VisitRow"],
      components: [{ name: "VisitRow", props: { visit: { id: 91, provider: "Dr. Okafor" } } }],
    });
  });

  it("cycles off, data, network and back", () => {
    const button = q('[data-action="context"]')!;

    overlay.setContextLevel();
    expect(button.textContent).toBe("Context: data");
    expect(button.getAttribute("aria-pressed")).toBe("true");

    overlay.setContextLevel();
    expect(button.textContent).toContain("Context: network");
    expect(button.getAttribute("data-level")).toBe("network");

    overlay.setContextLevel();
    expect(button.textContent).toBe("Context: off");
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("shows what the network payload would cost, since that is the decision", () => {
    overlay.setContextLevel("network");
    // The size is what makes "network" a considered choice rather than a shrug.
    expect(q('[data-action="context"]')?.textContent).toMatch(/~\d+(\.\d+)? (B|kB)/);
  });

  it("attaches the recent requests at the network level", async () => {
    overlay.setContextLevel("network");
    await fetch("http://api.example.com/patients/1182/visits");

    reactify('[data-testid="row-91"]');
    pick('[data-testid="row-91"]');
    q<HTMLTextAreaElement>('[data-role="composer-input"]')!.value = "where does this come from";
    q<HTMLButtonElement>('[data-action="composer-save"]')!.click();
    await vi.waitFor(() => expect(harness.deps.createThread).toHaveBeenCalled());

    const data = harness.deps.createThread.mock.calls[0]?.[2];
    expect(data?.network?.map((entry) => entry.url)).toContain(
      "http://api.example.com/patients/1182/visits",
    );
  });

  it("attaches requests even where React tells us nothing", async () => {
    // A production build still makes requests, and they are still the answer.
    overlay.setContextLevel("network");
    await fetch("http://api.example.com/thing");

    pick('[data-testid="row-92"]');
    q<HTMLTextAreaElement>('[data-role="composer-input"]')!.value = "no fiber here";
    q<HTMLButtonElement>('[data-action="composer-save"]')!.click();
    await vi.waitFor(() => expect(harness.deps.createThread).toHaveBeenCalled());

    expect(harness.deps.createThread.mock.calls[0]?.[2]?.network).toHaveLength(1);
  });

  it("sends no requests at the data level", async () => {
    overlay.setContextLevel("data");
    await fetch("http://api.example.com/thing");

    reactify('[data-testid="row-91"]');
    pick('[data-testid="row-91"]');
    q<HTMLTextAreaElement>('[data-role="composer-input"]')!.value = "props only";
    q<HTMLButtonElement>('[data-action="composer-save"]')!.click();
    await vi.waitFor(() => expect(harness.deps.createThread).toHaveBeenCalled());

    expect(harness.deps.createThread.mock.calls[0]?.[2]?.network).toBeUndefined();
  });

  it("asks the server which urls must not be recorded", () => {
    expect(harness.deps.fetchConfig).toHaveBeenCalled();
  });

  it("restores window.fetch on destroy", () => {
    const patched = window.fetch;
    overlay.destroy();
    // A hot reload mounts a new overlay; leaving wrappers stacked would have the
    // page's every request pass through all of them.
    expect(window.fetch).not.toBe(patched);
    overlay = new Overlay(harness.deps);
  });

  it("tells the human what was captured before they commit to it", () => {
    overlay.setContextLevel("data");
    reactify('[data-testid="row-91"]');
    pick('[data-testid="row-91"]');

    expect(q(".composer-context")?.textContent).toContain("VisitRow.tsx:42");
  });

  it("says so when the element has nothing to give", () => {
    // Production build, or not React at all — the toggle must not imply success.
    overlay.setContextLevel("data");
    pick('[data-testid="row-92"]');

    expect(q(".composer-context")?.textContent).toContain("no React data here");
  });

  it("shows no context line at all while off", () => {
    pick('[data-testid="row-91"]');
    expect(q(".composer-context")).toBeNull();
  });
});

describe("describeCapture", () => {
  it("names the file, the stack and the presence of props", () => {
    expect(
      describeCapture({
        source: { file: "components/VisitRow.tsx", line: 42 },
        componentStack: ["VisitRow", "VisitList", "PatientOverview"],
        components: [{ name: "VisitRow", props: { id: 1 } }],
        truncated: false,
      }),
    ).toBe("VisitRow.tsx:42 · VisitRow ← VisitList ← PatientOverview · props");
  });

  it("mentions truncation, since it changes what the agent is looking at", () => {
    expect(describeCapture({ componentStack: ["Row"], components: [], truncated: true })).toContain(
      "truncated",
    );
  });

  it("describes a React element that recorded nothing", () => {
    expect(describeCapture({ componentStack: [], components: [], truncated: false })).toContain(
      "no source or props",
    );
  });

  it("describes the absence of any capture", () => {
    expect(describeCapture(null)).toContain("selector only");
  });
});

describe("global chat", () => {
  it("sends a message to the global thread", async () => {
    q<HTMLTextAreaElement>('[data-role="global-input"]')!.value = "general question";
    q<HTMLButtonElement>('[data-action="send-global"]')!.click();

    await vi.waitFor(() => expect(harness.deps.addComment).toHaveBeenCalled());
    expect(harness.deps.addComment).toHaveBeenCalledWith("global", "general question");
  });

  it("ignores an empty message", () => {
    q<HTMLButtonElement>('[data-action="send-global"]')!.click();
    expect(harness.deps.addComment).not.toHaveBeenCalled();
  });
});

describe("threads and pins", () => {
  it("renders a pin and a thread card when a thread arrives", () => {
    harness.emit({ type: "thread-created", thread: makeThread() });

    expect(shadow().querySelectorAll(".pin")).toHaveLength(1);
    expect(q('.thread[data-thread="t_001"]')).toBeTruthy();
    expect(q(".comment-text")?.textContent).toBe("padding is wrong");
  });

  it("shows an agent reply arriving over the stream", () => {
    harness.emit({ type: "thread-created", thread: makeThread() });
    harness.emit({
      type: "comment-added",
      threadId: "t_001",
      comment: { id: "c_002", author: "agent", text: "fixed it", createdAt: "" },
    });

    const authors = [...shadow().querySelectorAll(".comment")].map((c) =>
      c.getAttribute("data-author"),
    );
    expect(authors).toEqual(["human", "agent"]);
    expect(shadow().textContent).toContain("fixed it");
  });

  it("does not orphan while the page is still loading its data", async () => {
    // The regression this guards: a pin on a table row found nothing during the
    // second before the API answered, was marked orphaned, and the flag was
    // persisted — so it stayed lost even once the row appeared.
    harness.emit({ type: "thread-created", thread: makeThread() });
    document.querySelector("main")!.innerHTML = "<p>loading…</p>";
    overlay.render();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(harness.deps.setOrphaned).not.toHaveBeenCalled();
  });

  it("re-anchors once the awaited element finally renders", async () => {
    harness.emit({ type: "thread-created", thread: makeThread() });
    document.querySelector("main")!.innerHTML = "<p>loading…</p>";
    overlay.render();
    expect(shadow().querySelectorAll(".pin")).toHaveLength(0);

    // The API answers and the row appears.
    document.querySelector("main")!.innerHTML =
      '<ul data-testid="visit-list"><li data-testid="row-91">Dr. Okafor</li></ul>';

    await vi.waitFor(() => expect(shadow().querySelectorAll(".pin")).toHaveLength(1));
    expect(harness.deps.setOrphaned).not.toHaveBeenCalled();
  });

  it("does not orphan a thread pinned on another route", async () => {
    harness.emit({
      type: "thread-created",
      thread: makeThread({ url: "http://localhost/some/other/page" }),
    });
    overlay.render();

    await new Promise((resolve) => setTimeout(resolve, 50));
    // Elsewhere is not lost. Navigating must not mark every pin orphaned.
    expect(harness.deps.setOrphaned).not.toHaveBeenCalled();
    expect(shadow().querySelectorAll(".pin")).toHaveLength(0);
    expect(q(".page-note")?.textContent).toContain("/some/other/page");
    expect(q(".orphan-note")).toBeNull();
  });

  it("treats a differing query string as the same page", async () => {
    harness.emit({
      type: "thread-created",
      thread: makeThread({ url: `${location.origin}${location.pathname}?tab=2` }),
    });
    overlay.render();
    expect(shadow().querySelectorAll(".pin")).toHaveLength(1);
  });

  it("orphans a thread whose element has vanished, once the grace period is up", async () => {
    harness.emit({ type: "thread-created", thread: makeThread() });
    // Simulate the agent editing the component away and hot reload swapping
    // the app's root — the overlay host lives outside it and survives.
    document.querySelector("main")!.innerHTML = "<p>completely different</p>";

    overlay.render(); // records the first miss
    expect(harness.deps.setOrphaned).not.toHaveBeenCalled();

    // Jump past the grace period rather than waiting it out.
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now + ORPHAN_GRACE_MS + 1);
    overlay.render();

    await vi.waitFor(() => expect(harness.deps.setOrphaned).toHaveBeenCalledWith("t_001", true));
    // No pin can be placed, but the comment must still be visible.
    expect(shadow().querySelectorAll(".pin")).toHaveLength(0);
    expect(shadow().textContent).toContain("padding is wrong");
    vi.restoreAllMocks();
  });

  it("surfaces the orphaned state in the panel", () => {
    harness.emit({ type: "thread-created", thread: makeThread({ orphaned: true }) });
    expect(q(".orphan-note")).toBeTruthy();
  });

  it("resolves a thread", async () => {
    harness.emit({ type: "thread-created", thread: makeThread() });
    q<HTMLButtonElement>('[data-action="resolve"]')!.click();
    await vi.waitFor(() => expect(harness.deps.setResolved).toHaveBeenCalledWith("t_001", true));
  });

  it("counts only unresolved pins in the toolbar", () => {
    harness.emit({ type: "thread-created", thread: makeThread() });
    harness.emit({ type: "thread-created", thread: makeThread({ id: "t_002" }) });
    expect(q('[data-role="count"]')?.textContent).toBe("2");

    harness.emit({ type: "thread-updated", threadId: "t_002", resolved: true, orphaned: false });
    expect(q('[data-role="count"]')?.textContent).toBe("1");
  });

  it("replaces state wholesale on a sync frame", () => {
    const state = emptyState();
    state.threads.push(makeThread());
    harness.emit({ type: "sync", state });
    expect(q('.thread[data-thread="t_001"]')).toBeTruthy();
  });
});

describe("ending", () => {
  it("requires confirmation before ending", () => {
    const end = q<HTMLButtonElement>('[data-action="end"]')!;
    end.click();
    expect(harness.deps.endSession).not.toHaveBeenCalled();
    expect(end.textContent).toBe("Sure?");
  });

  it("flushes an unsent draft before ending, so nothing typed is lost", async () => {
    q<HTMLTextAreaElement>('[data-role="global-input"]')!.value = "one last thing";
    const end = q<HTMLButtonElement>('[data-action="end"]')!;
    end.click();
    end.click();

    await vi.waitFor(() => expect(harness.deps.endSession).toHaveBeenCalled());
    expect(harness.deps.addComment).toHaveBeenCalledWith("global", "one last thing");
  });

  it("renders a terminal state and stops accepting input", () => {
    harness.emit({ type: "session-ended" });
    expect(shadow().querySelector(".ended")).toBeTruthy();
    expect(q('[data-action="inspect"]')).toBeNull();
    expect(q('[data-role="global-input"]')).toBeNull();
  });
});

describe("captureElement", () => {
  it("captures selector, text, tag and box", () => {
    const ref = captureElement(document.querySelector('[data-testid="row-91"]')!);
    expect(ref.selector).toContain("row-91");
    expect(ref.text).toBe("Dr. Okafor");
    expect(ref.tag).toBe("li");
    expect(ref.bbox).toHaveLength(4);
  });
});
