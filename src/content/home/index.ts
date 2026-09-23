export type HomeItem = {
  title: string
  text?: string
  href?: string
}

export type HomeSection = {
  heading: string
  intro?: string
  items: HomeItem[]
  more: { label: string; href: string }
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
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Praise Reports", href: "/praise-reports" },
  { label: "Watch", href: "/watch" },
  { label: "Contact Us", href: "/contact" },
  { label: "Give", href: "/give" },
] as const

export const pageNotes = {
  testimonies: "Stories adapted from Rambo World Outreach.",
  sunday: "Sunday services · Bengaluru local time",
  ministry: "New Creation Ministries",
  address:
    "NC Arena #3 Near Legacy School & Moto Mind Shop Byrithi, Village, Kothanur, Bengaluru, Karnataka 560077",
} as const

export const sermonPlaylistId = "PLWX7FFgYGzyU"

export const sections: HomeSection[] = [
  {
    heading: "What’s going on",
    items: [
      { title: "Highlight to be published" },
      { title: "Highlight to be published" },
      { title: "Highlight to be published" },
    ],
    more: { label: "Events", href: "/events" },
  },
  {
    heading: "Highlighted testimonies",
    items: [
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
    more: { label: "Praise Reports", href: "/praise-reports" },
  },
  {
    heading: "Sermons",
    intro:
      "My son, attend to my words; incline thine ear unto my sayings. Let them not depart from thine eyes; keep them in the midst of thine heart.",
    items: [{ title: "Proverbs 4:20-21" }],
    more: { label: "Watch", href: "/watch" },
  },
  {
    heading: "New to HSG",
    intro: "Join us every Sunday.",
    items: [
      { title: "Word Fest Service", text: "English\n8–9am" },
      {
        title: "Miracles and Healing Service",
        text: "Multilingual\n9:30am onwards",
      },
    ],
    more: { label: "Contact Us", href: "/contact" },
  },
]
