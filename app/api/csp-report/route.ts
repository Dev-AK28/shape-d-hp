import { NextResponse, type NextRequest } from 'next/server';
import { readBodyWithSizeGuard } from '@/lib/http/read-body';
import { extractClientIp } from '@/lib/http/rate-limit';
import { tryAcquireRateLimitSlotFailOpen } from '@/lib/http/rate-limit-service';
import { MAX_CSP_REPORT_BODY_BYTES } from '@/lib/csp-report/constants';
import { parseCspReportBody } from '@/lib/csp-report/parse-report';
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
  // Request-volume rate limit (#475), checked first — before the body-size
  // guard and any parsing/logging — so an over-threshold IP is rejected as
  // cheaply as possible. Checking this after the size guard would let an
  // oversized-body flood dodge the limiter entirely (every request would be
  // rejected 413 without ever being counted).
  const clientIp = extractClientIp(request.headers);
  if (clientIp) {
    const { allowed } = await tryAcquireRateLimitSlotFailOpen(
      getRateLimitService(),
      clientIp,
      'CSP report rate limit acquire failed; failing open (allowing request)',
    );

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

  const bodyResult = await readBodyWithSizeGuard(request, MAX_CSP_REPORT_BODY_BYTES);
  if (!bodyResult.ok) {
    return new NextResponse(null, { status: 413 });
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
