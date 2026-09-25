import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const PLAYLIST_ID = "PLWX7FFgYGzyU"
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`
const YOUTUBE_FEED_PREFIX = "https://www.youtube.com/feeds/"

const fixtureDir = dirname(fileURLToPath(import.meta.url))
const successXml = readFileSync(join(fixtureDir, "youtube-feed.xml"), "utf8")
const malformedXml = "<html><title>Not a feed</title></html>"

const modeFile = process.env.YOUTUBE_FEED_MODE_FILE

function requestUrl(input) {
  if (typeof input === "string") return input
  if (input instanceof URL) return input.href
  if (input && typeof input === "object" && typeof input.url === "string") {
    return input.url
  }
  return String(input)
}

function readMode() {
  if (!modeFile) return "success"
  try {
    return readFileSync(modeFile, "utf8").trim() || "success"
  } catch {
    return "success"
  }
}

function abortError(signal) {
  if (signal?.reason !== undefined) return signal.reason
  return new DOMException("The operation was aborted.", "AbortError")
}

function requireAbortSignal(signal, mode) {
  if (signal) return signal
  throw new Error(
    `YouTube feed fixture mode "${mode}" requires fetch AbortSignal`,
  )
}

function waitForAbort(signal) {
  return new Promise((_, reject) => {
    if (signal.aborted) {
      reject(abortError(signal))
      return
    }
    signal.addEventListener(
      "abort",
      () => {
        reject(abortError(signal))
      },
      { once: true },
    )
  })
}

function stalledBodyResponse(signal) {
  const stream = new ReadableStream({
    start(controller) {
      const fail = () => {
        try {
          controller.error(abortError(signal))
        } catch {
          // already closed
        }
      }
      if (signal.aborted) {
        fail()
        return
      }
      signal.addEventListener("abort", fail, { once: true })
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { "content-type": "application/atom+xml" },
  })
}

function xmlResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "application/atom+xml" },
  })
}

const originalFetch = globalThis.fetch.bind(globalThis)

globalThis.fetch = async function youtubeFeedFetch(input, init) {
  const url = requestUrl(input)
  if (url.startsWith(YOUTUBE_FEED_PREFIX) && url !== FEED_URL) {
    throw new Error(
      `YouTube feed fixture blocked unexpected feed URL: ${url}`,
    )
  }
  if (url !== FEED_URL) {
    return originalFetch(input, init)
  }

  const mode = readMode()
  const signal = init?.signal

  switch (mode) {
    case "success":
      return xmlResponse(successXml)
    case "404":
      return new Response("Not Found", { status: 404 })
    case "500":
      return new Response("Internal Server Error", { status: 500 })
    case "network":
      throw new TypeError("fetch failed")
    case "malformed":
      return new Response(malformedXml, {
        status: 200,
        headers: { "content-type": "text/html" },
      })
    case "stalled-headers":
      return waitForAbort(requireAbortSignal(signal, mode))
    case "stalled-body":
      return stalledBodyResponse(requireAbortSignal(signal, mode))
    default:
      throw new Error(`Unknown YouTube feed fixture mode: ${mode}`)
  }
}
