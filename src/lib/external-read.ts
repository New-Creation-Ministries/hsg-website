import { logExternalReadFailure } from "@/lib/diagnostics"
import {
  type ExternalDependency,
  ExternalReadError,
} from "@/lib/errors"

export type ExternalReadContext = {
  route: string
  dependency: ExternalDependency
  resource: string
}

export type ExternalReadResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ExternalReadError }

export async function readExternal<T>(
  context: ExternalReadContext,
  read: () => Promise<T>,
): Promise<ExternalReadResult<T>> {
  try {
    const value = await read()
    return { ok: true, value }
  } catch (error) {
    if (error instanceof ExternalReadError) {
      logExternalReadFailure(context, error)
      return { ok: false, error }
    }
    throw error
  }
}
