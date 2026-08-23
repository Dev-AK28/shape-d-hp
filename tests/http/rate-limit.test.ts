import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  extractClientIp,
  isRateLimited,
  pruneExpiredEntries,
  releaseRateLimitSlot,
  shouldTrustCloudflareIp,
  shouldTrustProxyIpHeaders,
  tryAcquireRateLimitSlot,
  type RateLimitOptions,
  type RateLimitStore,
} from '@/lib/http/rate-limit';

const OPTIONS: RateLimitOptions = { max: 3, windowMs: 60_000 };

describe('tryAcquireRateLimitSlot', () => {
  it('allows acquisitions under the limit', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < OPTIONS.max; i += 1) {
      expect(tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, now)).toBe(true);
    }

    expect(isRateLimited('1.2.3.4', store, OPTIONS, now)).toBe(true);
  });

  it('blocks acquisitions beyond the limit within the window', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < OPTIONS.max; i += 1) {
      tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, now);
    }

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, now)).toBe(false);
  });

  it('releases a slot after a failed operation', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < OPTIONS.max; i += 1) {
      tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, now);
    }

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, now)).toBe(false);

    releaseRateLimitSlot('1.2.3.4', store, now);

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, now)).toBe(true);
  });

  it('resets after the window expires', () => {
    const store: RateLimitStore = new Map();
    const start = 1_000_000;

    for (let i = 0; i < OPTIONS.max; i += 1) {
      tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, start);
    }

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, start)).toBe(false);
    expect(
      tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, start + OPTIONS.windowMs + 1),
    ).toBe(true);
  });

  it('tracks keys independently', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < OPTIONS.max; i += 1) {
      tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, now);
    }

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, OPTIONS, now)).toBe(false);
    expect(tryAcquireRateLimitSlot('5.6.7.8', store, OPTIONS, now)).toBe(true);
  });

  it('applies a different threshold per call site sharing one store', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;
    const looseOptions: RateLimitOptions = { max: 10, windowMs: 60_000 };

    // Same key, different namespaced-by-caller thresholds would normally use
    // distinct keys, but this asserts the options object (not a module
    // constant) is what drives the limit for a given call.
    for (let i = 0; i < looseOptions.max; i += 1) {
      expect(tryAcquireRateLimitSlot('shared-key', store, looseOptions, now)).toBe(true);
    }
    expect(tryAcquireRateLimitSlot('shared-key', store, looseOptions, now)).toBe(false);
  });
});

describe('pruneExpiredEntries', () => {
  it('removes expired keys from the store', () => {
    const store: RateLimitStore = new Map([
      ['expired', { count: 5, resetAt: 100 }],
      ['active', { count: 1, resetAt: 9_999_999 }],
    ]);

    pruneExpiredEntries(store, 200);

    expect(store.has('expired')).toBe(false);
    expect(store.has('active')).toBe(true);
  });
});

describe('shouldTrustProxyIpHeaders / shouldTrustCloudflareIp (#475 review: generic env var, deployment-wide)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers the generic TRUST_PROXY_IP_HEADERS over the legacy CONTACT_ prefixed one', () => {
    vi.stubEnv('TRUST_PROXY_IP_HEADERS', 'false');
    vi.stubEnv('CONTACT_TRUST_PROXY_IP_HEADERS', 'true');

    expect(shouldTrustProxyIpHeaders()).toBe(false);
  });

  it('falls back to the legacy CONTACT_TRUST_PROXY_IP_HEADERS when the generic var is unset', () => {
    vi.stubEnv('CONTACT_TRUST_PROXY_IP_HEADERS', 'true');

    expect(shouldTrustProxyIpHeaders()).toBe(true);
  });

  it('prefers the generic TRUST_CLOUDFLARE_IP over the legacy CONTACT_ prefixed one', () => {
    vi.stubEnv('TRUST_CLOUDFLARE_IP', 'true');
    vi.stubEnv('CONTACT_TRUST_CLOUDFLARE_IP', 'false');

    expect(shouldTrustCloudflareIp()).toBe(true);
  });

  it('extractClientIp trusts forwarded headers under the generic env var alone (no CONTACT_ var set)', () => {
    vi.stubEnv('TRUST_PROXY_IP_HEADERS', 'true');
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5' });

    expect(extractClientIp(headers)).toBe('203.0.113.5');
  });

  it('a CONTACT_-scoped false does not disable IP resolution when the generic var explicitly trusts it', () => {
    // Regression guard for the review finding: an operator who sets
    // CONTACT_TRUST_PROXY_IP_HEADERS=false believing it only scopes the
    // contact form must not silently disable csp-report's rate limiting —
    // the generic var, when explicitly set, takes precedence.
    vi.stubEnv('TRUST_PROXY_IP_HEADERS', 'true');
    vi.stubEnv('CONTACT_TRUST_PROXY_IP_HEADERS', 'false');
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.6' });

    expect(extractClientIp(headers)).toBe('203.0.113.6');
  });
});
