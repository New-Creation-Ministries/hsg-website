import { readFileSync } from "node:fs"
import { join } from "node:path"

import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, expect, test, vi } from "vitest"

import {
  featuredTestimoniesScripture,
  playlistThemes,
  testimonies,
} from "@/content/watch"
import { YoutubeLiveReadError } from "@/lib/errors"
import {
  YOUTUBE_LIVE_URL,
  type YoutubeLiveBroadcast,
} from "@/lib/youtube-live"
import {
  YoutubePlaylistReadError,
  type YoutubePlaylist,
} from "@/lib/youtube-playlist"

vi.mock("@/lib/youtube-playlist", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/youtube-playlist")>()
  return {
    ...actual,
    readYoutubePlaylist: vi.fn(),
  }
})

vi.mock("@/lib/youtube-live", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/youtube-live")>()
  return {
    ...actual,
    readYoutubeLiveBroadcast: vi.fn(),
  }
})

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

const { default: WatchPage, revalidate } = await import("./page")
const { readYoutubePlaylist } = await import("@/lib/youtube-playlist")
const { readYoutubeLiveBroadcast } = await import("@/lib/youtube-live")

const playlistMock = vi.mocked(readYoutubePlaylist)
const liveMock = vi.mocked(readYoutubeLiveBroadcast)

const FAILED_PLAYLIST_ID = playlistThemes[0]!.playlistId
const LIVE_BROADCAST: YoutubeLiveBroadcast = {
  title: "Sunday Service Live",
  thumbnailUrl: "https://i.ytimg.com/vi/livevid/mqdefault.jpg",
}

function playlistFor(playlistId: string, title: string): YoutubePlaylist {
  return {
    title,
    url: `https://www.youtube.com/playlist?list=${playlistId}`,
    videos: [
      {
        id: `${playlistId}-v1`,
        title: `${title} video 1`,
        url: `https://www.youtube.com/watch?v=${playlistId}-v1`,
        thumbnailUrl: `https://i.ytimg.com/vi/${playlistId}-v1/mqdefault.jpg`,
      },
      {
        id: `${playlistId}-v2`,
        title: `${title} video 2`,
        url: `https://www.youtube.com/watch?v=${playlistId}-v2`,
        thumbnailUrl: `https://i.ytimg.com/vi/${playlistId}-v2/mqdefault.jpg`,
      },
    ],
  }
}

function mockAllPlaylistsSuccess() {
  playlistMock.mockImplementation(async (playlistId: string) => {
    const theme = playlistThemes.find((row) => row.playlistId === playlistId)
    return playlistFor(playlistId, theme?.name ?? playlistId)
  })
}

async function renderWatch(): Promise<string> {
  const tree = await WatchPage()
  return renderToStaticMarkup(tree)
}

beforeEach(() => {
  playlistMock.mockReset()
  liveMock.mockReset()
  mockAllPlaylistsSuccess()
  liveMock.mockResolvedValue(null)
})

afterEach(() => {
  vi.restoreAllMocks()
})

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

