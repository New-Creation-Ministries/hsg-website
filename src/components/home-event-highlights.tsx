import type { EventHighlight } from "@/content/home"

export function HomeEventHighlights({
  highlights,
}: {
  highlights: readonly EventHighlight[]
}) {
  if (highlights.length === 0) return null

  return (
    <ol className="home-event-highlight-rows">
      {highlights.map((highlight) => {
        const thumbnailUrl = highlight.thumbnailUrl.trim()

        return (
          <li key={highlight.url} className="home-event-highlight-row">
            <a
              className="home-event-highlight-surface"
              href={highlight.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${highlight.title}`}
            >
              {thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- content-authored poster URL, not next/image
                <img
                  src={thumbnailUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className={
                    thumbnailUrl.startsWith("/") ? "is-portrait" : undefined
                  }
                />
              ) : null}
              <span className="home-event-play" aria-hidden="true" />
            </a>
            <h3 className="home-event-highlight-title">{highlight.title}</h3>
          </li>
        )
      })}
    </ol>
  )
}
