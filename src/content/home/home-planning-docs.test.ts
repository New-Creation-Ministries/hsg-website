import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const docsDir = join(import.meta.dirname, "../../../docs/features/home-landing-page")

const intent = readFileSync(join(docsDir, "intent.md"), "utf8")
const spec = readFileSync(join(docsDir, "spec.md"), "utf8")
const ux = readFileSync(join(docsDir, "ux.md"), "utf8")
const plan = readFileSync(join(docsDir, "plan.md"), "utf8")

const navLabels = ["Home", "About", "Events", "Watch", "Contact Us", "Give"] as const

test("Home intent Reach list matches Nav", () => {
  expect(intent).toMatch(
    /Reach Home, About, Events, Watch, Contact Us, and Give\./,
  )
  expect(intent).not.toMatch(/Praise Reports/)
  expect(intent).not.toMatch(/\/praise-reports/)
})

test("Home spec route table, header diagram, and link counts match Nav", () => {
  const routesSection = spec.slice(spec.indexOf("## Routes"))
  for (const label of navLabels) {
    expect(routesSection).toContain(`| ${label} |`)
  }
  expect(routesSection).not.toMatch(/Praise Reports/)
  expect(routesSection).not.toMatch(/\/praise-reports/)

  expect(spec).toMatch(
    /\[logo\].*Home\s+About\s+Events\s+Watch\s+Contact Us\s+Give/,
  )
  expect(spec).not.toMatch(/\[logo\].*Praise Reports/)

  expect(spec).toMatch(/Logo only, then the six links\./)
  expect(spec).toMatch(/Above 800px the six links are visible/)
  expect(spec).toMatch(/Menu shows the same six links\./)
  expect(spec).not.toMatch(/\bseven links\b/)
})

test("Home spec sections export marks more optional and section links match Highlighted testimonies", () => {
  expect(spec).toMatch(/more\?:\s*\{\s*label,\s*href\s*\}/)
  expect(spec).toMatch(/Highlighted testimonies has no section link/)
  expect(spec).not.toMatch(/Highlighted testimonies → Praise Reports/)
})

test("Home UX Menu row counts Nav routes; testimonies next action and pattern row match Docs", () => {
  expect(ux).toMatch(/Same six destinations/)
  expect(ux).toMatch(
    /\| 3 \| Highlighted testimonies \|[^|]+\| — \|/,
  )
  expect(ux).toMatch(
    /Readers cannot connect Sermons to Watch; Udeet resolves terminology/,
  )
  expect(ux).not.toMatch(/testimonies to Praise Reports/)
  expect(ux).not.toMatch(/Praise Reports/)
  expect(ux).not.toMatch(/\/praise-reports/)
})

test("Home plan drops praise-reports page, Not doing name, Band-link clause; shell count matches Nav", () => {
  expect(plan).not.toMatch(/praise-reports\/page\.tsx/)
  expect(plan).not.toMatch(/Praise Reports/)
  expect(plan).not.toMatch(/\/praise-reports/)
  expect(plan).not.toMatch(/Praise Reports is Band link/)
  expect(plan).toMatch(/the five shells/)
  expect(plan).toMatch(/the six links are not in the inline row/)
  expect(plan).not.toMatch(/\bseven links\b/)
})
