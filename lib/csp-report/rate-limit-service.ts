import {
  createRateLimitServiceFactory,
  type RateLimitService,
} from '@/lib/http/rate-limit-service';

export type { RateLimitService };

/**
 * Request-volume rate limit for `/api/csp-report` (#475, follow-up to #457).
 *
 * The endpoint is unauthenticated and public (browsers POST to it directly
 * per the CSP `report-to`/`report-uri` directives), so it needs its own
 * per-request-volume cap independent of the per-request size/count caps in
 * `lib/csp-report/constants.ts` (those only bound a single request's
 * payload, not how many requests an IP can send).
 *
 * The threshold is intentionally far more permissive than `/api/contact`
 * (5 req/60s, a human-filled form): legitimate CSP reporting traffic can
 * burst — many violations on one page load are already coalesced into a
 * single POST (see `MAX_CSP_REPORTS_PER_REQUEST`), and a browser may still
 * fire several such batched requests in quick succession (multiple tabs,
 * repeated navigations, retried deliveries). 30 req/60s per IP comfortably
 * covers that while still bounding a scripted flood's cost/log volume.
 */
export const CSP_REPORT_RATE_LIMIT_MAX = 30;
export const CSP_REPORT_RATE_LIMIT_WINDOW_MS = 60_000;

const rateLimitService = createRateLimitServiceFactory({
  namespace: 'csp-report',
  max: CSP_REPORT_RATE_LIMIT_MAX,
  windowMs: CSP_REPORT_RATE_LIMIT_WINDOW_MS,
});

/** Resets cached service — for tests only. */
export function resetRateLimitServiceForTests(): void {
  rateLimitService.resetForTests();
}

export function getRateLimitService(): RateLimitService {
  return rateLimitService.getRateLimitService();
}
