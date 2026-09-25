export type HomeItem = {
  title: string
  text?: string
  href?: string
}

export type HomeSection = {
  heading: string
  intro?: string
  items: HomeItem[]
  more?: { label: string; href: string }
}

export const church = {
  name: "Holy Spirit Generation",
} as const

export const leader = {
  name: "Apostle Dr. P. S. Rambabu",
  blurb:
    "A Word-based, Spirit-filled church in Bengaluru, founded and led by Apostle Dr. P. S. Rambabu and Pastor Vinita Rambabu.",
  portrait: null as null | { src: string; alt: string },
}

export const nav = [
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Watch", href: "/watch" },
  { label: "Contact Us", href: "/contact" },
  { label: "Give", href: "/give" },
] as const

export const pageNotes = {
  testimonies: "Stories adapted from Rambo World Outreach.",
  sunday: "Sunday services · Namma Bengaluru",
  ministry: "New Creation Ministries",
  address:
    "NC Arena #3 Near Legacy School & Moto Mind Shop Byrithi, Village, Kothanur, Bengaluru, Karnataka 560077",
} as const

export const sermonPlaylistId = "PLWX7FFgYGzyU"

export const sermonPlaylistUnavailable = {
  message: "Sermons are temporarily unavailable here.",
  linkLabel: "Listen to the word on Youtube",
} as const

export function sermonPlaylistUrl(playlistId: string = sermonPlaylistId): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`
}

export const sections: HomeSection[] = [
  {
    heading: "What’s going on",
    items: [
      {
        title: "Acts 2:46 (AMP)",
        text: "And day after day they regularly assembled in the temple with united purpose... with gladness and simplicity and generous hearts",
      },
    ],
    more: { label: "Events", href: "/events" },
  },
  {
    heading: "Highlighted testimonies",
    items: [
      {
        title: "Hebrews 2:4 (KJV)",
        text: "God also bearing them witness, both with signs and wonders, and with divers miracles, and gifts of the Holy Ghost",
      },
      {
        title: "Healing story from Sherman, Illinois",
        text: "A woman had lived for three decades with double scoliosis, a missing rib, and four back surgeries.",
      },
      {
        title: "Testimony from California",
        text: "A woman had severe migraine for seven years and could not bear sunlight or ordinary sound. Apostle Rambabu laid hands on her and said “Restore,” and the migraine ended.",
      },
      {
        title: "Miracle from Dallas",
        text: "A woman had been deaf in her left ear since childhood. She began to hear after Apostle Rambabu called out her condition and cast his shadow on her.",
      },
    ],
  },
  {
    heading: "New to HSG?",
    intro:
      "Join us every Sunday to worship the Lord together and celebrate his goodness in our lives",
    items: [
      { title: "Word Fest Service", text: "English\n08:00–09:00" },
      {
        title: "Miracles and Healing Service",
        text: "Multilingual\n09:30 onwards",
      },
    ],
    more: { label: "Know More", href: "/contact" },
  },
  {
    heading: "Sermons",
    intro:
      "My son, attend to my words; incline thine ear unto my sayings. Let them not depart from thine eyes; keep them in the midst of thine heart.",
    items: [{ title: "Proverbs 4:20-21" }],
    more: { label: "Watch", href: "/watch" },
  },
]
