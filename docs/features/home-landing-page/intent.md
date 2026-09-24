# Intent: Home landing page
Author: Udeet Gulati
Status: ready

## Problem

The landing page is currently empty. 

## Proposed outcome

- The landing page should catch the atention of the visitors. It should showcase the church.
- Identify Holy Spirit Generation and its leaders. The church is Word-based and Spirit-filled, in Bengaluru, founded and led by Apostle Dr. P. S. Rambabu and Pastor Vinita Rambabu. Wording is adapted from the Holy Spirit Generation section on [rwo.life/about-us](https://www.rwo.life/about-us).
- Find what is happening currently in the church: highlighted events and announcements.
- Read highlighted testimonies. An item may link to YouTube or Instagram. 
- Find sermons from the [Evangelist Rambabu](https://www.youtube.com/c/EvangelistRambabuRambo) channel.
- Learn the Sunday schedule for a first visit: Word Fest service, English, 8:00–8:45am, Miracles and Healing service, Multillingual, 9:30am onwards. 
- Reach Home, About, Events, Watch, Contact Us, and Give.

## Affected users and systems

- Visitors and members.
- Home (`/`), the shared navigation, and the routes that navigation opens.
- Home content in `src/content/home/`, replacing `src/content/home.ts`.

## Constraints

- State what Home must let a visitor do.
- Adapt text from rwo.life.
- Events, testimony URLs, and playlist URLs that are not supplied stay placeholders.
- This intent is the Home page. No content folders for other pages.

## Open questions

1. Which YouTube playlist URLs should Sermons show?
2. Which events and announcements are the current highlights?
3. Which testimonies link to a specific YouTube or Instagram URL?
