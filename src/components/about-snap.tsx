"use client"

import { useEffect } from "react"

export function AboutSnap() {
  useEffect(() => {
    const root = document.documentElement
    const scroller = document.scrollingElement
    if (!scroller) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const arm = () => {
      root.classList.add("about-snapping")
    }

    const onScroll = () => {
      if (scroller.scrollTop > 4) arm()
    }

    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "PageDown" ||
        event.key === "PageUp" ||
        event.key === " "
      ) {
        arm()
      }
    }

    if (scroller.scrollTop > 4) arm()
    scroller.addEventListener("scroll", onScroll, { passive: true })
    scroller.addEventListener("wheel", arm, { passive: true })
    scroller.addEventListener("touchmove", arm, { passive: true })
    window.addEventListener("keydown", onKey)

    return () => {
      root.classList.remove("about-snapping")
      scroller.removeEventListener("scroll", onScroll)
      scroller.removeEventListener("wheel", arm)
      scroller.removeEventListener("touchmove", arm)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  return null
}
