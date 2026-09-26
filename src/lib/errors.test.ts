import { expect, expectTypeOf, test } from "vitest"

import {
  ContentInvariantError,
  ExternalReadError,
  SiteError,
  YoutubeLiveReadError,
  YoutubePlaylistReadError,
  type ExternalDependency,
  type ExternalReadFailureCategory,
  type YoutubePlaylistReadFailureCategory,
} from "./errors"

test("exported dependency and category unions match the hierarchy", () => {
  expectTypeOf<ExternalDependency>().toEqualTypeOf<
    "youtube-playlist" | "youtube-live" | "youtube-oembed"
  >()
  expectTypeOf<ExternalReadFailureCategory>().toEqualTypeOf<
    "http" | "timeout" | "network" | "invalid-feed"
  >()
  expectTypeOf<YoutubePlaylistReadFailureCategory>().toEqualTypeOf<ExternalReadFailureCategory>()
})

test("SiteError sets name, code, isOperational, and cause", () => {
  const cause = new Error("root")
  const error = new SiteError({
    message: "site failure",
    code: "test_code",
    isOperational: false,
    cause,
  })

  expect(error).toBeInstanceOf(Error)
  expect(error).toBeInstanceOf(SiteError)
  expect(error.name).toBe("SiteError")
  expect(error.message).toBe("site failure")
  expect(error.code).toBe("test_code")
  expect(error.isOperational).toBe(false)
  expect(error.cause).toBe(cause)
})

test("SiteError omits cause when not provided", () => {
  const error = new SiteError({
    message: "no cause",
    code: "test_code",
    isOperational: true,
  })

  expect(error.cause).toBeUndefined()
  expect(Object.hasOwn(error, "cause")).toBe(false)
})

test("ExternalReadError sets hierarchy fields and isOperational", () => {
  const cause = new Error("upstream")
  const error = new ExternalReadError({
    dependency: "youtube-live",
    resource: "https://www.youtube.com/@channel/live",
    category: "http",
    message: "live page returned 503",
    status: 503,
    cause,
  })

  expect(error).toBeInstanceOf(Error)
  expect(error).toBeInstanceOf(SiteError)
  expect(error).toBeInstanceOf(ExternalReadError)
  expect(error.name).toBe("ExternalReadError")
  expect(error.code).toBe("external_read_failed")
  expect(error.isOperational).toBe(true)
  expect(error.dependency).toBe("youtube-live")
  expect(error.resource).toBe("https://www.youtube.com/@channel/live")
  expect(error.category).toBe("http")
  expect(error.status).toBe(503)
  expect(error.cause).toBe(cause)
  expect(error.message).toBe("live page returned 503")
})

test("ExternalReadError omits status when not provided", () => {
  const error = new ExternalReadError({
    dependency: "youtube-oembed",
    resource: "https://www.youtube.com/oembed?url=x",
    category: "network",
    message: "fetch failed",
  })

  expect(error.status).toBeUndefined()
  expect(Object.hasOwn(error, "status")).toBe(false)
})

test("YoutubePlaylistReadError fixes dependency and keeps instanceof chain", () => {
  const cause = { reason: "parse" }
  const error = new YoutubePlaylistReadError({
    resource: "PLplaylistId",
    category: "invalid-feed",
    message: "feed missing entry",
    status: 200,
    cause,
  })

  expect(error).toBeInstanceOf(Error)
  expect(error).toBeInstanceOf(SiteError)
  expect(error).toBeInstanceOf(ExternalReadError)
  expect(error).toBeInstanceOf(YoutubePlaylistReadError)
  expect(error.name).toBe("YoutubePlaylistReadError")
  expect(error.code).toBe("external_read_failed")
  expect(error.isOperational).toBe(true)
  expect(error.dependency).toBe("youtube-playlist")
  expect(error.resource).toBe("PLplaylistId")
  expect(error.category).toBe("invalid-feed")
  expect(error.status).toBe(200)
  expect(error.cause).toBe(cause)
})

test("YoutubeLiveReadError accepts youtube-live and youtube-oembed dependencies", () => {
  const liveCause = new Error("abort")
  const liveError = new YoutubeLiveReadError({
    dependency: "youtube-live",
    resource: "https://www.youtube.com/@channel/live",
    category: "timeout",
    message: "live page timed out",
    cause: liveCause,
  })

  expect(liveError).toBeInstanceOf(Error)
  expect(liveError).toBeInstanceOf(SiteError)
  expect(liveError).toBeInstanceOf(ExternalReadError)
  expect(liveError).toBeInstanceOf(YoutubeLiveReadError)
  expect(liveError.name).toBe("YoutubeLiveReadError")
  expect(liveError.code).toBe("external_read_failed")
  expect(liveError.isOperational).toBe(true)
  expect(liveError.dependency).toBe("youtube-live")
  expect(liveError.resource).toBe("https://www.youtube.com/@channel/live")
  expect(liveError.category).toBe("timeout")
  expect(liveError.cause).toBe(liveCause)

  const oembedError = new YoutubeLiveReadError({
    dependency: "youtube-oembed",
    resource: "https://www.youtube.com/oembed?format=json&url=x",
    category: "http",
    message: "oEmbed returned 404",
    status: 404,
  })

  expect(oembedError.dependency).toBe("youtube-oembed")
  expect(oembedError.status).toBe(404)
  expect(oembedError).toBeInstanceOf(YoutubeLiveReadError)
})

test("ContentInvariantError sets module, rule, and non-operational flag", () => {
  const cause = new Error("schema")
  const error = new ContentInvariantError({
    module: "src/content/events/index.ts",
    rule: "end-after-start",
    message: "event end precedes start",
    cause,
  })

  expect(error).toBeInstanceOf(Error)
  expect(error).toBeInstanceOf(SiteError)
  expect(error).not.toBeInstanceOf(ExternalReadError)
  expect(error).toBeInstanceOf(ContentInvariantError)
  expect(error.name).toBe("ContentInvariantError")
  expect(error.code).toBe("content_invariant_violated")
  expect(error.isOperational).toBe(false)
  expect(error.module).toBe("src/content/events/index.ts")
  expect(error.rule).toBe("end-after-start")
  expect(error.cause).toBe(cause)
  expect(error.message).toBe("event end precedes start")
})
