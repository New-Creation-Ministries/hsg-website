"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { church, nav } from "@/content/home"

export function SiteHeader() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const menu = useRef<HTMLButtonElement>(null)
  const navigation = useRef<HTMLElement>(null)
  const pendingPath = useRef<string | null>(null)

  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)")
    function resize() {
      const focused = document.activeElement
      if (query.matches) {
        if (focused === menu.current) {
          navigation.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus()
        }
        setExpanded(false)
      } else {
        setExpanded(Boolean(focused && navigation.current?.contains(focused)))
      }
    }
    query.addEventListener("change", resize)
    return () => query.removeEventListener("change", resize)
  }, [])

  useEffect(() => {
    function navigate(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest("a") : null
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return
      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin || url.hash) return
      if (url.pathname === pathname && url.search === window.location.search) {
        event.preventDefault()
        if (navigation.current?.contains(anchor) && !window.matchMedia("(min-width: 64rem)").matches) menu.current?.focus()
      } else {
        pendingPath.current = url.pathname
      }
      setExpanded(false)
    }
    function restoreHistory() {
      pendingPath.current = null
    }
    document.addEventListener("click", navigate, true)
    window.addEventListener("popstate", restoreHistory)
    return () => {
      document.removeEventListener("click", navigate, true)
      window.removeEventListener("popstate", restoreHistory)
    }
  }, [pathname])

  useEffect(() => {
    if (pendingPath.current !== pathname) return
    pendingPath.current = null
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return (
    <header className="site-header">
      <Link href="/" className="brand-link" aria-label={church.name}>
        <Image src="/brand/hsg-logo.jpg" alt="" width={1024} height={592} className="logo-mark header-mark" />
        <span>{church.name}</span>
      </Link>
      <button
        ref={menu}
        className="menu-toggle"
        aria-expanded={expanded}
        aria-controls="public-navigation"
        onClick={() => setExpanded((value) => !value)}
      >
        Menu
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d={expanded ? "M4 4l8 8M12 4l-8 8" : "M2 5h12M2 11h12"} stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <nav
        ref={navigation}
        id="public-navigation"
        aria-label="Main navigation"
        className="public-navigation"
        data-expanded={expanded}
        onKeyDown={(event) => {
          if (event.key === "Escape" && expanded) {
            event.preventDefault()
            setExpanded(false)
            menu.current?.focus()
          }
        }}
      >
        <ul>{nav.map(({ label, href }) => (
          <li key={href}><Link href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link></li>
        ))}</ul>
      </nav>
    </header>
  )
}
