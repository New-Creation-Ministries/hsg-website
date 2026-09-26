import { readFileSync } from "node:fs"
import { join } from "node:path"

import { createElement, type ComponentType } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { expect, test, vi } from "vitest"

import { church } from "@/content/home"

vi.mock("./globals.css", () => ({}))
vi.mock("next/font/google", () => ({
  DM_Sans: () => ({ variable: "__variable_sans", className: "dm-sans" }),
  Oswald: () => ({ variable: "__variable_display", className: "oswald" }),
}))

const source = readFileSync(
  join(import.meta.dirname, "global-error.tsx"),
  "utf8",
)
const { default: GlobalErrorPage } = await import("./global-error")

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const GlobalError = GlobalErrorPage as ComponentType<GlobalErrorProps>

function renderGlobalError(error: Error & { digest?: string }) {
  return renderToStaticMarkup(
    createElement(GlobalError, { error, reset: () => {} }),
  )
}

test("is a client component that reloads via window.location.reload", () => {
  expect(source).toMatch(/^["']use client["']/)
  expect(source).toMatch(/window\.location\.reload\s*\(\s*\)/)
  expect(source).toMatch(/import\s+["']\.\/globals\.css["']/)
  expect(source).toMatch(/\bDM_Sans\b/)
  expect(source).toMatch(/\bOswald\b/)
  expect(source).toMatch(/--font-sans/)
  expect(source).toMatch(/--font-display/)
  expect(source).toMatch(/\bfull-viewport\b/)
  expect(source).not.toMatch(/\breset\s*\(/)
  expect(source).not.toMatch(/\bretry\s*\(/)
})

test("renders minimal document with site name, copy, and Home anchor", () => {
  const html = renderGlobalError(new Error("secret-marker"))

  expect(html).toMatch(/<html[^>]*lang="en"/)
  expect(html).toMatch(
    /class="[^"]*\bfont-sans\b[^"]*\b__variable_sans\b[^"]*\b__variable_display\b/,
  )
  expect(html).toContain("<body>")
  expect(html).toContain("<title>Something went wrong</title>")
  expect(html).toContain(church.name)
  expect(html).toContain("<h1")
  expect(html).toContain("Something went wrong")
  expect(html).toContain(
    "This page couldn&#x27;t load. Reload it, or return to Home.",
  )
  expect(html).toContain("Reload page")
  expect(html).toContain("<button")
  expect(html).toContain('href="/"')
  expect(html).toContain("Return to Home")
  expect(html).toMatch(/<a[^>]*href="\/"[^>]*>\s*Return to Home\s*<\/a>/)
  expect(html).toMatch(
    /class="[^"]*\bshell-page\b[^"]*\bfull-viewport\b[^"]*\bpage-width\b/,
  )
  expect(html).not.toMatch(/<main\b/i)
  expect(html).not.toContain('id="main-content"')
})

test("never renders error message, name, or digest", () => {
  const error = Object.assign(new Error("secret-marker"), {
    name: "LeakedErrorName",
    digest: "digest-leak-token",
  })
  const html = renderGlobalError(error)

  expect(html).not.toContain("secret-marker")
  expect(html).not.toContain("LeakedErrorName")
  expect(html).not.toContain("digest-leak-token")
})
