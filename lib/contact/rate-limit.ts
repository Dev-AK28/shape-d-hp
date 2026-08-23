import {
  isRateLimited as genericIsRateLimited,
  pruneExpiredEntries as genericPruneExpiredEntries,
  releaseRateLimitSlot as genericReleaseRateLimitSlot,
  tryAcquireRateLimitSlot as genericTryAcquireRateLimitSlot,
  type RateLimitEntry,
  type RateLimitStore,
} from '@/lib/http/rate-limit';

// extractClientIp/shouldTrustProxyIpHeaders/shouldTrustCloudflareIp moved to
// lib/http/rate-limit.ts (#475 review): they now also gate /api/csp-report,
// not just /api/contact, so they're re-exported here for backward
// compatibility rather than owned by this contact-specific module.
export {
  extractClientIp,
  shouldTrustCloudflareIp,
  shouldTrustProxyIpHeaders,
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

