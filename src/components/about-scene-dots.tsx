"use client"

import { useEffect, useState } from "react"

export type AboutSceneDot = {
  id: string
  label: string
}

export function AboutSceneDots({ scenes }: { scenes: AboutSceneDot[] }) {
  const [currentId, setCurrentId] = useState(scenes[0]?.id ?? "")

  useEffect(() => {
    const nodes = scenes
      .map((scene) => document.getElementById(scene.id))
      .filter((node): node is HTMLElement => node !== null)

    if (nodes.length === 0) return

    const ratios = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        let bestId = ""
        let bestRatio = -1
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }
        if (bestId) setCurrentId((current) => (current === bestId ? current : bestId))
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [scenes])

  return (
    <nav className="about-scene-dots" aria-label="Scenes">
      {scenes.map((scene) => (
        <a
          key={scene.id}
          href={`#${scene.id}`}
          aria-current={currentId === scene.id ? "true" : undefined}
        >
          <span className="sr-only">{scene.label}</span>
        </a>
      ))}
    </nav>
  )
}
