import { afterEach, beforeEach, expect, test, vi } from "vitest"

async function loadSiteHost(): Promise<string> {
  const { siteHost } = await import("@/lib/site-host")
  return siteHost
}

function clearHostEnv() {
  vi.stubEnv("NEXT_PUBLIC_SITE_HOST", "")
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "")
  vi.stubEnv("VERCEL_URL", "")
  vi.stubEnv("VERCEL_ENV", "")
  vi.stubEnv("VERCEL", "")
}

beforeEach(() => {
  vi.resetModules()
  clearHostEnv()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

test("uses NEXT_PUBLIC_SITE_HOST when set", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_HOST", "church.example")
  vi.stubEnv("VERCEL_ENV", "production")
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "prod.vercel.app")
  vi.stubEnv("VERCEL_URL", "preview.vercel.app")

  expect(await loadSiteHost()).toBe("church.example")
})

test("uses VERCEL_PROJECT_PRODUCTION_URL when VERCEL_ENV is production", async () => {
  vi.stubEnv("VERCEL_ENV", "production")
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "prod.vercel.app")
  vi.stubEnv("VERCEL_URL", "preview.vercel.app")

  expect(await loadSiteHost()).toBe("prod.vercel.app")
})

test("uses VERCEL_URL on preview when production URL is not selected", async () => {
  vi.stubEnv("VERCEL_ENV", "preview")
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "prod.vercel.app")
  vi.stubEnv("VERCEL_URL", "preview.vercel.app")

  expect(await loadSiteHost()).toBe("preview.vercel.app")
})

test("falls back to localhost:3000 outside Vercel", async () => {
  expect(await loadSiteHost()).toBe("localhost:3000")
})

test("throws ContentInvariantError when host is empty in a Vercel build", async () => {
  vi.stubEnv("VERCEL", "1")

  const { ContentInvariantError } = await import("@/lib/errors")
  const loading = loadSiteHost()
  await expect(loading).rejects.toBeInstanceOf(ContentInvariantError)
  await expect(loading).rejects.toMatchObject({
    name: "ContentInvariantError",
    code: "content_invariant_violated",
    module: "src/lib/site-host.ts",
    rule: "site-host-required",
  })
})
