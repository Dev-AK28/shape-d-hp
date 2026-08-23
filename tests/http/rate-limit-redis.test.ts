import { describe, expect, it, vi } from 'vitest';
import { createRedisRateLimitService } from '@/lib/http/rate-limit-redis';

function createMockRedis() {
  return {
    eval: vi.fn(),
  };
}

describe('createRedisRateLimitService', () => {
  it('namespaces the Redis key and forwards the configured threshold', async () => {
    const redis = createMockRedis();
    redis.eval.mockResolvedValue(1);

    const service = createRedisRateLimitService(redis as never, {
      namespace: 'csp-report',
      max: 30,
      windowMs: 60_000,
    });
    await expect(service.tryAcquire('203.0.113.1')).resolves.toBe(true);

    expect(redis.eval).toHaveBeenCalledWith(
      expect.stringContaining('INCR'),
      ['csp-report:rate:203.0.113.1'],
      [30, 60_000],
    );
  });

  it('returns false when acquire Lua script rejects over limit', async () => {
    const redis = createMockRedis();
    redis.eval.mockResolvedValue(0);

    const service = createRedisRateLimitService(redis as never, {
      namespace: 'csp-report',
      max: 30,
      windowMs: 60_000,
    });
    await expect(service.tryAcquire('203.0.113.1')).resolves.toBe(false);
  });

  it('calls release Lua script with the namespaced key', async () => {
    const redis = createMockRedis();
    redis.eval.mockResolvedValue(1);

    const service = createRedisRateLimitService(redis as never, {
      namespace: 'csp-report',
      max: 30,
      windowMs: 60_000,
    });
    await service.release('203.0.113.1');

    expect(redis.eval).toHaveBeenCalledWith(
      expect.stringContaining('DECR'),
      ['csp-report:rate:203.0.113.1'],
      [],
    );
  });

  it('isolates keys by namespace so two callers never collide', async () => {
    const redis = createMockRedis();
    redis.eval.mockResolvedValue(1);

    const contactService = createRedisRateLimitService(redis as never, {
      namespace: 'contact',
      max: 5,
      windowMs: 60_000,
    });
    const cspService = createRedisRateLimitService(redis as never, {
      namespace: 'csp-report',
      max: 30,
      windowMs: 60_000,
    });

    await contactService.tryAcquire('1.1.1.1');
    await cspService.tryAcquire('1.1.1.1');

    expect(redis.eval).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INCR'),
      ['contact:rate:1.1.1.1'],
      [5, 60_000],
    );
    expect(redis.eval).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INCR'),
      ['csp-report:rate:1.1.1.1'],
      [30, 60_000],
    );
  });
});
