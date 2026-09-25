import type { Metadata } from "next"
import { DM_Sans, Oswald } from "next/font/google"

import { church, leader } from "@/content/home"
import { SiteFooterGate } from "@/components/site-footer-gate"
import { SiteHeader } from "@/components/site-header"
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

export const metadata: Metadata = {
  title: { default: church.name, template: `%s | ${church.name}` },
  description: leader.blurb,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("font-sans", dmSans.variable, oswald.variable)}
    >
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <SiteHeader />
        {children}
        <SiteFooterGate />
      </body>
    </html>
  )
}
