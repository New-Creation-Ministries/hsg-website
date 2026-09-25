export type YoutubeVideo = {
  id: string
  title: string
  url: string
  thumbnailUrl: string
}

export type YoutubePlaylist = {
  title: string
  url: string
  videos: YoutubeVideo[]
}

export type YoutubePlaylistReadFailureCategory =
  | "http"
  | "timeout"
  | "network"
  | "invalid-feed"

export class YoutubePlaylistReadError extends Error {
  readonly category: YoutubePlaylistReadFailureCategory
  readonly status?: number

  constructor(
    message: string,
    category: YoutubePlaylistReadFailureCategory,
    status?: number,
  ) {
    super(message)
    this.name = "YoutubePlaylistReadError"
    this.category = category
    if (status !== undefined) {
      this.status = status
    }
  }
}

const READ_DEADLINE_MS = 3000

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
  fallbackMessage: string,
): YoutubePlaylistReadError {
  if (isAbortError(error)) {
    return new YoutubePlaylistReadError(
      "YouTube playlist feed request timed out",
      "timeout",
    )
  }
  const message =
    error instanceof Error && error.message
      ? error.message
      : fallbackMessage
  return new YoutubePlaylistReadError(message, "network")
}

const TITLE_RE = /<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i
const VIDEO_ID_RE = /<yt:videoId>([\s\S]*?)<\/yt:videoId>/i
const ENTRY_RE = /<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi
const ENTITY_RE = /&(#(?:x[0-9a-fA-F]+|\d+)|[a-zA-Z]+);/g

function decodeXmlEntities(text: string): string {
  return text.replace(ENTITY_RE, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10)
      if (!Number.isFinite(code)) return match
      return String.fromCodePoint(code)
    }
    switch (entity) {
      case "amp":
        return "&"
      case "lt":
        return "<"
      case "gt":
        return ">"
      case "quot":
        return '"'
      case "apos":
        return "'"
      default:
        return match
    }
  })
}

function firstMatch(source: string, re: RegExp): string | null {
  const match = re.exec(source)
  return match?.[1] ?? null
}

function parseEntry(entryXml: string): YoutubeVideo {
  const videoIdRaw = firstMatch(entryXml, new RegExp(VIDEO_ID_RE.source, "i"))
  const titleRaw = firstMatch(entryXml, new RegExp(TITLE_RE.source, "i"))
  if (videoIdRaw === null || titleRaw === null) {
    throw new Error("YouTube playlist entry is missing yt:videoId or title")
  }
  const id = decodeXmlEntities(videoIdRaw).trim()
  const title = decodeXmlEntities(titleRaw).trim()
  if (!id || !title) {
    throw new Error("YouTube playlist entry is missing yt:videoId or title")
  }
  return {
    id,
    title,
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
  }
}

function parseFeed(xml: string, playlistId: string): YoutubePlaylist {
  if (!/<feed[\s>]/i.test(xml)) {
    throw new Error("YouTube playlist response is not a feed")
  }

  const firstEntryIndex = xml.search(/<entry[\s>]/i)
  const header = firstEntryIndex === -1 ? xml : xml.slice(0, firstEntryIndex)
  const titleRaw = firstMatch(header, new RegExp(TITLE_RE.source, "i"))
  if (titleRaw === null) {
    throw new Error("YouTube playlist feed title is missing")
  }
  const title = decodeXmlEntities(titleRaw).trim()
  if (!title) {
    throw new Error("YouTube playlist feed title is blank")
  }

  const entries = xml.match(ENTRY_RE) ?? []
  if (entries.length === 0) {
    throw new Error("YouTube playlist feed has no entries")
  }

  const videos = entries.map(parseEntry)

  return {
    title,
    url: `https://www.youtube.com/playlist?list=${playlistId}`,
    videos,
  }
}

export async function readYoutubePlaylist(
  id: string,
): Promise<YoutubePlaylist> {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, READ_DEADLINE_MS)

  try {
    let response: Response
    try {
      response = await fetch(
        `https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`,
        { cache: "no-store", signal: controller.signal },
      )
    } catch (error) {
      throw asTransportError(error, "YouTube playlist feed request failed")
    }

    if (!response.ok) {
      throw new YoutubePlaylistReadError(
        `YouTube playlist feed request failed with status ${response.status}`,
        "http",
        response.status,
      )
    }

    let body: string
    try {
      body = await response.text()
    } catch (error) {
      throw asTransportError(error, "YouTube playlist feed body read failed")
    }

    try {
      return parseFeed(body, id)
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "YouTube playlist feed is invalid"
      throw new YoutubePlaylistReadError(message, "invalid-feed")
    }
  } finally {
    clearTimeout(timer)
  }
}

export function firstPlaylistVideos(
  series: YoutubePlaylist,
  n: number,
): YoutubeVideo[] {
  return series.videos.slice(0, n)
}
