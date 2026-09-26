import { afterEach, expect, test, vi } from "vitest"

import { YoutubeLiveReadError } from "./errors"
import {
  readYoutubeLiveBroadcast,
  YOUTUBE_LIVE_OFFLINE_COPY,
  YOUTUBE_LIVE_URL,
} from "./youtube-live"

const VIDEO_ID = "nI725iVsyoQ"
const OEMBED_URL = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${VIDEO_ID}`)}&format=json`

function livePage(videoId = VIDEO_ID): string {
  return `{"liveBroadcastDetails":{"isLiveNow":true,"startTimestamp":"2026-09-23T16:47:51+00:00"},"externalVideoId":"${videoId}"}`
}

function offlinePage(): string {
  return `{"videoId":"9jOLI2T4hSY"}"thumbnailBadgeViewModel":{"text":"51:41"}`
}

function abortError(): DOMException {
  return new DOMException("The operation was aborted.", "AbortError")
}

function attachAbort(
  signal: AbortSignal | null | undefined,
  reject: (reason?: unknown) => void,
) {
  if (!signal) return
  if (signal.aborted) {
    reject(abortError())
    return
  }
  signal.addEventListener(
    "abort",
    () => {
      reject(abortError())
    },
    { once: true },
  )
}

function expectSignalOnlyInit(init: RequestInit | undefined) {
  expect(init).toEqual({ signal: expect.any(AbortSignal) })
  expect(Object.keys(init ?? {})).toEqual(["signal"])
}

async function expectLiveReadError(
  run: () => Promise<unknown>,
  expected: {
    dependency: "youtube-live" | "youtube-oembed"
    resource: string
    category: "http" | "timeout" | "network" | "invalid-feed"
    status?: number
  },
) {
  const clearSpy = vi.spyOn(globalThis, "clearTimeout")
  try {
    await run()
    expect.unreachable("expected readYoutubeLiveBroadcast to reject")
  } catch (error) {
    expect(error).toBeInstanceOf(YoutubeLiveReadError)
    const readError = error as YoutubeLiveReadError
    expect(readError.dependency).toBe(expected.dependency)
    expect(readError.resource).toBe(expected.resource)
    expect(readError.category).toBe(expected.category)
    expect(readError.code).toBe("external_read_failed")
    expect(readError.isOperational).toBe(true)
    if (expected.status === undefined) {
      expect(readError.status).toBeUndefined()
    } else {
      expect(readError.status).toBe(expected.status)
    }
  }
  expect(clearSpy).toHaveBeenCalled()
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test("offline copy is plain text with no link", () => {
  expect(YOUTUBE_LIVE_OFFLINE_COPY).toBe("No ongoing service")
})

test("returns title and thumbnail only when the channel page is live now", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    expectSignalOnlyInit(init)
    const url = String(input)
    if (url === YOUTUBE_LIVE_URL) {
      return new Response(livePage(), { status: 200 })
    }
    expect(url).toBe(OEMBED_URL)
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
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test("returns null when the live tab lists a finished video", async () => {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    expectSignalOnlyInit(init)
    return new Response(offlinePage(), { status: 200 })
  })
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

test("rejects a non-OK live page as http with youtube-live resource URL", async () => {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    expectSignalOnlyInit(init)
    return new Response("no", { status: 500 })
  })
  vi.stubGlobal("fetch", fetchMock)

  await expectLiveReadError(() => readYoutubeLiveBroadcast(), {
    dependency: "youtube-live",
    resource: YOUTUBE_LIVE_URL,
    category: "http",
    status: 500,
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test("rejects a non-OK oEmbed response as http with youtube-oembed resource URL", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    expectSignalOnlyInit(init)
    if (String(input) === YOUTUBE_LIVE_URL) {
      return new Response(livePage(), { status: 200 })
    }
    return new Response("no", { status: 404 })
  })
  vi.stubGlobal("fetch", fetchMock)

  await expectLiveReadError(() => readYoutubeLiveBroadcast(), {
    dependency: "youtube-oembed",
    resource: OEMBED_URL,
    category: "http",
    status: 404,
  })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test("rejects a failed live-page fetch as network", async () => {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"))
  vi.stubGlobal("fetch", fetchMock)

  await expectLiveReadError(() => readYoutubeLiveBroadcast(), {
    dependency: "youtube-live",
    resource: YOUTUBE_LIVE_URL,
    category: "network",
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test("rejects a failed live-page body read as network", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => {
      throw new TypeError("body failed")
    },
  } as unknown as Response)
  vi.stubGlobal("fetch", fetchMock)

  await expectLiveReadError(() => readYoutubeLiveBroadcast(), {
    dependency: "youtube-live",
    resource: YOUTUBE_LIVE_URL,
    category: "network",
  })
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test("rejects invalid oEmbed JSON as invalid-feed with youtube-oembed", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (String(input) === YOUTUBE_LIVE_URL) {
      return new Response(livePage(), { status: 200 })
    }
    return new Response("not-json", { status: 200 })
  })
  vi.stubGlobal("fetch", fetchMock)

  await expectLiveReadError(() => readYoutubeLiveBroadcast(), {
    dependency: "youtube-oembed",
    resource: OEMBED_URL,
    category: "invalid-feed",
  })
})

test("rejects oEmbed JSON null as invalid-feed with youtube-oembed", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (String(input) === YOUTUBE_LIVE_URL) {
      return new Response(livePage(), { status: 200 })
    }
    return new Response("null", { status: 200 })
  })
  vi.stubGlobal("fetch", fetchMock)

  await expectLiveReadError(() => readYoutubeLiveBroadcast(), {
    dependency: "youtube-oembed",
    resource: OEMBED_URL,
    category: "invalid-feed",
  })
})

