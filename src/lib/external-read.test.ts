import { afterEach, expect, test, vi } from "vitest"

import { ExternalReadError } from "./errors"
import { readExternal } from "./external-read"

afterEach(() => {
  vi.restoreAllMocks()
})

const context = {
  route: "/watch",
  dependency: "youtube-live" as const,
  resource: "https://www.youtube.com/@channel/live",
}

test("readExternal returns the value and does not warn on success", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

  const result = await readExternal(context, async () => ({ id: "video-1" }))

  expect(result).toEqual({ ok: true, value: { id: "video-1" } })
  expect(warn).not.toHaveBeenCalled()
})

test("readExternal returns ok false and warns once for ExternalReadError", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const error = new ExternalReadError({
    dependency: "youtube-live",
    resource: "https://www.youtube.com/@channel/live",
    category: "timeout",
    message: "live page timed out",
  })

  const result = await readExternal(context, async () => {
    throw error
  })

  expect(result).toEqual({ ok: false, error })
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn).toHaveBeenCalledWith({
    event: "external_read_failed",
    route: "/watch",
    dependency: "youtube-live",
    resource: "https://www.youtube.com/@channel/live",
    category: "timeout",
    code: "external_read_failed",
    message: "live page timed out",
  })
})

test("readExternal rethrows a plain Error without warning", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const error = new Error("x")

  await expect(
    readExternal(context, async () => {
      throw error
    }),
  ).rejects.toBe(error)
  expect(warn).not.toHaveBeenCalled()
})

test("readExternal rethrows a thrown string without warning", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

  await expect(
    readExternal(context, async () => {
      throw "boom"
    }),
  ).rejects.toBe("boom")
  expect(warn).not.toHaveBeenCalled()
})
