import Link from "next/link"
import type { ReactNode } from "react"

import { PortraitField } from "@/components/portrait-field"
import {
  church,
  leader,
  pageNotes,
  sections,
  type HomeItem,
  type HomeSection,
} from "@/content/home"

const SECTION_CLASS = ["is-bulletin", "is-testimonies", "is-sermons", "is-services"] as const

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
  if (item.href) {
    return <a href={item.href}>{item.title}</a>
  }
  return item.title
}

function HighlightItems({ items }: { items: HomeItem[] }) {
  return (
    <ul className="highlights content-list">
      {items.map((item, itemIndex) => (
        <li key={`${item.title}-${itemIndex}`}>
          <h3>
            <ItemTitle item={item} />
          </h3>
        </li>
      ))}
    </ul>
  )
}

function TestimonyItems({ items }: { items: HomeItem[] }) {
  return (
    <div className="stories">
      {items.map((item, itemIndex) => (
        <article key={`${item.title}-${itemIndex}`}>
          <h3>
            <ItemTitle item={item} />
          </h3>
          {item.text ? <p>{item.text}</p> : null}
        </article>
      ))}
    </div>
  )
}

function SermonItems({ section }: { section: HomeSection }) {
  const [first, ...rest] = section.items
  return (
    <div className="sermon-content">
      <div className="channel">
        {section.intro ? <p className="section-intro">{section.intro}</p> : null}
        {first ? (
          <p className="channel-item">
            <ItemTitle item={first} />
          </p>
        ) : null}
      </div>
      <ul className="playlists content-list">
        {rest.map((item, itemIndex) => (
          <li key={`${item.title}-${itemIndex}`}>
            <ItemTitle item={item} />
          </li>
        ))}
      </ul>
    </div>
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

function SectionBody({ section, index }: { section: HomeSection; index: number }) {
  if (index === 0) return <HighlightItems items={section.items} />
  if (index === 1) return <TestimonyItems items={section.items} />
  if (index === 2) return <SermonItems section={section} />
  return <ServiceItems items={section.items} />
}

export default function Home() {
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
          const isSunday = index === 3
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
                    <SectionLink href={section.more.href}>{section.more.label}</SectionLink>
                  </div>
                  <div>
                    <SectionBody section={section} index={index} />
                    <p className="source-note page-note">{pageNotes.sunday}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="section-head">
                    <h2 id={headingId}>{section.heading}</h2>
                    <SectionLink href={section.more.href}>{section.more.label}</SectionLink>
                  </div>
                  <SectionBody section={section} index={index} />
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
