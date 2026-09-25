export type GiveScripture = {
  text: string
  citation: string
}

export type GiveWhyWeGive = {
  heading: string
  body: string
}

export type GiveCta = {
  label: string
  href: string
}

export type GiveContact = {
  display: string
  href: string
}

export type GiveHelpBar = {
  label: string
  phone: GiveContact
  email: GiveContact
}

export const scripture: GiveScripture = {
  text: "But this I say, He which soweth sparingly shall reap also sparingly; and he which soweth bountifully shall reap also bountifully.",
  citation: "2 CORINTHIANS 9:6 • KJV",
}

export const whyWeGive: GiveWhyWeGive = {
  heading: "Why we give",
  body: "God is generous and so he calls us to be as well. What we do with what God has given us shows the world where our hearts are at and helps proclaim the gospel. We want to glorify God with every area of our lives, and that includes what we do with our finances.",
}

export const giveCta: GiveCta = {
  label: "GIVE",
  href: "https://rzp.io/rzp/JKx5HhpN",
}

export const helpBar: GiveHelpBar = {
  label: "Have questions or need help?",
  phone: {
    display: "+91-9036 060 480",
    href: "tel:+919036060480",
  },
  email: {
    display: "support@rwo.life",
    href: "mailto:support@rwo.life",
  },
}
