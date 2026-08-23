import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@/lib/contact/rate-limit';
import {
  createRateLimitServiceFactory,
  type RateLimitService,
} from '@/lib/http/rate-limit-service';

export type { RateLimitService };

const rateLimitService = createRateLimitServiceFactory({
  namespace: 'contact',
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
});

/** Resets cached service — for tests only. */
export function resetRateLimitServiceForTests(): void {
  rateLimitService.resetForTests();
}

export function getRateLimitService(): RateLimitService {
  return rateLimitService.getRateLimitService();
}
