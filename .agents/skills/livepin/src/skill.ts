/**
 * Installing the agent instructions.
 *
 * `SKILL.md` ships inside the package rather than being generated, so the text
 * an agent reads is reviewed like any other file. It is read from disk at the
 * moment it is installed, from the same package as the binary being run — which
 * is what keeps the instructions and the commands they describe in step.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Directory Claude Code looks in, relative to a project root. */
export const SKILL_DIR = path.join(".claude", "skills", "livepin");

/** Name of the instructions file, at both ends. */
export const SKILL_FILE = "SKILL.md";

/**
 * Locate the packaged `SKILL.md`.
 *
 * The file sits at the package root, so it is one level up from `dist/` when
 * installed and one level up from `src/` when running from a checkout. Both are
 * the same relative step, which is why this needs no build-time substitution.
 *
 * @returns Absolute path to the packaged file.
 */
export function packagedSkillPath(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..", SKILL_FILE);
}

/**
 * Read the packaged instructions.
 *
 * @returns The contents of `SKILL.md`.
 * @throws If the file is missing, which means a broken package rather than a
 *   user error, so it says so plainly.
 */
export async function readSkill(): Promise<string> {
  const file = packagedSkillPath();
  try {
    return await readFile(file, "utf8");
  } catch {
    throw new Error(`cannot read ${file} — this livepin install is incomplete`);
  }
}

/** Result of {@link installSkill}. */
export interface SkillInstallResult {
  /** Where it was written. */
  file: string;
  /** True when an existing file was replaced. */
  overwritten: boolean;
}

/**
 * Write the instructions where a coding agent will find them.
 *
 * Overwrites deliberately: the file is generated output, and an install that
 * silently left an old version in place would reintroduce exactly the drift this
 * command exists to prevent. The result says whether it replaced anything so the
 * caller can report it.
 *
 * @param root - Project root to install into.
 * @returns Where it went, and whether it replaced a previous copy.
 */
export async function installSkill(root: string): Promise<SkillInstallResult> {
  const directory = path.resolve(root, SKILL_DIR);
  const file = path.join(directory, SKILL_FILE);

  const existing = await readFile(file, "utf8").catch(() => null);

  await mkdir(directory, { recursive: true });
  await writeFile(file, await readSkill(), "utf8");

  return { file, overwritten: existing !== null };
}
