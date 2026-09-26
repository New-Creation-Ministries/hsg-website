export type ExternalDependency =
  | "youtube-playlist"
  | "youtube-live"
  | "youtube-oembed"

export type ExternalReadFailureCategory =
  | "http"
  | "timeout"
  | "network"
  | "invalid-feed"

export type YoutubePlaylistReadFailureCategory = ExternalReadFailureCategory

type SiteErrorOptions = {
  message: string
  code: string
  isOperational: boolean
  cause?: unknown
}

export class SiteError extends Error {
  readonly code: string
  readonly isOperational: boolean
  readonly cause?: unknown

  constructor(options: SiteErrorOptions) {
    const { message, code, isOperational, cause } = options
    super(message, cause !== undefined ? { cause } : undefined)
    this.name = new.target.name
    this.code = code
    this.isOperational = isOperational
    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

type ExternalReadErrorOptions = {
  dependency: ExternalDependency
  resource: string
  category: ExternalReadFailureCategory
  message: string
  status?: number
  cause?: unknown
}

export class ExternalReadError extends SiteError {
  readonly dependency: ExternalDependency
  readonly resource: string
  readonly category: ExternalReadFailureCategory
  readonly status?: number

  constructor(options: ExternalReadErrorOptions) {
    const { dependency, resource, category, message, status, cause } = options
    super({
      message,
      code: "external_read_failed",
      isOperational: true,
      ...(cause !== undefined ? { cause } : {}),
    })
    this.dependency = dependency
    this.resource = resource
    this.category = category
    if (status !== undefined) {
      this.status = status
    }
  }
}

type YoutubePlaylistReadErrorOptions = {
  resource: string
  category: ExternalReadFailureCategory
  message: string
  status?: number
  cause?: unknown
}

export class YoutubePlaylistReadError extends ExternalReadError {
  declare readonly dependency: "youtube-playlist"

  constructor(options: YoutubePlaylistReadErrorOptions) {
    super({
      ...options,
      dependency: "youtube-playlist",
    })
  }
}

type YoutubeLiveReadErrorOptions = {
  dependency: "youtube-live" | "youtube-oembed"
  resource: string
  category: ExternalReadFailureCategory
  message: string
  status?: number
  cause?: unknown
}

export class YoutubeLiveReadError extends ExternalReadError {
  declare readonly dependency: "youtube-live" | "youtube-oembed"

  constructor(options: YoutubeLiveReadErrorOptions) {
    super(options)
  }
}

type ContentInvariantErrorOptions = {
  module: string
  rule: string
  message: string
  cause?: unknown
}

export class ContentInvariantError extends SiteError {
  readonly module: string
  readonly rule: string

  constructor(options: ContentInvariantErrorOptions) {
    const { module, rule, message, cause } = options
    super({
      message,
      code: "content_invariant_violated",
      isOperational: false,
      ...(cause !== undefined ? { cause } : {}),
    })
    this.module = module
    this.rule = rule
  }
}
