import { ContentInvariantError } from "@/lib/errors"

import { sections as homeSections, type HomeItem } from "../home"

export type AboutPlate = {
  src: string
  alt: string
}

export type AboutScene = {
  id: string
  heading: string
  paragraphs: string[]
  plate?: AboutPlate
}

const newToHsg = homeSections.find(
  (section) => section.heading === "New to HSG?",
)

if (!newToHsg) {
  throw new ContentInvariantError({
    module: "src/content/about/index.ts",
    rule: "new-to-hsg-section",
    message: 'Home is missing the "New to HSG?" section',
  })
}

/** Home “New to HSG?” items — single source; do not copy service facts here. */
export const storyContinuesServices: HomeItem[] = newToHsg.items

export const storyContinuesIntro =
  "Join us every Sunday as we gather to worship together."

export const storyContinuesAddress =
  "We don't do Church together, We do Life together"

export const scenes: AboutScene[] = [
  {
    id: "founders",
    heading: "Founders",
    paragraphs: [
      "Apostle Dr. P. S. Rambabu and Vinita Rambabu are the founders of Rambo World Outreach, also known as New Creation Ministries. A ministry that has been passionately taking the glorious Gospel of the Lord Jesus Christ to the whole world with undeniable signs, miracles, and wonders accompanying.",
      "He and his wife serve as spiritual parents and mentors to many in the Lord, and they are dedicated to empowering believers all over the world to walk in faith in God’s Word.",
    ],
    plate: {
      src: "/about/founders.jpg",
      alt: "Apostle Dr. P. S. Rambabu and Pastor Vinita Rambabu",
    },
  },
  {
    id: "born-again",
    heading: "Born Again",
    paragraphs: [
      "Apostle Rambabu was born into a well-to-do and well-educated family in Bellary. In his teens he expressed hatred towards Christ and tore and burnt many Bibles. In 1983 he took a mute Muslim girl to a Christian meeting to challenge Jesus if He could heal her.",
      "God healed her. After that miracle he was born again, gave his life to Jesus, was disowned by his family, and kept preaching in streets, schools, and villages, riding a bicycle and sleeping in railway stations.",
    ],
    plate: {
      src: "/about/born-again.jpg",
      alt: "Apostle Rambabu seated among wheelchairs on a worship platform",
    },
  },
  {
    id: "the-call",
    heading: "The call",
    paragraphs: [
      "After graduating in mechanical engineering, he kept preaching Christ while working as a lecturer in an engineering college at Bellary.",
      "In 1989 he heard a call from God to serve Him full-time. He set out to preach the gospel to all the nations, determined to let the world know that Jesus is Lord.",
    ],
    plate: {
      src: "/about/the-call.jpg",
      alt: "Hands raised in worship",
    },
  },
  {
    id: "nations",
    heading: "Gospel to the Nations",
    paragraphs: [
      "Open-air Gospel campaigns followed, across India and the world, with hundreds of thousands in attendance. He has preached in 89 nations, including endangered and unreached places, with miracles, words of knowledge, and the gifts of the Holy Spirit.",
    ],
    plate: {
      src: "/about/nations.jpg",
      alt: "Apostle Rambabu preaching at a night meeting, with empty wheelchairs on the platform",
    },
  },
  {
    id: "church",
    heading: "The Church",
    paragraphs: [
      "Apostle Dr. P. S. Rambabu and Pastor Vinita Rambabu are the founders and senior pastors of Holy Spirit Generation, a vibrant, Word-based, Spirit-filled church where the supernatural lifestyle is a norm, and it is one of the fastest-growing churches in India.",
      "They equip believers in the Word of faith and the supernatural power of God, to raise up disciples who preach the gospel.",
    ],
    plate: {
      src: "/about/church.jpg",
      alt: "Apostle Rambabu standing beside wheelchairs, walkers, and crutches",
    },
  },
  {
    id: "story-continues",
    heading: "The story continues",
    paragraphs: [storyContinuesIntro],
  },
]
