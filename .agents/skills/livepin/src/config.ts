/**
 * `livepin.config.json`, read from the project root.
 *
 * Its only job today is redaction. It is a file rather than flags because the
 * rules are a property of the codebase — which endpoints return medical records,
 * which fields hold names — and belong in it, reviewed and shared, not retyped
 * on a command line by whoever happens to start the proxy.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

/** Name of the config file inside the project root. */
export const CONFIG_FILE = "livepin.config.json";

/** Redaction rules, as written in the file. */
export interface LivepinConfig {
  /**
   * Glob patterns for URLs whose bodies are never captured.
   *
   * Matching is on the whole URL, with a star meaning "any run of characters"
   * and a double star treated the same — path segments are not special, because
   * a pattern naming an endpoint should match it however deep it sits.
   */
  redactUrls: string[];
  /**
   * Field names replaced with `[redacted]` at any depth, case-insensitively.
   */
  redactFields: string[];
}

/** Rules applied when the project has no config file. */
export const DEFAULT_CONFIG: LivepinConfig = { redactUrls: [], redactFields: [] };

/** Turn a glob into an anchored regular expression. */
export function globToRegExp(pattern: string): RegExp {
  // Escape everything with meaning in a regex, then reinstate `*` as the one
  // wildcard. `**` collapses into the same thing rather than meaning something
  // subtly different that nobody would guess.
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*+/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

/** Compiled form, so a rule is parsed once rather than per request. */
export interface CompiledConfig {
  /** True when this URL's bodies must not be captured. */
  isRedactedUrl: (url: string) => boolean;
  /** Field names to blank, lowercased. */
  redactFields: Set<string>;
  /** The rules as loaded, for reporting. */
  raw: LivepinConfig;
}

/**
 * Compile redaction rules.
 *
 * @param config - Rules as loaded from disk.
 * @returns Matchers ready to use per request.
 */
export function compileConfig(config: LivepinConfig): CompiledConfig {
  const patterns = config.redactUrls.map(globToRegExp);
  return {
    isRedactedUrl: (url: string) => patterns.some((pattern) => pattern.test(url)),
    redactFields: new Set(config.redactFields.map((field) => field.toLowerCase())),
    raw: config,
  };
}

/**
 * Load `livepin.config.json` from a project root.
 *
 * A missing file is the normal case and yields the defaults. A malformed one
 * throws: silently ignoring a redaction rule that someone wrote down is the
 * worst possible failure mode for this particular file.
 *
 * @param root - Project root directory.
 * @returns The parsed rules, with defaults filled in.
 * @throws If the file exists but cannot be read as the expected shape.
 */
export async function loadConfig(root: string): Promise<LivepinConfig> {
  const file = path.join(root, CONFIG_FILE);

  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch {
    return DEFAULT_CONFIG;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`${file} is not valid JSON`);
  }

  if (!parsed || typeof parsed !== "object") throw new Error(`${file} must contain an object`);

  const { redactUrls, redactFields } = parsed as Record<string, unknown>;
  return {
    redactUrls: asStringArray(redactUrls, file, "redactUrls"),
    redactFields: asStringArray(redactFields, file, "redactFields"),
  };
}

/** Validate an optional array-of-strings field. */
function asStringArray(value: unknown, file: string, field: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${file}: ${field} must be an array of strings`);
  }
  return value as string[];
}
