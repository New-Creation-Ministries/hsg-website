import Image from "next/image"
import Link from "next/link"

import { leader, sections, type HomeItem } from "@/content/home"

function ItemTitle({ item }: { item: HomeItem }) {
  if (item.href) return <a href={item.href}>{item.title}</a>
  return item.title
}

export default function Home() {
  return (
    <main id="main-content" className="home-page page-width" tabIndex={-1}>
      <div className="leader-introduction">
        <div className="leader-copy">
          <h1 tabIndex={-1}>{leader.name}</h1>
          <p className="leader-blurb">{leader.blurb}</p>
        </div>
        {leader.portrait ? (
          <div className="portrait-field">
            <Image
              src={leader.portrait.src}
              alt={leader.portrait.alt}
              fill
              sizes="(min-width: 64rem) 280px, 70vw"
              className="leader-portrait"
            />
          </div>
        ) : (
          <div className="portrait-field" aria-hidden="true" />
        )}
      </div>
      <div className="home-sections">
        {sections.map((section, index) => (
          <section
            key={section.heading}
            aria-labelledby={`section-${index}`}
            className={`home-section is-${["bulletin", "testimonies", "sermons", "services"][index]}`}
          >
            <h2 id={`section-${index}`}>{section.heading}</h2>
            {section.intro ? <p className="section-intro">{section.intro}</p> : null}
            <ul className="content-list">
              {section.items.map((item, itemIndex) => (
                <li key={`${item.title}-${itemIndex}`}>
                  {item.text ? (
                    <>
                      <h3>
                        <ItemTitle item={item} />
                      </h3>
                      <p>
                        {item.text.split("\n").map((line, lineIndex) => (
                          <span className="text-line" key={lineIndex}>
                            {line}
                          </span>
                        ))}
                      </p>
                    </>
                  ) : (
                    <ItemTitle item={item} />
                  )}
                </li>
              ))}
            </ul>
            <Link href={section.more.href} className="section-link">
              {section.more.label}
            </Link>
          </section>
        ))}
      </div>
    </main>
  )
}
