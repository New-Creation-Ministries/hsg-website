import { renderToStaticMarkup } from "react-dom/server"
import { expect, test, vi } from "vitest"

vi.mock("next/link", () => ({
  default: function Link({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))

const { default: NotFound, metadata } = await import("./not-found")

test("metadata title is Page not found", () => {
  expect(metadata.title).toBe("Page not found")
})

test("renders not-found copy, Home link, and main landmark", () => {
  const html = renderToStaticMarkup(<NotFound />)

  expect(html).toContain("<h1")
  expect(html).toContain("Page not found")
  expect(html).toContain(
    "This page isn&#x27;t here. Use the menu to find what you were looking for, or return to Home.",
  )
  expect(html).toContain('href="/"')
  expect(html).toContain("Return to Home")
  expect(html).toMatch(
    /<main[^>]*id="main-content"[^>]*class="[^"]*\bpage-width\b[^"]*"[^>]*tabindex="-1"/i,
  )
  expect(html).not.toContain("<button")
})
