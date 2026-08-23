import {
  releaseRateLimitSlot,
  tryAcquireRateLimitSlot,
  type RateLimitOptions,
  type RateLimitStore,
} from '@/lib/http/rate-limit';
import {
  createRedisClientFromEnv,
  createRedisRateLimitService,
  type RateLimitService,
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

export type { RateLimitService };

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

export type RateLimitAcquireResult = {
  /** Whether the caller may proceed (true also when fail-open kicked in). */
  allowed: boolean;
  /** Whether a slot was actually acquired (false on fail-open — nothing to release). */
  acquired: boolean;
};

/**
 * Calls `service.tryAcquire`, failing open (allowing the request) if the
 * backend throws — e.g. Upstash Redis is unreachable. A rate limiter
 * outage must not take the guarded endpoint offline entirely; it just logs
 * loudly so the outage is observable (#475 review: this try/catch/log
 * pattern was duplicated verbatim in both `/api/contact` and
 * `/api/csp-report`; both now share this single implementation).
 *
 * Known residual edge case (#403, contact form's original implementation):
 * if the throw is a client-side timeout on the Redis `eval` call *after*
 * Upstash already executed the INCR server-side (i.e. not a hard
 * connection failure), the counter was incremented but this still fails
 * open, so that increment is never released. This is a low-likelihood leak
 * of at most one slot into the rate-limit window and is accepted as a
 * trade-off of the fail-open design; no functional fix is planned.
 */
export async function tryAcquireRateLimitSlotFailOpen(
  service: RateLimitService,
  key: string,
  failureLogMessage: string,
): Promise<RateLimitAcquireResult> {
  try {
    const acquired = await service.tryAcquire(key);
    return { allowed: acquired, acquired };
  } catch (error) {
    console.error(failureLogMessage, {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return { allowed: true, acquired: false };
  }
}
