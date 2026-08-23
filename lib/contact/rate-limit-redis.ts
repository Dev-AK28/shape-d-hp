import type { Redis } from '@upstash/redis';
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/contact/rate-limit';
import {
  createRedisRateLimitService as createGenericRedisRateLimitService,
  type RateLimitService,
} from '@/lib/http/rate-limit-redis';

export { createRedisClientFromEnv } from '@/lib/http/rate-limit-redis';

export function createRedisRateLimitService(redis: Redis): RateLimitService {
  return createGenericRedisRateLimitService(redis, {
    namespace: 'contact',
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
}
