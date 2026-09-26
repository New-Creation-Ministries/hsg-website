import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { renderToStaticMarkup } from "react-dom/server"
import { expect, test } from "vitest"

import type { EventHighlight } from "@/content/home"

import { HomeEventHighlights } from "./home-event-highlights"

const source = readFileSync(
  join(import.meta.dirname, "home-event-highlights.tsx"),
  "utf8",
)

const highlights: EventHighlight[] = [
  {
    title: "Together Youth Night Highlights",
    url: "https://www.instagram.com/reel/DclzTz2TnWk/",
    thumbnailUrl: "/home/together-youth-night.jpg",
  },
  {
    title: "Recent Service Recap",
    url: "https://www.instagram.com/reel/DdQZhQNTH6S/",
    thumbnailUrl: "https://cdn.example/recap.jpg",
  },
]

test("home-event-slots module is deleted; highlights live in this component", () => {
  expect(existsSync(join(import.meta.dirname, "../lib/home-event-slots.ts"))).toBe(
    false,
  )
  expect(
    existsSync(join(import.meta.dirname, "../lib/home-event-slots.test.ts")),
  ).toBe(false)
  expect(source).not.toMatch(/homeEventSlots|writeup|name-switch|switcher/i)
  expect(source).not.toMatch(/<iframe\b|<video\b/)
})

test("empty highlights render nothing", () => {
  expect(renderToStaticMarkup(<HomeEventHighlights highlights={[]} />)).toBe("")
})

test("rows open externally with title, play affordance, and poster — no writeup or player", () => {
  const html = renderToStaticMarkup(
    <HomeEventHighlights highlights={highlights} />,
  )

  expect(html).toContain('class="home-event-highlight-rows"')
  expect(html).toMatch(/<ol\b/)
  expect(html).toContain("Together Youth Night Highlights")
  expect(html).toContain("Recent Service Recap")
  expect(html).toContain('href="https://www.instagram.com/reel/DclzTz2TnWk/"')
  expect(html).toContain('href="https://www.instagram.com/reel/DdQZhQNTH6S/"')
  expect(html).toMatch(/target="_blank"/)
  expect(html).toMatch(/rel="noopener noreferrer"/)
  expect(html).toContain('aria-label="Open Together Youth Night Highlights"')
  expect(html).toContain('aria-label="Open Recent Service Recap"')
  expect(html).toContain('src="/home/together-youth-night.jpg"')
  expect(html).toContain('src="https://cdn.example/recap.jpg"')
  expect(html).toMatch(/class="home-event-play"[^>]*aria-hidden="true"/)
  expect(html).toMatch(
    /<h3 class="home-event-highlight-title">Together Youth Night Highlights<\/h3>/,
  )
  expect(html).not.toMatch(/writeup|witness|Rambo World Outreach/i)
  expect(html).not.toMatch(/<iframe\b|<video\b/)
})

test("local poster paths get portrait class; blank thumbnailUrl omits img", () => {
  const html = renderToStaticMarkup(
    <HomeEventHighlights highlights={highlights} />,
  )
  expect(html).toMatch(
    /src="\/home\/together-youth-night\.jpg"[^>]*class="is-portrait"|class="is-portrait"[^>]*src="\/home\/together-youth-night\.jpg"/,
  )
  expect(html).not.toMatch(
    /src="https:\/\/cdn\.example\/recap\.jpg"[^>]*class="is-portrait"|class="is-portrait"[^>]*src="https:\/\/cdn\.example\/recap\.jpg"/,
  )

  const blank = renderToStaticMarkup(
    <HomeEventHighlights
      highlights={[
        {
          title: "No poster",
          url: "https://www.instagram.com/reel/blank/",
          thumbnailUrl: "   ",
        },
      ]}
    />,
  )
  expect(blank).toContain("No poster")
  expect(blank).toContain('href="https://www.instagram.com/reel/blank/"')
  expect(blank).not.toMatch(/<img\b/)
})

test("highlight order matches the highlights prop", () => {
  const html = renderToStaticMarkup(
    <HomeEventHighlights highlights={highlights} />,
  )
  const first = html.indexOf("Together Youth Night Highlights")
  const second = html.indexOf("Recent Service Recap")
  expect(first).toBeGreaterThan(-1)
  expect(second).toBeGreaterThan(first)
})
