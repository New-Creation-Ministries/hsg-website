import Link from "next/link"
import type { ReactNode } from "react"

import { PortraitField } from "@/components/portrait-field"
import { events } from "@/content/events"
import {
  church,
  leader,
  pageNotes,
  sections,
  sermonPlaylistId,
  type HomeItem,
  type HomeSection,
} from "@/content/home"
import {
  homeEventSlots,
  type HomeEventSlot,
} from "@/lib/home-event-slots"
import {
  firstPlaylistVideos,
  readYoutubePlaylist,
  type YoutubeVideo,
} from "@/lib/youtube-playlist"

export const dynamic = "force-dynamic"

const SECTION_CLASS = ["is-bulletin", "is-testimonies", "is-services", "is-sermons"] as const

if (church.name !== "Holy Spirit Generation") {
  throw new Error(`Home heading expects “Holy Spirit Generation”, got “${church.name}”`)
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  )
}

function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="section-link text-link" style={{ minHeight: 44 }}>
      {children}
      <ArrowIcon />
    </Link>
  )
}

function ItemTitle({ item }: { item: HomeItem }) {
  if (!item.href) return item.title
  const external = /^https?:\/\//.test(item.href)
  if (!external) return <a href={item.href}>{item.title}</a>
  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer">
      {item.title}
    </a>
  )
}

function isScriptureItem(item: HomeItem) {
  return /\d+:\d+/.test(item.title)
}

function HighlightItems({
  items,
  slots,
}: {
  items: HomeItem[]
  slots: [HomeEventSlot, HomeEventSlot]
}) {
  return (
    <ul className="highlights content-list">
      {items.map((item, itemIndex) =>
        isScriptureItem(item) ? (
          <li className="scripture-tile" key={`${item.title}-${itemIndex}`}>
            <h3>
              <ItemTitle item={item} />
            </h3>
            {item.text ? <p>“{item.text}”</p> : null}
          </li>
        ) : (
          <li key={`${item.title}-${itemIndex}`}>
            <h3>
              <ItemTitle item={item} />
            </h3>
            {item.text ? <p>{item.text}</p> : null}
          </li>
        ),
      )}
      {slots.map((slot, slotIndex) => (
        <li key={`${slot.kind}-${slot.name}-${slotIndex}`}>
          <h3>{slot.name}</h3>
          {slot.kind === "dated" ? (
            <p>{slot.whenLine}</p>
          ) : (
            <>
              <p>{slot.language}</p>
              <p>{slot.time}</p>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

function TestimonyItems({ items }: { items: HomeItem[] }) {
  return (
    <div className="stories">
      {items.map((item, itemIndex) =>
        isScriptureItem(item) ? (
          <article className="scripture-tile" key={`${item.title}-${itemIndex}`}>
            <h3>
              <ItemTitle item={item} />
            </h3>
            {item.text ? <p>“{item.text}”</p> : null}
          </article>
        ) : (
          <article key={`${item.title}-${itemIndex}`}>
            <h3>
              <ItemTitle item={item} />
            </h3>
            {item.text ? <p>{item.text}</p> : null}
          </article>
        ),
      )}
    </div>
  )
}

function ClosingQuote({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 37 31" fill="currentColor" aria-hidden="true">
      <path d="M0 0h15v16c0 4-1 7-3 10-2 2.5-6 4.5-10 5 0-1 2-3 4.5-5.5C8.5 23 10 20 10 16H0V0z" />
      <path transform="translate(22)" d="M0 0h15v16c0 4-1 7-3 10-2 2.5-6 4.5-10 5 0-1 2-3 4.5-5.5C8.5 23 10 20 10 16H0V0z" />
    </svg>
  )
}

function SermonItems({
  section,
  videos,
}: {
  section: HomeSection
  videos: YoutubeVideo[]
}) {
  const [citation] = section.items
  return (
    <ul className="playlists">
      <li className="channel">
        <blockquote className="scripture">
          <ClosingQuote className="quote-mark quote-mark-start" />
          {section.intro ? <p>{section.intro}</p> : null}
          {citation ? <footer>{citation.title}</footer> : null}
          <ClosingQuote className="quote-mark quote-mark-end" />
        </blockquote>
      </li>
      {videos.map((video) => (
        <li key={video.id}>
          <a href={video.url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail URL, not next/image */}
            <img
              src={video.thumbnailUrl}
              alt=""
              referrerPolicy="no-referrer"
              width={320}
              height={180}
            />
            <span>{video.title}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function ServiceItems({ items }: { items: HomeItem[] }) {
  return (
    <div className="service-records">
      {items.map((item, itemIndex) => {
        const [language, time] = (item.text ?? "").split("\n")
        return (
          <article className="service" key={`${item.title}-${itemIndex}`}>
            <div>
              <h3>{item.title}</h3>
              {language ? <p>{language}</p> : null}
            </div>
            {time ? <p className="time">{time}</p> : null}
          </article>
        )
      })}
    </div>
  )
}

export default async function Home() {
  const sundayItems =
    sections.find((section) => section.heading === "New to HSG?")?.items ?? []
  const slots = homeEventSlots(events, sundayItems, new Date())
  const series = await readYoutubePlaylist(sermonPlaylistId)
  const videos = firstPlaylistVideos(series, 5)

  return (
    <main id="main-content" className="home-page page-width" tabIndex={-1}>
      <div className="hero leader-introduction">
        <div className="leader-copy">
          <h1 tabIndex={-1}>
            <span>Holy Spirit</span> <span>Generation</span>
          </h1>
          <p className="leader-blurb">{leader.blurb}</p>
          <SectionLink href="/about">About</SectionLink>
        </div>
        <PortraitField portrait={leader.portrait} />
      </div>

      <div className="home-sections">
        {sections.map((section, index) => {
          const headingId = `section-${index}`
          const isSunday = index === 2
          const isSermons = index === 3
          const isTestimonies = index === 1

          return (
            <section
              key={section.heading}
              aria-labelledby={headingId}
              className={`home-section ${SECTION_CLASS[index]}${isSunday ? " visit" : ""}${isTestimonies ? " testimony-section" : ""}`}
            >
              {isSunday ? (
                <div className="visit-grid">
                  <div className="visit-intro">
                    <h2 id={headingId}>{section.heading}</h2>
                    {section.intro ? <p className="section-intro">{section.intro}</p> : null}
                    {section.more && (
                      <SectionLink href={section.more.href}>{section.more.label}</SectionLink>
                    )}
                  </div>
                  <div>
                    <ServiceItems items={section.items} />
                    <p className="source-note page-note">{pageNotes.sunday}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="section-head">
                    <h2 id={headingId}>{section.heading}</h2>
                    {section.more && (
                      <SectionLink href={section.more.href}>{section.more.label}</SectionLink>
                    )}
                  </div>
                  {isSermons ? (
                    <SermonItems section={section} videos={videos} />
                  ) : index === 0 ? (
                    <HighlightItems items={section.items} slots={slots} />
                  ) : (
                    <TestimonyItems items={section.items} />
                  )}
                  {isTestimonies ? (
                    <p className="source-note page-note">{pageNotes.testimonies}</p>
                  ) : null}
                </>
              )}
            </section>
          )
        })}
      </div>
    </main>
  )
}
