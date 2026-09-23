# Plan: youtube-sermon-playlist
Author: Udeet Gulati
Status: approved
Links: [intent](./intent.md) · [spec](./spec.md)

Read: [ADR 0004](../../adr/0004-youtube-playlist-reading.md), [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md), [ADR 0002](../../adr/0002-public-navigation-and-recovery.md). Home outside Sermons stays [Home spec](../home-landing-page/spec.md). `/watch` stays the shell in [ADR 0001](../../adr/0001-public-pages.md).

## Files that change

- Edit `src/content/home/index.ts` — store playlist id `PLWX7FFgYGzyU`; remove both “Playlist to be published” items.
- Edit `src/content/home/home.test.ts` — assert the id and the single channel item.
- Add `src/lib/youtube-playlist.ts` — fetch and parse one public playlist feed.
- Add `src/lib/youtube-playlist.test.ts` — fixture cases; stub `fetch`; no YouTube call.
- Edit `src/app/page.tsx` — async Home reads the playlist while the page is produced and renders the series.
- Edit `src/app/page.test.ts` — source checks for the static read, four-video prefix, and link markup.
- Edit `src/app/globals.css` — series title and video rows on the existing sermon grid.
- Edit `e2e/copy.ts` — playlist URL constant.
- Edit `e2e/home.spec.ts` — replace placeholder assertions with the series.
- Edit `e2e/accessibility.spec.ts` — Acid color and 44px target on a sermon video link.

## Order of work

### Wave 1 (2 parallel)

id: youtube-sermon-playlist_1_1
title: Store the sermon playlist id and drop the placeholder rows
status: done
acceptance_criteria:
- `sermonPlaylistId` exported from `src/content/home/index.ts` is `PLWX7FFgYGzyU`
- Sermons `intro` stays “Messages from the Evangelist Rambabu channel.”
- Sermons `items` is only `{ title: "Evangelist Rambabu", href: "https://www.youtube.com/c/EvangelistRambabuRambo" }`
- No item title is “Playlist to be published”
- The only `href` among section items is still that channel URL
- Highlights, testimonies, Sunday records, nav, and `pageNotes` are unchanged
files:
- src/content/home/index.ts
- src/content/home/home.test.ts
depends_on: []

