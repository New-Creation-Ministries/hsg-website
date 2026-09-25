export const YOUTUBE_LIVE_URL =
  "https://www.youtube.com/@EvangelistRambabuRambo/live"
export const YOUTUBE_LIVE_OFFLINE_COPY = "No ongoing service"

export type YoutubeLiveBroadcast = {
  title: string
  thumbnailUrl: string
}

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

async function readText(url: string, signal: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch(url, { cache: "no-store", signal })
    if (!response.ok) return null
    return await response.text()
  } catch (error) {
    if (isAbortError(error)) throw error
    return null
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

function parseOEmbed(body: string): YoutubeLiveBroadcast | null {
  let parsed: OEmbedResponse
  try {
    parsed = JSON.parse(body) as OEmbedResponse
  } catch {
    return null
  }
  const title = parsed.title?.trim()
  const thumbnailUrl = parsed.thumbnail_url?.trim()
  if (!title || !thumbnailUrl) return null
  return { title, thumbnailUrl }
}

export async function readYoutubeLiveBroadcast(): Promise<YoutubeLiveBroadcast | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, READ_DEADLINE_MS)

  try {
    const html = await readText(YOUTUBE_LIVE_URL, controller.signal)
    if (!html) return null

    const videoId = liveVideoId(html)
    if (!videoId) return null

    const body = await readText(oEmbedUrl(videoId), controller.signal)
    if (!body) return null
    return parseOEmbed(body)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
