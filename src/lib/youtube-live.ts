import { YoutubeLiveReadError } from "./errors"

export const YOUTUBE_LIVE_URL =
  "https://www.youtube.com/@EvangelistRambabuRambo/live"
export const YOUTUBE_LIVE_OFFLINE_COPY = "No ongoing service"

export type YoutubeLiveBroadcast = {
  title: string
  thumbnailUrl: string
}

type YoutubeLiveDependency = "youtube-live" | "youtube-oembed"

const READ_DEADLINE_MS = 3000
const OEMBED_ENDPOINT = "https://www.youtube.com/oembed"
const LIVE_NOW_RE =
  /"liveBroadcastDetails":\{"isLiveNow":true[\s\S]{0,500}?"externalVideoId":"([A-Za-z0-9_-]{11})"/

type OEmbedResponse = {
  title?: string
  thumbnail_url?: string
}

function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  )
}

function asTransportError(
  error: unknown,
  dependency: YoutubeLiveDependency,
  resource: string,
  fallbackMessage: string,
): YoutubeLiveReadError {
  if (isAbortError(error)) {
    return new YoutubeLiveReadError({
      dependency,
      resource,
      category: "timeout",
      message: "YouTube live request timed out",
      cause: error,
    })
  }
  const message =
    error instanceof Error && error.message
      ? error.message
      : fallbackMessage
  return new YoutubeLiveReadError({
    dependency,
    resource,
    category: "network",
    message,
    cause: error,
  })
}

async function readText(
  url: string,
  dependency: YoutubeLiveDependency,
  signal: AbortSignal,
): Promise<string> {
  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    throw asTransportError(error, dependency, url, "YouTube live request failed")
  }

  if (!response.ok) {
    throw new YoutubeLiveReadError({
      dependency,
      resource: url,
      category: "http",
      message: `YouTube live request failed with status ${response.status}`,
      status: response.status,
    })
  }

  try {
    return await response.text()
  } catch (error) {
    throw asTransportError(
      error,
      dependency,
      url,
      "YouTube live body read failed",
    )
  }
}

function liveVideoId(html: string): string | null {
  return html.match(LIVE_NOW_RE)?.[1] ?? null
}

function oEmbedUrl(videoId: string): string {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const url = new URL(OEMBED_ENDPOINT)
  url.searchParams.set("url", watchUrl)
  url.searchParams.set("format", "json")
  return url.toString()
}

function parseOEmbed(body: string, resource: string): YoutubeLiveBroadcast {
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch (error) {
    throw new YoutubeLiveReadError({
      dependency: "youtube-oembed",
      resource,
      category: "invalid-feed",
      message: "YouTube oEmbed response is invalid JSON",
      cause: error,
    })
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new YoutubeLiveReadError({
      dependency: "youtube-oembed",
      resource,
      category: "invalid-feed",
      message: "YouTube oEmbed response is not a JSON object",
    })
  }
  const record = parsed as OEmbedResponse
  const title = record.title?.trim()
  const thumbnailUrl = record.thumbnail_url?.trim()
  if (!title || !thumbnailUrl) {
    throw new YoutubeLiveReadError({
      dependency: "youtube-oembed",
      resource,
      category: "invalid-feed",
      message: "YouTube oEmbed response is missing title or thumbnail_url",
    })
  }
  return { title, thumbnailUrl }
}

export async function readYoutubeLiveBroadcast(): Promise<YoutubeLiveBroadcast | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, READ_DEADLINE_MS)

  try {
    const html = await readText(
      YOUTUBE_LIVE_URL,
      "youtube-live",
      controller.signal,
    )
    const videoId = liveVideoId(html)
    if (!videoId) return null

    const embedUrl = oEmbedUrl(videoId)
    const body = await readText(embedUrl, "youtube-oembed", controller.signal)
    return parseOEmbed(body, embedUrl)
  } finally {
    clearTimeout(timer)
  }
}
