// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";

import {
  captureFiber,
  componentName,
  findFiber,
  MAX_ARRAY_ITEMS,
  MAX_COMPONENTS,
  MAX_DEPTH,
  MAX_KEYS,
  MAX_STACK_DEPTH,
  MAX_STRING_LENGTH,
  MAX_TOTAL_CHARS,
  summarise,
  type Budget,
} from "../../src/overlay/fiber.js";

/** A stand-in fiber. Only the fields the capture reads need to exist. */
interface FakeFiber {
  return?: FakeFiber | null;
  type?: unknown;
  memoizedProps?: unknown;
  stateNode?: unknown;
  _debugSource?: { fileName?: string; lineNumber?: number } | null;
}

/** Attach a fiber to an element the way React 18 does. */
function attach(element: Element, fiber: FakeFiber, key = "__reactFiber$a1b2c3"): Element {
  Object.defineProperty(element, key, { value: fiber, enumerable: true, configurable: true });
  return element;
}

/** An element in the document, optionally carrying a fiber. */
function node(fiber?: FakeFiber, key?: string): Element {
  document.body.innerHTML = "<div><span>x</span></div>";
  const element = document.querySelector("span")!;
  return fiber ? attach(element, fiber, key) : element;
}

/** A fresh budget for summarise tests. */
function budget(): Budget {
  return { used: 0, truncated: false };
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("findFiber", () => {
  it("finds React 18's fiber key", () => {
    const fiber = { type: "span" };
    expect(findFiber(node(fiber))).toBe(fiber);
  });

  it("finds React 17's older key name", () => {
    const fiber = { type: "span" };
    expect(findFiber(node(fiber, "__reactInternalInstance$zz"))).toBe(fiber);
  });

  it("returns null on a page that is not React", () => {
    expect(findFiber(node())).toBeNull();
  });

  it("ignores a fiber key holding something that is not an object", () => {
    const element = node();
    Object.defineProperty(element, "__reactFiber$x", { value: "nonsense", enumerable: true });
    expect(findFiber(element)).toBeNull();
  });
});

describe("componentName", () => {
  function Named(): null {
    return null;
  }

  it.each([
    ["a function", Named, "Named"],
    ["displayName over name", Object.assign(() => null, { displayName: "Preferred" }), "Preferred"],
    ["a forwardRef wrapper", { render: Named }, "Named"],
    ["a memo wrapper", { type: Named }, "Named"],
    ["a wrapper's own displayName", { displayName: "Memo(Row)", type: Named }, "Memo(Row)"],
  ])("reads %s", (_label, type, expected) => {
    expect(componentName(type)).toBe(expected);
  });

  it.each([["div"], [null], [undefined], [42]])("returns null for a host type %s", (type) => {
    // A string type is an element, not a component.
    expect(componentName(type)).toBeNull();
  });

  it("returns null for an anonymous function with no name", () => {
    const anonymous = (
      () => () =>
        null
    )();
    Object.defineProperty(anonymous, "name", { value: "" });
    expect(componentName(anonymous)).toBeNull();
  });
});

describe("summarise", () => {
  it("passes primitives through", () => {
    expect(summarise({ a: 1, b: "two", c: true, d: null }, budget())).toEqual({
      a: 1,
      b: "two",
      c: true,
      d: null,
    });
  });

  it("marks undefined rather than dropping the key", () => {
    // A missing prop and a prop set to undefined are different bugs.
    expect(summarise({ a: undefined }, budget())).toEqual({ a: "[undefined]" });
  });

  it("names functions instead of omitting them", () => {
    expect(summarise({ onClick: function handleClick() {} }, budget())).toEqual({
      onClick: "[Function handleClick]",
    });
  });

  it("renders non-finite numbers as text, since JSON cannot hold them", () => {
    expect(summarise({ a: NaN, b: Infinity }, budget())).toEqual({ a: "NaN", b: "Infinity" });
  });

  it("truncates a long string and says so", () => {
    const state = budget();
    const result = summarise("x".repeat(1000), state) as string;
    expect(result).toHaveLength(MAX_STRING_LENGTH);
    expect(result.endsWith("…")).toBe(true);
    expect(state.truncated).toBe(true);
  });

  it("stops at the depth limit", () => {
    const state = budget();
    let deep: unknown = "bottom";
    for (let i = 0; i < MAX_DEPTH + 3; i += 1) deep = { nest: deep };

    expect(JSON.stringify(summarise(deep, state))).toContain("[Object]");
    expect(state.truncated).toBe(true);
  });

  it("caps array length and reports how many were dropped", () => {
    const state = budget();
    const result = summarise(
      Array.from({ length: MAX_ARRAY_ITEMS + 5 }, (_, i) => i),
      state,
    ) as unknown[];

    expect(result).toHaveLength(MAX_ARRAY_ITEMS + 1);
    expect(result.at(-1)).toBe("[+5 more]");
    expect(state.truncated).toBe(true);
  });

  it("caps object keys and reports how many were dropped", () => {
    const state = budget();
    const wide = Object.fromEntries(Array.from({ length: MAX_KEYS + 3 }, (_, i) => [`k${i}`, i]));

    const result = summarise(wide, state) as Record<string, unknown>;
    expect(Object.keys(result)).toHaveLength(MAX_KEYS + 1);
    expect(result["…"]).toBe("[+3 more keys]");
  });

  it("breaks cycles instead of recursing forever", () => {
    const parent: Record<string, unknown> = { name: "parent" };
    parent.self = parent;

    expect(summarise(parent, budget())).toEqual({ name: "parent", self: "[circular]" });
  });

  it("does not walk into DOM nodes", () => {
    document.body.innerHTML = "<button>go</button>";
    const element = document.querySelector("button")!;

    expect(summarise({ ref: element }, budget())).toEqual({ ref: "[Node <button>]" });
  });

  it("names a React element rather than expanding children", () => {
    const child = {
      $$typeof: Symbol.for("react.element"),
      type: function Row(): null {
        return null;
      },
    };
    expect(summarise({ children: child }, budget())).toEqual({ children: "[ReactElement Row]" });
  });

  it("summarises dates, maps, sets and errors", () => {
    expect(
      summarise(
        {
          when: new Date("2026-08-07T00:00:00.000Z"),
          map: new Map([["a", 1]]),
          set: new Set([1, 2]),
          err: new TypeError("bad prop"),
        },
        budget(),
      ),
    ).toEqual({
      when: "2026-08-07T00:00:00.000Z",
      map: "[Map size=1]",
      set: "[Set size=2]",
      err: "[TypeError: bad prop]",
    });
  });

  it("survives a getter that throws", () => {
    const hostile = {
      get boom(): never {
        throw new Error("no");
      },
    };
    // The host app's broken getter is not our failure to report.
    expect(summarise(hostile, budget())).toEqual({ boom: "[unreadable]" });
  });

  it("stops once the total budget is spent", () => {
    const state = budget();
    const huge = Object.fromEntries(
      Array.from({ length: MAX_KEYS }, (_, i) => [`k${i}`, "y".repeat(MAX_STRING_LENGTH)]),
    );

    const result = summarise(huge, state) as Record<string, unknown>;
    expect(state.used).toBeGreaterThanOrEqual(MAX_TOTAL_CHARS);
    expect(Object.values(result)).toContain("[truncated]");
  });
});

describe("captureFiber", () => {
  function Row(): null {
    return null;
  }
  function List(): null {
    return null;
  }

  it("returns null when the element is not React's", () => {
    expect(captureFiber(node())).toBeNull();
  });

  it("reads the nearest recorded source location", () => {
    const outer: FakeFiber = {
      type: List,
      _debugSource: { fileName: "/app/List.tsx", lineNumber: 9 },
    };
    const inner: FakeFiber = {
      type: "span",
      _debugSource: { fileName: "/app/Row.tsx", lineNumber: 42 },
      return: outer,
    };

    // The click landed on the span, so the span's position is the useful one.
    expect(captureFiber(node(inner))?.source).toEqual({ file: "/app/Row.tsx", line: 42 });
  });

  it("omits the source on a build that does not record it", () => {
    // React 19 removed _debugSource; the rest must still work.
    const capture = captureFiber(node({ type: Row, memoizedProps: { id: 1 } }));
    expect(capture?.source).toBeUndefined();
    expect(capture?.components[0]?.props).toEqual({ id: 1 });
  });

  it("ignores a partial source record", () => {
    expect(
      captureFiber(node({ type: Row, _debugSource: { fileName: "/a.tsx" } }))?.source,
    ).toBeUndefined();
  });

  it("builds the component stack innermost first, skipping host elements", () => {
    const list: FakeFiber = { type: List };
    const row: FakeFiber = { type: Row, return: list };
    const span: FakeFiber = { type: "span", return: row };

    expect(captureFiber(node(span))?.componentStack).toEqual(["Row", "List"]);
  });

  it("captures props for the nearest components only, but names them all", () => {
    const outer: FakeFiber = { type: List, memoizedProps: { level: 4 } };
    const third: FakeFiber = { type: Row, memoizedProps: { level: 3 }, return: outer };
    const second: FakeFiber = { type: Row, memoizedProps: { level: 2 }, return: third };
    const first: FakeFiber = { type: Row, memoizedProps: { level: 1 }, return: second };

    const capture = captureFiber(node(first));
    // Props are the expensive part, so they stop at MAX_COMPONENTS...
    expect(capture?.components.map((c) => (c.props as { level: number }).level)).toEqual([1, 2, 3]);
    expect(MAX_COMPONENTS).toBe(3);
    // ...while names are cheap and keep going, so the agent still sees the shape.
    expect(capture?.componentStack).toEqual(["Row", "Row", "Row", "List"]);
  });

  it("captures class-component state from the instance", () => {
    const fiber: FakeFiber = {
      type: Row,
      memoizedProps: { id: 7 },
      stateNode: { state: { open: true } },
    };

    expect(captureFiber(node(fiber))?.components[0]).toEqual({
      name: "Row",
      props: { id: 7 },
      state: { open: true },
    });
  });

  it("omits state for a function component, whose memoizedState is a hooks list", () => {
    document.body.innerHTML = "<div><span>x</span></div>";
    const element = document.querySelector("span")!;
    // stateNode is the DOM node on a host fiber and null on a function component;
    // neither carries anything a human would recognise as state.
    const fiber: FakeFiber = { type: Row, memoizedProps: {}, stateNode: element };

    expect(captureFiber(attach(element, fiber))?.components[0]?.state).toBeUndefined();
  });

  it("stops climbing at the stack depth limit", () => {
    let fiber: FakeFiber = { type: Row };
    for (let i = 0; i < MAX_STACK_DEPTH + 10; i += 1) fiber = { type: Row, return: fiber };

    expect(captureFiber(node(fiber))?.componentStack).toHaveLength(MAX_STACK_DEPTH);
  });

  it("reports a React element with nothing else recorded", () => {
    const capture = captureFiber(node({ type: "span" }));
    expect(capture).toEqual({ componentStack: [], components: [], truncated: false });
  });

  it("returns null rather than throwing when the fiber shape is hostile", () => {
    const hostile = {
      get return(): never {
        throw new Error("internals moved");
      },
      type: Row,
    };

    // Private API changing shape must cost the extra context, never the comment.
    expect(captureFiber(node(hostile as FakeFiber))).toBeNull();
  });

  it("flags truncation up to the caller", () => {
    const fiber: FakeFiber = { type: Row, memoizedProps: { blurb: "z".repeat(1000) } };
    expect(captureFiber(node(fiber))?.truncated).toBe(true);
  });
});
