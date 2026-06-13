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

/** Returns true when the IP has reached the limit (read-only). */
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

/**
 * Atomically acquires a rate-limit slot before processing.
 * Returns false when the IP is already at the limit.
 */
export function tryAcquireRateLimitSlot(
  ip: string,
  store: RateLimitStore,
  now: number = Date.now(),
): boolean {
  pruneExpiredEntries(store, now);

  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

/** Releases a slot when email sending fails after acquire. */
export function releaseRateLimitSlot(
  ip: string,
  store: RateLimitStore,
  now: number = Date.now(),
): void {
  pruneExpiredEntries(store, now);

  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    return;
  }

  if (entry.count <= 1) {
    store.delete(ip);
    return;
  }

  entry.count -= 1;
}

export function shouldTrustCloudflareIp(): boolean {
  return process.env.CONTACT_TRUST_CLOUDFLARE_IP?.trim().toLowerCase() === 'true';
}

/**
 * Whether to trust `x-forwarded-for` / `x-real-ip`.
 * On Vercel the edge overwrites these headers; clients cannot forge them.
 * Set `CONTACT_TRUST_PROXY_IP_HEADERS=false` to disable when not behind a trusted proxy.
 */
export function shouldTrustProxyIpHeaders(): boolean {
  const explicit = process.env.CONTACT_TRUST_PROXY_IP_HEADERS?.trim().toLowerCase();
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
