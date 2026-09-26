"use client"

import { DM_Sans, Oswald } from "next/font/google"

import { church } from "@/content/home"
import { cn } from "@/lib/utils"

import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const oswald = Oswald({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-display",
  display: "swap",
})

export default function GlobalError() {
  return (
    <html
      lang="en"
      className={cn("font-sans", dmSans.variable, oswald.variable)}
    >
      <body>
        <title>Something went wrong</title>
        <div className="shell-page full-viewport page-width">
          <p>{church.name}</p>
          <h1>Something went wrong</h1>
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
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error replaces root layout */}
            <a href="/" className="text-link">
              Return to Home
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}
