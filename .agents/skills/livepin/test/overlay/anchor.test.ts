// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";

import {
  boxDistance,
  findByText,
  isSamePage,
  POSITION_TOLERANCE,
  reanchor,
} from "../../src/overlay/anchor.js";
import type { ElementRef } from "../../src/types.js";

/**
 * happy-dom reports a zero box for everything, so position-strategy tests stub
 * getBoundingClientRect on the specific elements under test.
 */
function stubBox(element: Element, left: number, top: number): void {
  const rect = {
    left,
    top,
    width: 100,
    height: 20,
    right: left + 100,
    bottom: top + 20,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
  element.getBoundingClientRect = () => rect;
}

function ref(overrides: Partial<ElementRef> = {}): ElementRef {
  return {
    selector: '[data-testid="row-91"]',
    text: "Dr. Okafor — Follow-up",
    bbox: [10, 20, 300, 40],
    tag: "li",
    ...overrides,
  };
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("findByText", () => {
  it("finds the element whose text matches", () => {
    document.body.innerHTML = "<ul><li>alpha</li><li>beta</li></ul>";
    const found = findByText(document, "beta");
    expect(found).toHaveLength(1);
    expect(found[0]?.textContent).toBe("beta");
  });

  it("returns the deepest node when a parent shares its child's text", () => {
    document.body.innerHTML = "<div><span>only</span></div>";
    const found = findByText(document, "only");
    expect(found).toHaveLength(1);
    expect(found[0]?.tagName).toBe("SPAN");
  });

  it("returns every match when text is genuinely duplicated", () => {
    document.body.innerHTML = "<ul><li>same</li><li>same</li></ul>";
    expect(findByText(document, "same")).toHaveLength(2);
  });

  it("returns nothing for empty text", () => {
    document.body.innerHTML = "<div></div>";
    expect(findByText(document, "")).toEqual([]);
  });
});

describe("isSamePage", () => {
  it("matches on pathname", () => {
    expect(isSamePage("http://app/patients/1182", "http://app/patients/1182")).toBe(true);
  });

  it("ignores query strings and hashes", () => {
    // A tab switch is not a different page, and pins must survive it.
    expect(isSamePage("http://app/list?tab=1", "http://app/list?tab=2#top")).toBe(true);
  });

  it("ignores origin differences, so a port change does not lose pins", () => {
    expect(isSamePage("http://127.0.0.1:4850/list", "http://localhost:3000/list")).toBe(true);
  });

  it("rejects a different path", () => {
    expect(isSamePage("http://app/patients", "http://app/dashboard")).toBe(false);
  });

  it("rejects an unparseable url rather than throwing", () => {
    expect(isSamePage("", "http://app/x")).toBe(false);
    expect(isSamePage("not a url", "http://app/x")).toBe(false);
  });
});

describe("boxDistance", () => {
  it("is zero at the captured position", () => {
    expect(boxDistance({ left: 10, top: 20 }, [10, 20, 0, 0])).toBe(0);
  });

  it("grows with displacement", () => {
    expect(boxDistance({ left: 13, top: 24 }, [10, 20, 0, 0])).toBe(25);
  });
});

describe("reanchor", () => {
  it("uses the selector when it matches exactly one element", () => {
    document.body.innerHTML = '<ul><li data-testid="row-91">Dr. Okafor — Follow-up</li></ul>';
    const result = reanchor(ref(), document);
    expect(result.strategy).toBe("selector");
    expect(result.element?.getAttribute("data-testid")).toBe("row-91");
  });

  it("rejects an ambiguous selector and falls through", () => {
    // Two matches means the selector has stopped identifying anything.
    document.body.innerHTML = "<ul><li>Dr. Okafor — Follow-up</li><li>other</li></ul>";
    const result = reanchor(ref({ selector: "li" }), document);
    expect(result.strategy).toBe("text");
    expect(result.element?.textContent).toBe("Dr. Okafor — Follow-up");
  });

  it("falls back to text when the markup was restructured", () => {
    // The test id is gone — the usual outcome of editing a component.
    document.body.innerHTML = "<section><div><li>Dr. Okafor — Follow-up</li></div></section>";
    const result = reanchor(ref(), document);
    expect(result.strategy).toBe("text");
  });

  it("survives a selector that has become syntactically invalid", () => {
    document.body.innerHTML = "<ul><li>Dr. Okafor — Follow-up</li></ul>";
    const result = reanchor(ref({ selector: "[[[not a selector" }), document);
    expect(result.strategy).toBe("text");
  });

  it("falls back to position when selector and text both fail", () => {
    document.body.innerHTML = "<ul><li>renamed entirely</li></ul>";
    const li = document.querySelector("li")!;
    stubBox(li, 12, 22);

    const result = reanchor(ref({ selector: "#gone" }), document);
    expect(result.strategy).toBe("position");
    expect(result.element).toBe(li);
  });

  it("restricts the position fallback to the same tag", () => {
    document.body.innerHTML = "<div>renamed</div>";
    const div = document.querySelector("div")!;
    stubBox(div, 10, 20);

    // Captured tag was li; a div at the same spot must not be grabbed.
    const result = reanchor(ref({ selector: "#gone" }), document);
    expect(result.strategy).toBe("none");
  });

  it("refuses a position match beyond the tolerance", () => {
    document.body.innerHTML = "<ul><li>renamed</li></ul>";
    stubBox(document.querySelector("li")!, 10 + POSITION_TOLERANCE * 3, 20);

    expect(reanchor(ref({ selector: "#gone" }), document).strategy).toBe("none");
  });

  it("reports none rather than guessing when the element is gone", () => {
    document.body.innerHTML = "<p>completely different page</p>";
    const result = reanchor(ref({ selector: "#gone" }), document);
    expect(result.strategy).toBe("none");
    expect(result.element).toBeNull();
  });

  it("prefers the selector over text when both would match", () => {
    document.body.innerHTML =
      '<ul><li data-testid="row-91">Dr. Okafor — Follow-up</li><li>Dr. Okafor — Follow-up</li></ul>';
    expect(reanchor(ref(), document).strategy).toBe("selector");
  });
});
