/**
 * Recovering React's view of a clicked DOM element.
 *
 * Everything here reads private internals. React hangs a `__reactFiber$…` key on
 * each host DOM node, and dev builds record where each element was written in
 * `_debugSource`. Neither is documented, both have changed shape between
 * versions, and `_debugSource` was removed outright in React 19.
 *
 * So the contract of this module is: return what it can, return null when it
 * cannot, and never throw. A page that is not React, is a production build, or
 * is a React version that moved the furniture must degrade to a selector and a
 * bit of text — which is still a working annotation.
 */

import type { CapturedData, ComponentCapture, SourceRef } from "../types.js";

/** Keys React uses for the fiber it attaches to a DOM node, newest first. */
const FIBER_KEY_PREFIXES = ["__reactFiber$", "__reactInternalInstance$"];

/** How far up the tree component names are collected. */
export const MAX_STACK_DEPTH = 12;

/** How many components' props and state are captured. */
export const MAX_COMPONENTS = 3;

/** Longest string kept inside captured data. */
export const MAX_STRING_LENGTH = 200;

/** How deep into a props object the capture goes. */
export const MAX_DEPTH = 4;

/** Most keys kept from one object. */
export const MAX_KEYS = 24;

/** Most items kept from one array. */
export const MAX_ARRAY_ITEMS = 20;

/** Total characters of captured data, across everything. */
export const MAX_TOTAL_CHARS = 4000;

/** The parts of a fiber this module reads. All optional — none are guaranteed. */
interface Fiber {
  return?: Fiber | null;
  type?: unknown;
  elementType?: unknown;
  memoizedProps?: unknown;
  memoizedState?: unknown;
  stateNode?: unknown;
  _debugSource?: { fileName?: string; lineNumber?: number } | null;
}

/** Tracks how much has been captured, so the total stays bounded. */
export interface Budget {
  used: number;
  truncated: boolean;
}

/**
 * Find the fiber React attached to a DOM node.
 *
 * @param node - Any element on the page.
 * @returns The fiber, or null if the node is not React's.
 */
export function findFiber(node: Element): Fiber | null {
  for (const key of Object.keys(node)) {
    if (!FIBER_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) continue;

    const value = (node as unknown as Record<string, unknown>)[key];
    if (value && typeof value === "object") return value as Fiber;
  }
  return null;
}

/**
 * Display name of a component type.
 *
 * @param type - A fiber's `type`: a string for host elements, a function or
 *   class for components, or a wrapper object for `memo` and `forwardRef`.
 * @returns The name, or null when this is not a component.
 */
export function componentName(type: unknown): string | null {
  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name || null;
  }

  if (type && typeof type === "object") {
    const wrapper = type as { displayName?: string; render?: unknown; type?: unknown };
    if (typeof wrapper.displayName === "string" && wrapper.displayName) return wrapper.displayName;
    // forwardRef holds the function in `render`; memo holds it in `type`.
    if (wrapper.render) return componentName(wrapper.render);
    if (wrapper.type) return componentName(wrapper.type);
  }

  // A string type is a host element (`div`), which is not a component.
  return null;
}

