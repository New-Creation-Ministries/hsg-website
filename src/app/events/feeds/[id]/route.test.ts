import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, expect, test, vi } from "vitest"

import { events, sundayFeeds } from "@/content/events"
import { calendarFeed } from "@/lib/calendar-feed"

import nextConfig from "../../../../../next.config"
import {
  BUILD_DTSTAMP,
  dynamic,
  dynamicParams,
  generateStaticParams,
  GET,
} from "./route"

const routeDir = dirname(fileURLToPath(import.meta.url))
const routeSource = readFileSync(join(routeDir, "route.ts"), "utf8")

afterEach(() => {
  vi.doUnmock("@/content/home")
  vi.doUnmock("@/content/events")
  vi.resetModules()
})

function maxAgeSeconds(cacheControl: string | null): number | null {
  if (!cacheControl) return null
  const match = /(?:^|[,;\s])max-age=(\d+)/i.exec(cacheControl)
  return match ? Number(match[1]) : null
}

async function getFeed(id: string): Promise<Response> {
  return GET(new Request(`http://localhost/events/feeds/${id}`), {
    params: Promise.resolve({ id }),
  })
}

test("GET returns 200 text/calendar with max-age ≤ 3600 and calendarFeed body", async () => {
  for (const id of ["word-fest", "miracles-and-healing"] as const) {
    const response = await getFeed(id)
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe(
      "text/calendar; charset=utf-8",
    )
    const cacheControl = response.headers.get("Cache-Control")
    const maxAge = maxAgeSeconds(cacheControl)
    expect(maxAge).not.toBeNull()
    expect(maxAge!).toBeLessThanOrEqual(3600)

    const body = await response.text()
    expect(body).toBe(calendarFeed(id, { dtstamp: BUILD_DTSTAMP }))
  }
})

test("generateStaticParams lists every dated id plus Sunday feeds, including past end", () => {
  expect(routeSource).toMatch(/\.\.\.events\.map\s*\(/)
  expect(routeSource).toMatch(/\.\.\.sundayFeeds\.map\s*\(/)
  expect(routeSource).not.toMatch(/listUpcoming/)
  expect(routeSource).not.toMatch(/\.filter\s*\(/)

  const datedIds = events.map((event) => event.id)
  const params = generateStaticParams()
  const ids = params.map((entry) => entry.id)

  expect(ids).toEqual([...datedIds, ...sundayFeeds.map((feed) => feed.id)])
  expect(new Set(ids).size).toBe(ids.length)
})

test("generateStaticParams calls assertEventsPublishable and Home time-text checks", () => {
  expect(routeSource).toMatch(
    /assertEventsPublishable\s*\(\s*events\s*,\s*new Date\s*\(\s*\)\s*\)/,
  )
  expect(routeSource).toMatch(/8–9am|08:00/)
  expect(routeSource).toMatch(/9:30am onwards|13:30/)
  expect(routeSource).toMatch(/New to HSG\?/)
  expect(() => generateStaticParams()).not.toThrow()
})

test("generateStaticParams throws ContentInvariantError when Home Sunday text drifts", async () => {
  vi.resetModules()
  vi.doMock("@/content/home", () => ({
    sections: [
      {
        heading: "New to HSG?",
        items: [
          { title: "Word Fest Service", text: "English\nwrong-time" },
          {
            title: "Miracles and Healing Service",
            text: "Multilingual\n09:30 onwards",
          },
        ],
      },
    ],
  }))
  const { ContentInvariantError: ErrorClass } = await import("@/lib/errors")
  const { generateStaticParams: generate } = await import("./route")
  expect(() => generate()).toThrow(ErrorClass)
})

test("generateStaticParams throws ContentInvariantError when a Sunday feed is missing", async () => {
  vi.resetModules()
  vi.doMock("@/content/events", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/content/events")>()
    const miracles = actual.sundayFeeds.find(
      (feed) => feed.id === "miracles-and-healing",
    )
    return {
      ...actual,
      sundayFeeds: miracles ? [miracles] : [],
    }
  })
  const { ContentInvariantError: ErrorClass } = await import("@/lib/errors")
  const { generateStaticParams: generate } = await import("./route")
  expect(() => generate()).toThrow(ErrorClass)
})

test("generateStaticParams throws ContentInvariantError when a Sunday window drifts", async () => {
  vi.resetModules()
  vi.doMock("@/content/events", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/content/events")>()
    return {
      ...actual,
      sundayFeeds: actual.sundayFeeds.map((feed) =>
        feed.id === "word-fest"
          ? {
              ...feed,
              start: "2026-01-04T10:00:00+05:30",
              end: "2026-01-04T11:00:00+05:30",
            }
          : feed,
      ),
    }
  })
  const { ContentInvariantError: ErrorClass } = await import("@/lib/errors")
  const { generateStaticParams: generate } = await import("./route")
  expect(() => generate()).toThrow(ErrorClass)
})

test("route is force-static; DTSTAMP is build-once; handler avoids request APIs", async () => {
  expect(dynamic).toBe("force-static")
  expect(dynamicParams).toBe(false)
  expect(routeSource).toMatch(
    /export\s+const\s+dynamic\s*=\s*["']force-static["']/,
  )
  expect(routeSource).not.toMatch(/\bheaders\s*\(/)
  expect(routeSource).not.toMatch(/\bcookies\s*\(/)
  expect(routeSource).not.toMatch(/\bconnection\s*\(/)
  expect(routeSource).not.toMatch(/from\s+["']next\/headers["']/)

  const first = await (await getFeed("word-fest")).text()
  const second = await (await getFeed("word-fest")).text()
  expect(first).toBe(second)
  expect(first).toBe(calendarFeed("word-fest", { dtstamp: BUILD_DTSTAMP }))
})
test("next.config rewrites .ics to the extensionless feed route; nothing under public/", async () => {
  expect(typeof nextConfig.rewrites).toBe("function")
  const rewrites = await nextConfig.rewrites!()
  const list = Array.isArray(rewrites)
    ? rewrites
    : [...(rewrites.afterFiles ?? []), ...(rewrites.beforeFiles ?? []), ...(rewrites.fallback ?? [])]
  expect(list).toContainEqual({
    source: "/events/feeds/:id.ics",
    destination: "/events/feeds/:id",
  })
  expect(existsSync(join(process.cwd(), "public/events/feeds"))).toBe(false)
  expect(existsSync(join(process.cwd(), "public/events"))).toBe(false)
})
