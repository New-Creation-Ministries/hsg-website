import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"

import { expect, test } from "vitest"

const srcRoot = join(import.meta.dirname)

type SourceFile = {
  path: string
  relativePath: string
  source: string
}

function isTestFile(name: string): boolean {
  return name.includes(".test.")
}

function collectSourceFiles(dir: string): SourceFile[] {
  const files: SourceFile[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath))
      continue
    }
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) continue
    if (isTestFile(entry.name)) continue
    files.push({
      path: fullPath,
      relativePath: relative(srcRoot, fullPath).split("\\").join("/"),
      source: readFileSync(fullPath, "utf8"),
    })
  }
  return files
}

const sources = collectSourceFiles(srcRoot)

function matchesInSources(pattern: RegExp): string[] {
  return sources
    .filter((file) => pattern.test(file.source))
    .map((file) => file.relativePath)
}

function extractCatchBodies(source: string): string[] {
  const bodies: string[] = []
  const catchStart = /\bcatch\b/g
  let match: RegExpExecArray | null
  while ((match = catchStart.exec(source)) !== null) {
    let i = match.index + match[0].length
    while (i < source.length && /\s/.test(source[i] ?? "")) i += 1

    if (source[i] === "(") {
      let depth = 1
      i += 1
      while (i < source.length && depth > 0) {
        const ch = source[i]
        if (ch === "(") depth += 1
        else if (ch === ")") depth -= 1
        i += 1
      }
      while (i < source.length && /\s/.test(source[i] ?? "")) i += 1
    }

    if (source[i] !== "{") continue

    let depth = 1
    const bodyStart = i + 1
    i += 1
    while (i < source.length && depth > 0) {
      const ch = source[i]
      if (ch === "{") depth += 1
      else if (ch === "}") depth -= 1
      i += 1
    }
    bodies.push(source.slice(bodyStart, i - 1))
  }
  return bodies
}

function catchBodiesMissingInstanceofOrThrow(): string[] {
  const offenders: string[] = []
  for (const file of sources) {
    for (const [index, body] of extractCatchBodies(file.source).entries()) {
      if (/\binstanceof\b/.test(body) || /\bthrow\b/.test(body)) continue
      offenders.push(`${file.relativePath}#catch[${index}]`)
    }
  }
  return offenders
}

function readRouteSource(relativePath: string): string {
  const file = sources.find((entry) => entry.relativePath === relativePath)
  expect(file, `missing route source ${relativePath}`).toBeDefined()
  return file!.source
}

test("src production sources omit force-dynamic", () => {
  expect(matchesInSources(/force-dynamic/)).toEqual([])
})

test("Home, Events, and Watch export the spec revalidate values", () => {
  expect(readRouteSource("app/page.tsx")).toMatch(
    /export\s+const\s+revalidate\s*=\s*3600\b/,
  )
  expect(readRouteSource("app/events/page.tsx")).toMatch(
    /export\s+const\s+revalidate\s*=\s*3600\b/,
  )
  expect(readRouteSource("app/watch/page.tsx")).toMatch(
    /export\s+const\s+revalidate\s*=\s*300\b/,
  )
})

test('src production sources omit from "next/headers"', () => {
  expect(matchesInSources(/from\s+["']next\/headers["']/)).toEqual([])
})

test("src production sources omit throw new Error(", () => {
  expect(matchesInSources(/throw\s+new\s+Error\s*\(/)).toEqual([])
})

test("every catch block includes instanceof or throw", () => {
  expect(catchBodiesMissingInstanceofOrThrow()).toEqual([])
})

test('src production sources omit cache: "no-store"', () => {
  expect(matchesInSources(/cache\s*:\s*["']no-store["']/)).toEqual([])
})
