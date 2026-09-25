import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "vitest"

import {
  giveCta,
  helpBar,
  scripture,
  whyWeGive,
} from "."

const moduleSource = readFileSync(
  join(import.meta.dirname, "index.ts"),
  "utf8",
)

test("locks scripture text and citation from intent", () => {
  expect(scripture.text).toBe(
    "But this I say, He which soweth sparingly shall reap also sparingly; and he which soweth bountifully shall reap also bountifully.",
  )
  expect(scripture.citation).toBe("2 CORINTHIANS 9:6 • KJV")
})

test("locks Why we give heading and body from intent", () => {
  expect(whyWeGive.heading).toBe("Why we give")
  expect(whyWeGive.body).toBe(
    "God is generous and so he calls us to be as well. What we do with what God has given us shows the world where our hearts are at and helps proclaim the gospel. We want to glorify God with every area of our lives, and that includes what we do with our finances.",
  )
})

test("locks GIVE CTA label and Razorpay href", () => {
  expect(giveCta.label).toBe("GIVE")
  expect(giveCta.href).toBe("https://rzp.io/rzp/JKx5HhpN")
})

test("locks help bar label, phone display, email, and contact hrefs", () => {
  expect(helpBar.label).toBe("Have questions or need help?")
  expect(helpBar.phone.display).toBe("+91-9036 060 480")
  expect(helpBar.phone.href).toBe("tel:+919036060480")
  expect(helpBar.email.display).toBe("support@rwo.life")
  expect(helpBar.email.href).toBe("mailto:support@rwo.life")
})

test("does not include QR, address, or extra payment fields", () => {
  expect(moduleSource).not.toMatch(/qr/i)
  expect(moduleSource).not.toMatch(/address/i)
  expect(moduleSource).not.toMatch(/upi/i)
  expect(moduleSource).not.toMatch(/bank/i)
  expect(moduleSource).not.toMatch(/account/i)
  expect(moduleSource).not.toMatch(/ifsc/i)
  expect(moduleSource).not.toMatch(/paypal/i)
  expect(moduleSource).not.toMatch(/venmo/i)

  expect(scripture).toEqual({
    text: scripture.text,
    citation: scripture.citation,
  })
  expect(whyWeGive).toEqual({
    heading: whyWeGive.heading,
    body: whyWeGive.body,
  })
  expect(giveCta).toEqual({
    label: giveCta.label,
    href: giveCta.href,
  })
  expect(helpBar).toEqual({
    label: helpBar.label,
    phone: helpBar.phone,
    email: helpBar.email,
  })
  expect(helpBar.phone).toEqual({
    display: helpBar.phone.display,
    href: helpBar.phone.href,
  })
  expect(helpBar.email).toEqual({
    display: helpBar.email.display,
    href: helpBar.email.href,
  })
})
