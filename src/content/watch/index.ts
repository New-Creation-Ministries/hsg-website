export type WatchTestimony = {
  name: string
  url: string
  title: string
  writeup: string
  thumbnailUrl: string
}

export type WatchPlaylistTheme = {
  name: string
  playlistId: string
}

export type WatchScripture = {
  citation: string
  text: string
}

export const featuredTestimoniesScripture: WatchScripture = {
  citation: "Hebrews 2:4",
  text: "God also bearing them witness, both with signs and wonders, and with divers miracles, and gifts of the Holy Ghost",
}

export const testimonies: WatchTestimony[] = [
  {
    name: "4th Stage Lung Cancer Healed",
    url: "https://www.instagram.com/reel/DT-AMm_kewV/",
    title: "4th Stage Lung Cancer Healed",
    writeup:
      "This brother had a collapsed lung. He was unable to walk but can now run also and is able to go to gym. Hallelujah!",
    thumbnailUrl: "/watch/thangaraj.jpg",
  },
  {
    name: "4th Stage Brain Cancer Healed",
    url: "https://www.instagram.com/reel/DQ__yFACVim/",
    title: "4th Stage Brain Cancer Healed",
    writeup:
      "This girl was suffering severely from Brain Cancer. The Lord healed her completely and she is now able to go to school and enjoy life!",
    thumbnailUrl: "/watch/poorvika.jpg",
  },
  {
    name: "Creative Miracle",
    url: "https://www.instagram.com/reel/DSaHC9JEmiz/",
    title: "Is there anything too hard for the Lord?",
    writeup:
      "This little child was missing an organ from birth. But after prayer, the organ grew back miraculously!",
    thumbnailUrl: "/watch/creative-miracle.jpg",
  },
  {
    name: "Cervical Disk Bulge Healed",
    url: "https://www.instagram.com/reel/DP3qzsLiVuB/",
    title: "Cervical Disk Bulge Healed",
    writeup:
      "Worked in an operation theatre and suffered a cervical disc bulge. The left side of the body would not move. Look what the Lord has done. Hallelujah.",
    thumbnailUrl: "/watch/cervical-disk-bulge.jpg",
  },
]

export const playlistThemes: WatchPlaylistTheme[] = [
  {
    name: "Healing",
    playlistId: "PL4sLZ9xdjDfid3If1uvOqlTz9WvGYTN1A",
  },
  {
    name: "Live in Health",
    playlistId: "PLKz6Hr2fQ7Nc",
  },
  {
    name: "Restoration and Recovery",
    playlistId: "PLTXk7vAHmkA0",
  },
  {
    name: "Grow in the Word",
    playlistId: "PL5ah6Wbjftr5aLfOd-3F9nSJiG12XRW5f",
  },
  {
    name: "Conquer Fear",
    playlistId: "PL5ah6Wbjftr4tGpaloXOehqpXB6KwY3zI",
  },
  {
    name: "Mental Health",
    playlistId: "PLWX7FFgYGzyU",
  },
  {
    name: "Excellent Life",
    playlistId: "PLC1s9kXkw278",
  },
  {
    name: "Free sermons",
    playlistId: "PLP2xTHxGd68s",
  },
]
