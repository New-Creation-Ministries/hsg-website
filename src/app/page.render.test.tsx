import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, expect, test, vi } from "vitest"

import {
  eventHighlights,
  sermonPlaylistId,
  sermonPlaylistUnavailable,
  sermonPlaylistUrl,
} from "@/content/home"
import {
  YoutubePlaylistReadError,
  type YoutubePlaylist,
  type YoutubePlaylistReadFailureCategory,
} from "@/lib/youtube-playlist"

vi.mock("next/link", () => ({
  default: function Link({
    href,
    children,
    className,
    style,
  }: {
    href: string
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
  }) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    )
  },
}))

vi.mock("@/components/portrait-field", () => ({
  PortraitField: function PortraitField() {
    return <div className="portrait-field" aria-hidden="true" />
  },
}))

vi.mock("@/lib/youtube-playlist", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/youtube-playlist")>()
  return {
    ...actual,
    readYoutubePlaylist: vi.fn(),
  }
})

const { default: Home } = await import("./page")
const { readYoutubePlaylist } = await import("@/lib/youtube-playlist")

const readMock = vi.mocked(readYoutubePlaylist)

const PLAYLIST_URL = sermonPlaylistUrl()

function video(index: number) {
  const id = `vid${index}`
  return {
    id,
    title: `Sermon title ${index}`,
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
  }
}

function playlistWithVideos(count: number): YoutubePlaylist {
  return {
    title: "Mental health",
    url: PLAYLIST_URL,
    videos: Array.from({ length: count }, (_, i) => video(i + 1)),
  }
}

async function renderHome(): Promise<string> {
  const tree = await Home()
  return renderToStaticMarkup(tree)
}

function expectUnrelatedHomeContent(html: string) {
  expect(html).toContain("Holy Spirit")
  expect(html).toContain("Generation")
  expect(html).toContain("What’s going on")
  expect(html).not.toContain("Highlighted testimonies")
  expect(html).not.toContain("Stories adapted from Rambo World Outreach")
  expect(html).not.toContain("Hebrews 2:4")
  expect(html).toContain("New to HSG?")
  expect(html).toContain("Sermons")
  expect(html).toContain("Proverbs 4:20-21")
  expect(html).toContain('href="/watch"')
  expect(html).toContain("Watch")
  expect(html).toContain("Acts 2:46")
  expect(html).toContain('href="/events"')
  expect(html).toContain("Events")
  for (const highlight of eventHighlights) {
    expect(html).toContain(highlight.title)
    expect(html).toContain(highlight.url)
    expect(html).toContain(highlight.thumbnailUrl)
  }
  expect(html).toContain('class="home-event-highlight-rows"')
  expect(html).toContain('class="home-event-play"')
  expect(html).not.toContain("homeEventSlots")
  expect(html).not.toMatch(/<iframe\b/)
  expect(html).not.toContain("Playlist to be published")
  expect(html).not.toContain("youtube_playlist_read_failed")
  expect(html).not.toContain("external_read_failed")
  expect(html).not.toContain("invalid-feed")
  expect(html).not.toContain("YoutubePlaylistReadError")
  expect(html).not.toContain("ExternalReadError")
}

function sectionClassForHeading(html: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = html.match(
    new RegExp(
      `<section[^>]*class="([^"]*)"[^>]*>(?:(?!<section\\b)[\\s\\S])*?<h2[^>]*>${escaped}<\\/h2>`,
    ),
  )
  expect(match).not.toBeNull()
  return match![1]!
}

function expectHomeSectionBranching(html: string) {
  const bulletin = html.indexOf("What’s going on")
  const visit = html.indexOf("New to HSG?")
  const sermons = html.indexOf("Sermons")
  expect(bulletin).toBeGreaterThan(-1)
  expect(visit).toBeGreaterThan(bulletin)
  expect(sermons).toBeGreaterThan(visit)

  expect(sectionClassForHeading(html, "What’s going on")).toMatch(/is-bulletin/)
  expect(sectionClassForHeading(html, "What’s going on")).not.toMatch(/\bvisit\b/)
  expect(sectionClassForHeading(html, "New to HSG?")).toMatch(/\bvisit\b/)
  expect(sectionClassForHeading(html, "New to HSG?")).not.toMatch(/is-sermons/)
  expect(sectionClassForHeading(html, "Sermons")).toMatch(/is-sermons/)
  expect(sectionClassForHeading(html, "Sermons")).not.toMatch(/\bvisit\b/)
}

