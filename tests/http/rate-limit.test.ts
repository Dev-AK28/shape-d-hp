import { describe, expect, it } from 'vitest';
import {
  isRateLimited,
  pruneExpiredEntries,
  releaseRateLimitSlot,
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
