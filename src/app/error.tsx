"use client"

import Link from "next/link"

export default function Error() {
  return (
    <main id="main-content" className="shell-page page-width" tabIndex={-1}>
      <title>Something went wrong</title>
      <h1 tabIndex={-1}>Something went wrong</h1>
      <p>This page couldn&apos;t load. Reload it, or return to Home.</p>
      <p>
        <button
          type="button"
          className="text-link"
          onClick={() => {
            window.location.reload()
          }}
        >
          Reload page
        </button>
      </p>
      <p>
        <Link href="/" className="text-link">
          Return to Home
        </Link>
      </p>
    </main>
  )
}
