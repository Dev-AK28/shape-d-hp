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
      if (!(await rateLimit.tryAcquire(clientIp))) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 },
        );
      }
      slotAcquired = true;
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
