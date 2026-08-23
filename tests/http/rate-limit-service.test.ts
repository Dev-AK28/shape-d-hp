import { describe, expect, it, vi, afterEach } from 'vitest';

describe('createRateLimitServiceFactory (memory fallback)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enforces the configured threshold independently of other callers', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');

    vi.resetModules();
    const { createRateLimitServiceFactory } = await import('@/lib/http/rate-limit-service');

    const strict = createRateLimitServiceFactory({ namespace: 'a', max: 2, windowMs: 60_000 });
    const loose = createRateLimitServiceFactory({ namespace: 'b', max: 5, windowMs: 60_000 });

    const strictService = strict.getRateLimitService();
    const looseService = loose.getRateLimitService();

    await expect(strictService.tryAcquire('1.2.3.4')).resolves.toBe(true);
    await expect(strictService.tryAcquire('1.2.3.4')).resolves.toBe(true);
    await expect(strictService.tryAcquire('1.2.3.4')).resolves.toBe(false);

    // The looser-configured service, sharing no state with `strict`, is
    // unaffected by the other's threshold.
    for (let i = 0; i < 5; i += 1) {
      await expect(looseService.tryAcquire('1.2.3.4')).resolves.toBe(true);
    }
    await expect(looseService.tryAcquire('1.2.3.4')).resolves.toBe(false);
  });

  it('releases a slot and caches the service instance across calls', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');

    vi.resetModules();
    const { createRateLimitServiceFactory } = await import('@/lib/http/rate-limit-service');
    const factory = createRateLimitServiceFactory({ namespace: 'c', max: 1, windowMs: 60_000 });

    expect(factory.getRateLimitService()).toBe(factory.getRateLimitService());

    const service = factory.getRateLimitService();
    await expect(service.tryAcquire('9.9.9.9')).resolves.toBe(true);
    await expect(service.tryAcquire('9.9.9.9')).resolves.toBe(false);

    await service.release('9.9.9.9');
    await expect(service.tryAcquire('9.9.9.9')).resolves.toBe(true);

    factory.resetForTests();
    // After reset, the store is cleared so a fresh acquire on the same key
    // is allowed even without an explicit release.
    await expect(service.tryAcquire('9.9.9.9')).resolves.toBe(true);
  });
});
