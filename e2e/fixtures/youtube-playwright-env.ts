import { join } from "node:path"
import { pathToFileURL } from "node:url"

export function youtubeFeedNodeOptions(
  existingNodeOptions = process.env.NODE_OPTIONS,
): string {
  const youtubeFetchPreload = pathToFileURL(
    join(process.cwd(), "e2e/fixtures/youtube-fetch.mjs"),
  ).href
  return [existingNodeOptions, `--import ${youtubeFetchPreload}`]
    .filter(Boolean)
    .join(" ")
}
