import { NextRequest, NextResponse } from 'next/server';
import { MAX_CONTACT_BODY_BYTES } from '@/lib/contact/constants';
import {
  extractClientIp,
  releaseRateLimitSlot,
  tryAcquireRateLimitSlot,
  type RateLimitStore,
} from '@/lib/contact/rate-limit';
import { contactFormSchema } from '@/lib/contact/schema';
import { sendContactEmail } from '@/lib/contact/send-email';

const rateLimitStore: RateLimitStore = new Map();
const SERVER_ERROR_MESSAGE = 'Failed to process form';

function parseJsonBody(rawBody: string): unknown | null {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
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

    const rawBody = await request.text();

    if (rawBody.length > MAX_CONTACT_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Payload too large' },
        { status: 413 },
      );
    }

    const body = parseJsonBody(rawBody);
    if (body === null) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 },
      );
    }

    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const clientIp = extractClientIp(request.headers);
    let slotAcquired = false;

    if (clientIp) {
      if (!tryAcquireRateLimitSlot(clientIp, rateLimitStore)) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429 },
        );
      }
      slotAcquired = true;
    }

    const result = await sendContactEmail(parsed.data);

    if (!result.ok) {
      if (clientIp && slotAcquired) {
        releaseRateLimitSlot(clientIp, rateLimitStore);
      }
      console.error('Contact email failed', { error: result.error });
      return NextResponse.json({ success: false, error: SERVER_ERROR_MESSAGE }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: SERVER_ERROR_MESSAGE }, { status: 500 });
  }
}
