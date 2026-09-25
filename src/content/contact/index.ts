import { helpBar, type GiveContact } from "../give"
import { pageNotes } from "../home"

export type ContactDirections = {
  label: string
  href: string
}

export type ContactVisit = {
  eyebrow: string
  headline: string
  address: string
  directions: ContactDirections
}

export type ContactArrivalTextFact = {
  kind: "text"
  text: string
}

export type ContactArrivalLinkFact = {
  kind: "link"
  text: string
  href: string
}

export type ContactArrivalFact =
  | ContactArrivalTextFact
  | ContactArrivalLinkFact

export type ContactArrival = {
  heading: string
  facts: ContactArrivalFact[]
}

export type ContactSocialWithHref = {
  kind: "link"
  label: string
  href: string
}

export type ContactSocialLabelOnly = {
  kind: "label"
  label: string
}

export type ContactSocial = ContactSocialWithHref | ContactSocialLabelOnly

export type ContactStrip = {
  phone: GiveContact
  email: GiveContact
  socials: ContactSocial[]
}

export const visit: ContactVisit = {
  eyebrow: "VISIT HSG",
  headline: "COME AND RECEIVE YOUR MIRACLE",
  address: pageNotes.address,
  directions: {
    label: "GET DIRECTIONS",
    href: "https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KUmCSu__Ga47McXkTAwuEFl1&daddr=NC+Arena+%233+Near+Legacy+School+%26+Moto+Mind+Shop+Byrithi,+Village,+Kothanur,+Bengaluru,+Karnataka+560077",
  },
}

export const arrival: ContactArrival = {
  heading: "WHEN YOU ARRIVE",
  facts: [
    { kind: "text", text: "Go in past the Bosch showroom." },
    {
      kind: "text",
      text: "Two-wheeler parking is in front of Bosch on Sundays.",
    },
    {
      kind: "text",
      text: "Four-wheeler parking is in the ground opposite, next to Sam Palace.",
    },
    {
      kind: "text",
      text: "Fill a healing card for healing prayer in the second service starting 8am.",
    },
    {
      kind: "text",
      text: "Healing team counter is in the ground outside the church hall.",
    },
    {
      kind: "text",
      text: "Wheelchairs are provided if needed.",
    },
    {
      kind: "text",
      text: "Please meet volunteers if this is your first visit.",
    },
    { kind: "text", text: "Lunch is provided after the service." },
    {
      kind: "text",
      text: "We are pioneering the use of AI for live translation to all languages.",
    },
    {
      kind: "link",
      text: "Use this link for AI Translation",
      href: "https://glossa.live/holy-spirit-generation",
    },
  ],
}

export const contactStrip: ContactStrip = {
  phone: helpBar.phone,
  email: helpBar.email,
  socials: [
    {
      kind: "link",
      label: "YouTube",
      href: "https://www.youtube.com/c/EvangelistRambabuRambo",
    },
    {
      kind: "link",
      label: "Instagram",
      href: "https://www.instagram.com/holyspiritgeneration777/",
    },
    { kind: "label", label: "WhatsApp" },
  ],
}
