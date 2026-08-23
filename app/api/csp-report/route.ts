import { NextResponse, type NextRequest } from 'next/server';
import { readRequestBodyWithLimit } from '@/lib/http/read-body';
import { MAX_CSP_REPORT_BODY_BYTES } from '@/lib/csp-report/constants';
import { parseCspReportBody } from '@/lib/csp-report/parse-report';

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
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const length = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(length) && length > MAX_CSP_REPORT_BODY_BYTES) {
      return new NextResponse(null, { status: 413 });
    }
  }

  const bodyResult = await readRequestBodyWithLimit(request, MAX_CSP_REPORT_BODY_BYTES);
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
