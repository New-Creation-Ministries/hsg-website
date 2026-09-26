import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "page.tsx"), "utf8")
const repoRoot = join(import.meta.dirname, "../..")

test("h1 accessible name is Holy Spirit Generation on two lines, not leader.name", () => {
  expect(source).toMatch(/from\s+["']@\/content\/home["']/)
  expect(source).toMatch(/\bchurch\b/)
  expect(source).toMatch(/<h1[\s\S]*?>[\s\S]*?Holy Spirit[\s\S]*?Generation[\s\S]*?<\/h1>/)
  expect(source).not.toMatch(/<h1[^>]*>\s*\{leader\.name\}/)
  expect(source).not.toMatch(/leader\.name/)
})

test("hero order is heading, blurb, About link, then portrait field", () => {
  const heading = source.indexOf("<h1")
  const blurb = source.indexOf("leader.blurb")
  const about = source.search(/href=["']\/about["']/)
  const portrait = source.search(/<PortraitField\b/)
  expect(heading).toBeGreaterThan(-1)
  expect(blurb).toBeGreaterThan(heading)
  expect(about).toBeGreaterThan(blurb)
  expect(portrait).toBeGreaterThan(about)
  expect(source).toMatch(/href=["']\/about["'][\s\S]*?>[\s\S]*?About/)
})

test("section heads put h2 with the section link before items; New to HSG is intro beside records", () => {
  expect(source).toMatch(/section-head|className=["'][^"']*section-head/)
  expect(source).toMatch(/visit-grid|visit-intro|className=["'][^"']*visit/)
  expect(source).not.toMatch(/pageNotes\.testimonies/)
  expect(source).toMatch(/pageNotes\.sunday/)
})

test("section links use destination label, aria-hidden arrow, and 44px min height", () => {
  expect(source).toMatch(/aria-hidden=["']true["']/)
  expect(source).toMatch(/<svg[\s\S]*?aria-hidden=["']true["']/)
  expect(source).toMatch(/min-height:\s*44px|min-h-\[44px\]|minHeight:\s*44|min-height:\s*2\.75/)
  expect(source).toMatch(/section\.more\.label/)
})

test("SectionLink renders only when more is set at visit intro and section head", () => {
  const visitIntro = source.match(
    /className=["']visit-intro["'][\s\S]*?<\/div>/,
  )?.[0]
  const sectionHead = source.match(
    /className=["']section-head["'][\s\S]*?<\/div>/,
  )?.[0]
  expect(visitIntro).toBeDefined()
  expect(sectionHead).toBeDefined()
  expect(visitIntro).toMatch(/section\.more\s*&&|section\.more\s*\?/)
  expect(sectionHead).toMatch(/section\.more\s*&&|section\.more\s*\?/)
  expect(visitIntro).toMatch(/section\.more\.label/)
  expect(sectionHead).toMatch(/section\.more\.label/)
  expect(visitIntro).toMatch(/<SectionLink\b/)
  expect(sectionHead).toMatch(/<SectionLink\b/)
})

test("external item links open in a new tab; items without href are plain text", () => {
  expect(source).toMatch(/item\.href/)
  expect(source).toMatch(/target=["']_blank["']/)
  expect(source).toMatch(/rel=["']noopener noreferrer["']/)
})

test("sermons put intro and first item in cobalt panel; no iframe or banned tagline", () => {
  expect(source).toMatch(/channel|sermon-panel|cobalt/i)
  expect(source).toMatch(/section\.intro/)
  expect(source).not.toMatch(/<iframe\b/)
  expect(source).not.toMatch(/The Word,\s*wherever you are/i)
  expect(source).not.toMatch(/Messages & teaching/)
  expect(source).not.toMatch(/Church news & gatherings/)
})

test("Home revalidates hourly, reads playlist through readExternal, first five videos", () => {
  expect(source).toMatch(/export\s+const\s+revalidate\s*=\s*3600/)
  expect(source).not.toMatch(/export\s+const\s+dynamic\s*=/)
  expect(source).not.toMatch(/force-dynamic/)
  expect(source).toMatch(/ContentInvariantError/)
  expect(source).toMatch(/throw new ContentInvariantError\s*\(/)
  expect(source).toMatch(/rule:\s*["']home-heading-church-name["']/)
  expect(source).not.toMatch(/homeEventSlots/)
  expect(source).not.toMatch(/@\/content\/events/)
  expect(source).not.toMatch(/@\/lib\/home-event-slots/)
  expect(source).toMatch(/async\s+function\s+Home/)
  expect(source).toMatch(/readExternal\s*\(/)
  expect(source).toMatch(/route:\s*["']\/["']/)
  expect(source).toMatch(/dependency:\s*["']youtube-playlist["']/)
  expect(source).toMatch(/resource:\s*sermonPlaylistId/)
  expect(source).toMatch(/readYoutubePlaylist\s*\(\s*sermonPlaylistId\s*\)/)
  expect(source).toMatch(/firstPlaylistVideos\s*\(/)
  expect(source).toMatch(/firstPlaylistVideos\s*\([^)]*,\s*5\s*\)/)
  expect(source).not.toMatch(/console\.error/)
  expect(source).not.toMatch(/\btry\s*\{/)
  expect(source).not.toMatch(/cache:\s*["']no-store["']/)
  expect(source).not.toMatch(/Playlist to be published/)
})

test("What’s going on renders scripture text then event highlights; no homeEventSlots", () => {
  expect(existsSync(join(repoRoot, "src/lib/home-event-slots.ts"))).toBe(false)
  expect(existsSync(join(repoRoot, "src/lib/home-event-slots.test.ts"))).toBe(
    false,
  )
  expect(source).toMatch(
    /from\s+["']@\/components\/home-event-highlights["']/,
  )
  expect(source).toMatch(/className=["']highlights content-list["']/)
  expect(source).toMatch(/scripture-tile/)
  expect(source).toMatch(/“\{item\.text\}”/)
  expect(source).toMatch(/HomeEventHighlights/)
  expect(source).toMatch(/eventHighlights/)
  expect(source).not.toMatch(/homeEventSlots/)
  expect(source).not.toMatch(/slot\.name/)
  expect(source).not.toMatch(/slot\.whenLine/)
  expect(source).not.toMatch(/TestimonyItems/)
  expect(source).not.toMatch(/pageNotes\.testimonies/)
  expect(source).toMatch(/section\.heading\s*===\s*["']What’s going on["']/)
  expect(source).toMatch(/section\.heading\s*===\s*["']New to HSG\?["']/)
  expect(source).toMatch(/section\.heading\s*===\s*["']Sermons["']/)
})

test("section classes branch by heading so visit is banded and Sermons is not", () => {
  expect(source).toMatch(
    /if\s*\(\s*heading\s*===\s*["']What’s going on["']\s*\)\s*return\s+["']home-section is-bulletin["']/,
  )
  expect(source).toMatch(
    /if\s*\(\s*heading\s*===\s*["']New to HSG\?["']\s*\)\s*return\s+["']home-section is-services visit["']/,
  )
  expect(source).toMatch(
    /if\s*\(\s*heading\s*===\s*["']Sermons["']\s*\)\s*return\s+["']home-section is-sermons["']/,
  )
  expect(source).toMatch(/sectionClassName\s*\(\s*section\.heading\s*\)/)
  expect(source).not.toMatch(
    /sections\[\s*0\s*\]|sections\[\s*1\s*\]|sections\[\s*2\s*\]/,
  )
  expect(source).not.toMatch(
    /heading\s*===\s*["']Sermons["']\s*\)\s*return\s+["'][^"']*\bvisit\b/,
  )
  expect(source).not.toMatch(
    /heading\s*===\s*["']New to HSG\?["']\s*\)\s*return\s+["'][^"']*is-sermons/,
  )
})

test("sermon video links: empty alt, no-referrer, new tab, no iframe", () => {
  expect(source).toMatch(/referrerPolicy=["']no-referrer["']/)
  expect(source).toMatch(/alt=["']["']/)
  expect(source).toMatch(/width=\{320\}/)
  expect(source).toMatch(/height=\{180\}/)
  expect(source).not.toMatch(/<iframe\b/)
  expect(source).toMatch(/target=["']_blank["']/)
  expect(source).toMatch(/rel=["']noopener noreferrer["']/)
  expect(source).toMatch(/className=["']playlists["']/)
  expect(source).not.toMatch(/className=["']playlists content-list["']/)
  expect(source).not.toMatch(/className=["'][^"']*playlists[^"']*content-list/)
})

test("testimony text is one paragraph; Sunday splits language and time; onwards stays", () => {
  expect(source).toMatch(/split\(["']\\n["']\)/)
  expect(source).not.toMatch(/Leader portrait placeholder/)
})

test("three regions named by visible h2; New to HSG uses articles; no carousel tabs disclosure motion", () => {
  expect(source).toMatch(/aria-labelledby=/)
  expect(source).toMatch(/<h2\b/)
  expect(source).toMatch(/<h3\b/)
  expect(source).toMatch(/<article\b/)
  expect(source).not.toMatch(/carousel|role=["']tablist["']|<details\b|framer-motion|animate-/i)
})
