import type { Metadata } from "next"

import { arrival, contactStrip, visit } from "@/content/contact"

export const metadata: Metadata = { title: "Contact Us" }

export default function Page() {
  return (
    <div className="contact-page">
      <main id="main-content" className="contact-main" tabIndex={-1}>
        <div className="contact-desk">
          <section className="contact-visit" aria-labelledby="contact-visit-eyebrow">
            <p id="contact-visit-eyebrow" className="contact-visit-eyebrow">
              {visit.eyebrow}
            </p>
            <h1 tabIndex={-1}>{visit.headline}</h1>
            <p className="contact-visit-address">{visit.address}</p>
            <a
              className="contact-directions"
              href={visit.directions.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
              {visit.directions.label}
            </a>
          </section>
          <section className="contact-arrival" aria-labelledby="contact-arrival-heading">
            <h2 id="contact-arrival-heading">{arrival.heading}</h2>
            <ul className="contact-arrival-list">
              {arrival.facts.map((fact) => (
                <li key={fact.kind === "link" ? fact.href : fact.text}>
                  {fact.kind === "link" ? (
                    <a
                      href={fact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {fact.text}
                    </a>
                  ) : (
                    fact.text
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <aside className="contact-strip" aria-label="Contact">
        <a href={contactStrip.phone.href}>{contactStrip.phone.display}</a>
        <a href={contactStrip.email.href}>{contactStrip.email.display}</a>
        {contactStrip.socials.map((social) =>
          social.kind === "link" ? (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {social.label}
            </a>
          ) : (
            <span key={social.label}>{social.label}</span>
          ),
        )}
      </aside>
    </div>
  )
}
