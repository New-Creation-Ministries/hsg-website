import { ContentInvariantError } from "@/lib/errors"

export type EventPhoto = {
  src: string
  alt: string
}

export type EventRecord = {
  id: string
  name: string
  start: string
  end: string
  revision: number
  description?: string
  photo?: EventPhoto
  featured?: boolean
}

export type SundayFeedRecord = {
  id: string
  start: string
  end: string
  revision: number
  weekly: true
}

export const events: EventRecord[] = [
  {
    id: "voice-of-apostles-2026",
    name: "Voice of Apostles 2026",
    start: "2026-09-30T18:00:00+05:30",
    end: "2026-10-03T21:00:00+05:30",
    revision: 1,
    featured: true,
    photo: {
      src: "/event-photos/voice-of-apostles-2026.jpg",
      alt: "Apostle Dr. P. S. Rambabu holding a microphone before a crowd, under the title Voice of Apostles",
    },
  },
]

/** Seed Sunday 4 Jan 2026; weekly recurrence is implied by `weekly: true`. */
export const sundayFeeds: SundayFeedRecord[] = [
  {
    id: "word-fest",
    start: "2026-01-04T08:00:00+05:30",
    end: "2026-01-04T09:00:00+05:30",
    revision: 1,
    weekly: true,
  },
  {
    id: "miracles-and-healing",
    start: "2026-01-04T09:30:00+05:30",
    end: "2026-01-04T13:30:00+05:30",
    revision: 1,
    weekly: true,
  },
]

export function assertEventsPublishable(
  records: EventRecord[],
  now: Date,
): void {
  const nowMs = now.getTime()
  let featuredUpcoming = 0

  for (const record of records) {
    if (!record.name || !record.start || !record.end) {
      throw new ContentInvariantError({
        module: "src/content/events/index.ts",
        rule: "required-fields",
        message: `Event "${record.id}" requires name, start, and end`,
      })
    }

    const startMs = Date.parse(record.start)
    const endMs = Date.parse(record.end)
    if (!(endMs > startMs)) {
      throw new ContentInvariantError({
        module: "src/content/events/index.ts",
        rule: "end-after-start",
        message: `Event "${record.id}" end must be after start`,
      })
    }

    if (!Number.isInteger(record.revision) || record.revision < 1) {
      throw new ContentInvariantError({
        module: "src/content/events/index.ts",
        rule: "revision-integer-ge-1",
        message: `Event "${record.id}" revision must be an integer ≥ 1`,
      })
    }

    if (record.photo?.src && !record.photo.alt) {
      throw new ContentInvariantError({
        module: "src/content/events/index.ts",
        rule: "photo-alt-required",
        message: `Event "${record.id}" photo requires alt when src is set`,
      })
    }

    if (record.featured && endMs > nowMs) {
      featuredUpcoming += 1
    }
  }

  if (featuredUpcoming > 2) {
    throw new ContentInvariantError({
      module: "src/content/events/index.ts",
      rule: "max-two-featured-upcoming",
      message:
        "At most two featured events may still be listed (end after now)",
    })
  }
}
