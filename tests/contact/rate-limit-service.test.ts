import { describe, expect, it, vi, afterEach } from 'vitest';
import { resetRateLimitServiceForTests } from '@/lib/contact/rate-limit-service';
import { RATE_LIMIT_MAX } from '@/lib/contact/rate-limit';

describe('getRateLimitService (memory fallback)', () => {
  afterEach(() => {
    resetRateLimitServiceForTests();
    vi.unstubAllEnvs();
  });

  it('uses in-memory store when Redis env is unset', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');

    vi.resetModules();
    const { getRateLimitService } = await import('@/lib/contact/rate-limit-service');
    const service = getRateLimitService();

    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      await expect(service.tryAcquire('1.2.3.4')).resolves.toBe(true);
    }

    await expect(service.tryAcquire('1.2.3.4')).resolves.toBe(false);

    await service.release('1.2.3.4');
    await expect(service.tryAcquire('1.2.3.4')).resolves.toBe(true);
  });
});

describe('createRedisClientFromEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null when env vars are missing', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');

    const { createRedisClientFromEnv } = await import('@/lib/contact/rate-limit-redis');
    expect(createRedisClientFromEnv()).toBeNull();
  });

  it('creates client from Upstash env vars', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token');

    const { createRedisClientFromEnv } = await import('@/lib/contact/rate-limit-redis');
    expect(createRedisClientFromEnv()).not.toBeNull();
  });

  it('creates client from Vercel KV env vars', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('KV_REST_API_URL', 'https://example.kv.vercel-storage.com');
    vi.stubEnv('KV_REST_API_TOKEN', 'token');

    const { createRedisClientFromEnv } = await import('@/lib/contact/rate-limit-redis');
    expect(createRedisClientFromEnv()).not.toBeNull();
  });
});
