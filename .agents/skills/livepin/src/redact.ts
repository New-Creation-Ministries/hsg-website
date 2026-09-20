/**
 * Redaction, applied server-side before anything is stored or sent.
 *
 * Position matters more than the code here does. This runs between the overlay
 * handing a capture to the API and the API putting it in a session — so on the
 * path to the disk and to the agent, once, with nothing downstream of it. There
 * is deliberately no way to store a capture without passing through here.
 *
 * The overlay also declines to record bodies for redacted URLs, so those never
 * reach this point at all. That is belt and braces, not a substitute: the browser
 * is the side that can be stale, so the authoritative pass is this one.
 */

import type { CompiledConfig } from "./config.js";
import type { CapturedData, NetworkEntry } from "./types.js";

/** Replacement for a redacted field's value. */
export const REDACTED = "[redacted]";

/** Longest body kept after redaction. */
export const MAX_BODY_CHARS = 2000;

/**
 * Replace matching field names anywhere in a value.
 *
 * Works on the parsed shape rather than the text, so a field is caught wherever
 * it sits — top level, nested, inside an array of records.
 *
 * @param value - Parsed JSON.
 * @param fields - Lowercased field names to blank.
 * @returns A copy with matching fields replaced.
 */
export function redactFields(value: unknown, fields: Set<string>): unknown {
  if (fields.size === 0) return value;

  if (Array.isArray(value)) return value.map((item) => redactFields(item, fields));

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, member] of Object.entries(value as Record<string, unknown>)) {
      result[key] = fields.has(key.toLowerCase()) ? REDACTED : redactFields(member, fields);
    }
    return result;
  }

  return value;
}

/**
 * Redact a request or response body.
 *
 * JSON is redacted field by field. Anything else cannot be inspected safely, so
 * it is dropped rather than passed through on the hope that it holds nothing
 * sensitive — a body we cannot read is a body we cannot clear.
 *
 * @param body - Raw body text.
 * @param config - Compiled rules.
 * @returns The redacted body, or undefined when it must not be sent.
 */
export function redactBody(body: string, config: CompiledConfig): string | undefined {
  if (config.redactFields.size === 0) return clip(body);

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    // Not JSON: HTML, a blob, a form encoding. There are rules to apply and no
    // way to apply them, so nothing goes out.
    return undefined;
  }

  return clip(JSON.stringify(redactFields(parsed, config.redactFields)));
}

/** Shorten a body to the cap. */
function clip(body: string): string {
  return body.length > MAX_BODY_CHARS ? `${body.slice(0, MAX_BODY_CHARS)}…` : body;
}

/**
 * Apply redaction to one network entry.
 *
 * @param entry - Entry as observed.
 * @param config - Compiled rules.
 * @returns A copy safe to store and send.
 */
export function redactEntry(entry: NetworkEntry, config: CompiledConfig): NetworkEntry {
  const { requestBody, responseBody, ...rest } = entry;

  if (config.isRedactedUrl(entry.url)) {
    // The URL itself is on the list: keep that it happened, drop what was in it.
    return { ...rest, redacted: true };
  }

  const request = requestBody === undefined ? undefined : redactBody(requestBody, config);
  const responded = responseBody === undefined ? undefined : redactBody(responseBody, config);
  const dropped =
    (requestBody !== undefined && request === undefined) ||
    (responseBody !== undefined && responded === undefined);

  return {
    ...rest,
    ...(request === undefined ? {} : { requestBody: request }),
    ...(responded === undefined ? {} : { responseBody: responded }),
    ...(dropped ? { redacted: true } : {}),
  };
}

/**
 * Apply redaction to a whole capture.
 *
 * @param data - Capture from the overlay, possibly absent.
 * @param config - Compiled rules.
 * @returns A copy safe to store and send.
 */
export function redactCapture(
  data: CapturedData | undefined,
  config: CompiledConfig,
): CapturedData | undefined {
  if (!data) return data;

  const components = data.components.map((component) => ({
    ...component,
    ...(component.props === undefined
      ? {}
      : { props: redactFields(component.props, config.redactFields) }),
    ...(component.state === undefined
      ? {}
      : { state: redactFields(component.state, config.redactFields) }),
  }));

  return {
    ...data,
    components,
    ...(data.network ? { network: data.network.map((entry) => redactEntry(entry, config)) } : {}),
  };
}