id: youtube-sermon-playlist_1_2
title: Parse a public YouTube playlist feed without calling YouTube from tests
status: done
acceptance_criteria:
- No new dependency. The feed `<title>` is the first `<title>` before any `<entry>`. Each entry uses its first `<title>` and its `<yt:videoId>`, not `media:title` or `media:thumbnail`
- `readYoutubePlaylist(id)` requests `https://www.youtube.com/feeds/videos.xml?playlist_id={id}` with `cache: "force-cache"`
- Series URL is `https://www.youtube.com/playlist?list={id}`
- Each video has that id, the decoded entry title (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&apos;`, and numeric character references), `https://www.youtube.com/watch?v={id}`, and `https://i.ytimg.com/vi/{id}/mqdefault.jpg`
- Feed order is kept. A fixture whose `<published>` dates run backwards still returns document order
- `media:thumbnail`, `media:title`, author, description, views, ratings, and dates are not on the result. A fixture author “Other Channel” appears nowhere in the result
- `firstPlaylistVideos(series, 4)` returns 4 when the feed has more, and every video when it has fewer
- Throws when the body is not a `<feed>`, the feed `<title>` is missing or blank, any entry lacks `yt:videoId` or a direct `<title>`, the response is not OK, or there are zero entries. A later bad entry fails the whole read; it is not skipped
- Tests pass a synthetic XML string and a stubbed `fetch`. `make test` performs no request to `youtube.com` or `ytimg.com`
files:
- src/lib/youtube-playlist.ts
- src/lib/youtube-playlist.test.ts
depends_on: []

### Wave 2 (1)

**Most risky:** `youtube-sermon-playlist_2_1`. An uncached fetch or a request-time API (`cookies`, `headers`, `searchParams`, `connection`) makes `/` dynamic, so serving Home calls YouTube. `h3` and `.content-list a` will also break the type and the wrapping title.

id: youtube-sermon-playlist_2_1
title: Render the first four videos beside the cobalt channel panel
status: done
acceptance_criteria:
- `page.tsx` stays a Server Component. `Home` is async and calls `readYoutubePlaylist(sermonPlaylistId)` during render. It does not catch failures or render “Playlist to be published”
- The page exports `dynamic = "error"` and does not export `revalidate`. The playlist fetch is the one in the reader (`cache: "force-cache"`). No `cache: "no-store"`
- `firstPlaylistVideos(..., 4)` is what the page renders. Entries after the fourth are absent from the JSX
- Sermons region name stays “Sermons”. “Watch” still points at `/watch`. The cobalt panel still has the intro, then the channel link
- The series title is one same-tab link to the playlist URL, in the column beside the panel, above the rows. It is not an `h2` or `h3`. Accessible name is the feed title
- Each video is one same-tab link wrapping an `img` and the full title. `alt=""`. `referrerPolicy="no-referrer"`. `width={320}` and `height={180}`. Accessible name is the title once
- The video list uses `playlists` and not `content-list`. Rows keep the hairline `border-top`. No radius, shadow, play icon, card, iframe, or YouTube script. No `target="_blank"`
- Titles use DM Sans (body), wrap, and are not uppercase Oswald. The image displays at `8rem` wide, `height: auto`, `aspect-ratio: 16 / 9`, `flex: none`, with a `25px` gap before the title (the service-record gap). At `max-width: 25rem` the row fits the existing page width
- Wide `.sermon-content` stays `grid-template-columns: 1fr 1fr`. At `max-width: 800px` it stays one column. Existing `globals.test.ts` grid assertions still pass
- `page.test.ts` source checks: `dynamic = "error"`, `readYoutubePlaylist`, `firstPlaylistVideos`, `referrerPolicy`, empty alt, no `<iframe`, no `target="_blank"`
files:
- src/app/page.tsx
- src/app/page.test.ts
- src/app/globals.css
depends_on:
- youtube-sermon-playlist_1_1
- youtube-sermon-playlist_1_2

### Wave 3 (1)

id: youtube-sermon-playlist_3_1
title: Cover the sermon series in the existing browser tests
status: done
acceptance_criteria:
- `e2e/home.spec.ts` no longer expects “Playlist to be published”
- Sermons shows one link named by its text whose href is `https://www.youtube.com/playlist?list=PLWX7FFgYGzyU`, with no `target="_blank"`
- That region shows four links whose hrefs match `https://www.youtube.com/watch?v=`, in DOM order, each with an `img` whose `src` matches `https://i.ytimg.com/vi/{id}/mqdefault.jpg` and whose accessible name equals the link text once
- At the desktop viewport the series link sits to the right of “Evangelist Rambabu”. At `atMenu` (800px) it sits below that link
- “Watch” still points at `/watch`. Highlight placeholders and testimony URLs are unchanged. `iframe` count stays 0
- Aborting `https://i.ytimg.com/**` leaves the four title links visible
- One video link and the series link navigate in the same tab (Playwright fulfills `https://www.youtube.com/**`) and Back returns Home
- A sermon video link’s computed color is `rgb(222, 231, 127)`, and its box height is at least 44
- `e2e/navigation.spec.ts` still shows `/watch` as the unpublished shell. The 320px Home test still has no horizontal scroll
files:
- e2e/copy.ts
- e2e/home.spec.ts
- e2e/accessibility.spec.ts
depends_on:
- youtube-sermon-playlist_2_1

### Not doing

- YouTube Data API, an iframe, a player script, or `target="_blank"`.
- Committing the live feed or thumbnail files. The unit fixture is synthetic XML.
- `next/image`. The browser must request `i.ytimg.com` itself.
- `revalidate` or any refresh other than the next deploy.
- Editing `/watch`, highlights, testimonies, header, footer, or Sunday.
- Rewriting `docs/features/home-landing-page/spec.md` or `docs/architecture.md`. This spec is the sermon delta. ADR 0004 is the pattern later slices follow.
- Pointing Playwright at `next start`. `make e2e` stays on `next dev`.
- A screenshot baseline. Geometry stays bounding-box checks.
- Showing the feed author, sorting by date, or listing more than four videos.
- A client fetch when the visitor opens `/`.

## Risks

- `e2e/home.spec.ts` asserts “Playlist to be published” twice, including the wide/narrow position check. Those assertions fail until wave 3.
- After wave 1, `SermonItems` still prints `items` after the channel. That list is empty until wave 2. `make test` can be green; `make e2e` is not.
- `.content-list a` is `display: inline-flex`. A video link with that rule will not wrap its title. `h1`–`h3` are Oswald and uppercase. A heading on the series title or a video title breaks DM Sans.
- Default `fetch` is static only until a request-time API exists. `cache: "no-store"` fetches on every request. Either one makes serving `/` call YouTube.
- `navigation.spec.ts` loads `/` at 320px and fails on horizontal scroll if the thumbnail stays 320px wide.
- `make build` and `make e2e` both need the public feed. A YouTube failure fails the build on purpose. `make test` must still pass offline.
- There is no screenshot baseline and no test double for the dev server. Browser checks hit the live playlist through `next dev`.

## Acceptance criteria

- `make test` is green and its processes do not open `youtube.com` or `ytimg.com`.
- `make build` prints “Build succeeded”, marks `/` static, and the prerendered Home HTML contains `https://www.youtube.com/playlist?list=PLWX7FFgYGzyU` and `https://i.ytimg.com/vi/` and does not contain “Playlist to be published” or `<iframe`.
- `make e2e` passes `e2e/home.spec.ts`, `e2e/accessibility.spec.ts`, and `e2e/navigation.spec.ts`.
- `make lint` reports zero warnings.
- Missing infrastructure: no screenshot baseline. Build and e2e need the public playlist feed. Unit tests do not.