test("rejects oEmbed missing title as invalid-feed with youtube-oembed", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (String(input) === YOUTUBE_LIVE_URL) {
      return new Response(livePage(), { status: 200 })
    }
    return new Response(
      JSON.stringify({
        thumbnail_url: "https://i.ytimg.com/vi/nI725iVsyoQ/hqdefault.jpg",
      }),
      { status: 200 },
    )
  })
  vi.stubGlobal("fetch", fetchMock)

  await expectLiveReadError(() => readYoutubeLiveBroadcast(), {
    dependency: "youtube-oembed",
    resource: OEMBED_URL,
    category: "invalid-feed",
  })
})

test("rejects oEmbed missing thumbnail_url as invalid-feed with youtube-oembed", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (String(input) === YOUTUBE_LIVE_URL) {
      return new Response(livePage(), { status: 200 })
    }
    return new Response(JSON.stringify({ title: "Sunday service" }), {
      status: 200,
    })
  })
  vi.stubGlobal("fetch", fetchMock)

  await expectLiveReadError(() => readYoutubeLiveBroadcast(), {
    dependency: "youtube-oembed",
    resource: OEMBED_URL,
    category: "invalid-feed",
  })
})

test("aborts stalled live-page headers at the shared 3,000 ms deadline as timeout", async () => {
  vi.useFakeTimers()
  const fetchMock = vi.fn(
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        attachAbort(init?.signal, reject)
      }),
  )
  vi.stubGlobal("fetch", fetchMock)

  const pending = readYoutubeLiveBroadcast()
  const expectation = expectLiveReadError(() => pending, {
    dependency: "youtube-live",
    resource: YOUTUBE_LIVE_URL,
    category: "timeout",
  })
  await vi.advanceTimersByTimeAsync(3000)
  await expectation
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test("aborts stalled live-page body at the shared 3,000 ms deadline as timeout", async () => {
  vi.useFakeTimers()
  const fetchMock = vi.fn(
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        attachAbort(init?.signal, reject)
        resolve({
          ok: true,
          status: 200,
          text: () =>
            new Promise<string>((_resolveText, rejectText) => {
              attachAbort(init?.signal, rejectText)
            }),
        } as Response)
      }),
  )
  vi.stubGlobal("fetch", fetchMock)

  const pending = readYoutubeLiveBroadcast()
  const expectation = expectLiveReadError(() => pending, {
    dependency: "youtube-live",
    resource: YOUTUBE_LIVE_URL,
    category: "timeout",
  })
  await vi.advanceTimersByTimeAsync(3000)
  await expectation
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
