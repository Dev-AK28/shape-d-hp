import { NextResponse, type NextRequest } from 'next/server';
import { readBodyWithSizeGuard } from '@/lib/http/read-body';
import { MAX_CSP_REPORT_BODY_BYTES } from '@/lib/csp-report/constants';
import { parseCspReportBody } from '@/lib/csp-report/parse-report';
import { extractClientIp } from '@/lib/contact/rate-limit';
import { getRateLimitService } from '@/lib/csp-report/rate-limit-service';

/**
 * Receives Content-Security-Policy violation reports from the browser
 * (see next.config.ts CSP_HEADER_VALUE `report-to`/`report-uri` and the
 * `Reporting-Endpoints` header) and logs them server-side.
 *
 * No external log aggregation service is used here by design (#457) — this
 * is intentionally the cheapest possible sink (stdout, captured by Vercel's
 * function logs) to avoid introducing a new billing dependency.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const bodyResult = await readBodyWithSizeGuard(request, MAX_CSP_REPORT_BODY_BYTES);
  if (!bodyResult.ok) {
    return new NextResponse(null, { status: 413 });
  }

  // Request-volume rate limit (#475): applied before parsing/logging so an
  // over-threshold request does neither, per this endpoint's public/
  // unauthenticated exposure.
  const clientIp = extractClientIp(request.headers);
  if (clientIp) {
    let allowed = true;
    try {
      allowed = await getRateLimitService().tryAcquire(clientIp);
    } catch (error) {
      // Fail open: if the rate limiter backend (e.g. Upstash Redis) is down,
      // it must not take CSP reporting offline entirely. Log loudly so the
      // outage is observable, then let the request proceed unlimited.
      console.error('CSP report rate limit acquire failed; failing open (allowing request)', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      allowed = true;
    }

    if (!allowed) {
      return new NextResponse(null, { status: 429 });
    }
  } else {
    // Rate limiting is intentionally skipped when the client IP cannot be
    // resolved (e.g. proxy header trust not configured). Warn so a
    // misconfigured self-hosted deployment doesn't silently run with zero
    // rate limiting.
    console.warn('CSP report rate limiting skipped: client IP could not be resolved', {
      reason: 'proxy header trust not configured',
    });
  }

  const parsed = parseCspReportBody(bodyResult.body);
  if (!parsed.ok) {
    return NextResponse.json({ success: false, error: 'Invalid report' }, { status: 400 });
  }

  for (const violation of parsed.violations) {
    console.error('CSP violation report', violation);
  }

  // 204: acknowledged, nothing to return. Matches the Reporting API's
  // expectation that the endpoint not meaningfully respond with content.
  return new NextResponse(null, { status: 204 });
}
