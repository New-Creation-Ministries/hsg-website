"use client"

import { usePathname } from "next/navigation"

import { SiteFooter } from "@/components/site-footer"

export function SiteFooterGate() {
  const pathname = usePathname()
  if (pathname === "/contact") return null
  return <SiteFooter />
}
