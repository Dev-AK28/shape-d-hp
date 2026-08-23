import {
  isRateLimited as genericIsRateLimited,
  pruneExpiredEntries as genericPruneExpiredEntries,
  releaseRateLimitSlot as genericReleaseRateLimitSlot,
  tryAcquireRateLimitSlot as genericTryAcquireRateLimitSlot,
  type RateLimitEntry,
  type RateLimitStore,
} from '@/lib/http/rate-limit';

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export type { RateLimitEntry, RateLimitStore };

const OPTIONS = { max: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS };

export function pruneExpiredEntries(
  store: RateLimitStore,
  now: number = Date.now(),
): void {
  genericPruneExpiredEntries(store, now);
}

/** Returns true when the IP has reached the limit (read-only). */
export function isRateLimited(
  ip: string,
  store: RateLimitStore,
  now: number = Date.now(),
): boolean {
  return genericIsRateLimited(ip, store, OPTIONS, now);
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
  return genericTryAcquireRateLimitSlot(ip, store, OPTIONS, now);
}

/** Releases a slot when email sending fails after acquire. */
export function releaseRateLimitSlot(
  ip: string,
  store: RateLimitStore,
  now: number = Date.now(),
): void {
  genericReleaseRateLimitSlot(ip, store, now);
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
