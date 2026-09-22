# Intent: Home landing page
Author: Udeet Gulati
Status: ready

## Problem

Home is a centered logo and the sentence “Gatherings, news, and messages will be published here.” A visitor cannot tell who leads the church, what the church is, or where to go next.

## Proposed outcome

Home opens with Apostle Dr. P. S. Rambabu: his name, a portrait, and a short blurb about the church. The blurb is adapted from the Holy Spirit Generation section on [rwo.life/about-us](https://www.rwo.life/about-us): a Word-based, Spirit-filled church in Bengaluru, founded and led by Apostle Dr. P. S. Rambabu and Pastor Vinita Rambabu.

Four lead-in sections follow, in order. Each shows a few items, then links to its page.

1. **What’s going on** — highlighted events and announcements. Page: Events.
2. **Highlighted testimonies** — short praise reports. An item may link to YouTube or Instagram. Wording adapted from the miracle-story summaries on [rwo.life](https://www.rwo.life/). Page: Praise Reports.
3. **Sermons** — YouTube playlists. Channel: [Evangelist Rambabu](https://www.youtube.com/c/EvangelistRambabuRambo). Page: Watch.
4. **New to HSG** — Sunday welcome adapted from rwo.life/about-us: Kannada service 8:00–9:30am, English service 10:00am–12:00pm. Page: Contact Us, for visit information.

Navigation: Home, About, Events, Praise Reports, Watch, Contact Us, Give.

## Affected users and systems

- Visitors and members.
- Home (`/`), the shared navigation, and the routes that navigation opens.
- Home content in `src/content/home/`, replacing `src/content/home.ts`.

## Constraints

- Adapt text from rwo.life. Do not recreate that site’s layout or add facts it does not state.
- Events, testimony URLs, playlist URLs, and photos that are not supplied stay placeholders.
- This intent is the Home page. No content folders for other pages.

## Open questions

1. Which YouTube playlist URLs should Sermons show?
2. Which events and announcements are the current highlights?
3. Which testimonies link to a specific YouTube or Instagram URL?
