import { describe, expect, it } from "vitest";

import { compileConfig } from "../src/config.js";
import {
  MAX_BODY_CHARS,
  redactBody,
  redactCapture,
  redactEntry,
  redactFields,
  REDACTED,
} from "../src/redact.js";
import type { CapturedData, NetworkEntry } from "../src/types.js";

/** Compile rules for one test. */
function rules(fields: string[] = [], urls: string[] = []) {
  return compileConfig({ redactFields: fields, redactUrls: urls });
}

/** A network entry with bodies. */
function entry(overrides: Partial<NetworkEntry> = {}): NetworkEntry {
  return {
    method: "GET",
    url: "https://api.example.com/patients/1182/visits",
    status: 200,
    ms: 214,
    startedAt: "2026-08-07T09:14:22.113Z",
    via: "page",
    contentType: "application/json",
    responseBody: JSON.stringify({ id: 1182, name: "Ada Okafor", ssn: "123-45-6789" }),
    ...overrides,
  };
}

/** The same entry with no bodies, for the cases that are about their absence. */
function bodiless(overrides: Partial<NetworkEntry> = {}): NetworkEntry {
  const { requestBody: _request, responseBody: _response, ...rest } = entry();
  return { ...rest, ...overrides };
}

describe("redactFields", () => {
  it("replaces a matching field at the top level", () => {
    expect(redactFields({ ssn: "123", id: 7 }, new Set(["ssn"]))).toEqual({
      ssn: REDACTED,
      id: 7,
    });
  });

  it("replaces it at any depth", () => {
    expect(redactFields({ patient: { contact: { dob: "1970-01-01" } } }, new Set(["dob"]))).toEqual(
      { patient: { contact: { dob: REDACTED } } },
    );
  });

  it("replaces it inside arrays of records", () => {
    expect(redactFields([{ name: "a" }, { name: "b" }], new Set(["name"]))).toEqual([
      { name: REDACTED },
      { name: REDACTED },
    ]);
  });

  it("matches case-insensitively, since field naming is inconsistent everywhere", () => {
    expect(redactFields({ SSN: "x", Ssn: "y" }, new Set(["ssn"]))).toEqual({
      SSN: REDACTED,
      Ssn: REDACTED,
    });
  });

  it("leaves everything alone when there are no rules", () => {
    const value = { ssn: "123" };
    expect(redactFields(value, new Set())).toBe(value);
  });

  it("passes primitives through", () => {
    expect(redactFields("plain", new Set(["ssn"]))).toBe("plain");
    expect(redactFields(null, new Set(["ssn"]))).toBeNull();
  });
});

describe("redactBody", () => {
  it("returns a body unchanged when there is nothing to redact", () => {
    expect(redactBody("<html>anything</html>", rules())).toBe("<html>anything</html>");
  });

  it("redacts fields in a JSON body", () => {
    const result = redactBody('{"ssn":"123-45-6789","id":7}', rules(["ssn"]));
    expect(JSON.parse(result!)).toEqual({ ssn: REDACTED, id: 7 });
  });

  it("drops a body it cannot parse when there are rules to apply", () => {
    // A body we cannot read is a body we cannot clear, so it does not go out.
    expect(redactBody("<html>Ada Okafor</html>", rules(["name"]))).toBeUndefined();
  });

  it("caps the length", () => {
    const result = redactBody("y".repeat(MAX_BODY_CHARS * 2), rules());
    expect(result).toHaveLength(MAX_BODY_CHARS + 1);
    expect(result?.endsWith("…")).toBe(true);
  });
});

describe("redactEntry", () => {
  it("keeps that a redacted-url request happened, without its contents", () => {
    const result = redactEntry(entry(), rules([], ["*/patients/*"]));

    expect(result.responseBody).toBeUndefined();
    expect(result.redacted).toBe(true);
    // The request itself is still evidence: method, url, status, timing.
    expect(result).toMatchObject({ method: "GET", status: 200, ms: 214 });
  });

  it("redacts fields in the bodies it keeps", () => {
    const result = redactEntry(entry(), rules(["ssn"]));
    expect(JSON.parse(result.responseBody!)).toEqual({
      id: 1182,
      name: "Ada Okafor",
      ssn: REDACTED,
    });
  });

  it("redacts a request body too", () => {
    const result = redactEntry(
      bodiless({ method: "POST", requestBody: '{"ssn":"123"}' }),
      rules(["ssn"]),
    );
    expect(JSON.parse(result.requestBody!)).toEqual({ ssn: REDACTED });
  });

  it("flags an entry whose unparseable body had to be dropped", () => {
    const result = redactEntry(
      entry({ responseBody: "<html>Ada</html>", contentType: "text/html" }),
      rules(["name"]),
    );
    expect(result.responseBody).toBeUndefined();
    expect(result.redacted).toBe(true);
  });

  it("leaves a bodiless entry unflagged", () => {
    const result = redactEntry(bodiless(), rules(["ssn"]));
    expect(result.redacted).toBeUndefined();
  });
});

describe("redactCapture", () => {
  const capture: CapturedData = {
    source: { file: "src/Row.tsx", line: 1 },
    componentStack: ["Row"],
    components: [
      { name: "Row", props: { patient: { name: "Ada", ssn: "123" } }, state: { ssn: "456" } },
    ],
    network: [entry()],
    truncated: false,
  };

  it("redacts props", () => {
    const result = redactCapture(capture, rules(["ssn"]));
    expect(result?.components[0]?.props).toEqual({ patient: { name: "Ada", ssn: REDACTED } });
  });

  it("redacts class state as well as props", () => {
    // State is the same application data by another route.
    expect(redactCapture(capture, rules(["ssn"]))?.components[0]?.state).toEqual({ ssn: REDACTED });
  });

  it("redacts network entries", () => {
    const result = redactCapture(capture, rules([], ["*/patients/*"]));
    expect(result?.network?.[0]?.redacted).toBe(true);
  });

  it("leaves the source and stack alone", () => {
    const result = redactCapture(capture, rules(["ssn"]));
    expect(result?.source).toEqual({ file: "src/Row.tsx", line: 1 });
    expect(result?.componentStack).toEqual(["Row"]);
  });

  it("passes an absent capture through", () => {
    expect(redactCapture(undefined, rules(["ssn"]))).toBeUndefined();
  });

  it("omits the network key when there was none", () => {
    const dataOnly: CapturedData = { componentStack: [], components: [], truncated: false };
    expect(redactCapture(dataOnly, rules(["ssn"]))).not.toHaveProperty("network");
  });
});
