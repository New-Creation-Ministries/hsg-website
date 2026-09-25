# 0004 YouTube playlist reading

- Status: accepted.
- Date: 2026-09-23.
- Decision owner: Udeet Gulati.

## Context

[docs/architecture.md](../architecture.md) leaves the YouTube mechanism to the first slice that needs it, and says later slices follow that pattern. A page that shows a sermon series needs titles and thumbnails from a public playlist. YouTube remains the media host. Video files are not stored in this repository.

[ADR 0003](0003-spirit-in-blue-visual-direction.md) keeps sermon surfaces flat and static: no autoplay, no entrance motion. [ADR 0002](0002-public-navigation-and-recovery.md) opens all external URLs in a new tab.

## Decision

- A named public playlist is read from `https://www.youtube.com/feeds/videos.xml?playlist_id={id}`.
- No YouTube API credential, no persisted copy of the feed, and no per-request read when the page is served.
- The read runs while the page is produced for deploy. The shipped HTML contains the series title and, for each video the surface shows, the title, a thumbnail URL, and a watch link. A change on YouTube appears on the next deploy.
- The public feed returns at most 15 entries. A listing shows a prefix of that list, in feed order. The slice chooses the prefix length. The playlist URL is how a visitor opens the rest of the series on YouTube.
- Each video is a new-tab link to `https://www.youtube.com/watch?v={id}`. The thumbnail is `https://i.ytimg.com/vi/{id}/mqdefault.jpg`, loaded by the browser from YouTube. The image is not committed to the repo.
- A playlist listing does not mount a YouTube player, iframe, or script. Playback happens on YouTube.
- The visible series name is the feed title. The feed author is not shown.
- If the feed cannot be read, has no title, or has no usable entries, page production fails. The page does not substitute placeholder rows.

## Alternatives

| Alternative | Outcome |
| --- | --- |
| YouTube Data API | Rejected for this pattern. It needs a credential and a quota for the same public fields. |
| Player iframe on the listing | Rejected. It loads YouTube’s player on read, and conflicts with the static, no-autoplay sermon surface in [ADR 0003](0003-spirit-in-blue-visual-direction.md). |
| Copy video files or thumbnail files into the repo | Rejected. YouTube stays the host. |
| Client fetch on each visit | Rejected. The page would depend on YouTube at request time, and serving `/` would call YouTube. |

## Consequences

- The feed provides at most 15 videos. A listing shows a prefix of that list, in feed order, and the playlist link opens the rest. A later slice that must show more than the feed provides amends this ADR before adding the Data API.
- Instagram and on-page playback are not decided here. A later slice that only lists a public YouTube item uses this read-and-link pattern. A slice that plays media on the site amends this ADR.
- This decision replaces the “plain playlist list” sermon sentence in [ADR 0003](0003-spirit-in-blue-visual-direction.md) where a playlist id is published. The cobalt channel panel, flat rectangles, and absence of autoplay stay.
