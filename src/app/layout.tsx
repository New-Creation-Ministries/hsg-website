import type { Metadata } from "next"
import { Fraunces } from "next/font/google"

import { church, leader } from "@/content/home"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: church.name, template: `%s | ${church.name}` },
  description: leader.blurb,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("font-sans", fraunces.variable)}>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
