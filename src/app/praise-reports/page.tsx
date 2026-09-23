import type { Metadata } from "next"

export const metadata: Metadata = { title: "Praise Reports" }

export default function Page() {
  return (
    <main id="main-content" className="shell-page page-width" tabIndex={-1}>
      <h1 tabIndex={-1}>Praise Reports</h1>
      <p>This page will be published here.</p>
    </main>
  )
}
