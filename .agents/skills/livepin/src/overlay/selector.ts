/**
 * Generating a CSS selector for a clicked element.
 *
 * The selector has to survive a code change, because the whole point of the
 * tool is that the agent edits the page between the comment being written and
 * the pin being re-anchored. So the strategy prefers identifiers a developer
 * chose deliberately (test ids, ids) over structural position, which any edit
 * can shift.
 */

/** Attributes treated as stable handles, in order of preference. */
const STABLE_ATTRIBUTES = ["data-testid", "data-test-id", "data-test", "data-cy"];

/** How far up the tree to walk before giving up on a structural path. */
const MAX_DEPTH = 12;

/** Longest element text captured alongside a selector. */
export const MAX_TEXT_LENGTH = 120;

/**
 * CSS-escape a value for use in a selector.
 *
 * Uses the platform's `CSS.escape` when present and falls back to escaping the
 * characters that actually appear in generated class names and ids, so the
 * module stays usable in a bare test DOM.
 *
 * @param value - Raw attribute value.
 */
export function escapeSelectorValue(value: string): string {
  const globalCss = (globalThis as { CSS?: { escape?: (v: string) => string } }).CSS;
  if (typeof globalCss?.escape === "function") return globalCss.escape(value);
  return value.replace(/([^\w-])/g, "\\$1");
}

/**
 * True when an id looks framework-generated rather than author-written.
 *
 * React's `useId`, Emotion, and MUI all emit ids that change between builds, so
 * anchoring to them produces a selector that breaks on the next reload — worse
 * than a structural path, because it looks stable and is not.
 *
 * @param id - The element's id attribute.
 */
export function isVolatileId(id: string): boolean {
  return (
    id.length === 0 ||
    /^(:r[0-9a-z]+:|mui-[0-9]+|radix-|headlessui-|:R[0-9a-z]+:)/i.test(id) ||
    // Long hex or base36 blobs are almost always generated.
    /^[a-f0-9]{8,}$/i.test(id) ||
    /^[a-z]*[0-9]{6,}$/i.test(id)
  );
}

/**
 * Class names worth keeping in a selector.
 *
 * CSS-in-JS emits hashed classes (`css-1q2w3e`, `jsx-123456`) that change
 * whenever the style does. Utility frameworks emit dozens of classes that say
 * nothing about identity. Both are filtered out.
 *
 * @param element - The element to read classes from.
 */
export function stableClasses(element: Element): string[] {
  const raw = element.getAttribute("class");
  if (!raw) return [];

  return raw
    .split(/\s+/)
    .filter(Boolean)
    .filter((cls) => !/^(css-|jsx-|emotion-|sc-|Mui.*-)/.test(cls))
    .filter((cls) => !/^[a-z]+-[a-f0-9]{5,}$/i.test(cls))
    .slice(0, 2);
}

/**
 * Build a selector fragment identifying `element` among its siblings.
 *
 * @param element - Element to describe.
 * @returns A single-level selector fragment.
 */
function describeElement(element: Element): string {
  const tag = element.tagName.toLowerCase();

  for (const attr of STABLE_ATTRIBUTES) {
    const value = element.getAttribute(attr);
    if (value) return `[${attr}="${value}"]`;
  }

  const id = element.getAttribute("id");
  if (id && !isVolatileId(id)) return `#${escapeSelectorValue(id)}`;

  const classes = stableClasses(element);
  const withClasses = classes.length ? `${tag}.${classes.map(escapeSelectorValue).join(".")}` : tag;

  // Position is the last resort, and only added when it disambiguates.
  const parent = element.parentElement;
  if (!parent) return withClasses;

  const matching = [...parent.children].filter((sibling) => sibling.tagName === element.tagName);
  if (matching.length <= 1) return withClasses;

  const index = matching.indexOf(element) + 1;
  return `${withClasses}:nth-of-type(${index})`;
}

/**
 * True when the fragment identifies an element on its own, without ancestors.
 *
 * @param fragment - A selector fragment from {@link describeElement}.
 */
function isGloballyUnique(fragment: string): boolean {
  return fragment.startsWith("[data-") || fragment.startsWith("#");
}

/**
 * Build a CSS selector for `element`.
 *
 * Walks up from the element, stopping as soon as it hits something globally
 * unique (a test id or a stable id) so the shortest, most durable selector
 * wins. Falls back to a bounded structural path.
 *
 * @param element - The element to describe.
 * @returns A selector string. Not guaranteed unique on pathological markup —
 *   callers treat it as one signal among several when re-anchoring.
 */
export function buildSelector(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;
  let depth = 0;

  while (current && depth < MAX_DEPTH) {
    const fragment = describeElement(current);
    parts.unshift(fragment);

    if (isGloballyUnique(fragment)) break;

    current = current.parentElement;
    depth += 1;
    if (current && (current.tagName === "BODY" || current.tagName === "HTML")) break;
  }

  return parts.join(" > ");
}

/**
 * Read an element's visible text, collapsed and truncated.
 *
 * @param element - Element to read.
 * @returns Trimmed text, at most {@link MAX_TEXT_LENGTH} characters.
 */
export function elementText(element: Element): string {
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.length > MAX_TEXT_LENGTH ? `${text.slice(0, MAX_TEXT_LENGTH - 1)}…` : text;
}
