import { existsSync, statSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

const root = join(import.meta.dirname, "../../..")

const plates = [
  "founders.jpg",
  "born-again.jpg",
  "the-call.jpg",
  "nations.jpg",
  "church.jpg",
] as const

const explorationImages = [
  "couple.png",
  "stage.png",
  "night-crusade.png",
  "studio.png",
  "festival.png",
  "filmstrip.png",
] as const

test("five about plates ship under public/about/", () => {
  for (const name of plates) {
    const path = join(root, "public/about", name)
    expect(existsSync(path), path).toBe(true)
    expect(statSync(path).size).toBeGreaterThan(0)
  }
})

test("six exploration PNGs are deleted", () => {
  const dir = join(root, "docs/features/about-page/explorations/images")
  for (const name of explorationImages) {
    expect(existsSync(join(dir, name)), name).toBe(false)
  }
})
