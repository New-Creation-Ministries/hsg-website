/**
 * Finding a pinned element again after the page has changed.
 *
 * This is the hardest problem in the tool. Pins are placed, the agent edits the
 * code, hot reload swaps the DOM, and the pin has to land back on the right
 * element — or, failing that, say so. The rule that shapes everything here:
 * **a comment is never silently dropped.** A pin that cannot be placed becomes
 * visibly orphaned instead of disappearing.
 */

import type { ElementRef } from "../types.js";
import { elementText } from "./selector.js";

/** How a pin was re-anchored, in descending order of confidence. */
export type AnchorStrategy = "selector" | "text" | "position" | "none";

/**
 * True when a thread was created on the page currently being viewed.
 *
 * Compares pathnames only: query strings and hashes routinely change without
 * changing what is on screen, and a thread pinned on `?tab=1` is still pinned to
 * the same page on `?tab=2`.
 *
 * A thread from a *different* page is not orphaned — its element is simply
 * elsewhere. Conflating the two marks every pin as lost the moment the human
 * navigates, which in a single-page app is constantly.
 *
 * @param threadUrl - URL recorded when the thread was created.
 * @param currentHref - The page being viewed now.
 */
export function isSamePage(threadUrl: string, currentHref: string): boolean {
  try {
    return new URL(threadUrl).pathname === new URL(currentHref).pathname;
  } catch {
    return false;
  }
}

/** Outcome of an attempt to re-anchor a pin. */
export interface AnchorResult {
  element: Element | null;
  strategy: AnchorStrategy;
}

/**
 * Distance in CSS pixels within which a position match is believed.
 *
 * Generous enough to survive a font-size change or a scrollbar appearing, tight
 * enough that it will not grab an unrelated element across the page.
 */
export const POSITION_TOLERANCE = 40;

/**
 * Find elements whose visible text matches the captured text exactly.
 *
 * @param root - Document or subtree to search.
 * @param text - Text captured when the pin was created.
 * @returns Matching elements, deepest-first so the most specific wins.
 */
export function findByText(root: ParentNode, text: string): Element[] {
  if (!text) return [];

  const matches: Element[] = [];
  for (const element of root.querySelectorAll("*")) {
    if (elementText(element) === text) matches.push(element);
  }

  // A parent and its only child share text; the deeper node is the one the
  // human actually clicked.
  return matches.filter(
    (element) => !matches.some((other) => other !== element && element.contains(other)),
  );
}

/**
 * Squared distance between an element's current box and a captured one.
 *
 * Squared rather than rooted because only the ordering matters, and this runs
 * over every candidate on the page.
 *
 * @param rect - Current bounding box.
 * @param bbox - Captured `[x, y, width, height]`.
 */
export function boxDistance(
  rect: { left: number; top: number },
  bbox: readonly [number, number, number, number],
): number {
  const dx = rect.left - bbox[0];
  const dy = rect.top - bbox[1];
  return dx * dx + dy * dy;
}

/**
 * Re-anchor a pin to an element in the current DOM.
 *
 * Strategies are tried in descending order of confidence:
 *
 * 1. **selector** — the captured selector still matches exactly one element.
 * 2. **text** — exactly one element has the same visible text. Survives markup
 *    restructuring, which is the common case after a component is edited.
 * 3. **position** — a same-tag element sits within {@link POSITION_TOLERANCE}
 *    of where the pin was. Weakest, so it is also the narrowest: same tag only.
 *
 * @param ref - The element reference captured when the pin was created.
 * @param root - Document to search. Injectable for tests.
 * @returns The element and which strategy found it, or `none`.
 */
export function reanchor(ref: ElementRef, root: Document): AnchorResult {
  // 1. Selector, but only when unambiguous — two matches means the selector has
  //    stopped identifying anything in particular.
  try {
    const bySelector = root.querySelectorAll(ref.selector);
    if (bySelector.length === 1) {
      return { element: bySelector[0] ?? null, strategy: "selector" };
    }
  } catch {
    // A selector can become syntactically invalid if the markup it was built
    // from contained something exotic. Fall through rather than throw.
  }

  // 2. Text, again only when unambiguous.
  const byText = findByText(root, ref.text);
  if (byText.length === 1) {
    return { element: byText[0] ?? null, strategy: "text" };
  }

  // 3. Position, restricted to the same tag and a tight radius.
  const sameTag = [...root.querySelectorAll(ref.tag)];
  let best: Element | null = null;
  let bestDistance = Infinity;

  for (const element of sameTag) {
    const rect = element.getBoundingClientRect();
    const distance = boxDistance(rect, ref.bbox);
    if (distance < bestDistance) {
      best = element;
      bestDistance = distance;
    }
  }

  if (best && bestDistance <= POSITION_TOLERANCE * POSITION_TOLERANCE) {
    return { element: best, strategy: "position" };
  }

  return { element: null, strategy: "none" };
}
