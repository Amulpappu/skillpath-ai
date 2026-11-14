/** Small in-memory fixed-window rate limiter. Best effort on serverless, where instances are short-lived. */

const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

export function allowRequest(key: string, limit: number, now = Date.now()): boolean {
  const entry = hits.get(key);
  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function resetRateLimits(): void {
  hits.clear();
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}
