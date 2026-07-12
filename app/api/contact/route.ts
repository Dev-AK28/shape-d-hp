import { NextRequest, NextResponse } from 'next/server';
import { MAX_CONTACT_BODY_BYTES } from '@/lib/contact/constants';
import { readRequestBodyWithLimit } from '@/lib/contact/read-body';
import { extractClientIp } from '@/lib/contact/rate-limit';
import { getRateLimitService, type RateLimitService } from '@/lib/contact/rate-limit-service';
import { contactFormSchema } from '@/lib/contact/schema';
import { sendContactEmail } from '@/lib/contact/send-email';

const SERVER_ERROR_MESSAGE = 'Failed to process form';

function parseJsonBody(rawBody: string): unknown | null {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return null;
  }
}

function serverErrorResponse() {
  return NextResponse.json({ success: false, error: SERVER_ERROR_MESSAGE }, { status: 500 });
}

export async function POST(request: NextRequest) {
  let rateLimit: RateLimitService | null = null;
  let clientIp: string | null = null;
  let slotAcquired = false;

  async function releaseAcquiredSlot(): Promise<void> {
    if (!slotAcquired || !clientIp || !rateLimit) {
      return;
    }
    slotAcquired = false;
    try {
      await rateLimit.release(clientIp);
    } catch (error) {
      console.error('Rate limit release failed', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
    }
  }

  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const length = Number.parseInt(contentLength, 10);
      if (!Number.isNaN(length) && length > MAX_CONTACT_BODY_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Payload too large' },
          { status: 413 },
        );
      }
    }

    const bodyResult = await readRequestBodyWithLimit(request, MAX_CONTACT_BODY_BYTES);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { success: false, error: 'Payload too large' },
        { status: 413 },
      );
    }

    const rawBody = bodyResult.body;
    const parsedJson = parseJsonBody(rawBody);
    if (parsedJson === null) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 },
      );
    }

    const parsed = contactFormSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    clientIp = extractClientIp(request.headers);

    if (clientIp) {
      rateLimit = getRateLimitService();

      let allowed = true;
      let acquiredSlot = false;
      try {
        allowed = await rateLimit.tryAcquire(clientIp);
        acquiredSlot = allowed;
      } catch (error) {
        // Fail open: if the rate limiter backend (e.g. Upstash Redis) is down,
        // it must not take the entire contact form offline. Log loudly so the
        // outage is observable, then let the submission proceed unlimited.
        //
        // Known residual edge case (#403): if this throw is a client-side
        // timeout on the `eval` call *after* Upstash already executed the
        // INCR server-side (i.e. not a hard connection failure), the counter
        // was incremented but we still fail open here, so that increment is
        // never released. This is a low-likelihood leak of at most one slot
        // into the rate-limit window and is accepted as a trade-off of the
        // fail-open design; no functional fix is planned.
        console.error('Rate limit acquire failed; failing open (allowing request)', {
          name: error instanceof Error ? error.name : 'UnknownError',
        });
        allowed = true;
      }

      if (!allowed) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 },
        );
      }

      slotAcquired = acquiredSlot;
    } else {
      // Rate limiting is intentionally skipped when the client IP cannot be
      // resolved (e.g. proxy header trust not configured). Warn so a
      // misconfigured self-hosted deployment doesn't silently run with zero
      // rate limiting.
      console.warn('Rate limiting skipped: client IP could not be resolved', {
        reason: 'proxy header trust not configured',
      });
    }

    const result = await sendContactEmail(parsed.data);

    if (!result.ok) {
      await releaseAcquiredSlot();
      console.error('Contact email failed', { error: result.error });
      return serverErrorResponse();
    }

    slotAcquired = false;
    return NextResponse.json({ success: true });
  } catch {
    await releaseAcquiredSlot();
    return serverErrorResponse();
  }
}
