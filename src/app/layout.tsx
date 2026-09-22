import type { Metadata } from "next"
import { Fraunces } from "next/font/google"

import { home } from "@/content/home"
import { cn } from "@/lib/utils"

import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: home.name,
  description: home.summary,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("font-sans", fraunces.variable)}>
      <body>{children}</body>
    </html>
  )
}
