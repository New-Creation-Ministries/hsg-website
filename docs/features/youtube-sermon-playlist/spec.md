# Spec: YouTube sermon playlist

Status: approved
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Home Sermons shows one series from playlist `PLWX7FFgYGzyU`, with its YouTube title, a link to the playlist, and a thumbnail plus watch link for the first four videos in feed order.

How the site reads a public YouTube playlist is [ADR 0004](../../adr/0004-youtube-playlist-reading.md). This slice applies that decision to Home only. `/watch` stays the unpublished shell in [ADR 0001](../../adr/0001-public-pages.md).

Visual direction stays [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md): cobalt channel panel, Oswald and DM Sans, flat rectangles, no autoplay. External links stay same-tab per [ADR 0002](../../adr/0002-public-navigation-and-recovery.md).

## Resolved questions

| # | Question | Resolution |
| --- | --- | --- |
| 1 | Does `PLWX7FFgYGzyU` resolve? | Yes. The public Atom feed returns it. Short playlist ids are valid. Checked 2026-09-23: title “Mental health”, 10 entries, each authored on YouTube by Evangelist Rambabu Rambo. The feed author is a different channel; the page does not show that name. |
| 2 | How many videos appear on Home? | The first 4 entries, in feed order. This playlist has 10; the other 6 stay on YouTube behind the series link. If the feed has fewer than 4, show those. Do not sort by date. |
| 3 | Thumbnail or embedded player? | The thumbnail and title open the video on YouTube. Home does not mount a player. See [ADR 0004](../../adr/0004-youtube-playlist-reading.md). |
| 4 | Channel panel or replacement? | The cobalt panel stays: intro, then the Evangelist Rambabu link. The series replaces both “Playlist to be published” lines. Watch still goes to `/watch`. |

## Delta from Home

Replaces these sentences in [Home spec](../home-landing-page/spec.md): the two sermon placeholder rows, “Home does not fetch playlists”, “playlist lines stay plain text”, and “the only external URL is the channel”.

Unchanged: sermon intro, channel URL, Watch, highlights, testimonies, Sunday, header, footer, and the 800px stack.

| Piece | Wide (above 800px) | Narrow (800px and below) |
| --- | --- | --- |
| Cobalt panel | Intro, then Evangelist Rambabu. | Same, above the series. |
| Series | Beside the panel. Title link, then four video rows. | Under the panel. |

```
[ cobalt panel          ]  Mental health
  intro                     [thumb] video title
  Evangelist Rambabu        [thumb] video title
                            [thumb] video title
                            [thumb] video title
```

On the narrow stack the panel is full width, then the same title and rows.

## Content

`src/content/home/` keeps the sermon intro and the channel item. It stores the playlist id `PLWX7FFgYGzyU` and drops both placeholder items. It does not store video titles or thumbnail files.

The series title and videos come from the reader, not from hand-written copy. Home renders the first 4 entries the reader returns.

## Reader

Module responsibility: given a playlist id, return the series or fail. Home calls it while the page is produced. Unit tests use a fixture and do not call YouTube.

| Field | Source |
| --- | --- |
| Series title | Feed `<title>` |
| Series URL | `https://www.youtube.com/playlist?list={id}` |
| Video id | `yt:videoId` |
| Video title | Entry `<title>` |
| Video URL | `https://www.youtube.com/watch?v={id}` |
| Thumbnail URL | `https://i.ytimg.com/vi/{id}/mqdefault.jpg` |

`mqdefault` is the 16:9 frame (320×180). The feed’s `hqdefault` image is 4:3 with bars, so the page does not use it.

Ignored: feed author, descriptions, view counts, star ratings, and publish dates.

Fail page production when the response is not a feed, the title is missing, an entry has no video id or title, or there are zero entries. Do not render “Playlist to be published” in that case.

Serving `/` does not request YouTube. The HTML already contains titles, links, and thumbnail URLs. A YouTube-side change shows up on the next deploy.

## Sermons markup

- Region name stays “Sermons”. Section link text stays “Watch” and still points at `/watch`.
- Series title is one link to the playlist URL. Accessible name is the feed title.
- Each video is one link. The link wraps the thumbnail and the full title. Accessible name is the video title once. The image `alt` is empty.
- Image requests use `referrerpolicy="no-referrer"`. Width and height are set so the row does not jump when the image arrives.
- If an image fails, the title link remains.
- Rows are separated with the existing hairline rule. No radius, shadow, play icon, or card.
- Titles wrap. They are not truncated.
- No `<iframe>`, no YouTube script, no `target="_blank"`.
- Link color stays Acid on the ink ground and on the cobalt panel. Titles use DM Sans. The series title is not a second `h2`.

## Acceptance

- Home shows the channel link and no “Playlist to be published” text.
- The series link’s name is the feed title and its href is the playlist URL.
- The first 4 feed entries are same-tab links. Each name is that video’s title, each href is that video’s watch URL, and each has a thumbnail from `i.ytimg.com`. Later entries are absent.
- Order matches the feed. A feed shorter than 4 shows every entry it has.
- The cobalt panel still contains the intro and the channel link. At wide width it sits beside the series; at 800px and below the series follows it.
- Watch still opens `/watch`. Highlights and testimony URLs are unchanged.
- The page HTML contains no iframe and no YouTube embed script.
- Reader tests pass on a fixture, including a failure when the fixture has no entries.
- `make test` does not call YouTube.

## Concerns

| Topic | What this spec does |
| --- | --- |
| Architecture “embed” | [docs/architecture.md](../../architecture.md) says the site embeds YouTube. [ADR 0004](../../adr/0004-youtube-playlist-reading.md) defines a playlist listing as a build-time read plus outbound links, not an iframe. An on-page player would amend that ADR. |
| Playlist owner | The feed author is not the church channel. The page shows “Mental health” and the Rambabu video titles. It does not show the feed author. |
| Shown count | Home shows 4. The series link opens the rest, including videos past the feed’s 15-entry limit. |
| Third-party images | The browser requests thumbnails from `i.ytimg.com`. No player cookies and no YouTube script. |
| Build dependency | A YouTube outage or an unpublished playlist fails the deploy instead of shipping an empty series. |
| Home spec status | [Home spec](../home-landing-page/spec.md) stays the approved page contract except the sermon sentences listed under Delta. |
