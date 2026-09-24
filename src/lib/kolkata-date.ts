const dateKeyFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** `YYYY-MM-DD` for an instant in Asia/Kolkata. */
export function kolkataDateKey(iso: string): string {
  const parts = dateKeyFormatter.formatToParts(new Date(iso))
  const year = parts.find((part) => part.type === "year")?.value ?? ""
  const month = parts.find((part) => part.type === "month")?.value ?? ""
  const day = parts.find((part) => part.type === "day")?.value ?? ""
  return `${year}-${month}-${day}`
}