test("anchors #main-content and revalidates every 300s for Atom reads", () => {
  expect(source).toMatch(/id=["']main-content["']/)
  expect(source).toMatch(/export\s+const\s+revalidate\s*=\s*300/)
  expect(source).not.toMatch(
    /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/,
  )
  expect(revalidate).toBe(300)
  expect(liveSource).toMatch(
    /https:\/\/www\.youtube\.com\/@EvangelistRambabuRambo\/live/,
  )
  expect(liveSource).toMatch(/isLiveNow/)
  expect(source).toMatch(/firstPlaylistVideos\(series,\s*15\)/)
  expect(source).toMatch(/readYoutubeLiveBroadcast/)
  expect(source).toMatch(/readYoutubePlaylist/)
  expect(source).toMatch(/readExternal/)
  expect(source).toMatch(/route:\s*["']\/watch["']/)
  expect(source).toMatch(/Promise\.all/)
  expect(source).not.toMatch(/try\s*\{/)
  expect(source).not.toMatch(/console\.error/)
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

test("Featured Testimonies places Hebrews 2:4 after the heading and before items", () => {
  expect(testimoniesSource).toMatch(
    /Featured Testimonies[\s\S]*?className=["']watch-scripture["'][\s\S]*?watch-testimony-rows/,
  )
  expect(testimoniesSource).toMatch(/featuredTestimoniesScripture\.citation/)
  expect(testimoniesSource).toMatch(/featuredTestimoniesScripture\.text/)
  expect(testimoniesSource).toMatch(
    /testimonies\.map\(\(testimony(?:,\s*index)?\)\s*=>/,
  )
  expect(testimoniesSource).not.toMatch(
    /testimonies\.map[\s\S]*featuredTestimoniesScripture/,
  )
  expect(testimoniesSource).not.toMatch(
    /featuredTestimoniesScripture[\s\S]*testimonies\.map[\s\S]*featuredTestimoniesScripture/,
  )
})

test("renders Hebrews 2:4 as a non-linking block outside the testimonies list", async () => {
  const html = await renderWatch()

  const headingIdx = html.indexOf("Featured Testimonies")
  const citationIdx = html.indexOf(featuredTestimoniesScripture.citation)
  const verseIdx = html.indexOf(featuredTestimoniesScripture.text)
  const listIdx = html.indexOf('class="watch-testimony-rows"')
  const firstTestimonyIdx = html.indexOf(testimonies[0]!.name)

  expect(headingIdx).toBeGreaterThan(-1)
  expect(citationIdx).toBeGreaterThan(headingIdx)
  expect(verseIdx).toBeGreaterThan(citationIdx)
  expect(listIdx).toBeGreaterThan(verseIdx)
  expect(firstTestimonyIdx).toBeGreaterThan(listIdx)

  expect(html).toContain('class="watch-scripture"')
  expect(html).toContain(
    `class="watch-scripture-citation">${featuredTestimoniesScripture.citation}</h3>`,
  )
  expect(html).toContain(
    `class="watch-scripture-text">“${featuredTestimoniesScripture.text}”</p>`,
  )

  const scriptureBlock = html.match(
    /<div class="watch-scripture">[\s\S]*?<\/div>/,
  )?.[0]
  expect(scriptureBlock).toBeDefined()
  expect(scriptureBlock!).not.toMatch(/<a\b/)
  expect(scriptureBlock!).not.toMatch(/href=/)

  const listBlock = html.match(
    /<ol class="watch-testimony-rows">[\s\S]*?<\/ol>/,
  )?.[0]
  expect(listBlock).toBeDefined()
  expect(listBlock!).not.toContain(featuredTestimoniesScripture.citation)
  expect(listBlock!).not.toContain(featuredTestimoniesScripture.text)
  for (const testimony of testimonies) {
    expect(listBlock!).toContain(testimony.name)
  }
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

test("success renders live link and theme videos without logging", async () => {
  liveMock.mockResolvedValue(LIVE_BROADCAST)
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

  const html = await renderWatch()

  expect(html).toContain('class="watch-live"')
  expect(html).toContain(`href="${YOUTUBE_LIVE_URL}"`)
  expect(html).toContain(`LIVE · ${LIVE_BROADCAST.title}`)
  expect(html).toContain(LIVE_BROADCAST.thumbnailUrl)
  expect(html).not.toContain("No ongoing service")
  for (const theme of playlistThemes) {
    expect(html).toContain(`${theme.name} video 1`)
  }
  for (const testimony of testimonies) {
    expect(html).toContain(testimony.name)
  }
  expect(warn).not.toHaveBeenCalled()
})

test("live null omits the live section and does not warn", async () => {
  liveMock.mockResolvedValue(null)
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

  const html = await renderWatch()

  expect(html).not.toContain('class="watch-live"')
  expect(html).not.toContain("watch-live-heading")
  expect(html).not.toContain(`LIVE ·`)
  expect(html).not.toContain(YOUTUBE_LIVE_URL)
  expect(html).not.toContain("No ongoing service")
  expect(warn).not.toHaveBeenCalled()
})

test("live failure omits the live section and logs one warn with dependency", async () => {
  const error = new YoutubeLiveReadError({
    dependency: "youtube-live",
    resource: YOUTUBE_LIVE_URL,
    category: "http",
    message: "live page unavailable",
    status: 503,
  })
  liveMock.mockRejectedValue(error)
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

  const html = await renderWatch()

  expect(html).not.toContain('class="watch-live"')
  expect(html).not.toContain("watch-live-heading")
  expect(html).not.toContain(`LIVE ·`)
  expect(html).not.toContain("No ongoing service")
  expect(html).not.toContain("live page unavailable")
  expect(html).toContain(playlistThemes[1]!.name)
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn.mock.calls[0]?.[0]).toEqual({
    event: "external_read_failed",
    route: "/watch",
    dependency: error.dependency,
    resource: YOUTUBE_LIVE_URL,
    category: "http",
    status: 503,
    code: "external_read_failed",
    message: "live page unavailable",
  })
})

test("one failed theme row logs one warn and omits its videos while others render", async () => {
  liveMock.mockResolvedValue(LIVE_BROADCAST)
  playlistMock.mockImplementation(async (playlistId: string) => {
    if (playlistId === FAILED_PLAYLIST_ID) {
      throw new YoutubePlaylistReadError({
        resource: FAILED_PLAYLIST_ID,
        category: "invalid-feed",
        message: "broken theme feed",
      })
    }
    const theme = playlistThemes.find((row) => row.playlistId === playlistId)
    return playlistFor(playlistId, theme?.name ?? playlistId)
  })
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

  const html = await renderWatch()

  expect(html).toContain('class="watch-live"')
  expect(html).toContain(`LIVE · ${LIVE_BROADCAST.title}`)
  expect(html).toContain("Videos are temporarily unavailable here.")
  expect(html).not.toContain(`${playlistThemes[0]!.name} video 1`)
  expect(html).not.toContain("broken theme feed")
  for (const theme of playlistThemes.slice(1)) {
    expect(html).toContain(`${theme.name} video 1`)
  }
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn.mock.calls[0]?.[0]).toEqual({
    event: "external_read_failed",
    route: "/watch",
    dependency: "youtube-playlist",
    resource: FAILED_PLAYLIST_ID,
    category: "invalid-feed",
    code: "external_read_failed",
    message: "broken theme feed",
  })
})

test("non-ExternalReadError playlist rejection propagates without warn or error", async () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  const boom = new Error("unexpected playlist failure")
  playlistMock.mockRejectedValue(boom)

  await expect(WatchPage()).rejects.toBe(boom)
  expect(warnSpy).not.toHaveBeenCalled()
  expect(errorSpy).not.toHaveBeenCalled()
})
