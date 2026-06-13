import {
  releaseRateLimitSlot,
  tryAcquireRateLimitSlot,
  type RateLimitStore,
} from '@/lib/contact/rate-limit';
import {
  createRedisClientFromEnv,
  createRedisRateLimitService,
} from '@/lib/contact/rate-limit-redis';

export type RateLimitService = {
  tryAcquire(clientIp: string): Promise<boolean>;
  release(clientIp: string): Promise<void>;
};

const memoryStore: RateLimitStore = new Map();

function createMemoryRateLimitService(store: RateLimitStore): RateLimitService {
  return {
    async tryAcquire(clientIp: string): Promise<boolean> {
      return tryAcquireRateLimitSlot(clientIp, store);
    },

    async release(clientIp: string): Promise<void> {
      releaseRateLimitSlot(clientIp, store);
    },
  };
}

let cachedService: RateLimitService | null = null;

/** Resets cached service — for tests only. */
export function resetRateLimitServiceForTests(): void {
  cachedService = null;
  memoryStore.clear();
}

export function getRateLimitService(): RateLimitService {
  if (cachedService) {
    return cachedService;
  }

  const redis = createRedisClientFromEnv();
  if (redis) {
    cachedService = createRedisRateLimitService(redis);
    return cachedService;
  }

  cachedService = createMemoryRateLimitService(memoryStore);
  return cachedService;
}
