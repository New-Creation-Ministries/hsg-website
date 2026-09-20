import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  CONFIG_FILE,
  compileConfig,
  DEFAULT_CONFIG,
  globToRegExp,
  loadConfig,
} from "../src/config.js";

let dir: string;

/** Write a config file into the temp project. */
async function writeConfig(contents: string): Promise<void> {
  await writeFile(path.join(dir, CONFIG_FILE), contents);
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "livepin-config-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("globToRegExp", () => {
  it.each([
    ["*/patients/*", "https://api.example.com/patients/1182/visits", true],
    ["*/patients/*", "https://api.example.com/providers/4", false],
    ["https://api.example.com/*", "https://api.example.com/anything", true],
    ["**/records", "https://a/b/c/records", true],
    ["*/PATIENTS/*", "https://a/patients/1", true],
  ])("%s matches %s -> %s", (pattern, url, expected) => {
    expect(globToRegExp(pattern).test(url)).toBe(expected);
  });

  it("does not let regex characters in a pattern mean something", () => {
    // A dot is a dot, not "any character".
    expect(globToRegExp("https://api.example.com/x").test("https://apiXexample.com/x")).toBe(false);
  });

  it("anchors, so a pattern is not a substring search", () => {
    expect(globToRegExp("/patients").test("https://a/patients")).toBe(false);
  });
});

describe("loadConfig", () => {
  it("returns defaults when the project has no config", async () => {
    expect(await loadConfig(dir)).toEqual(DEFAULT_CONFIG);
  });

  it("reads both rule lists", async () => {
    await writeConfig(
      JSON.stringify({ redactUrls: ["*/patients/*"], redactFields: ["ssn", "dob"] }),
    );
    expect(await loadConfig(dir)).toEqual({
      redactUrls: ["*/patients/*"],
      redactFields: ["ssn", "dob"],
    });
  });

  it("fills in a missing list", async () => {
    await writeConfig(JSON.stringify({ redactFields: ["ssn"] }));
    expect(await loadConfig(dir)).toEqual({ redactUrls: [], redactFields: ["ssn"] });
  });

  it("refuses malformed JSON rather than quietly redacting nothing", async () => {
    // Ignoring a rule someone wrote down is the worst failure this file can have.
    await writeConfig("{ redactFields: }");
    await expect(loadConfig(dir)).rejects.toThrow(/not valid JSON/);
  });

  it("refuses a non-object", async () => {
    await writeConfig('"just a string"');
    await expect(loadConfig(dir)).rejects.toThrow(/must contain an object/);
  });

  it.each([
    ['{"redactFields": "ssn"}', /redactFields must be an array/],
    ['{"redactUrls": [1, 2]}', /redactUrls must be an array/],
  ])("refuses a badly typed rule list %s", async (contents, message) => {
    await writeConfig(contents);
    await expect(loadConfig(dir)).rejects.toThrow(message);
  });
});

describe("compileConfig", () => {
  it("matches redacted urls case-insensitively", () => {
    const config = compileConfig({ redactUrls: ["*/Patients/*"], redactFields: [] });
    expect(config.isRedactedUrl("https://a/patients/1182")).toBe(true);
    expect(config.isRedactedUrl("https://a/providers/1")).toBe(false);
  });

  it("lowercases field names so the rules are not case-sensitive", () => {
    expect(compileConfig({ redactUrls: [], redactFields: ["SSN"] }).redactFields.has("ssn")).toBe(
      true,
    );
  });

  it("matches nothing when there are no rules", () => {
    expect(compileConfig(DEFAULT_CONFIG).isRedactedUrl("https://a/anything")).toBe(false);
  });

  it("keeps the raw rules, for reporting what was in force", () => {
    const raw = { redactUrls: ["*/x"], redactFields: ["y"] };
    expect(compileConfig(raw).raw).toEqual(raw);
  });
});
