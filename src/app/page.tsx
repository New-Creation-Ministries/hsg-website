import Image from "next/image"

import { home } from "@/content/home"

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <h1>
        <Image
          src="/brand/hsg-logo.jpg"
          alt={home.name}
          width={1024}
          height={592}
          priority
          className="logo-mark h-auto w-[min(100%,40rem)]"
        />
      </h1>
      <p className="mt-2 max-w-[36rem] text-center font-sans text-lg leading-relaxed text-foreground">
        {home.summary}
      </p>
    </main>
  )
}
