import { describe, expect, it, vi } from 'vitest';
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  extractClientIp,
  isRateLimited,
  pruneExpiredEntries,
  releaseRateLimitSlot,
  tryAcquireRateLimitSlot,
  type RateLimitStore,
} from '@/lib/contact/rate-limit';

describe('tryAcquireRateLimitSlot', () => {
  it('allows acquisitions under the limit', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      expect(tryAcquireRateLimitSlot('1.2.3.4', store, now)).toBe(true);
    }

    expect(isRateLimited('1.2.3.4', store, now)).toBe(true);
  });

  it('blocks the 6th acquisition within the window', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      tryAcquireRateLimitSlot('1.2.3.4', store, now);
    }

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, now)).toBe(false);
  });

  it('releases a slot after failed send simulation', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      tryAcquireRateLimitSlot('1.2.3.4', store, now);
    }

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, now)).toBe(false);

    releaseRateLimitSlot('1.2.3.4', store, now);

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, now)).toBe(true);
  });

  it('resets after the window expires', () => {
    const store: RateLimitStore = new Map();
    const start = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      tryAcquireRateLimitSlot('1.2.3.4', store, start);
    }

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, start)).toBe(false);
    expect(tryAcquireRateLimitSlot('1.2.3.4', store, start + RATE_LIMIT_WINDOW_MS + 1)).toBe(true);
  });

  it('tracks IPs independently', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      tryAcquireRateLimitSlot('1.2.3.4', store, now);
    }

    expect(tryAcquireRateLimitSlot('1.2.3.4', store, now)).toBe(false);
    expect(tryAcquireRateLimitSlot('5.6.7.8', store, now)).toBe(true);
  });
});

describe('extractClientIp', () => {
  it('reads the first x-forwarded-for address when proxy headers are trusted', () => {
    vi.stubEnv('CONTACT_TRUST_PROXY_IP_HEADERS', 'true');
    const headers = new Headers({ 'x-forwarded-for': ' 203.0.113.1, 10.0.0.1 ' });

    expect(extractClientIp(headers)).toBe('203.0.113.1');
    vi.unstubAllEnvs();
  });

  it('falls back to x-real-ip when proxy headers are trusted', () => {
    vi.stubEnv('CONTACT_TRUST_PROXY_IP_HEADERS', 'true');
    const headers = new Headers({ 'x-real-ip': '198.51.100.2' });

    expect(extractClientIp(headers)).toBe('198.51.100.2');
    vi.unstubAllEnvs();
  });

  it('returns null when no IP headers exist', () => {
    expect(extractClientIp(new Headers())).toBeNull();
  });

  it('prefers cf-connecting-ip when Cloudflare trust is enabled', () => {
    vi.stubEnv('CONTACT_TRUST_CLOUDFLARE_IP', 'true');
    vi.stubEnv('CONTACT_TRUST_PROXY_IP_HEADERS', 'true');
    const headers = new Headers({
      'cf-connecting-ip': '192.0.2.1',
      'x-forwarded-for': '203.0.113.1',
    });

    expect(extractClientIp(headers)).toBe('192.0.2.1');
    vi.unstubAllEnvs();
  });

  it('ignores spoofed cf-connecting-ip when Cloudflare trust is disabled', () => {
    vi.stubEnv('CONTACT_TRUST_CLOUDFLARE_IP', 'false');
    vi.stubEnv('CONTACT_TRUST_PROXY_IP_HEADERS', 'true');
    const headers = new Headers({
      'cf-connecting-ip': '192.0.2.1',
      'x-forwarded-for': '203.0.113.1',
    });

    expect(extractClientIp(headers)).toBe('203.0.113.1');
    vi.unstubAllEnvs();
  });

  it('ignores x-forwarded-for when proxy headers are not trusted', () => {
    vi.stubEnv('CONTACT_TRUST_PROXY_IP_HEADERS', 'false');
    vi.stubEnv('VERCEL', '');
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.1' });

    expect(extractClientIp(headers)).toBeNull();
    vi.unstubAllEnvs();
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
