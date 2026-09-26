import { readFileSync } from "node:fs"
import { join } from "node:path"

import { afterEach, expect, test, vi } from "vitest"

import { sections as homeSections } from "../home"
import {
  scenes,
  storyContinuesAddress,
  storyContinuesIntro,
  storyContinuesServices,
} from "."

const aboutSource = readFileSync(
  join(import.meta.dirname, "index.ts"),
  "utf8",
)

afterEach(() => {
  vi.doUnmock("../home")
  vi.doUnmock("@/content/home")
  vi.resetModules()
})

test("lists the six scenes in locked order and titles", () => {
  expect(scenes.map((scene) => ({ id: scene.id, heading: scene.heading }))).toEqual([
    { id: "founders", heading: "Founders" },
    { id: "born-again", heading: "Born Again" },
    { id: "the-call", heading: "The call" },
    { id: "nations", heading: "Gospel to the Nations" },
    { id: "church", heading: "The Church" },
    { id: "story-continues", heading: "The story continues" },
  ])
})

test("Born Again keeps birth material and speaks of being born again", () => {
  const bornAgain = scenes.find((scene) => scene.id === "born-again")
  const body = bornAgain?.paragraphs.join(" ") ?? ""

  expect(body).toMatch(/Bellary/)
  expect(body).toMatch(/1983/)
  expect(body).toMatch(/born again/i)
  expect(body).toMatch(/gave (his|their) life to Jesus|giving life to Jesus/i)
})

test("Gospel to the Nations keeps open-air copy and drops the family-residence sentence", () => {
  const nations = scenes.find((scene) => scene.id === "nations")
  const familyResidence =
    "He lives in Bangalore with his wife Vinita Rambabu, and his two children Ankit and Annika."

  expect(nations?.paragraphs).toEqual([
    "Open-air Gospel campaigns followed, across India and the world, with hundreds of thousands in attendance. He has preached in 89 nations, including endangered and unreached places, with miracles, words of knowledge, and the gifts of the Holy Spirit.",
  ])
  expect(nations?.paragraphs.join(" ")).not.toContain(familyResidence)
})

test("The story continues has no plate; the other five name public/about plates", () => {
  const withPlates = scenes.filter((scene) => scene.id !== "story-continues")
  const storyContinues = scenes.find((scene) => scene.id === "story-continues")

  expect(storyContinues?.plate).toBeUndefined()
  expect(withPlates.map((scene) => scene.plate?.src)).toEqual([
    "/about/founders.jpg",
    "/about/born-again.jpg",
    "/about/the-call.jpg",
    "/about/nations.jpg",
    "/about/church.jpg",
  ])
})

test("imports New to HSG? services from Home; about does not redefine them", () => {
  const homeServices = homeSections.find(
    (section) => section.heading === "New to HSG?",
  )

  expect(storyContinuesServices).toBe(homeServices?.items)
  expect(aboutSource).not.toMatch(/Word Fest Service/)
  expect(aboutSource).not.toMatch(/Miracles and Healing Service/)
  expect(aboutSource).not.toMatch(/8–9am/)
  expect(aboutSource).not.toMatch(/9:30am onwards/)
  expect(aboutSource).not.toMatch(/Kannada Service/)
  expect(aboutSource).not.toMatch(/English Service/)
})

test("locks Home service text that The story continues expects", () => {
  expect(storyContinuesServices).toEqual([
    { title: "Word Fest Service", text: "English\n08:00–09:00" },
    {
      title: "Miracles and Healing Service",
      text: "Multilingual\n09:30 onwards",
    },
  ])
})

test("uses the locked story-continues intro and visit address", () => {
  expect(storyContinuesIntro).toBe(
    "Join us every Sunday as we gather to worship together.",
  )
  expect(storyContinuesAddress).toBe(
    "We don't do Church together, We do Life together",
  )

  const storyContinues = scenes.find((scene) => scene.id === "story-continues")
  expect(storyContinues?.paragraphs).toEqual([storyContinuesIntro])
})

test("missing New to HSG? section rejects ContentInvariantError at module load", async () => {
  vi.resetModules()
  vi.doMock("../home", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../home")>()
    return {
      ...actual,
      sections: actual.sections.filter(
        (section) => section.heading !== "New to HSG?",
      ),
    }
  })

  const { ContentInvariantError: FreshContentInvariantError } = await import(
    "@/lib/errors"
  )
  await expect(import(".")).rejects.toThrow(FreshContentInvariantError)
})
