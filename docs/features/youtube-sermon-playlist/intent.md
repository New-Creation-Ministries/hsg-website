# Intent: YouTube sermon playlist
Author: Udeet Gulati
Status: draft

## Problem

Home Sermons still shows the Evangelist Rambabu channel beside two unpublished lines, “Playlist to be published”. Visitors cannot see a real sermon series or its video thumbnails. The embed mechanism is still deferred in [docs/architecture.md](../../architecture.md).

## Proposed outcome

- Home Sermons shows one real series from [this playlist](https://www.youtube.com/playlist?list=PLWX7FFgYGzyU) (`list=PLWX7FFgYGzyU`).
- Each shown video has its YouTube thumbnail and a way to open that video.
- The series identity (playlist title and link) is visible with the thumbnails.
- This feature defines how the site reads YouTube and renders it. Later embeds follow that pattern.
- Code that loads the playlist and renders it on Home is in scope, including content, components, styles, and tests that the current placeholders require.

## Affected users and systems

- Visitors and members on Home (`/`), Sermons region.
- Home content in `src/content/home/` and the Sermons markup in `src/app/page.tsx`.
- YouTube, external. This site reads the playlist and shows thumbnails.
- [docs/features/home-landing-page/spec.md](../home-landing-page/spec.md) and [docs/adr/0003-spirit-in-blue-visual-direction.md](../../adr/0003-spirit-in-blue-visual-direction.md), which still describe plain playlist lines and no player.

## Constraints

- One public Next.js app on Vercel. No member accounts.
- Add a backend only if the integration needs a trusted server or a secret that cannot live in the client.
- Pages stay static unless the integration needs per-request data.
- YouTube stays the media host. Do not copy video files into the repo.
- Keep the Spirit in Blue sermon panel: cobalt ground, existing channel link, Watch still goes to `/watch`.
- Supplied playlist only. Do not invent other series.
- Unpublished highlights and testimony URLs stay placeholders.

## Open questions

1. Does `PLWX7FFgYGzyU` resolve? Typical playlist ids are longer.
2. How many videos from the playlist appear on Home?
3. Does a thumbnail open YouTube, or play in an embedded player on Home?
4. Does the channel panel stay beside the series, or does the series replace both placeholder lines only?
