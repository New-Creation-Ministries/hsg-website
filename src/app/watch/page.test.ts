import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "page.tsx"), "utf8")
const liveSource = readFileSync(
  join(import.meta.dirname, "../../lib/youtube-live.ts"),
  "utf8",
)
const testimoniesSource = readFileSync(
  join(import.meta.dirname, "../../components/watch-testimonies.tsx"),
  "utf8",
)
const sermonRowSource = readFileSync(
  join(import.meta.dirname, "../../components/watch-sermon-row.tsx"),
  "utf8",
)
const globalsSource = readFileSync(
  join(import.meta.dirname, "../globals.css"),
  "utf8",
)

test("hides the live panel unless a broadcast is live", () => {
  expect(source).toMatch(/if \(!broadcast\) return null/)
  expect(source).toMatch(/id=["']watch-live-heading["']/)
  expect(source).toMatch(/>\s*Live\s*</)
  expect(source).not.toMatch(/YOUTUBE_LIVE_OFFLINE_COPY/)
})

test("document title is Watch; page has no shell sentence", () => {
  expect(source).toMatch(/title:\s*["']Watch["']/)
  expect(source).not.toMatch(/This page will be published here/)
  expect(source).not.toMatch(/<h1[^>]*>\s*Watch\s*<\/h1>/)
})

test("anchors #main-content and is force-dynamic for Atom reads", () => {
  expect(source).toMatch(/id=["']main-content["']/)
  expect(source).toMatch(/export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/)
  expect(source).not.toMatch(/\brevalidate\b/)
  expect(liveSource).toMatch(
    /https:\/\/www\.youtube\.com\/@EvangelistRambabuRambo\/live/,
  )
  expect(liveSource).toMatch(/isLiveNow/)
  expect(source).toMatch(/firstPlaylistVideos\(series,\s*15\)/)
  expect(source).toMatch(/readYoutubeLiveBroadcast/)
  expect(source).toMatch(/readYoutubePlaylist/)
  expect(source).toMatch(/YoutubePlaylistReadError/)
  expect(source).toMatch(/Promise\.all/)
  expect(source).not.toMatch(/readYoutubeLiveStatus/)
  expect(source).not.toMatch(/playlist-continuation/)
})

test("no iframe or YouTube embed/player script on Watch page or components", () => {
  for (const body of [source, testimoniesSource, sermonRowSource]) {
    expect(body).not.toMatch(/<iframe\b/)
    expect(body).not.toMatch(/youtube\.com\/embed/i)
    expect(body).not.toMatch(/www\.youtube\.com\/iframe_api/i)
    expect(body).not.toMatch(/YT\.Player/)
    expect(body).not.toMatch(/instagram\.com\/embed/i)
  }
})

test("testimony surface shows thumbnail with play affordance; no on-page player", () => {
  expect(testimoniesSource).toMatch(/thumbnailUrl/)
  expect(testimoniesSource).toMatch(/<img\b/)
  expect(testimoniesSource).toMatch(/watch-play/)
  expect(testimoniesSource).not.toMatch(/fetch\s*\(/)
  expect(testimoniesSource).not.toMatch(/instagram\.com\/embed/i)
  expect(globalsSource).toMatch(
    /\.watch-page\s+\.watch-testimony-surface[\s\S]*?background:\s*var\(--cobalt\)/,
  )
})

test("external http(s) links use G7 new-tab attrs", () => {
  const assertExternalAnchorsCarryG7 = (body: string) => {
    const anchors = [...body.matchAll(/<a\b[\s\S]*?>/g)].map((match) => match[0])
    const externalAnchors = anchors.filter(
      (anchor) =>
        /href=["']https?:\/\//.test(anchor) ||
        /href=\{[^}]*(?:\burl\b|playlistUrl|YOUTUBE_LIVE_URL)[^}]*\}/.test(anchor),
    )
    expect(externalAnchors.length).toBeGreaterThan(0)
    for (const anchor of externalAnchors) {
      expect(anchor).toMatch(/target=["']_blank["']/)
      expect(anchor).toMatch(/rel=["']noopener noreferrer["']/)
    }
  }

  assertExternalAnchorsCarryG7(source)
  assertExternalAnchorsCarryG7(testimoniesSource)
  assertExternalAnchorsCarryG7(sermonRowSource)
})

test("composes client testimonies and sermon rows from watch content", () => {
  expect(source).toMatch(/from\s+["']@\/content\/watch["']/)
  expect(source).toMatch(/WatchTestimonies/)
  expect(source).toMatch(/WatchSermonRow/)
  expect(source).toMatch(/from\s+["']@\/components\/watch-testimonies["']/)
  expect(source).toMatch(/from\s+["']@\/components\/watch-sermon-row["']/)
  expect(testimoniesSource).not.toMatch(/["']use client["']/)
  expect(testimoniesSource).toMatch(/watch-testimony-row/)
  expect(testimoniesSource).not.toMatch(/watch-testimony-switch/)
  expect(sermonRowSource).not.toMatch(/["']use client["']/)
  expect(sermonRowSource).toMatch(/href=\{playlistUrl\}/)
  expect(sermonRowSource).not.toMatch(/playlist-continuation/)
})

test("Watch CSS is scoped under .watch-page", () => {
  expect(source).toMatch(/watch-page/)
  expect(globalsSource).toMatch(/\.watch-page\b/)
  expect(globalsSource).toMatch(
    /\.watch-page[\s\S]*watch-testimonies|\.watch-page\s+\.watch-testimonies/,
  )
  expect(globalsSource).toMatch(
    /\.watch-page[\s\S]*watch-sermon-row|\.watch-page\s+\.watch-sermon-row/,
  )
  expect(globalsSource).not.toMatch(/^\.watch-testimonies\s*\{/m)
  expect(globalsSource).not.toMatch(/^\.watch-sermon-row\s*\{/m)
  expect(globalsSource).not.toMatch(/^\.watch-live\s*\{/m)
})
