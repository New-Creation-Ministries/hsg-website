import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <main id="main-content" className="shell-page page-width" tabIndex={-1}>
      <h1 tabIndex={-1}>Page not found</h1>
      <p>
        This page isn&apos;t here. Use the menu to find what you were looking for,
        or return to Home.
      </p>
      <p>
        <Link href="/" className="text-link">
          Return to Home
        </Link>
      </p>
    </main>
  )
}
