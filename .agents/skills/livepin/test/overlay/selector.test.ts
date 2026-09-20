// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";

import {
  buildSelector,
  elementText,
  escapeSelectorValue,
  isVolatileId,
  MAX_TEXT_LENGTH,
  stableClasses,
} from "../../src/overlay/selector.js";

/** Replace the document body and return the element matching `pick`. */
function render(html: string, pick: string): Element {
  document.body.innerHTML = html;
  const element = document.body.querySelector(pick);
  if (!element) throw new Error(`fixture has no ${pick}`);
  return element;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("isVolatileId", () => {
  it.each([
    [":r1:", true],
    [":R2h:", true],
    ["mui-12345", true],
    ["radix-:r0:", true],
    ["headlessui-menu-1", true],
    ["deadbeef99", true],
    ["field123456", true],
    ["", true],
    ["patient-header", false],
    ["submit", false],
    ["step2", false],
  ])("%s -> %s", (id, expected) => {
    expect(isVolatileId(id)).toBe(expected);
  });
});

describe("stableClasses", () => {
  it("drops CSS-in-JS hashes and keeps authored names", () => {
    const el = render('<div class="css-1q2w3e visit-row jsx-9988 emotion-x"></div>', "div");
    expect(stableClasses(el)).toEqual(["visit-row"]);
  });

  it("drops hashed utility classes", () => {
    const el = render('<div class="btn-a1b2c3d card"></div>', "div");
    expect(stableClasses(el)).toEqual(["card"]);
  });

  it("caps how many classes are kept", () => {
    const el = render('<div class="a b c d e"></div>', "div");
    expect(stableClasses(el)).toHaveLength(2);
  });

  it("returns empty for an unclassed element", () => {
    expect(stableClasses(render("<div></div>", "div"))).toEqual([]);
  });
});

describe("buildSelector", () => {
  it("prefers a test id and stops there", () => {
    const el = render('<main><div data-testid="strip"><span>x</span></div></main>', "span");
    // The ancestor carries the test id, so the path stops at it.
    expect(buildSelector(el)).toBe('[data-testid="strip"] > span');
  });

  it("uses the element's own test id alone", () => {
    const el = render('<main><b data-testid="badge">x</b></main>', "b");
    expect(buildSelector(el)).toBe('[data-testid="badge"]');
  });

  it("uses a stable id", () => {
    const el = render('<div id="patient-header"><i>x</i></div>', "i");
    expect(buildSelector(el)).toBe("#patient-header > i");
  });

  it("ignores a framework-generated id and falls back to structure", () => {
    const el = render('<main><p id=":r7:">x</p></main>', "p");
    expect(buildSelector(el)).not.toContain(":r7:");
    expect(buildSelector(el)).toContain("p");
  });

  it("adds nth-of-type only when siblings are ambiguous", () => {
    const el = render("<ul><li>a</li><li>b</li><li>c</li></ul>", "li:nth-child(2)");
    expect(buildSelector(el)).toContain("li:nth-of-type(2)");
  });

  it("omits nth-of-type for an only child", () => {
    const el = render("<ul><li>only</li></ul>", "li");
    expect(buildSelector(el)).not.toContain("nth-of-type");
  });

  it("produces a selector that actually matches the element", () => {
    const el = render(
      '<main><section class="panel"><ul data-testid="list"><li>a</li><li>b</li></ul></section></main>',
      "li:nth-child(2)",
    );
    const selector = buildSelector(el);
    expect(document.querySelectorAll(selector)).toHaveLength(1);
    expect(document.querySelector(selector)).toBe(el);
  });

  it("handles a detached element with no parent", () => {
    const orphan = document.createElement("div");
    expect(buildSelector(orphan)).toBe("div");
  });
});

describe("elementText", () => {
  it("collapses whitespace", () => {
    const el = render("<p>  hello\n\n   world  </p>", "p");
    expect(elementText(el)).toBe("hello world");
  });

  it("truncates long text with an ellipsis", () => {
    const el = render(`<p>${"x".repeat(500)}</p>`, "p");
    const text = elementText(el);
    expect(text).toHaveLength(MAX_TEXT_LENGTH);
    expect(text.endsWith("…")).toBe(true);
  });

  it("returns empty string for an empty element", () => {
    expect(elementText(render("<div></div>", "div"))).toBe("");
  });
});

describe("escapeSelectorValue", () => {
  it("escapes characters that would break a selector", () => {
    // happy-dom may not provide CSS.escape; either path must escape the colon.
    expect(escapeSelectorValue("a:b")).toContain("\\:");
  });

  it("delegates to CSS.escape when the platform provides it", () => {
    const original = (globalThis as { CSS?: unknown }).CSS;
    (globalThis as { CSS?: unknown }).CSS = { escape: (v: string) => `escaped(${v})` };
    try {
      expect(escapeSelectorValue("a:b")).toBe("escaped(a:b)");
    } finally {
      (globalThis as { CSS?: unknown }).CSS = original;
    }
  });

  it("falls back to manual escaping when CSS.escape is absent", () => {
    const original = (globalThis as { CSS?: unknown }).CSS;
    delete (globalThis as { CSS?: unknown }).CSS;
    try {
      expect(escapeSelectorValue("a:b")).toBe("a\\:b");
    } finally {
      (globalThis as { CSS?: unknown }).CSS = original;
    }
  });
});
