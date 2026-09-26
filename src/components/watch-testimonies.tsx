import {
  featuredTestimoniesScripture,
  type WatchTestimony,
} from "@/content/watch"

export function WatchTestimonies({
  testimonies,
}: {
  testimonies: readonly WatchTestimony[]
}) {
  if (testimonies.length === 0) return null

  return (
    <section className="watch-testimonies" aria-labelledby="watch-testimonies-heading">
      <h2 id="watch-testimonies-heading" className="watch-testimonies-heading">
        Featured Testimonies
      </h2>
      <div className="watch-scripture">
        <h3 className="watch-scripture-citation">
          {featuredTestimoniesScripture.citation}
        </h3>
        <p className="watch-scripture-text">
          “{featuredTestimoniesScripture.text}”
        </p>
      </div>
      <ol className="watch-testimony-rows">
        {testimonies.map((testimony, index) => {
          const Heading = index === 0 ? "h1" : "h2"
          const thumbnailUrl = testimony.thumbnailUrl.trim()

          return (
            <li key={testimony.name} className="watch-testimony-row">
              <a
                className="watch-testimony-surface"
                href={testimony.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${testimony.title}`}
              >
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- content-authored or YouTube thumbnail URL, not next/image
                  <img
                    src={thumbnailUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className={
                      thumbnailUrl.startsWith("/") ? "is-portrait" : undefined
                    }
                  />
                ) : null}
                <span className="watch-play" aria-hidden="true" />
              </a>
              <div className="watch-testimony-copy">
                <Heading className="watch-testimony-name">{testimony.name}</Heading>
                <p className="watch-testimony-writeup">{testimony.writeup}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
