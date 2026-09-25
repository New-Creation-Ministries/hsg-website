import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

import { helpBar } from "../give"
import { pageNotes } from "../home"
import {
  arrival,
  contactStrip,
  visit,
} from "."

const contactSource = readFileSync(
  join(import.meta.dirname, "index.ts"),
  "utf8",
)

const footerSource = readFileSync(
  join(import.meta.dirname, "../../components/site-footer.tsx"),
  "utf8",
)

const mapsHref =
  "https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KUmCSu__Ga47McXkTAwuEFl1&daddr=NC+Arena+%233+Near+Legacy+School+%26+Moto+Mind+Shop+Byrithi,+Village,+Kothanur,+Bengaluru,+Karnataka+560077"

const youtubeHref = "https://www.youtube.com/c/EvangelistRambabuRambo"
const instagramHref = "https://www.instagram.com/holyspiritgeneration777/"
const glossaHref = "https://glossa.live/holy-spirit-generation"

test("Visit HSG locks eyebrow, headline, directions label, and maps href", () => {
  expect(visit.eyebrow).toBe("VISIT HSG")
  expect(visit.headline).toBe("COME AND RECEIVE YOUR MIRACLE")
  expect(visit.directions.label).toBe("GET DIRECTIONS")
  expect(visit.directions.href).toBe(mapsHref)
})

test("imports address from Home pageNotes; contact does not redefine it", () => {
  expect(visit.address).toBe(pageNotes.address)
  expect(visit.address).toBe(
    "NC Arena #3 Near Legacy School & Moto Mind Shop Byrithi, Village, Kothanur, Bengaluru, Karnataka 560077",
  )
  expect(contactSource).not.toMatch(
    /NC Arena #3 Near Legacy School & Moto Mind Shop Byrithi/,
  )
  const daddr = new URL(visit.directions.href).searchParams.get("daddr")
  expect(daddr).toBe(pageNotes.address)
})

test("Arrival locks heading and ordered facts including live-translation link", () => {
  expect(arrival.heading).toBe("WHEN YOU ARRIVE")
  expect(arrival.facts).toEqual([
    { kind: "text", text: "Go in past the Bosch showroom." },
    {
      kind: "text",
      text: "Two-wheeler parking is in front of Bosch on Sundays.",
    },
    {
      kind: "text",
      text: "Four-wheeler parking is in the ground opposite, next to Sam Palace.",
    },
    {
      kind: "text",
      text: "Fill a healing card for healing prayer in the second service starting 8am.",
    },
    {
      kind: "text",
      text: "Healing team counter is in the ground outside the church hall.",
    },
    {
      kind: "text",
      text: "Wheelchairs are provided if needed.",
    },
    {
      kind: "text",
      text: "Please meet volunteers if this is your first visit.",
    },
    { kind: "text", text: "Lunch is provided after the service." },
    {
      kind: "text",
      text: "We are pioneering the use of AI for live translation to all languages.",
    },
    {
      kind: "link",
      text: "Use this link for AI Translation",
      href: glossaHref,
    },
  ])
})

test("imports phone and email from Give helpBar; contact does not redefine them", () => {
  expect(contactStrip.phone).toBe(helpBar.phone)
  expect(contactStrip.email).toBe(helpBar.email)
  expect(contactStrip.phone).toEqual({
    display: "+91-9036 060 480",
    href: "tel:+919036060480",
  })
  expect(contactStrip.email).toEqual({
    display: "support@rwo.life",
    href: "mailto:support@rwo.life",
  })
  expect(contactSource).not.toMatch(/\+91-9036 060 480/)
  expect(contactSource).not.toMatch(/support@rwo\.life/)
  expect(contactSource).not.toMatch(/tel:\+919036060480/)
  expect(contactSource).not.toMatch(/mailto:support@rwo\.life/)
})

test("contact strip socials match SiteFooter YouTube and Instagram; WhatsApp is label only", () => {
  expect(contactStrip.socials).toEqual([
    { kind: "link", label: "YouTube", href: youtubeHref },
    { kind: "link", label: "Instagram", href: instagramHref },
    { kind: "label", label: "WhatsApp" },
  ])

  expect(footerSource).toContain(youtubeHref)
  expect(footerSource).toContain(instagramHref)

  const whatsapp = contactStrip.socials.find((item) => item.label === "WhatsApp")
  expect(whatsapp).toEqual({ kind: "label", label: "WhatsApp" })
  expect(whatsapp).not.toHaveProperty("href")
})
