import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const root = join(import.meta.dirname, "..")
const auditPath = join(
  root,
  "docs/improvements/error-handling-model-and-audit/audit.md",
)

const SCOPED_FILES = [
  "src/lib/youtube-live.ts",
  "src/lib/youtube-playlist.ts",
  "src/lib/calendar-feed.ts",
  "src/lib/home-event-slots.ts",
  "src/app/page.tsx",
  "src/app/watch/page.tsx",
  "src/app/events/page.tsx",
  "src/app/events/feeds/[id]/route.ts",
  "src/content/about/index.ts",
  "src/content/contact/index.ts",
  "src/content/events/index.ts",
  "src/content/give/index.ts",
  "src/content/home/index.ts",
  "src/content/watch/index.ts",
  "src/app/layout.tsx",
  "src/app/about/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/give/page.tsx",
  "src/lib/external-read.ts",
  "src/lib/site-host.ts",
] as const

const VALID_CLASSES = new Set([
  "conforming",
  "swallow-all",
  "stringly-typed",
  "misplaced boundary",
  "missing boundary",
])

const VALID_CONSTRUCTS = new Set([
  "throw",
  "catch",
  "fetch",
  "null-on-failure",
  "—",
])

const VALID_ACTIONS = new Set([
  "none",
  "retype",
  "move",
  "add boundary",
  "remove",
])

const BOUNDARY_SITES = [
  "src/app/not-found.tsx",
  "src/app/error.tsx",
  "src/app/global-error.tsx",
  "src/instrumentation.ts",
] as const

const PLAN_MODULES = [
  "src/lib/errors.ts",
  "src/lib/diagnostics.ts",
  "src/lib/external-read.ts",
  "src/lib/site-host.ts",
] as const

const TASK_ID = /\b\d+_\d+\b/
const ACTION_LINE = /^(none|retype|move|add boundary|remove)(?: · \d+_\d+)?$/

type AuditRow = {
  site: string
  construct: string
  currentClass: string
  modelRow: string
  action: string
}

function parseAuditRows(source: string): AuditRow[] {
  const rows: AuditRow[] = []
  for (const line of source.split("\n")) {
    if (!line.startsWith("| `")) continue
    const cells = line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim())
    if (cells.length < 5) continue
    const [site, construct, currentClass, modelRow, action] = cells
    rows.push({ site, construct, currentClass, modelRow, action })
  }
  return rows
}

function grepThrowCatchFetchCount(): number {
  const output = execFileSync(
    "grep",
    ["-cE", String.raw`throw |catch|fetch\(`, ...SCOPED_FILES],
    { cwd: root, encoding: "utf8" },
  )
  return output
    .trim()
    .split("\n")
    .reduce((sum, line) => {
      const count = Number(line.split(":").at(-1))
      return sum + (Number.isFinite(count) ? count : 0)
    }, 0)
}

function grepThrowCatchFetchSites(): Set<string> {
  const output = execFileSync(
    "grep",
    ["-nE", String.raw`throw |catch|fetch\(`, ...SCOPED_FILES],
    { cwd: root, encoding: "utf8" },
  )
  const sites = new Set<string>()
  for (const line of output.trim().split("\n")) {
    if (!line) continue
    const match = line.match(/^(.*?):(\d+):/)
    if (!match) continue
    sites.add(`\`${match[1]}:${match[2]}\``)
  }
  return sites
}

const audit = readFileSync(auditPath, "utf8")
const rows = parseAuditRows(audit)

test("audit.md table header matches the five spec columns", () => {
  expect(audit).toMatch(
    /\|\s*Site\s*\|\s*Construct\s*\|\s*Current class\s*\|\s*Model row\s*\|\s*Action\s*\|/,
  )
})

test("audit.md has one five-column row per inventoried site", () => {
  expect(rows.length).toBeGreaterThan(0)
  for (const row of rows) {
    expect(row.site, JSON.stringify(row)).toBeTruthy()
    expect(row.construct, row.site).toBeTruthy()
    expect(row.currentClass, row.site).toBeTruthy()
    expect(row.modelRow, row.site).toBeTruthy()
    expect(row.action, row.site).toBeTruthy()
    expect(VALID_CLASSES.has(row.currentClass), row.site).toBe(true)
    expect(VALID_CONSTRUCTS.has(row.construct), row.site).toBe(true)
    expect(ACTION_LINE.test(row.action), `${row.site} action=${row.action}`).toBe(
      true,
    )
    const verb = row.action.split(" · ")[0] ?? ""
    expect(VALID_ACTIONS.has(verb), row.site).toBe(true)
  }
})

test("throw/catch/fetch row count matches grep over audit scope", () => {
  const grepCount = grepThrowCatchFetchCount()
  const auditCount = rows.filter((row) =>
    ["throw", "catch", "fetch"].includes(row.construct),
  ).length
  expect(auditCount).toBe(grepCount)

  const grepSites = grepThrowCatchFetchSites()
  const auditSites = new Set(
    rows
      .filter((row) => ["throw", "catch", "fetch"].includes(row.construct))
      .map((row) => row.site),
  )
  expect(auditSites).toEqual(grepSites)
})

test("route boundaries and plan modules are inventoried as conforming", () => {
  for (const path of [...BOUNDARY_SITES, ...PLAN_MODULES]) {
    const matches = rows.filter((row) => row.site.includes(path))
    expect(matches.length, path).toBeGreaterThanOrEqual(1)
    for (const row of matches) {
      expect(row.currentClass, row.site).toBe("conforming")
      expect(row.action, row.site).toBe("none")
    }
  }
})

test("every non-conforming row names an owning task id", () => {
  const missing = rows.filter(
    (row) =>
      row.currentClass !== "conforming" && !TASK_ID.test(row.action),
  )
  expect(missing).toEqual([])
})

test("reconciled audit has no open Actions", () => {
  const open = rows.filter((row) => row.action !== "none")
  expect(open).toEqual([])
})

test("live page without isLiveNow remains the only youtube-live null-on-failure", () => {
  const liveNulls = rows.filter(
    (row) =>
      row.construct === "null-on-failure" &&
      row.site.includes("src/lib/youtube-live.ts"),
  )
  expect(liveNulls).toEqual([
    expect.objectContaining({
      site: "`src/lib/youtube-live.ts:155`",
      currentClass: "conforming",
      action: "none",
    }),
  ])
})
