import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const source = readFileSync(join(import.meta.dirname, "globals.css"), "utf8")

test("public theme tokens match Spirit in Blue; gold navy and logo mask are gone", () => {
  expect(source).toMatch(/--ink:\s*#090d15/i)
  expect(source).toMatch(/--paper:\s*#f5f3e8/i)
  expect(source).toMatch(/--mist:\s*#b6c1d5/i)
  expect(source).toMatch(/--acid:\s*#dee77f/i)
  expect(source).toMatch(/--cobalt:\s*#173de0/i)
  expect(source).toMatch(/--rule:\s*#394250/i)
  expect(source).toMatch(/--band:\s*#dedfc9/i)
  expect(source).toMatch(/--band-ink:\s*#141a20/i)
  expect(source).toMatch(/--band-link:\s*#182da3/i)
  expect(source).not.toMatch(/#d0af3b/i)
  expect(source).not.toMatch(/#020411/i)
  expect(source).not.toMatch(/mask-image:\s*radial-gradient/)
  expect(source).not.toMatch(/-webkit-mask-image:\s*radial-gradient/)
})

test("focus ring and current-page link use Acid; Menu at max-width 800px", () => {
  expect(source).toMatch(/--ring:\s*var\(--acid\)|--ring:\s*#dee77f/i)
  expect(source).toMatch(
    /\.public-navigation a\[aria-current=["']page["']\][^}]*var\(--acid\)|\.public-navigation a\[aria-current=["']page["']\][^}]*#dee77f/i,
  )
  expect(source).toMatch(/\.menu-toggle:focus\s*\{\s*display:\s*flex\s*;?\s*\}/)
  expect(source).toMatch(/@media\s*\(\s*max-width:\s*800px\s*\)/)
  expect(source).not.toMatch(/max-width:\s*63\.999rem/)
  expect(source).not.toMatch(/min-width:\s*64rem/)
})

test("body is 16px / 1.6; display type is Oswald uppercase weight 500", () => {
  expect(source).toMatch(/body\s*\{[^}]*font-size:\s*16px/)
  expect(source).toMatch(/body\s*\{[^}]*line-height:\s*1\.6/)
  expect(source).toMatch(/h1\s*,\s*h2\s*,\s*\.monogram/)
  expect(source).toMatch(/\.time[^{]*\{[^}]*font-family:\s*var\(--font-display\)/)
  expect(source).toMatch(/font-family:\s*var\(--font-display\)/)
  expect(source).toMatch(/text-transform:\s*uppercase/)
  expect(source).toMatch(/font-weight:\s*500/)
  expect(source).toMatch(/--font-display/)
})

test("hero and sermon panel are Cobalt; New to HSG? visit is Band with Band ink and Band link", () => {
  expect(source).toMatch(/\.hero[^{]*\{[^}]*background:\s*var\(--cobalt\)/)
  expect(source).toMatch(/\.channel[^{]*\{[^}]*background:\s*var\(--cobalt\)/)
  expect(source).not.toMatch(/\.channel[^{]*\{[^}]*background:\s*var\(--band\)/)
  expect(source).not.toMatch(/\.playlists[^{]*\{[^}]*background:\s*var\(--band\)/)
  expect(source).toMatch(/\.visit[^{]*\{[^}]*background:\s*var\(--band\)/)
  expect(source).toMatch(/\.visit[^{]*\{[^}]*color:\s*var\(--band-ink\)/)
  expect(source).toMatch(/\.visit[^{]*\{[^}]*--acid:\s*var\(--band-link\)/)
  expect(source).toMatch(/\.visit[^{]*\{[^}]*--mist:\s*#424a4e/)
  expect(source).toMatch(/\.visit[^{]*\{[^}]*--rule:\s*#a6aa9b/)
  expect(source).toMatch(/\.visit\s+h2[^{]*\{[^}]*color:\s*var\(--band-ink\)/)
  expect(source).toMatch(
    /\.visit\s+a,\s*\.visit\s+\.text-link,\s*\.visit\s+\.section-link[^{]*\{[^}]*color:\s*var\(--band-link\)/,
  )
  expect(source).toMatch(/\.visit\s+\.source-note[^{]*\{[^}]*color:\s*var\(--mist\)/)
  expect(source).toMatch(/\.service\s+\.time[^{]*\{[^}]*color:\s*var\(--acid\)/)
  expect(source).not.toMatch(/\.visit[^{]*\{[^}]*background:\s*var\(--ink\)/)
  expect(source).not.toMatch(/\.testimony-section\b/)
  expect(source).not.toMatch(/\.stories\b/)
})

test("home event highlights use ink-ground Home tokens, not the cream band", () => {
  expect(source).toMatch(
    /\.home-event-highlight-surface[^{]*\{[^}]*background:\s*var\(--cobalt\)/,
  )
  expect(source).toMatch(
    /\.home-event-highlight-title[^{]*\{[^}]*color:\s*var\(--paper\)/,
  )
  expect(source).toMatch(
    /\.home-event-play[^{]*\{[^}]*border-color:\s*transparent\s+transparent\s+transparent\s+var\(--paper\)/,
  )
  expect(source).not.toMatch(
    /\.home-event-highlight-(?:rows|row|surface|title)[^{]*\{[^}]*background:\s*var\(--band\)/,
  )
  expect(source).not.toMatch(
    /\.home-event-highlight-(?:rows|row|surface|title)[^{]*\{[^}]*color:\s*var\(--band-ink\)/,
  )
})

test("wide region grids: hero two columns, event highlights two columns, sermons and visit beside", () => {
  expect(source).toMatch(/\.hero[^{]*\{[^}]*grid-template-columns:\s*1\.6fr\s+0?\.7fr/)
  expect(source).toMatch(
    /\.home-event-highlight-rows[^{]*\{[^}]*grid-template-columns:\s*16rem\s+16rem/,
  )
  expect(source).toMatch(/\.playlists[^{]*\{[^}]*grid-template-columns:\s*1fr\s+1fr/)
  expect(source).toMatch(/\.visit-grid[^{]*\{[^}]*grid-template-columns:/)
  expect(source).toMatch(/\.highlights[^{]*\{[^}]*display:\s*block/)
  expect(source).toMatch(/\.highlights\s+li[^{]*\{[^}]*display:\s*block/)
  expect(source).toMatch(/\.highlights\s+li[^{]*\{[^}]*border-top:/)
  expect(source).toMatch(/\.site-footer[^{]*\{[^}]*justify-content:\s*space-between/)
})

test("at 800px regions stack; portrait follows About; event highlights separated by a rule", () => {
  const narrow = source.match(/@media\s*\(\s*max-width:\s*800px\s*\)\s*\{([\s\S]*)/)
  expect(narrow).not.toBeNull()
  const block = narrow![1]
  expect(block).toMatch(/\.hero[^{]*\{[^}]*grid-template-columns:\s*1fr/)
  expect(block).toMatch(/\.home-event-highlight-rows[^{]*\{[^}]*grid-template-columns:\s*1fr/)
  expect(block).toMatch(/\.playlists[^{]*\{[^}]*grid-template-columns:\s*1fr/)
  expect(block).toMatch(/\.visit-grid[^{]*\{[^}]*grid-template-columns:\s*1fr/)
  expect(block).toMatch(/\.site-footer[^{]*\{[^}]*flex-direction:\s*column/)
  expect(block).toMatch(
    /\.home-event-highlight-row\s*\+\s*\.home-event-highlight-row[^{]*\{[^}]*border-top:|\.home-event-highlight-row[^{]*\{[^}]*border-top:/,
  )
  expect(block).not.toMatch(/\.stories\b/)
  expect(source).not.toMatch(/\.leader-copy\s*\{\s*display:\s*contents/)
})

test("headings keep measure under 65ch; no ellipsis or fixed text height clipping", () => {
  expect(source).toMatch(/max-width:\s*65ch/)
  expect(source).not.toMatch(/text-overflow:\s*ellipsis/)
  expect(source).not.toMatch(/-webkit-line-clamp/)
  expect(source).not.toMatch(/line-clamp:\s*[1-9]/)
  expect(source).not.toMatch(/(?:^|[^-\w])height:\s*[0-9.]+(?:px|rem|em|vh|%)/m)
})

test("reference design strings stay out of the stylesheet", () => {
  expect(source).not.toMatch(/Church news & gatherings/)
  expect(source).not.toMatch(/Messages & teaching/)
  expect(source).not.toMatch(/The Word,\s*wherever you are/i)
  expect(source).not.toMatch(/Leader portrait placeholder/)
  expect(source).not.toMatch(/Return Home/)
  expect(source).not.toMatch(/Design concept/)
})

test("Watch Featured Testimonies scripture block sits on band under .watch-page", () => {
  expect(source).toMatch(
    /\.watch-page\s+\.watch-scripture[^{]*\{[^}]*width:\s*100%/,
  )
  expect(source).toMatch(
    /\.watch-page\s+\.watch-scripture[^{]*\{[^}]*background:\s*#c5c6b0/,
  )
  expect(source).toMatch(
    /\.watch-page\s+\.watch-scripture-citation[^{]*\{[^}]*color:\s*var\(--band-ink\)/,
  )
  expect(source).toMatch(
    /\.watch-page\s+\.watch-scripture-text[^{]*\{[^}]*color:\s*var\(--band-link\)/,
  )
  expect(source).not.toMatch(/(?<!\.watch-page\s+)\.watch-scripture\s*\{/)
})

test("timeline spine, tick, breakout, and sunday follow the reference with Home tokens", () => {
  expect(source).toMatch(/\.spine\s*\{/)
  expect(source).toMatch(/\.tick\s*\{/)
  expect(source).toMatch(/\.tick::before/)
  expect(source).toMatch(/\.breakout\s*\{/)
  expect(source).toMatch(/\.sunday\s*\{/)
  expect(source).toMatch(/\.breakout[^}]*background:\s*var\(--cobalt\)/)
  expect(source).toMatch(/\.sunday[^}]*background:\s*var\(--band\)/)
  expect(source).not.toMatch(/\.breakout[^}]*border-radius|\.breakout[^}]*box-shadow/)
  expect(source).toMatch(/\.add summary[^}]*min-height:\s*44px/)
  expect(source).toMatch(/\.add-menu a[^}]*min-height:\s*44px/)
  const narrow = source.match(/@media\s*\(\s*max-width:\s*800px\s*\)\s*\{([\s\S]*)/)
  expect(narrow).not.toBeNull()
  expect(narrow![1]).toMatch(
    /\.breakout,\s*\.sunday-grid,\s*\.tick|\.tick,\s*\.breakout,\s*\.sunday-grid|\.breakout[^{]*\{[^}]*grid-template-columns:\s*1fr/,
  )
})
