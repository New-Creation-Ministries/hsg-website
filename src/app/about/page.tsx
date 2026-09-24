import type { Metadata } from "next"

import { AboutSceneDots } from "@/components/about-scene-dots"
import {
  scenes,
  storyContinuesAddress,
  storyContinuesServices,
  type AboutScene,
} from "@/content/about"

export const metadata: Metadata = { title: "About" }

const sceneDots = scenes.map((scene) => ({
  id: scene.id,
  label: scene.heading,
}))

function ScenePlate({ scene }: { scene: AboutScene }) {
  if (!scene.plate) {
    return (
      <div className="plate band">
        <div className="times">
          {storyContinuesServices.map((item) => {
            const [language, time] = (item.text ?? "").split("\n")
            return (
              <article key={item.title}>
                <h3>{item.title}</h3>
                {language ? <p className="service-language">{language}</p> : null}
                {time ? <p>{time}</p> : null}
              </article>
            )
          })}
        </div>
        <p className="address">{storyContinuesAddress}</p>
      </div>
    )
  }

  return (
    <div
      className="plate"
      style={{ backgroundImage: `url(${scene.plate.src})` }}
      role="img"
      aria-label={scene.plate.alt}
    />
  )
}

export default function Page() {
  return (
    <main id="main-content" className="about-scenes" tabIndex={-1}>
      <AboutSceneDots scenes={sceneDots} />
      {scenes.map((scene, index) => (
        <section className="scene" id={scene.id} key={scene.id}>
          <div className="copy">
            {index === 0 ? (
              <h1 tabIndex={-1}>{scene.heading}</h1>
            ) : (
              <h2>{scene.heading}</h2>
            )}
            {scene.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ScenePlate scene={scene} />
        </section>
      ))}
    </main>
  )
}
