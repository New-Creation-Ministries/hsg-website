import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { installSkill, packagedSkillPath, readSkill, SKILL_DIR, SKILL_FILE } from "../src/skill.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "livepin-skill-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("packagedSkillPath", () => {
  it("points at a file that exists", async () => {
    // Running from src/ or from dist/ is the same step up to the package root.
    await expect(readFile(packagedSkillPath(), "utf8")).resolves.toContain("# livepin");
  });
});

describe("readSkill", () => {
  it("returns the packaged instructions", async () => {
    expect(await readSkill()).toContain("name: livepin");
  });
});

describe("installSkill", () => {
  it("writes where Claude Code looks", async () => {
    const { file } = await installSkill(dir);

    expect(file).toBe(path.join(dir, SKILL_DIR, SKILL_FILE));
    expect(await readFile(file, "utf8")).toBe(await readSkill());
  });

  it("creates the directory tree", async () => {
    await expect(installSkill(dir)).resolves.toBeTruthy();
  });

  it("reports a first install as new", async () => {
    expect((await installSkill(dir)).overwritten).toBe(false);
  });

  it("replaces an older copy and says so", async () => {
    const file = path.join(dir, SKILL_DIR, SKILL_FILE);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, "# an older version");

    // Leaving a stale copy would reintroduce the drift this command prevents.
    const result = await installSkill(dir);
    expect(result.overwritten).toBe(true);
    expect(await readFile(file, "utf8")).toBe(await readSkill());
  });

  it("resolves a relative root against the cwd", async () => {
    const { file } = await installSkill(".");
    expect(file).toBe(path.resolve(SKILL_DIR, SKILL_FILE));
    await rm(path.resolve(".claude"), { recursive: true, force: true });
  });
});

describe("the instructions themselves", () => {
  /**
   * Every `livepin <verb>` the instructions tell an agent to run.
   *
   * Anchored to a line start or a backtick so this reads commands rather than
   * prose — "a livepin proxy is already running" is a quoted error message, not
   * an instruction to run `livepin proxy`.
   */
  async function documentedVerbs(): Promise<Set<string>> {
    const text = await readSkill();
    return new Set([...text.matchAll(/(?:^\s*|`)livepin ([a-z]+)/gm)].map((match) => match[1]!));
  }

  it("names only commands the CLI actually has", async () => {
    // The guard against instructions drifting from the tool they describe.
    const implemented = new Set(["start", "poll", "say", "state", "end", "skill"]);
    for (const verb of await documentedVerbs()) {
      expect(implemented, `SKILL.md mentions \`livepin ${verb}\``).toContain(verb);
    }
  });

  it("carries the frontmatter an agent needs to find it", async () => {
    const text = await readSkill();
    expect(text.startsWith("---\n")).toBe(true);
    expect(text).toMatch(/\nname: livepin\n/);
    expect(text).toMatch(/\ndescription: /);
  });

  it("is emphatic that poll blocks", async () => {
    // An agent that backgrounds the poll breaks the loop and cannot see why.
    expect(await readSkill()).toMatch(/poll\S* \*\*blocks|\*\*`poll` blocks/i);
  });

  it("says to tell the human the url before blocking", async () => {
    expect(await readSkill()).toMatch(/before\*{0,2} you block/i);
  });

  it("warns against reviving an ended session", async () => {
    expect(await readSkill()).toMatch(/not restart an ended session/i);
  });
});
