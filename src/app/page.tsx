import Image from "next/image"
import Link from "next/link"

import { leader, sections } from "@/content/home"

export default function Home() {
  return (
    <main id="main-content" className="home-page page-width" tabIndex={-1}>
      <div className="leader-introduction">
        <h1 tabIndex={-1}>{leader.name}</h1>
        <p className="leader-blurb">{leader.blurb}</p>
        {leader.portrait ? (
          <div className="portrait-field"><Image src={leader.portrait.src} alt={leader.portrait.alt} fill sizes="(min-width: 64rem) 320px, (min-width: 40rem) 280px, 70vw" className="leader-portrait" /></div>
        ) : <div className="portrait-field" aria-hidden="true" />}
      </div>
      <div className="home-sections">
        {sections.map((section, index) => (
          <section key={section.heading} aria-labelledby={`section-${index}`} className="home-section">
            <h2 id={`section-${index}`}>{section.heading}</h2>
            {section.intro ? <p className="section-intro">{section.intro}</p> : null}
            <ul className="content-list">
              {section.items.map((item, itemIndex) => (
                <li key={`${item.title}-${itemIndex}`}>
                  {item.text ? <h3>{item.href ? <a href={item.href}>{item.title}</a> : item.title}</h3> : item.href ? <a href={item.href}>{item.title}</a> : <span>{item.title}</span>}
                  {item.text ? <p>{item.text}</p> : null}
                </li>
              ))}
            </ul>
            <Link href={section.more.href} className="section-link">{section.more.label}</Link>
          </section>
        ))}
      </div>
    </main>
  )
}
