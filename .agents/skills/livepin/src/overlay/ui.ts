/**
 * The overlay UI.
 *
 * Mounted in a shadow root so it can neither restyle the page under review nor
 * be restyled by it. Every element it creates lives inside that root; the only
 * things it touches outside are document-level event listeners, all of which
 * are removed on teardown.
 */

import type { CapturedData, ContextLevel, ElementRef, SessionState, Thread } from "../types.js";
import { isSamePage, reanchor } from "./anchor.js";
import { captureFiber } from "./fiber.js";
import { estimateSize, formatSize, NetworkRecorder } from "./network.js";
import { buildSelector, elementText } from "./selector.js";
import { OVERLAY_CSS } from "./styles.js";
import * as api from "./transport.js";
import type { StreamMessage } from "./transport.js";

/** Attribute marking nodes the overlay owns, so it never inspects itself. */
export const OVERLAY_HOST_ID = "livepin-overlay-root";

/**
 * How long a pin may fail to find its element before it is called orphaned.
 *
 * Real applications paint an empty shell first and fill it once an API answers,
 * so a pin on a table row finds nothing for the first second or more after a
 * reload. Declaring that orphaned immediately — and persisting it — marks live
 * pins as lost. The overlay keeps retrying for this long, and a DOM mutation
 * retries sooner, so in practice the pin reappears the instant its data lands.
 */
export const ORPHAN_GRACE_MS = 8000;

/** Debounce between DOM-mutation-triggered re-anchor attempts. */
const RETRY_DEBOUNCE_MS = 300;

/** How often the toolbar's payload estimate is refreshed while network is on. */
export const SIZE_REFRESH_MS = 2000;

/** Panel width. Must match the `.panel` rule in the stylesheet. */
export const PANEL_WIDTH_PX = 380;

/** Build an element with attributes and children in one call. */
function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (name === "class") element.className = value;
    else element.setAttribute(name, value);
  }
  element.append(...children);
  return element;
}

/**
 * Capture everything needed to identify an element later.
 *
 * @param element - The element the human clicked.
 */
export function captureElement(element: Element): ElementRef {
  const rect = element.getBoundingClientRect();
  return {
    selector: buildSelector(element),
    text: elementText(element),
    bbox: [rect.left, rect.top, rect.width, rect.height],
    tag: element.tagName.toLowerCase(),
  };
}

/**
 * One line saying what the context toggle actually managed to collect.
 *
 * Worth showing because the toggle promises something the page may not be able
 * to give — a production build or a non-React app yields nothing — and a human
 * who thinks they attached props when they did not will not understand the
 * agent's reply.
 *
 * @param data - The capture, or null if there was none.
 * @returns Text for the composer.
 */
export function describeCapture(data: CapturedData | null): string {
  if (!data) return "no React data here — sending the selector only";

  const parts: string[] = [];
  if (data.source) parts.push(`${basename(data.source.file)}:${data.source.line}`);
  if (data.componentStack.length) parts.push(data.componentStack.slice(0, 3).join(" ← "));
  if (data.components.some((component) => component.props !== undefined)) parts.push("props");
  if (data.network) {
    // The count and the size together: one says what is attached, the other says
    // what it costs.
    parts.push(`${data.network.length} request${data.network.length === 1 ? "" : "s"}`);
    parts.push(`~${formatSize(estimateSize(data))}`);
  }
  if (data.truncated) parts.push("truncated");

  return parts.length ? parts.join(" · ") : "React element, no source or props recorded";
}

/** Last path segment, for showing a file without its directories. */
function basename(file: string): string {
  const at = file.lastIndexOf("/");
  return at === -1 ? file : file.slice(at + 1);
}

/**
 * Build a matcher for a list of URL globs.
 *
 * A copy of the server's rule, deliberately small: the overlay only needs to know
 * which bodies not to hold on to, and the authoritative pass runs server-side.
 *
 * @param patterns - Globs from the project config.
 * @returns A predicate over whole URLs.
 */
