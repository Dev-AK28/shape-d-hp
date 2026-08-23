import { describe, expect, it, vi, afterEach } from 'vitest';
import { CSP_REPORT_RATE_LIMIT_MAX } from '@/lib/csp-report/rate-limit-service';

describe('getRateLimitService (csp-report, memory fallback)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses its own namespace/threshold, independent of /api/contact', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');

    vi.resetModules();
    const { getRateLimitService } = await import('@/lib/csp-report/rate-limit-service');
    const { getRateLimitService: getContactRateLimitService } = await import(
      '@/lib/contact/rate-limit-service'
    );

    const service = getRateLimitService();
    const contactService = getContactRateLimitService();

    for (let i = 0; i < CSP_REPORT_RATE_LIMIT_MAX; i += 1) {
      await expect(service.tryAcquire('1.2.3.4')).resolves.toBe(true);
    }
    await expect(service.tryAcquire('1.2.3.4')).resolves.toBe(false);

    // /api/contact's own (much stricter) budget for the same IP is untouched.
    await expect(contactService.tryAcquire('1.2.3.4')).resolves.toBe(true);

    await service.release('1.2.3.4');
    await expect(service.tryAcquire('1.2.3.4')).resolves.toBe(true);
  });
});
