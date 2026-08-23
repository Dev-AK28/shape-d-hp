/**
 * Generic in-memory sliding-window rate limiter.
 *
 * Extracted from `lib/contact/rate-limit.ts` (#475) so multiple endpoints
 * (`/api/contact`, `/api/csp-report`, ...) can share the same primitives
 * while choosing their own threshold/window and key namespace, instead of
 * being locked to a single module-level `RATE_LIMIT_MAX`/`RATE_LIMIT_WINDOW_MS`.
 */

export type RateLimitEntry = { count: number; resetAt: number };
export type RateLimitStore = Map<string, RateLimitEntry>;

export type RateLimitOptions = {
  /** Maximum acquisitions allowed per key within `windowMs`. */
  max: number;
  /** Sliding window length, in milliseconds. */
  windowMs: number;
};

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

/** Returns true when the key has reached the limit (read-only). */
export function isRateLimited(
  key: string,
  store: RateLimitStore,
  options: RateLimitOptions,
  now: number = Date.now(),
): boolean {
  pruneExpiredEntries(store, now);

  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    return false;
  }

  return entry.count >= options.max;
}

/**
 * Atomically acquires a rate-limit slot before processing.
 * Returns false when the key is already at the limit.
 */
export function tryAcquireRateLimitSlot(
  key: string,
  store: RateLimitStore,
  options: RateLimitOptions,
  now: number = Date.now(),
): boolean {
  pruneExpiredEntries(store, now);

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return true;
  }

  if (entry.count >= options.max) {
    return false;
  }

  entry.count += 1;
  return true;
}

/** Releases a slot when the guarded operation fails after acquire. */
export function releaseRateLimitSlot(
  key: string,
  store: RateLimitStore,
  now: number = Date.now(),
): void {
  pruneExpiredEntries(store, now);

  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    return;
  }

  if (entry.count <= 1) {
    store.delete(key);
    return;
  }

  entry.count -= 1;
}
