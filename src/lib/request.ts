import type { z } from "zod";
import { allowRequest, clientKey } from "./rateLimit";
import { jsonError } from "./stream";

const MAX_BODY_BYTES = 32_000;

type Parsed<T> = { ok: true; data: T } | { ok: false; response: Response };

/** Shared guard for API routes: rate limit, size limit, JSON parsing and schema validation. */
export async function parseRequest<T>(request: Request, schema: z.ZodType<T>, limitPerMinute: number): Promise<Parsed<T>> {
  if (!allowRequest(clientKey(request), limitPerMinute)) {
    return { ok: false, response: jsonError("Too many requests. Please wait a minute and try again.", 429) };
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return { ok: false, response: jsonError("Request is too large.", 413) };
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { ok: false, response: jsonError("Request body must be valid JSON.", 400) };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return { ok: false, response: jsonError("Some fields are missing or invalid. Please check the form.", 400) };
  }
  return { ok: true, data: result.data };
}
