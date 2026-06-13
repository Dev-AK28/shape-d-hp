import { describe, expect, it, vi } from 'vitest';
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/contact/rate-limit';
import { createRedisRateLimitService } from '@/lib/contact/rate-limit-redis';

function createMockRedis() {
  return {
    eval: vi.fn(),
  };
}

describe('createRedisRateLimitService', () => {
  it('returns true when acquire Lua script succeeds', async () => {
    const redis = createMockRedis();
    redis.eval.mockResolvedValue(1);

    const service = createRedisRateLimitService(redis as never);
    await expect(service.tryAcquire('203.0.113.1')).resolves.toBe(true);

    expect(redis.eval).toHaveBeenCalledWith(
      expect.stringContaining('INCR'),
      ['contact:rate:203.0.113.1'],
      [RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS],
    );
  });

  it('returns false when acquire Lua script rejects over limit', async () => {
    const redis = createMockRedis();
    redis.eval.mockResolvedValue(0);

    const service = createRedisRateLimitService(redis as never);
    await expect(service.tryAcquire('203.0.113.1')).resolves.toBe(false);
  });

  it('calls release Lua script on release', async () => {
    const redis = createMockRedis();
    redis.eval.mockResolvedValue(1);

    const service = createRedisRateLimitService(redis as never);
    await service.release('203.0.113.1');

    expect(redis.eval).toHaveBeenCalledWith(
      expect.stringContaining('DECR'),
      ['contact:rate:203.0.113.1'],
      [],
    );
  });
});