/** Shorten a string, counting it against the budget. */
function takeString(value: string, budget: Budget): string {
  const clipped =
    value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH - 1)}…` : value;
  if (clipped.length !== value.length) budget.truncated = true;
  budget.used += clipped.length;
  return clipped;
}

/**
 * Convert a value into something JSON-safe and bounded.
 *
 * Unrepresentable values become a marker rather than disappearing: an agent
 * being told a prop is a function is informative, an agent seeing no prop at all
 * is misled.
 *
 * @param value - Anything from a props object.
 * @param budget - Shared size accounting.
 * @param depth - Current nesting depth.
 * @param seen - Objects already visited on this path, for cycle detection.
 * @returns A JSON-serialisable stand-in.
 */
export function summarise(
  value: unknown,
  budget: Budget,
  depth = 0,
  seen: Set<unknown> = new Set(),
): unknown {
  if (budget.used >= MAX_TOTAL_CHARS) {
    budget.truncated = true;
    return "[truncated]";
  }

  if (value === null) return null;
  if (value === undefined) return "[undefined]";

  switch (typeof value) {
    case "boolean":
      budget.used += 5;
      return value;
    case "number":
      budget.used += 8;
      // NaN and Infinity are not JSON; say so rather than sending null.
      return Number.isFinite(value) ? value : String(value);
    case "string":
      return takeString(value, budget);
    case "bigint":
      return takeString(`${value}n`, budget);
    case "symbol":
      return takeString(String(value), budget);
    case "function":
      return `[Function ${(value as { name?: string }).name || "anonymous"}]`;
    default:
      break;
  }

  if (seen.has(value)) {
    // Props routinely contain parent references; following them never ends.
    return "[circular]";
  }

  // A DOM node's own properties are enormous and tell the agent nothing it
  // cannot see from the selector.
  if (typeof Node !== "undefined" && value instanceof Node) {
    const tag = value instanceof Element ? value.tagName.toLowerCase() : value.nodeName;
    return `[Node <${tag.toLowerCase()}>]`;
  }

  const tagged = value as { $$typeof?: symbol; type?: unknown };
  if (typeof tagged.$$typeof === "symbol") {
    // A React element, i.e. `children`. Name it; do not walk into it.
    return `[ReactElement ${componentName(tagged.type) ?? String(tagged.type ?? "?")}]`;
  }

  if (value instanceof Date) return value.toISOString();
  if (value instanceof Map) return `[Map size=${value.size}]`;
  if (value instanceof Set) return `[Set size=${value.size}]`;
  if (value instanceof Error) return `[${value.name}: ${takeString(value.message, budget)}]`;

  if (depth >= MAX_DEPTH) {
    budget.truncated = true;
    return Array.isArray(value) ? "[Array]" : "[Object]";
  }

  const nested = new Set(seen).add(value);

  if (Array.isArray(value)) {
    const kept = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => summarise(item, budget, depth + 1, nested));
    if (value.length > MAX_ARRAY_ITEMS) {
      budget.truncated = true;
      kept.push(`[+${value.length - MAX_ARRAY_ITEMS} more]`);
    }
    return kept;
  }

  const result: Record<string, unknown> = {};
  const keys = Object.keys(value as object);

  for (const key of keys.slice(0, MAX_KEYS)) {
    let member: unknown;
    try {
      member = (value as Record<string, unknown>)[key];
    } catch {
      // A getter that throws is the host app's business, not ours to surface.
      member = "[unreadable]";
    }
    result[key] = summarise(member, budget, depth + 1, nested);
  }

  if (keys.length > MAX_KEYS) {
    budget.truncated = true;
    result["…"] = `[+${keys.length - MAX_KEYS} more keys]`;
  }

  return result;
}

/** Read `_debugSource` from a fiber, if this React build records it. */
function readSource(fiber: Fiber): SourceRef | null {
  const source = fiber._debugSource;
  if (!source?.fileName || typeof source.lineNumber !== "number") return null;
  return { file: source.fileName, line: source.lineNumber };
}

/**
 * Class-component state, or nothing.
 *
 * `memoizedState` means something entirely different on a function component —
 * it is the head of the hooks linked list, which is an implementation detail
 * with no useful shape — so it is read from the class instance instead.
 */
function readState(fiber: Fiber, budget: Budget): unknown {
  const instance = fiber.stateNode as { state?: unknown; props?: unknown } | null | undefined;
  if (!instance || typeof instance !== "object") return undefined;
  if (typeof Node !== "undefined" && instance instanceof Node) return undefined;
  if (!("state" in instance) || instance.state === null || instance.state === undefined) {
    return undefined;
  }
  return summarise(instance.state, budget);
}

/**
 * Walk up from a DOM element collecting what React knows about it.
 *
 * @param element - The element the human clicked.
 * @returns The capture, or null when the element is not part of a React tree.
 */
export function captureFiber(element: Element): CapturedData | null {
  try {
    let fiber = findFiber(element);
    if (!fiber) return null;

    const budget: Budget = { used: 0, truncated: false };
    const componentStack: string[] = [];
    const components: ComponentCapture[] = [];
    let source: SourceRef | null = null;

    for (let depth = 0; fiber && depth < MAX_STACK_DEPTH; depth += 1) {
      // The nearest recorded position is the one the human clicked on; keep the
      // first found rather than the outermost.
      source ??= readSource(fiber);

      const name = componentName(fiber.type ?? fiber.elementType);
      if (name) {
        componentStack.push(name);

        if (components.length < MAX_COMPONENTS) {
          const props =
            fiber.memoizedProps === undefined ? undefined : summarise(fiber.memoizedProps, budget);
          const state = readState(fiber, budget);
          components.push({
            name,
            ...(props === undefined ? {} : { props }),
            ...(state === undefined ? {} : { state }),
          });
        }
      }

      fiber = fiber.return ?? null;
    }

    return {
      ...(source ? { source } : {}),
      componentStack,
      components,
      truncated: budget.truncated,
    };
  } catch {
    // Private internals changing shape must cost the human their extra context,
    // never their comment.
    return null;
  }
}
