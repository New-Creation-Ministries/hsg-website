import Link from "next/link"
import type { ReactNode } from "react"

import { HomeEventHighlights } from "@/components/home-event-highlights"
import { PortraitField } from "@/components/portrait-field"
import {
  church,
  eventHighlights,
  leader,
  pageNotes,
  sections,
  sermonPlaylistId,
  sermonPlaylistUnavailable,
  sermonPlaylistUrl,
  type HomeItem,
  type HomeSection,
} from "@/content/home"
import { ContentInvariantError } from "@/lib/errors"
import { readExternal } from "@/lib/external-read"
import {
  firstPlaylistVideos,
  readYoutubePlaylist,
  type YoutubeVideo,
} from "@/lib/youtube-playlist"

export const revalidate = 3600

type SermonListing =
  | { status: "available"; videos: YoutubeVideo[] }
  | { status: "unavailable" }

if (church.name !== "Holy Spirit Generation") {
  throw new ContentInvariantError({
    module: "src/app/page.tsx",
    rule: "home-heading-church-name",
    message: `Home heading expects “Holy Spirit Generation”, got “${church.name}”`,
  })
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

function sectionClassName(heading: string): string {
  if (heading === "What’s going on") return "home-section is-bulletin"
  if (heading === "New to HSG?") return "home-section is-services visit"
  if (heading === "Sermons") return "home-section is-sermons"
  return "home-section"
}

function HighlightItems({ items }: { items: HomeItem[] }) {
  return (
    <>
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
      </ul>
      <HomeEventHighlights highlights={eventHighlights} />
    </>
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
  listing,
}: {
  section: HomeSection
  listing: SermonListing
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
      {listing.status === "available" ? (
        listing.videos.map((video) => (
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
        ))
      ) : (
        <li className="playlists-unavailable">
          <p>{sermonPlaylistUnavailable.message}</p>
          <a
            href={sermonPlaylistUrl(sermonPlaylistId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local placeholder, same thumbnail markup as playlist rows */}
            <img
              src="/sermons/playlist-placeholder.jpg"
              alt=""
              width={1024}
              height={682}
            />
            <span>{sermonPlaylistUnavailable.linkLabel}</span>
          </a>
        </li>
      )}
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

async function readSermonListing(): Promise<SermonListing> {
  const result = await readExternal(
    {
      route: "/",
      dependency: "youtube-playlist",
      resource: sermonPlaylistId,
    },
    () => readYoutubePlaylist(sermonPlaylistId),
  )
  if (!result.ok) {
    return { status: "unavailable" }
  }
  return {
    status: "available",
    videos: firstPlaylistVideos(result.value, 5),
  }
}

export default async function Home() {
  const listing = await readSermonListing()

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
          const isVisit = section.heading === "New to HSG?"
          const isSermons = section.heading === "Sermons"
          const isBulletin = section.heading === "What’s going on"

          return (
            <section
              key={section.heading}
              aria-labelledby={headingId}
              className={sectionClassName(section.heading)}
            >
              {isVisit ? (
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
                    <SermonItems section={section} listing={listing} />
                  ) : isBulletin ? (
                    <HighlightItems items={section.items} />
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
