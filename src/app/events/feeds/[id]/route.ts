import {
  assertEventsPublishable,
  events,
  sundayFeeds,
} from "@/content/events"
import { sections } from "@/content/home"
import { calendarFeed } from "@/lib/calendar-feed"

/** Deploy-time stamp for every feed in this build. Do not move into modules Home imports. */
export const BUILD_DTSTAMP = new Date()

export const dynamic = "force-static"
export const dynamicParams = false

type KolkataWindow = {
  start: string | undefined
  end: string | undefined
  startOffset: string | undefined
  endOffset: string | undefined
}

function kolkataWindow(isoStart: string, isoEnd: string): KolkataWindow {
  const start = isoStart.match(/T(\d{2}:\d{2}):\d{2}([+-]\d{2}:\d{2})$/)
  const end = isoEnd.match(/T(\d{2}:\d{2}):\d{2}([+-]\d{2}:\d{2})$/)
  return {
    start: start?.[1],
    end: end?.[1],
    startOffset: start?.[2],
    endOffset: end?.[2],
  }
}

function sameWindow(actual: KolkataWindow, expected: KolkataWindow): boolean {
  return (
    actual.start === expected.start &&
    actual.end === expected.end &&
    actual.startOffset === expected.startOffset &&
    actual.endOffset === expected.endOffset
  )
}

const HOME_SUNDAY_LOCKS = [
  {
    id: "word-fest",
    homeTitle: "Word Fest Service",
    homeText: "English\n08:00–09:00",
    window: {
      start: "08:00",
      end: "09:00",
      startOffset: "+05:30",
      endOffset: "+05:30",
    },
  },
  {
    id: "miracles-and-healing",
    homeTitle: "Miracles and Healing Service",
    homeText: "Multilingual\n09:30 onwards",
    window: {
      start: "09:30",
      end: "13:30",
      startOffset: "+05:30",
      endOffset: "+05:30",
    },
  },
] as const

/** Fails the build when Sunday feed windows drift from Home “New to HSG?” time text. */
function assertSundayFeedsMatchHome(): void {
  const services = sections.find((section) => section.heading === "New to HSG?")

  for (const lock of HOME_SUNDAY_LOCKS) {
    const home = services?.items.find((item) => item.title === lock.homeTitle)
    if (home?.text !== lock.homeText) {
      throw new Error(
        `Home “New to HSG?” ${lock.homeTitle} text must remain ${JSON.stringify(lock.homeText)}`,
      )
    }

    const feed = sundayFeeds.find((item) => item.id === lock.id)
    if (!feed) {
      throw new Error(`sundayFeeds is missing ${lock.id}`)
    }
    if (!sameWindow(kolkataWindow(feed.start, feed.end), lock.window)) {
      throw new Error(
        `${lock.id} must be Sunday ${lock.window.start}–${lock.window.end} Asia/Kolkata`,
      )
    }
  }
}

export function generateStaticParams(): { id: string }[] {
  assertEventsPublishable(events, new Date())
  assertSundayFeedsMatchHome()

  return [
    ...events.map((event) => ({ id: event.id })),
    ...sundayFeeds.map((feed) => ({ id: feed.id })),
  ]
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params
  const body = calendarFeed(id, { dtstamp: BUILD_DTSTAMP })

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
