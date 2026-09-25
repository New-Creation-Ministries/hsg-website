import type { Metadata } from "next"

import { giveCta, helpBar, scripture, whyWeGive } from "@/content/give"

export const metadata: Metadata = { title: "Give" }

export default function Page() {
  return (
    <div className="give-page">
      <main id="main-content" className="give-main" tabIndex={-1}>
        <div className="give-leaflet">
          <section className="give-scripture" aria-label="Scripture">
            <p className="give-scripture-text">{scripture.text}</p>
            <p className="give-scripture-citation">{scripture.citation}</p>
          </section>
          <section className="give-why">
            <h1 tabIndex={-1}>{whyWeGive.heading}</h1>
            <p>{whyWeGive.body}</p>
            <a
              className="give-cta"
              href={giveCta.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {giveCta.label}
            </a>
          </section>
        </div>
      </main>
      <aside className="give-help" aria-label={helpBar.label}>
        <p className="give-help-label">{helpBar.label}</p>
        <a href={helpBar.phone.href}>{helpBar.phone.display}</a>
        <a href={helpBar.email.href}>{helpBar.email.display}</a>
      </aside>
    </div>
  )
}
