import { Redis } from '@upstash/redis';
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/contact/rate-limit';
import type { RateLimitService } from '@/lib/contact/rate-limit-service';

const ACQUIRE_SCRIPT = `
local key = KEYS[1]
local max = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local count = redis.call('INCR', key)
if count == 1 then
  redis.call('PEXPIRE', key, window)
end
if count > max then
  redis.call('DECR', key)
  return 0
end
return 1
`;

const RELEASE_SCRIPT = `
local key = KEYS[1]
local current = redis.call('GET', key)
if not current then
  return 0
end
local count = tonumber(current)
if count <= 1 then
  redis.call('DEL', key)
else
  redis.call('DECR', key)
end
return 1
`;

function rateLimitKey(ip: string): string {
  return `contact:rate:${ip}`;
}

export function createRedisRateLimitService(
  redis: Redis,
): RateLimitService {
  return {
    async tryAcquire(clientIp: string): Promise<boolean> {
      const result = await redis.eval(
        ACQUIRE_SCRIPT,
        [rateLimitKey(clientIp)],
        [RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS],
      );

      return result === 1;
    },

    async release(clientIp: string): Promise<void> {
      await redis.eval(RELEASE_SCRIPT, [rateLimitKey(clientIp)], []);
    },
  };
}

export function createRedisClientFromEnv(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}