export function matchesAny(patterns: string[]): (url: string) => boolean {
  const compiled = patterns.map(
    (pattern) =>
      new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*+/g, ".*")}$`, "i"),
  );
  return (url: string) => compiled.some((pattern) => pattern.test(url));
}

/** Runtime dependencies, injectable so tests can drive the UI without a server. */
export interface OverlayDeps {
  createThread: typeof api.createThread;
  addComment: typeof api.addComment;
  setResolved: typeof api.setResolved;
  setOrphaned: typeof api.setOrphaned;
  endSession: typeof api.endSession;
  fetchState: typeof api.fetchState;
  fetchConfig: typeof api.fetchConfig;
  openEventStream: typeof api.openEventStream;
}

/** The overlay. One instance per page. */
export class Overlay {
  private readonly host: HTMLElement;
  private readonly root: ShadowRoot;
  private readonly deps: OverlayDeps;

  private state: SessionState = { id: "", ended: false, threads: [] };
  private inspecting = false;

  /**
   * How much context to attach to new pins.
   *
   * Off by default, and deliberately not remembered between loads. Props and
   * response bodies are the application's data — on the first codebase this runs
   * against, patient records — and they are also the bulk of what a comment costs
   * an agent to read. Both arguments point the same way: the human turns this up
   * for the comment that needs it.
   */
  private contextLevel: ContextLevel = "off";

  /** Records the page's own requests. Installed for the overlay's lifetime. */
  private readonly network = new NetworkRecorder();

  /** Refreshes the toolbar's size estimate while network context is on. */
  private sizeTimer: number | null = null;

  /**
   * The panel starts closed.
   *
   * It is a fixed strip down the right-hand side, so leaving it open by default
   * hides part of the application and swallows every click that lands under it
   * — on the portal it covered the login button, making the app unusable
   * through the proxy. The thread count in the toolbar is what advertises that
   * there is something to read.
   */
  private panelOpen = false;

  /** The host page's own `margin-right`, restored when the panel closes. */
  private previousMarginRight: string | null = null;
  private pendingTarget: {
    element: Element;
    ref: ElementRef;
    /** Captured at click time, while the element is certainly still mounted. */
    data: CapturedData | null;
  } | null = null;
  private closeStream: (() => void) | null = null;

  /** Live DOM element each pin thread is currently anchored to. */
  private readonly anchors = new Map<string, Element>();

  /**
   * When each thread first failed to find its element, keyed by thread id.
   * Cleared the moment it anchors again — only a sustained miss counts.
   */
  private readonly firstMissAt = new Map<string, number>();

  /** Watches the page so a pin re-anchors as soon as its data renders. */
  private observer: MutationObserver | null = null;
  private retryTimer: number | null = null;

  private highlight!: HTMLElement;
  private toolbar!: HTMLElement;
  private panel!: HTMLElement;
  private panelBody!: HTMLElement;
  private pinLayer!: HTMLElement;
  private composer: HTMLElement | null = null;

  constructor(deps: OverlayDeps = api) {
    this.deps = deps;

    this.host = h("div", { id: OVERLAY_HOST_ID });
    this.root = this.host.attachShadow({ mode: "open" });
    this.root.append(h("style", {}, [OVERLAY_CSS]));

    this.buildChrome();
    document.body.append(this.host);
  }

  /** Fetch state and start listening. */
  async start(): Promise<void> {
    // Patch before anything else: requests made while the overlay is still
    // setting up are exactly the ones that render the page.
    this.network.install();

    try {
      const config = await this.deps.fetchConfig();
      this.network.setRedactedUrls(matchesAny(config.redactUrls));
    } catch {
      // No rules is the common case and the safe direction: the server redacts
      // regardless, so the worst outcome is a body held briefly in the page.
    }

    try {
      this.state = await this.deps.fetchState();
    } catch {
      // The proxy may still be starting; the stream's sync message will
      // deliver state shortly regardless.
    }
    this.render();
    this.closeStream = this.deps.openEventStream((message) => this.onStreamMessage(message));

    window.addEventListener("scroll", this.reposition, { passive: true, capture: true });
    window.addEventListener("resize", this.reposition, { passive: true });
    document.addEventListener("keydown", this.onKeyDown, true);

    // The app paints its shell first and fills it when an API answers. Watching
    // for that is what lets a pin on a table row survive a reload — otherwise
    // it looks lost for the second before the data lands.
    // The overlay's own nodes live in a shadow root, whose mutations do not
    // reach an observer on the light DOM, so this cannot feed itself.
    this.observer = new MutationObserver(() => this.scheduleAnchorRetry());
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  /** Remove every listener and node the overlay owns. */
  destroy(): void {
    this.closeStream?.();
    this.observer?.disconnect();
    this.observer = null;
    // Unpatch, or a hot reload leaves a stack of wrappers on window.fetch.
    this.network.uninstall();
    if (this.retryTimer !== null) window.clearTimeout(this.retryTimer);
    this.retryTimer = null;
    if (this.sizeTimer !== null) window.clearInterval(this.sizeTimer);
    this.sizeTimer = null;
    window.removeEventListener("scroll", this.reposition, true);
    window.removeEventListener("resize", this.reposition);
    document.removeEventListener("keydown", this.onKeyDown, true);
    document.removeEventListener("mousemove", this.onMouseMove, true);
    document.removeEventListener("click", this.onInspectClick, true);
    // Never leave the host page inset after the overlay is gone.
    this.applyPageShift(false);
    this.host.remove();
  }

  // ---- chrome ----------------------------------------------------------

  /** Build the persistent parts: toolbar, panel, pin layer, highlight. */
  private buildChrome(): void {
    this.highlight = h("div", { class: "highlight", hidden: "" });
    this.pinLayer = h("div", { class: "pin-layer" });

    const inspectButton = h(
      "button",
      {
        "data-action": "inspect",
        "aria-pressed": "false",
        title: "Inspect mode (Esc to exit)",
      },
      ["Inspect"],
    );
    inspectButton.addEventListener("click", () => this.toggleInspect());

    const panelButton = h("button", { "data-action": "panel", "data-variant": "ghost" }, ["Panel"]);
    panelButton.addEventListener("click", () => {
      this.panelOpen = !this.panelOpen;
      this.render();
    });

    const contextButton = h(
      "button",
      {
        "data-action": "context",
        "data-variant": "ghost",
        "aria-pressed": "false",
        "data-level": "off",
        title:
          "What new pins carry: off, data (source, props, state), " +
          "network (also the recent requests)",
      },
      ["Context: off"],
    );
    contextButton.addEventListener("click", () => this.setContextLevel());

    const endButton = h("button", { "data-action": "end", "data-variant": "danger" }, ["End"]);
    endButton.addEventListener("click", () => this.confirmEnd(endButton));

    this.toolbar = h("div", { class: "toolbar" }, [
      h("span", { class: "brand" }, ["livepin"]),
      inspectButton,
      h("span", { class: "count", "data-role": "count" }, ["0"]),
      h("span", { class: "divider" }),
      contextButton,
      panelButton,
      endButton,
    ]);

    this.panelBody = h("div", { class: "panel-body" });
    this.panel = h("div", { class: "panel" }, [
      h("div", { class: "panel-head" }, [h("span", { class: "panel-title" }, ["Review"])]),
      this.panelBody,
      this.buildGlobalComposer(),
    ]);

    this.root.append(this.highlight, this.pinLayer, this.panel, this.toolbar);
  }

  /** The always-present composer for the global chat. */
  private buildGlobalComposer(): HTMLElement {
    const textarea = h("textarea", {
      placeholder: "Message about anything — not tied to an element",
      "data-role": "global-input",
    });
    const send = h("button", { "data-variant": "primary", "data-action": "send-global" }, ["Send"]);

    const submit = async () => {
      const text = textarea.value.trim();
      if (!text) return;
      textarea.value = "";
      await this.deps.addComment("global", text);
    };

    send.addEventListener("click", submit);
    textarea.addEventListener("keydown", (event) => {
      // Enter sends; Shift+Enter is a newline. Matches every chat box.
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void submit();
      }
    });

    return h("div", { class: "panel-foot" }, [textarea, h("div", { class: "row" }, [send])]);
  }

  // ---- inspect ---------------------------------------------------------

  /** Turn inspect mode on or off. */
  toggleInspect(force?: boolean): void {
    this.inspecting = force ?? !this.inspecting;

    if (this.inspecting) {
      document.addEventListener("mousemove", this.onMouseMove, true);
      document.addEventListener("click", this.onInspectClick, true);
    } else {
      document.removeEventListener("mousemove", this.onMouseMove, true);
      document.removeEventListener("click", this.onInspectClick, true);
      this.highlight.hidden = true;
    }

    this.toolbar
      .querySelector('[data-action="inspect"]')
      ?.setAttribute("aria-pressed", String(this.inspecting));
  }

  /**
   * Set how much context new pins carry, or advance to the next level.
   *
   * @param level - Desired level. Cycles off → data → network → off when omitted.
   */
  setContextLevel(level?: ContextLevel): void {
    const order: ContextLevel[] = ["off", "data", "network"];
    this.contextLevel =
      level ?? order[(order.indexOf(this.contextLevel) + 1) % order.length] ?? "off";

    // Only poll for a size while the number is on screen and can change.
    if (this.sizeTimer !== null) window.clearInterval(this.sizeTimer);
    this.sizeTimer = null;
    if (this.contextLevel === "network") {
      this.sizeTimer = window.setInterval(() => this.renderContextButton(), SIZE_REFRESH_MS);
    }

    this.renderContextButton();
  }

  /** The context level new pins are being captured at. */
  get level(): ContextLevel {
    return this.contextLevel;
  }

  /** Update the toolbar's context button to match the level and payload size. */
  private renderContextButton(): void {
    const button = this.toolbar.querySelector('[data-action="context"]');
    if (!button) return;

    button.setAttribute("aria-pressed", String(this.contextLevel !== "off"));
    button.setAttribute("data-level", this.contextLevel);

    if (this.contextLevel !== "network") {
      button.textContent = `Context: ${this.contextLevel}`;
      return;
    }

    // The size is what the human is actually deciding about, so show it rather
    // than making them guess what "network" costs on this page.
    button.textContent = `Context: network (~${formatSize(estimateSize(this.network.recent()))})`;
  }

  /**
   * Collect whatever the current context level asks for.
   *
   * @param element - The element being pinned.
   * @returns The capture, or null when the level is off or there was nothing.
   */
  private capture(element: Element): CapturedData | null {
    if (this.contextLevel === "off") return null;

    const data = captureFiber(element);
    if (this.contextLevel !== "network") return data;

    // Network context is worth having even where React tells us nothing — a
    // production build still makes requests.
    const base: CapturedData = data ?? { componentStack: [], components: [], truncated: false };
    return { ...base, network: this.network.recent() };
  }

  /** True when a node belongs to the overlay rather than the page. */
  private isOwnNode(target: EventTarget | null): boolean {
    return target instanceof Node && this.host.contains(target);
  }

  /** Track the hovered element and draw the highlight over it. */
  private onMouseMove = (event: MouseEvent): void => {
    if (this.isOwnNode(event.target)) {
      this.highlight.hidden = true;
      return;
    }
    const element = event.target;
    if (!(element instanceof Element)) return;

    const rect = element.getBoundingClientRect();
    this.highlight.hidden = false;
    this.highlight.style.left = `${rect.left}px`;
    this.highlight.style.top = `${rect.top}px`;
    this.highlight.style.width = `${rect.width}px`;
    this.highlight.style.height = `${rect.height}px`;
    this.highlight.replaceChildren(
      h("span", { class: "highlight-label" }, [element.tagName.toLowerCase()]),
    );
  };

  /** Capture the clicked element and open a composer over it. */
  private onInspectClick = (event: MouseEvent): void => {
    if (this.isOwnNode(event.target)) return;
    if (!(event.target instanceof Element)) return;

    // The page must not react to a click that was meant for us.
    event.preventDefault();
    event.stopPropagation();

    // Capture now, not on submit: by the time the human has finished typing the
    // component may have re-rendered, and its props then are not the props they
    // were looking at.
    this.pendingTarget = {
      element: event.target,
      ref: captureElement(event.target),
      data: this.capture(event.target),
    };
    this.toggleInspect(false);
    this.openComposer();
  };

  // ---- composer --------------------------------------------------------

  /** Open the per-element comment composer next to the pending target. */
  private openComposer(): void {
    // Remove any previous popover *without* clearing pendingTarget — that is
    // the target this composer is being opened for.
    this.removeComposerNode();
    const pending = this.pendingTarget;
    if (!pending) return;

    const textarea = h("textarea", {
      placeholder: "What should change here?",
      "data-role": "composer-input",
    });
    const save = h("button", { "data-variant": "primary", "data-action": "composer-save" }, [
      "Comment",
    ]);
    const cancel = h("button", { "data-variant": "ghost", "data-action": "composer-cancel" }, [
      "Cancel",
    ]);

    const submit = async () => {
      const text = textarea.value.trim();
      if (!text) return;
      this.closeComposer();
      await this.deps.createThread(pending.ref, text, pending.data ?? undefined);
    };

    save.addEventListener("click", submit);
    cancel.addEventListener("click", () => this.closeComposer());
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void submit();
      }
    });

    const [x, y, , height] = pending.ref.bbox;
    this.composer = h("div", { class: "composer" }, [
      h("div", { class: "composer-target" }, [pending.ref.selector]),
      ...(this.contextLevel === "off"
        ? []
        : [h("div", { class: "composer-context" }, [describeCapture(pending.data)])]),
      textarea,
      h("div", { class: "row" }, [h("span", { class: "grow" }), cancel, save]),
    ]);
    this.composer.style.left = `${Math.max(12, Math.min(x, window.innerWidth - 332))}px`;
    this.composer.style.top = `${Math.min(y + height + 8, window.innerHeight - 190)}px`;

    this.root.append(this.composer);
    textarea.focus();
  }

  /** Detach the composer popover, leaving the pending target alone. */
  private removeComposerNode(): void {
    this.composer?.remove();
    this.composer = null;
  }

  /** Dismiss the composer and forget the pending target. */
  private closeComposer(): void {
    this.removeComposerNode();
    this.pendingTarget = null;
  }

  // ---- ending ----------------------------------------------------------

  /**
   * Two-step end, so a mis-click cannot discard a review in progress.
   *
   * Any text left unsent in the global composer is flushed first — the spec
   * treats losing what the human typed as unacceptable.
   */
  private confirmEnd(button: HTMLElement): void {
    if (button.getAttribute("data-confirming") !== "true") {
      button.setAttribute("data-confirming", "true");
      button.textContent = "Sure?";
      setTimeout(() => {
        button.removeAttribute("data-confirming");
        button.textContent = "End";
      }, 4000);
      return;
    }

    void this.flushAndEnd();
  }

  /** Send any unsent draft, then end the session. */
  private async flushAndEnd(): Promise<void> {
    const draft = this.panel.querySelector<HTMLTextAreaElement>('[data-role="global-input"]');
    const text = draft?.value.trim();
    if (text) {
      draft!.value = "";
      await this.deps.addComment("global", text).catch(() => undefined);
    }
    await this.deps.endSession().catch(() => undefined);
  }

  // ---- events ----------------------------------------------------------

  /** Esc leaves inspect mode and dismisses the composer. */
  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") return;
    if (this.composer) this.closeComposer();
    else if (this.inspecting) this.toggleInspect(false);
  };

  /** Apply an incremental update or a full sync from the server. */
  private onStreamMessage(message: StreamMessage): void {
    switch (message.type) {
      case "sync":
        this.state = message.state;
        break;
      case "thread-created":
        this.state.threads.push(message.thread);
        break;
      case "comment-added": {
        const thread = this.state.threads.find((t) => t.id === message.threadId);
        thread?.comments.push(message.comment);
        break;
      }
      case "thread-updated": {
        const thread = this.state.threads.find((t) => t.id === message.threadId);
        if (thread) {
          thread.resolved = message.resolved;
          thread.orphaned = message.orphaned;
        }
        break;
      }
      case "session-ended":
        this.state.ended = true;
        break;
    }
    this.render();
  }

  // ---- rendering -------------------------------------------------------

  /** Threads that carry a pin, in creation order. */
  private pinnedThreads(): Thread[] {
    return this.state.threads.filter((thread) => thread.element !== null);
  }

  /** Redraw everything from current state. */
  render(): void {
    // An app that replaces the whole body — or a hot reload that does — would
    // otherwise take the overlay with it and never bring it back, silently
    // stranding every comment the human has written.
    if (!this.host.isConnected) document.body.append(this.host);

    if (this.state.ended) {
      this.renderEnded();
      return;
    }

    this.panel.hidden = !this.panelOpen;
    this.applyPageShift(this.panelOpen);
    const count = this.pinnedThreads().filter((t) => !t.resolved).length;
    const countNode = this.toolbar.querySelector('[data-role="count"]');
    if (countNode) countNode.textContent = String(count);

    this.renderPins();
    this.renderPanel();
  }

  /** Replace all chrome with a terminal ended notice. */
  private renderEnded(): void {
    this.toggleInspect(false);
    this.closeComposer();
    // Hand the full width back to the application.
    this.applyPageShift(false);
    this.root.replaceChildren(
      h("style", {}, [OVERLAY_CSS]),
      h("div", { class: "ended" }, ["livepin — session ended"]),
    );
  }

  /**
   * Place a marker for every pinned thread, re-anchoring each to the live DOM.
   *
   * A thread whose element cannot be found is flagged orphaned rather than
   * dropped, and the server is told so the state survives a reload.
   */
  private renderPins(): void {
    this.pinLayer.replaceChildren();
    let awaitingAnchor = false;

    this.pinnedThreads().forEach((thread, index) => {
      const ref = thread.element;
      if (!ref) return;

      // A thread from another route is not lost, it is just elsewhere. Leave
      // its orphaned flag alone — in a single-page app the human navigates
      // constantly, and marking every pin lost on each hop is nonsense.
      if (!isSamePage(thread.url, location.href)) {
        this.anchors.delete(thread.id);
        this.firstMissAt.delete(thread.id);
        return;
      }

      const cached = this.anchors.get(thread.id);
      const stillAttached = cached?.isConnected ? cached : null;
      const element = stillAttached ?? reanchor(ref, document).element;

      if (!element) {
        this.anchors.delete(thread.id);

        // The page may still be fetching what this pin points at. Give it a
        // grace period, and let the MutationObserver retry the moment the DOM
        // changes, before calling the comment orphaned.
        const since = this.firstMissAt.get(thread.id);
        if (since === undefined) {
          this.firstMissAt.set(thread.id, Date.now());
          awaitingAnchor = true;
        } else if (Date.now() - since < ORPHAN_GRACE_MS) {
          awaitingAnchor = true;
        } else if (!thread.orphaned) {
          void this.deps.setOrphaned(thread.id, true).catch(() => undefined);
        }
        return;
      }

      this.anchors.set(thread.id, element);
      this.firstMissAt.delete(thread.id);
      if (thread.orphaned) void this.deps.setOrphaned(thread.id, false).catch(() => undefined);

      const rect = element.getBoundingClientRect();
      const pin = h(
        "button",
        {
          class: "pin",
          "data-thread": thread.id,
          "data-resolved": String(thread.resolved),
          "data-orphaned": "false",
          title: thread.comments[0]?.text ?? "",
        },
        [String(index + 1)],
      );
      pin.style.left = `${rect.left - 8}px`;
      pin.style.top = `${rect.top - 8}px`;
      pin.addEventListener("click", () => {
        this.panelOpen = true;
        this.render();
      });

      this.pinLayer.append(pin);
    });

    // Keep trying while anything is still within its grace period, so a pin
    // lands even on a page that never mutates again after its data arrives.
    if (awaitingAnchor) this.scheduleAnchorRetry();
  }

  /**
   * Make room for the panel by insetting the page, rather than covering it.
   *
   * Without this the panel sits on top of the application and intercepts every
   * click beneath it. Shifting the root element lets normal document flow move
   * out of the way; elements the app positions against the viewport still sit
   * underneath, which is why the panel also defaults to closed.
   *
   * @param open - Whether the panel is currently showing.
   */
  private applyPageShift(open: boolean): void {
    const root = document.documentElement;

    if (open) {
      if (this.previousMarginRight === null) {
        this.previousMarginRight = root.style.marginRight;
      }
      root.style.marginRight = `${PANEL_WIDTH_PX}px`;
      return;
    }

    if (this.previousMarginRight !== null) {
      root.style.marginRight = this.previousMarginRight;
      this.previousMarginRight = null;
    }
  }

  /** Re-run anchoring shortly, coalescing bursts of mutations into one pass. */
  private scheduleAnchorRetry(): void {
    if (this.retryTimer !== null) return;
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = null;
      if (!this.state.ended) this.renderPins();
    }, RETRY_DEBOUNCE_MS);
  }

  /** Rebuild the thread list in the panel. */
  private renderPanel(): void {
    const threads = this.state.threads.filter(
      (thread) => thread.element !== null || thread.comments.length > 0,
    );

    if (threads.length === 0) {
      this.panelBody.replaceChildren(
        h("p", { class: "empty" }, [
          "Nothing yet. Hit Inspect, click an element, and say what should change — or use the box below for anything not tied to one.",
        ]),
      );
      return;
    }

    const pinned = this.pinnedThreads();
    this.panelBody.replaceChildren(
      ...threads.map((thread) => this.renderThread(thread, pinned.indexOf(thread) + 1)),
    );
  }

  /** Render one thread card. */
  private renderThread(thread: Thread, pinNumber: number): HTMLElement {
    const isGlobal = thread.element === null;

    const head = h("div", { class: "thread-head" }, [
      h("span", { class: "thread-badge" }, [isGlobal ? "chat" : String(pinNumber)]),
      h("span", { class: "thread-target" }, [
        isGlobal ? "General" : (thread.element?.selector ?? ""),
      ]),
    ]);

    if (!isGlobal) {
      const resolve = h("button", { "data-variant": "ghost", "data-action": "resolve" }, [
        thread.resolved ? "Reopen" : "Resolve",
      ]);
      resolve.addEventListener("click", () => {
        void this.deps.setResolved(thread.id, !thread.resolved).catch(() => undefined);
      });
      head.append(resolve);
    }

    const parts: Node[] = [head];

    if (thread.data) {
      // Shows the human that context was attached, and gives them the file name
      // they are about to be asked about.
      parts.push(h("p", { class: "source-note" }, [describeCapture(thread.data)]));
    }

    const elsewhere = !isGlobal && !isSamePage(thread.url, location.href);
    if (elsewhere) {
      // Not lost — just pinned to a different route.
      let path = thread.url;
      try {
        path = new URL(thread.url).pathname;
      } catch {
        // Keep the raw value if it will not parse.
      }
      parts.push(h("p", { class: "page-note" }, [`Pinned on ${path}`]));
    } else if (thread.orphaned) {
      parts.push(
        h("p", { class: "orphan-note" }, [
          "Element no longer on the page — the comment is kept here.",
        ]),
      );
    }

    for (const comment of thread.comments) {
      parts.push(
        h("div", { class: "comment", "data-author": comment.author }, [
          h("span", { class: "comment-author" }, [comment.author]),
          h("span", { class: "comment-text" }, [comment.text]),
        ]),
      );
    }

    if (!isGlobal && !thread.resolved) {
      const reply = h("textarea", { placeholder: "Reply…", "data-role": "reply-input" });
      reply.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          const text = reply.value.trim();
          if (!text) return;
          reply.value = "";
          void this.deps.addComment(thread.id, text).catch(() => undefined);
        }
      });
      parts.push(reply);
    }

    return h(
      "div",
      {
        class: "thread",
        "data-thread": thread.id,
        "data-resolved": String(thread.resolved),
        "data-orphaned": String(thread.orphaned),
      },
      parts,
    );
  }

  /** Pins are fixed-positioned, so they must follow scroll and resize. */
  private reposition = (): void => {
    if (!this.state.ended) this.renderPins();
  };
}
