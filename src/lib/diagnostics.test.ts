import { afterEach, expect, test, vi } from "vitest"

import { logExternalReadFailure, logRenderFailure } from "./diagnostics"
import { ExternalReadError } from "./errors"

afterEach(() => {
  vi.restoreAllMocks()
})

test("logExternalReadFailure emits one warn with the full field set including status", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const error = new ExternalReadError({
    dependency: "youtube-playlist",
    resource: "PLplaylistId",
    category: "http",
    message: "playlist feed returned 503",
    status: 503,
  })

  logExternalReadFailure({ route: "/" }, error)

  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn).toHaveBeenCalledWith({
    event: "external_read_failed",
    route: "/",
    dependency: "youtube-playlist",
    resource: "PLplaylistId",
    category: "http",
    status: 503,
    code: "external_read_failed",
    message: "playlist feed returned 503",
  })
})

test("logExternalReadFailure omits status when the error has none", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const error = new ExternalReadError({
    dependency: "youtube-live",
    resource: "https://www.youtube.com/@channel/live",
    category: "network",
    message: "fetch failed",
  })

  logExternalReadFailure({ route: "/watch" }, error)

  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn.mock.calls[0]?.[0]).toEqual({
    event: "external_read_failed",
    route: "/watch",
    dependency: "youtube-live",
    resource: "https://www.youtube.com/@channel/live",
    category: "network",
    code: "external_read_failed",
    message: "fetch failed",
  })
  expect(warn.mock.calls[0]?.[0]).not.toHaveProperty("status")
})

test("logRenderFailure emits one error with required fields only", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

  logRenderFailure({
    route: "/events",
    method: "GET",
    routerKind: "App Router",
    routeType: "render",
    message: "unexpected failure",
  })

  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(errorSpy).toHaveBeenCalledWith({
    event: "render_failed",
    route: "/events",
    method: "GET",
    routerKind: "App Router",
    routeType: "render",
    message: "unexpected failure",
  })
  expect(errorSpy.mock.calls[0]?.[0]).not.toHaveProperty("renderSource")
  expect(errorSpy.mock.calls[0]?.[0]).not.toHaveProperty("digest")
  expect(errorSpy.mock.calls[0]?.[0]).not.toHaveProperty("code")
  expect(errorSpy.mock.calls[0]?.[0]).not.toHaveProperty("isOperational")
})

test("logRenderFailure includes optional fields when provided", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

  logRenderFailure({
    route: "/watch",
    method: "GET",
    routerKind: "App Router",
    routeType: "render",
    renderSource: "react-server-components",
    digest: "abc123",
    code: "content_invariant_violated",
    isOperational: false,
    message: "invariant broken",
  })

  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(errorSpy).toHaveBeenCalledWith({
    event: "render_failed",
    route: "/watch",
    method: "GET",
    routerKind: "App Router",
    routeType: "render",
    renderSource: "react-server-components",
    digest: "abc123",
    code: "content_invariant_violated",
    isOperational: false,
    message: "invariant broken",
  })
})
