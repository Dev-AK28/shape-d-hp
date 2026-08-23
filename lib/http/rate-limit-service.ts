import {
  releaseRateLimitSlot,
  tryAcquireRateLimitSlot,
  type RateLimitOptions,
  type RateLimitStore,
} from '@/lib/http/rate-limit';
import {
  createRedisClientFromEnv,
  createRedisRateLimitService,
} from '@/lib/http/rate-limit-redis';

/**
 * Generic rate-limit service factory (#475).
 *
 * Extracted from `lib/contact/rate-limit-service.ts`: the backend-selection
 * (Redis when configured, in-memory fallback otherwise) and single-flight
 * caching logic was already generic, only the threshold/namespace were
 * hardcoded to the contact form. `createRateLimitServiceFactory` lets each
 * caller (e.g. `/api/contact`, `/api/csp-report`) instantiate its own
 * isolated service with its own limits.
 */

export type RateLimitService = {
  tryAcquire(key: string): Promise<boolean>;
  release(key: string): Promise<void>;
};

export type RateLimitServiceConfig = RateLimitOptions & {
  /** Key namespace prefix, also used as the Redis key namespace. */
  namespace: string;
};

function createMemoryRateLimitService(
  store: RateLimitStore,
  options: RateLimitOptions,
): RateLimitService {
  return {
    async tryAcquire(key: string): Promise<boolean> {
      return tryAcquireRateLimitSlot(key, store, options);
    },

    async release(key: string): Promise<void> {
      releaseRateLimitSlot(key, store);
    },
  };
}

export type RateLimitServiceHandle = {
  getRateLimitService(): RateLimitService;
  /** Resets cached service — for tests only. */
  resetForTests(): void;
};

export function createRateLimitServiceFactory(
  config: RateLimitServiceConfig,
): RateLimitServiceHandle {
  const memoryStore: RateLimitStore = new Map();
  let cachedService: RateLimitService | null = null;

  return {
    resetForTests(): void {
      cachedService = null;
      memoryStore.clear();
    },

    getRateLimitService(): RateLimitService {
      if (cachedService) {
        return cachedService;
      }

      const redis = createRedisClientFromEnv();
      if (redis) {
        cachedService = createRedisRateLimitService(redis, config);
        return cachedService;
      }

      cachedService = createMemoryRateLimitService(memoryStore, config);
      return cachedService;
    },
  };
}
