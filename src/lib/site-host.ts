import { ContentInvariantError } from "@/lib/errors"

function resolveSiteHost(): string {
  const host =
    process.env.NEXT_PUBLIC_SITE_HOST ||
    (process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : undefined) ||
    process.env.VERCEL_URL

  if (host) return host

  if (process.env.VERCEL) {
    throw new ContentInvariantError({
      module: "src/lib/site-host.ts",
      rule: "site-host-required",
      message: "Site host is empty in a Vercel build",
    })
  }

  return "localhost:3000"
}

export const siteHost = resolveSiteHost()
