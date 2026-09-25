import { afterEach, expect, test, vi } from "vitest"

import {
  readYoutubeLiveBroadcast,
  YOUTUBE_LIVE_OFFLINE_COPY,
  YOUTUBE_LIVE_URL,
} from "./youtube-live"

const VIDEO_ID = "nI725iVsyoQ"

function livePage(videoId = VIDEO_ID): string {
  return `{"liveBroadcastDetails":{"isLiveNow":true,"startTimestamp":"2026-09-23T16:47:51+00:00"},"externalVideoId":"${videoId}"}`
}

function offlinePage(): string {
  return `{"videoId":"9jOLI2T4hSY"}"thumbnailBadgeViewModel":{"text":"51:41"}`
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

test("offline copy is plain text with no link", () => {
  expect(YOUTUBE_LIVE_OFFLINE_COPY).toBe("No ongoing service")
})

test("returns title and thumbnail only when the channel page is live now", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url === YOUTUBE_LIVE_URL) {
      return new Response(livePage(), { status: 200 })
    }
    expect(url).toContain("https://www.youtube.com/oembed")
    expect(url).toContain(encodeURIComponent(`https://www.youtube.com/watch?v=${VIDEO_ID}`))
    return new Response(
      JSON.stringify({
        title: "Sunday service",
        thumbnail_url: "https://i.ytimg.com/vi/nI725iVsyoQ/hqdefault.jpg",
      }),
      { status: 200 },
    )
  })
  vi.stubGlobal("fetch", fetchMock)

  await expect(readYoutubeLiveBroadcast()).resolves.toEqual({
    title: "Sunday service",
    thumbnailUrl: "https://i.ytimg.com/vi/nI725iVsyoQ/hqdefault.jpg",
  })
})

test("returns null when the live tab lists a finished video", async () => {
  const fetchMock = vi.fn(async () => new Response(offlinePage(), { status: 200 }))
  vi.stubGlobal("fetch", fetchMock)

  await expect(readYoutubeLiveBroadcast()).resolves.toBeNull()
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test("returns null when isLiveNow is false", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        `{"liveBroadcastDetails":{"isLiveNow":false},"externalVideoId":"${VIDEO_ID}"}`,
        { status: 200 },
      ),
    ),
  )

  await expect(readYoutubeLiveBroadcast()).resolves.toBeNull()
})

test("returns null when the live page or oEmbed fails", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })))
  await expect(readYoutubeLiveBroadcast()).resolves.toBeNull()

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === YOUTUBE_LIVE_URL) return new Response(livePage(), { status: 200 })
      return new Response("no", { status: 404 })
    }),
  )
  await expect(readYoutubeLiveBroadcast()).resolves.toBeNull()
})
