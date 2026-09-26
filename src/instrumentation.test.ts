import { afterEach, expect, test, vi } from "vitest"

import { ContentInvariantError } from "@/lib/errors"

import { onRequestError } from "./instrumentation"

afterEach(() => {
  vi.restoreAllMocks()
})

const request = {
  path: "/events",
  method: "GET",
  headers: {},
}

const context = {
  routerKind: "App Router" as const,
  routePath: "/app/events/page",
  routeType: "render" as const,
  renderSource: "react-server-components" as const,
  revalidateReason: undefined,
  renderType: "dynamic" as const,
}

test("onRequestError logs a plain Error without code or isOperational", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

  onRequestError(new Error("render blew up"), request, context)

  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(errorSpy).toHaveBeenCalledWith({
    event: "render_failed",
    route: "/events",
    method: "GET",
    routerKind: "App Router",
    routeType: "render",
    renderSource: "react-server-components",
    message: "render blew up",
  })
  expect(errorSpy.mock.calls[0]?.[0]).not.toHaveProperty("code")
  expect(errorSpy.mock.calls[0]?.[0]).not.toHaveProperty("isOperational")
  expect(errorSpy.mock.calls[0]?.[0]).not.toHaveProperty("digest")
})

test("onRequestError logs ContentInvariantError with code and isOperational false", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  const error = new ContentInvariantError({
    module: "src/app/page.tsx",
    rule: "heading-present",
    message: "home heading missing",
  })

  onRequestError(error, request, context)

  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(errorSpy).toHaveBeenCalledWith({
    event: "render_failed",
    route: "/events",
    method: "GET",
    routerKind: "App Router",
    routeType: "render",
    renderSource: "react-server-components",
    code: "content_invariant_violated",
    isOperational: false,
    message: "home heading missing",
  })
})

test("onRequestError includes digest when present on the error object", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
  const error = Object.assign(new Error("digested"), { digest: "NEXT_DIGEST" })

  onRequestError(error, request, context)

  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(errorSpy.mock.calls[0]?.[0]).toMatchObject({
    event: "render_failed",
    digest: "NEXT_DIGEST",
    message: "digested",
  })
})
