import { describe, expect, it } from 'vitest';
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  extractClientIp,
  isRateLimited,
  pruneExpiredEntries,
  recordRateLimitHit,
  type RateLimitStore,
} from '@/lib/contact/rate-limit';

describe('isRateLimited', () => {
  it('allows requests under the limit', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      recordRateLimitHit('1.2.3.4', store, now);
      expect(isRateLimited('1.2.3.4', store, now)).toBe(i + 1 >= RATE_LIMIT_MAX);
    }
  });

  it('blocks after max successful submissions', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      recordRateLimitHit('1.2.3.4', store, now);
    }

    expect(isRateLimited('1.2.3.4', store, now)).toBe(true);
  });

  it('does not count failed attempts toward the limit', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    expect(isRateLimited('1.2.3.4', store, now)).toBe(false);
  });

  it('resets after the window expires', () => {
    const store: RateLimitStore = new Map();
    const start = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      recordRateLimitHit('1.2.3.4', store, start);
    }

    expect(isRateLimited('1.2.3.4', store, start)).toBe(true);
    expect(isRateLimited('1.2.3.4', store, start + RATE_LIMIT_WINDOW_MS + 1)).toBe(false);
  });

  it('tracks IPs independently', () => {
    const store: RateLimitStore = new Map();
    const now = 1_000_000;

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      recordRateLimitHit('1.2.3.4', store, now);
    }

    expect(isRateLimited('1.2.3.4', store, now)).toBe(true);
    expect(isRateLimited('5.6.7.8', store, now)).toBe(false);
  });
});

describe('extractClientIp', () => {
  it('reads the first x-forwarded-for address', () => {
    const headers = new Headers({ 'x-forwarded-for': ' 203.0.113.1, 10.0.0.1 ' });

    expect(extractClientIp(headers)).toBe('203.0.113.1');
  });

  it('falls back to x-real-ip', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.2' });

    expect(extractClientIp(headers)).toBe('198.51.100.2');
  });

  it('returns null when no IP headers exist', () => {
    expect(extractClientIp(new Headers())).toBeNull();
  });

  it('prefers cf-connecting-ip', () => {
    const headers = new Headers({
      'cf-connecting-ip': '192.0.2.1',
      'x-forwarded-for': '203.0.113.1',
    });

    expect(extractClientIp(headers)).toBe('192.0.2.1');
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
