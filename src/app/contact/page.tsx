import type { Metadata } from "next"

export const metadata: Metadata = { title: "Contact Us" }

export default function Page() {
  return (
    <main id="main-content" className="shell-page page-width" tabIndex={-1}>
      <h1 tabIndex={-1}>Contact Us</h1>
      <p>This page will be published here.</p>
    </main>
  )
}
