"use client"

import Image from "next/image"
import { useState } from "react"

type Portrait = { src: string; alt: string } | null

export function PortraitField({ portrait }: { portrait: Portrait }) {
  const [failed, setFailed] = useState(false)
  const showImage = portrait !== null && !failed

  if (showImage) {
    return (
      <div className="portrait-field">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes="(min-width: 801px) 280px, 70vw"
          className="leader-portrait"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  return (
    <div className="portrait-field" aria-hidden="true">
      <span className="monogram">HSG</span>
    </div>
  )
}
