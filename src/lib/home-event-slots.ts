import type { EventRecord } from "@/content/events"
import type { HomeItem } from "@/content/home"

import { listUpcoming, type UpcomingEventRow } from "./event-list"

export type HomeDatedSlot = {
  kind: "dated"
  name: string
  whenLine: string
}

export type HomeServiceSlot = {
  kind: "service"
  name: string
  language: string
  time: string
}

export type HomeEventSlot = HomeDatedSlot | HomeServiceSlot

function datedSlot(row: UpcomingEventRow): HomeDatedSlot {
  return { kind: "dated", name: row.name, whenLine: row.whenLine }
}

function serviceSlot(item: HomeItem): HomeServiceSlot {
  const [language = "", time = ""] = (item.text ?? "").split("\n")
  return { kind: "service", name: item.title, language, time }
}

function findService(services: HomeItem[], title: string): HomeServiceSlot {
  const item = services.find((service) => service.title === title)
  if (!item) {
    throw new Error(`Missing New to HSG? service: ${title}`)
  }
  return serviceSlot(item)
}

export function homeEventSlots(
  events: EventRecord[],
  services: HomeItem[],
  now: Date,
): [HomeEventSlot, HomeEventSlot] {
  const upcoming = listUpcoming(events, now)
  const featured = upcoming.filter((row) => row.featured)
  const rest = upcoming.filter((row) => !row.featured)

  if (featured.length >= 2) {
    return [datedSlot(featured[0]!), datedSlot(featured[1]!)]
  }
  if (featured.length === 1) {
    return [
      datedSlot(featured[0]!),
      findService(services, "Miracles and Healing Service"),
    ]
  }
  if (rest.length >= 2) {
    return [datedSlot(rest[0]!), datedSlot(rest[1]!)]
  }
  if (rest.length === 1) {
    return [
      datedSlot(rest[0]!),
      findService(services, "Miracles and Healing Service"),
    ]
  }
  return [
    findService(services, "Miracles and Healing Service"),
    findService(services, "Word Fest Service"),
  ]
}