function expectExternalReadFailedWarn(
  warnSpy: ReturnType<typeof vi.spyOn>,
  {
    category,
    status,
    message,
  }: {
    category: YoutubePlaylistReadFailureCategory
    status?: number
    message: string
  },
) {
  expect(warnSpy).toHaveBeenCalledTimes(1)
  expect(warnSpy).toHaveBeenCalledWith({
    event: "external_read_failed",
    route: "/",
    dependency: "youtube-playlist",
    resource: sermonPlaylistId,
    category,
    ...(status !== undefined ? { status } : {}),
    code: "external_read_failed",
    message,
  })
}

function expectUnavailableState(html: string) {
  expect(html).toContain(sermonPlaylistUnavailable.message)
  expect(html).toContain(sermonPlaylistUnavailable.linkLabel)
  expect(html).toContain(`href="${PLAYLIST_URL}"`)
  expect(html).toMatch(
    new RegExp(
      `href="${PLAYLIST_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*target="_blank"`,
    ),
  )
  expect(html).toMatch(/rel="noopener noreferrer"/)
  expect(html).not.toContain("Sermon title")
  expect(html).not.toContain("youtube.com/watch")
  expect(html).not.toContain("i.ytimg.com")
  expect(html).toContain('class="playlists-unavailable"')
  expect(html).toContain('src="/sermons/playlist-placeholder.jpg"')
}

function expectAvailableVideos(html: string, count: number) {
  for (let i = 1; i <= count; i += 1) {
    expect(html).toContain(`Sermon title ${i}`)
    expect(html).toContain(`https://www.youtube.com/watch?v=vid${i}`)
  }
  expect(html).not.toContain(`Sermon title ${count + 1}`)
  expect(html).not.toContain(sermonPlaylistUnavailable.message)
  expect(html).not.toContain(sermonPlaylistUnavailable.linkLabel)
}

beforeEach(() => {
  readMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test("content stores fallback message and link label", () => {
  expect(sermonPlaylistUnavailable).toEqual({
    message: "Sermons are temporarily unavailable here.",
    linkLabel: "Listen to the word on Youtube",
  })
  expect(sermonPlaylistUrl()).toBe(
    "https://www.youtube.com/playlist?list=PLWX7FFgYGzyU",
  )
})

test("success with six videos renders the first five rows", async () => {
  readMock.mockResolvedValue(playlistWithVideos(6))
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

  const html = await renderHome()

  expectUnrelatedHomeContent(html)
  expectHomeSectionBranching(html)
  expectAvailableVideos(html, 5)
  expect(html).toContain("Sermon title 5")
  expect(html).not.toContain("Sermon title 6")
  expect(warnSpy).not.toHaveBeenCalled()
  expect(errorSpy).not.toHaveBeenCalled()
})

const failureCases: Array<{
  category: YoutubePlaylistReadFailureCategory
  status?: number
}> = [
  { category: "http", status: 404 },
  { category: "http", status: 500 },
  { category: "timeout" },
  { category: "network" },
  { category: "invalid-feed" },
]

for (const { category, status } of failureCases) {
  test(`unavailable state for ${category}${status !== undefined ? ` ${status}` : ""}`, async () => {
    const message = `diagnostic ${category} ${status ?? ""}`.trim()
    readMock.mockRejectedValue(
      new YoutubePlaylistReadError({
        resource: sermonPlaylistId,
        category,
        message,
        ...(status !== undefined ? { status } : {}),
      }),
    )
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const html = await renderHome()

    expectUnrelatedHomeContent(html)
    expectUnavailableState(html)
    expect(html).not.toContain(`diagnostic ${category}`)
    expectExternalReadFailedWarn(warnSpy, { category, status, message })
    expect(errorSpy).not.toHaveBeenCalled()
  })
}

test("failed render then success restores rows and logs once per failure", async () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

  readMock.mockRejectedValueOnce(
    new YoutubePlaylistReadError({
      resource: sermonPlaylistId,
      category: "http",
      message: "feed down",
      status: 404,
    }),
  )
  const failedHtml = await renderHome()
  expectUnavailableState(failedHtml)
  expectExternalReadFailedWarn(warnSpy, {
    category: "http",
    status: 404,
    message: "feed down",
  })
  expect(errorSpy).not.toHaveBeenCalled()

  readMock.mockResolvedValueOnce(playlistWithVideos(6))
  const successHtml = await renderHome()
  expectAvailableVideos(successHtml, 5)
  expect(warnSpy).toHaveBeenCalledTimes(1)
  expect(errorSpy).not.toHaveBeenCalled()
})

test("non-ExternalReadError playlist rejection propagates without warn or error", async () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  const boom = new Error("unexpected playlist failure")
  readMock.mockRejectedValue(boom)

  await expect(Home()).rejects.toBe(boom)
  expect(warnSpy).not.toHaveBeenCalled()
  expect(errorSpy).not.toHaveBeenCalled()
})
