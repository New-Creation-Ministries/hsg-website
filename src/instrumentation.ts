import { type Instrumentation } from "next"

import { logRenderFailure } from "@/lib/diagnostics"
import { SiteError } from "@/lib/errors"

export const onRequestError: Instrumentation.onRequestError = (
  err,
  request,
  context,
) => {
  const message = err instanceof Error ? err.message : String(err)
  const digest =
    typeof err === "object" && err !== null && "digest" in err
      ? String(err.digest)
      : undefined

  logRenderFailure({
    route: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routeType: context.routeType,
    ...(context.renderSource !== undefined
      ? { renderSource: context.renderSource }
      : {}),
    ...(digest !== undefined ? { digest } : {}),
    ...(err instanceof SiteError
      ? { code: err.code, isOperational: err.isOperational }
      : {}),
    message,
  })
}
