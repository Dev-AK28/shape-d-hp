export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export type RateLimitEntry = { count: number; resetAt: number };
export type RateLimitStore = Map<string, RateLimitEntry>;

export function pruneExpiredEntries(
  store: RateLimitStore,
  now: number = Date.now(),
): void {
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

/** Returns true when the IP has reached the limit (does not increment). */
export function isRateLimited(
  ip: string,
  store: RateLimitStore,
  now: number = Date.now(),
): boolean {
  pruneExpiredEntries(store, now);

  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    return false;
  }

  return entry.count >= RATE_LIMIT_MAX;
}

/** Records a successful submission against the IP limit. */
export function recordRateLimitHit(
  ip: string,
  store: RateLimitStore,
  now: number = Date.now(),
): void {
  pruneExpiredEntries(store, now);

  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  entry.count += 1;
}

export function extractClientIp(headers: Headers): string | null {
  const cfConnectingIp = headers.get('cf-connecting-ip')?.trim();
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) {
    return forwarded;
  }

  const realIp = headers.get('x-real-ip')?.trim();
  return realIp || null;
}
