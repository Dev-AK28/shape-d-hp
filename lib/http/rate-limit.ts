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

/**
 * Reads a boolean trust flag, preferring the generic env var name and
 * falling back to the legacy `CONTACT_`-prefixed one for backward
 * compatibility with deployments that already set it (#475 review).
 */
function readTrustFlag(genericVar: string, legacyVar: string): string | undefined {
  return (
    process.env[genericVar]?.trim().toLowerCase() ||
    process.env[legacyVar]?.trim().toLowerCase()
  );
}

/**
 * Whether to trust `cf-connecting-ip`. Prefer `TRUST_CLOUDFLARE_IP`; the
 * legacy `CONTACT_TRUST_CLOUDFLARE_IP` name is still honored so existing
 * deployment config keeps working.
 */
export function shouldTrustCloudflareIp(): boolean {
  return readTrustFlag('TRUST_CLOUDFLARE_IP', 'CONTACT_TRUST_CLOUDFLARE_IP') === 'true';
}

/**
 * Whether to trust `x-forwarded-for` / `x-real-ip`.
 * On Vercel the edge overwrites these headers; clients cannot forge them.
 *
 * Prefer `TRUST_PROXY_IP_HEADERS` (`false` to disable when not behind a
 * trusted proxy); the legacy `CONTACT_TRUST_PROXY_IP_HEADERS` name is still
 * honored so existing deployment config keeps working. Using the generic
 * name is deployment-wide — it now also governs `/api/csp-report`, not just
 * `/api/contact` (#475 review: a `CONTACT_`-prefixed var reads as
 * contact-form-scoped and could be set to `false` believing it only
 * affected that form, silently disabling CSP-report rate limiting too).
 */
export function shouldTrustProxyIpHeaders(): boolean {
  const explicit = readTrustFlag('TRUST_PROXY_IP_HEADERS', 'CONTACT_TRUST_PROXY_IP_HEADERS');
  if (explicit === 'false') {
    return false;
  }
  if (explicit === 'true') {
    return true;
  }
  return process.env.VERCEL === '1';
}

export function extractClientIp(headers: Headers): string | null {
  if (shouldTrustCloudflareIp()) {
    const cfConnectingIp = headers.get('cf-connecting-ip')?.trim();
    if (cfConnectingIp) {
      return cfConnectingIp;
    }
  }

  if (!shouldTrustProxyIpHeaders()) {
    return null;
  }

  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) {
    return forwarded;
  }

  const realIp = headers.get('x-real-ip')?.trim();
  return realIp || null;
}
