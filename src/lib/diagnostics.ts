import type { ExternalReadError } from "@/lib/errors"

type ExternalReadFailureContext = {
  route: string
}

type RenderFailureInput = {
  route: string
  method: string
  routerKind: string
  routeType: string
  renderSource?: string
  digest?: string
  code?: string
  isOperational?: boolean
  message: string
}

export function logExternalReadFailure(
  context: ExternalReadFailureContext,
  error: ExternalReadError,
): void {
  console.warn({
    event: "external_read_failed",
    route: context.route,
    dependency: error.dependency,
    resource: error.resource,
    category: error.category,
    ...(error.status !== undefined ? { status: error.status } : {}),
    code: error.code,
    message: error.message,
  })
}

export function logRenderFailure(input: RenderFailureInput): void {
  console.error({
    event: "render_failed",
    route: input.route,
    method: input.method,
    routerKind: input.routerKind,
    routeType: input.routeType,
    ...(input.renderSource !== undefined
      ? { renderSource: input.renderSource }
      : {}),
    ...(input.digest !== undefined ? { digest: input.digest } : {}),
    ...(input.code !== undefined ? { code: input.code } : {}),
    ...(input.isOperational !== undefined
      ? { isOperational: input.isOperational }
      : {}),
    message: input.message,
  })
}
