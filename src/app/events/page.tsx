import Image from "next/image"
import type { Metadata } from "next"
import { headers } from "next/headers"

import { AddToCalendar } from "@/components/add-to-calendar"
import { events, sundayFeeds } from "@/content/events"
import { sections } from "@/content/home"
import { listUpcoming, type UpcomingEventRow } from "@/lib/event-list"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Events" }

const sundaySection = sections.find((section) => section.heading === "New to HSG?")

const SUNDAY_DESCRIPTION: Record<string, string> = {
  "Word Fest Service":
    "Short English service focused on deep teaching of the Word of God",
  "Miracles and Healing Service":
    "Full service with healing prayer and live translation using AI. Lunch is provided afterwards.",
}

const SUNDAY_FEED_BY_TITLE = new Map(
  [
    ["Word Fest Service", "word-fest"],
    ["Miracles and Healing Service", "miracles-and-healing"],
  ].flatMap(([title, id]) => {
    const feed = sundayFeeds.find((item) => item.id === id)
    return feed ? [[title, feed] as const] : []
  }),
)

function hhmm(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso))
  const hour = parts.find((part) => part.type === "hour")?.value ?? ""
  const minute = parts.find((part) => part.type === "minute")?.value ?? ""
  return `${hour}:${minute}`
}

function sundayClock(time: string, start: string, end: string): string {
  const startClock = hhmm(start)
  if (/onwards/i.test(time)) return `${startClock} onwards`
  return `${startClock}–${hhmm(end)}`
}

function scopePhrase(scope: UpcomingEventRow["scope"]): "this date only" | "these dates only" {
  return scope === "This date only" ? "this date only" : "these dates only"
}

function TickTime({ row }: { row: UpcomingEventRow }) {
  return (
    <time dateTime={row.start}>
      {row.tickDay}
      {row.tickTime ? (
        <>
          <br />
          {row.tickTime}
        </>
      ) : null}
    </time>
  )
}

function FeaturedRow({
  row,
  host,
}: {
  row: UpcomingEventRow
  host: string
}) {
  return (
    <article className="tick">
      <TickTime row={row} />
      <div className="breakout">
        {row.photo ? (
          <figure className="photo">
            <Image
              src={row.photo.src}
              alt={row.photo.alt}
              width={1024}
              height={576}
            />
          </figure>
        ) : null}
        <div>
          <h2>{row.name}</h2>
          <p className="when">{row.whenLine}</p>
          {row.description ? <p>{row.description}</p> : null}
          <AddToCalendar
            id={row.id}
            name={row.name}
            host={host}
            scope={scopePhrase(row.scope)}
          />
        </div>
      </div>
    </article>
  )
}

function MinorRow({
  row,
  host,
}: {
  row: UpcomingEventRow
  host: string
}) {
  return (
    <article className="tick minor">
      <TickTime row={row} />
      <div>
        <h3>{row.name}</h3>
        <p className="when">{row.whenLine}</p>
        <AddToCalendar
          id={row.id}
          name={row.name}
          host={host}
          scope={scopePhrase(row.scope)}
        />
      </div>
    </article>
  )
}

export default async function Page() {
  const host = (await headers()).get("host") ?? "localhost:3000"
  const upcoming = listUpcoming(events, new Date())
  const sundayItems = sundaySection?.items ?? []

  return (
    <main id="main-content" className="timeline" tabIndex={-1}>
      <div className="mast">
        <h1 tabIndex={-1}>Events</h1>
      </div>

      {upcoming.length === 0 ? (
        <p className="empty">No upcoming events.</p>
      ) : (
        <div className="spine">
          {upcoming.map((row) =>
            row.featured ? (
              <FeaturedRow key={row.id} row={row} host={host} />
            ) : (
              <MinorRow key={row.id} row={row} host={host} />
            ),
          )}
        </div>
      )}

      <section className="sunday">
        <div className="sunday-grid">
          <div>
            <h2>Sunday services</h2>
          </div>
          <div>
            {sundayItems.map((item) => {
              const feed = SUNDAY_FEED_BY_TITLE.get(item.title)
              const [language, time] = (item.text ?? "").split("\n")
              if (!feed) return null
              const clock = time ? sundayClock(time, feed.start, feed.end) : null
              return (
                <article className="service" key={feed.id}>
                  <div>
                    <h3>{item.title}</h3>
                    {language ? (
                      <p className="lang">
                        {language === "Multilingual"
                          ? "Multilingual · AI Powered"
                          : language}
                      </p>
                    ) : null}
                    {SUNDAY_DESCRIPTION[item.title] ? (
                      <p className="description">{SUNDAY_DESCRIPTION[item.title]}</p>
                    ) : null}
                    <AddToCalendar
                      id={feed.id}
                      name={item.title}
                      host={host}
                      scope="every Sunday"
                    />
                  </div>
                  {clock ? <p className="clock">{clock}</p> : null}
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
