import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, expect, test, vi } from "vitest"

import {
  sermonPlaylistId,
  sermonPlaylistUnavailable,
  sermonPlaylistUrl,
} from "@/content/home"
import { homeEventSlots } from "@/lib/home-event-slots"
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

vi.mock("@/lib/home-event-slots", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/home-event-slots")>()
  return {
    ...actual,
    homeEventSlots: vi.fn(actual.homeEventSlots),
  }
})

const { default: Home } = await import("./page")
const { readYoutubePlaylist } = await import("@/lib/youtube-playlist")

const readMock = vi.mocked(readYoutubePlaylist)
const slotsMock = vi.mocked(homeEventSlots)

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
  expect(html).toContain("Highlighted testimonies")
  expect(html).toContain("New to HSG?")
  expect(html).toContain("Sermons")
  expect(html).toContain("Proverbs 4:20-21")
  expect(html).toContain('href="/watch"')
  expect(html).toContain("Watch")
  expect(html).not.toContain("Playlist to be published")
  expect(html).not.toContain("youtube_playlist_read_failed")
  expect(html).not.toContain("external_read_failed")
  expect(html).not.toContain("invalid-feed")
  expect(html).not.toContain("YoutubePlaylistReadError")
  expect(html).not.toContain("ExternalReadError")
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

const { homeEventSlots: realHomeEventSlots } = await vi.importActual<
  typeof import("@/lib/home-event-slots")
>("@/lib/home-event-slots")

beforeEach(() => {
  readMock.mockReset()
  slotsMock.mockReset()
  slotsMock.mockImplementation(realHomeEventSlots)
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

test("frozen clock around event end matches homeEventSlots output", async () => {
  readMock.mockResolvedValue(playlistWithVideos(6))
  const { events } = await import("@/content/events")
  const { homeEventSlots: realSlots } = await vi.importActual<
    typeof import("@/lib/home-event-slots")
  >("@/lib/home-event-slots")

  const beforeEnd = new Date("2026-10-03T20:59:00+05:30")
  vi.useFakeTimers()
  vi.setSystemTime(beforeEnd)
  const expectedBefore = realSlots(events, beforeEnd)
  const htmlBefore = await renderHome()
  for (const slot of expectedBefore) {
    expect(htmlBefore).toContain(slot.name)
    if (slot.kind === "dated") {
      expect(htmlBefore).toContain(slot.whenLine)
    } else {
      expect(htmlBefore).toContain(slot.language)
      expect(htmlBefore).toContain(slot.time)
    }
  }

  const afterEnd = new Date("2026-10-03T21:01:00+05:30")
  vi.setSystemTime(afterEnd)
  const expectedAfter = realSlots(events, afterEnd)
  const htmlAfter = await renderHome()
  for (const slot of expectedAfter) {
    expect(htmlAfter).toContain(slot.name)
    if (slot.kind === "dated") {
      expect(htmlAfter).toContain(slot.whenLine)
    } else {
      expect(htmlAfter).toContain(slot.language)
      expect(htmlAfter).toContain(slot.time)
    }
  }
  expect(expectedBefore[0]?.kind).toBe("dated")
  expect(expectedAfter.every((slot) => slot.kind === "service")).toBe(true)
  expect(slotsMock).toHaveBeenCalledWith(events, expect.any(Date))
})


test("event-selection exceptions still propagate", async () => {
  readMock.mockResolvedValue(playlistWithVideos(6))
  slotsMock.mockImplementationOnce(() => {
    throw new Error("event selection failed")
  })

  await expect(Home()).rejects.toThrow("event selection failed")
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
