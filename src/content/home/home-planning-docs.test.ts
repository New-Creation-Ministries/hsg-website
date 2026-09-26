import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const repoRoot = join(import.meta.dirname, "../../..")
const docsDir = join(repoRoot, "docs/features/home-landing-page")

const intent = readFileSync(join(docsDir, "intent.md"), "utf8")
const spec = readFileSync(join(docsDir, "spec.md"), "utf8")
const ux = readFileSync(join(docsDir, "ux.md"), "utf8")
const plan = readFileSync(join(docsDir, "plan.md"), "utf8")

const homeEventsSpec = readFileSync(
  join(
    repoRoot,
    "docs/improvements/home-events-and-scripture-tiles/spec.md",
  ),
  "utf8",
)
const aboutSpec = readFileSync(
  join(repoRoot, "docs/features/about-page/spec.md"),
  "utf8",
)

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

test("Home spec locks shipped What’s going on and drops live Highlighted testimonies", () => {
  expect(spec).toMatch(/more\?:\s*\{\s*label,\s*href\s*\}/)
  expect(spec).toMatch(
    /`h2` in this order:\s*What’s going on,\s*New to HSG\?,\s*Sermons/,
  )
  expect(spec).toMatch(/No Highlighted testimonies section/)
  expect(spec).toMatch(
    /Acts 2:46 \(AMP\) scripture tile first[\s\S]*two event highlights/,
  )
  expect(spec).toMatch(
    /`eventHighlights`\s*\|\s*`\{\s*title,\s*url,\s*thumbnailUrl\s*\}\[\]`/,
  )
  expect(spec).toMatch(
    /Band\s*\|\s*`#dedfc9`\s*\|\s*New to HSG\? visit-section background/,
  )
  expect(spec).not.toMatch(/Highlighted testimonies has no section link/)
  expect(spec).not.toMatch(/Highlighted testimonies → Praise Reports/)
  expect(spec).not.toMatch(
    /\|\s*3\s*\|\s*Highlighted testimonies\s*\|/,
  )
  expect(spec).not.toMatch(/Stories adapted from Rambo World Outreach/)
  expect(spec).not.toMatch(/`homeEventSlots`/)
})

test("Home UX Menu row counts Nav routes; section order has no live Highlighted testimonies", () => {
  expect(ux).toMatch(/Same six destinations/)
  expect(ux).toMatch(
    /\|\s*2\s*\|\s*What’s going on\s*\|[^|]*two event highlights/,
  )
  expect(ux).toMatch(
    /\|\s*3\s*\|\s*New to HSG\?\s*\|[^|]+\|\s*Contact Us\s*\|/,
  )
  expect(ux).not.toMatch(
    /\|\s*3\s*\|\s*Highlighted testimonies\s*\|[^|]+\|\s*—\s*\|/,
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

test("home-events-and-scripture-tiles spec is superseded by event-highlights relocation", () => {
  expect(homeEventsSpec).toMatch(/^Status:\s*superseded\b/m)
  expect(homeEventsSpec).toMatch(
    /event-highlights-and-scripture-relocation/,
  )
  expect(homeEventsSpec).toMatch(
    /Scripture tile \+ two event highlights;.*no `homeEventSlots` rows/,
  )
  expect(homeEventsSpec).toMatch(
    /Highlighted testimonies\s*\|\s*Removed from Home/,
  )
  expect(homeEventsSpec).toMatch(
    /Watch Hebrews 2:4\s*\|\s*Horizontal block before Featured Testimonies items/,
  )
})

test("About spec nations source line drops family-in-Bangalore claim", () => {
  expect(aboutSpec).toMatch(
    /\|\s*`nations`\s*\|\s*Gospel to the Nations\s*\|\s*Open-air campaigns, 89 nations\s*\|/,
  )
  expect(aboutSpec).not.toMatch(/family in Bangalore/)
})
