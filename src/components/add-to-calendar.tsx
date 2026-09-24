type ScopeKind = "this date only" | "these dates only" | "every Sunday"

export function AddToCalendar({
  id,
  name,
  host,
  scope,
}: {
  id: string
  name: string
  host: string
  scope: ScopeKind
}) {
  const appleHref = `webcal://${host}/events/feeds/${id}.ics`
  const googleHref = `https://calendar.google.com/calendar/render?cid=webcal://${host}/events/feeds/${id}.ics`

  return (
    <details className="add">
      <summary aria-label={`Add to calendar, ${name}, ${scope}`}>
        Add to calendar
      </summary>
      <div className="add-menu">
        <a
          href={googleHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Google Calendar, ${name}`}
        >
          Google Calendar
        </a>
        <a
          href={appleHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Apple Calendar, ${name}`}
        >
          Apple Calendar
        </a>
      </div>
    </details>
  )
}
