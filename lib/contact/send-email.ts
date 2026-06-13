import { CONTACT_RECIPIENTS, RESEND_TIMEOUT_MS } from './constants';
import {
  buildContactEmailBody,
  buildContactEmailSubject,
  formatFromAddress,
  sanitizeEmailHeaderValue,
} from './email-format';
import type { ContactFormInput } from './schema';

type SendResult = { ok: true } | { ok: false; error: string };

export async function sendContactEmail(data: ContactFormInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      return { ok: true };
    }
    return { ok: false, error: 'Email service is not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: formatFromAddress(),
        to: [...CONTACT_RECIPIENTS],
        reply_to: sanitizeEmailHeaderValue(data.email),
        subject: buildContactEmailSubject(data.name),
        text: buildContactEmailBody(data),
      }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error('Resend API error', { status: response.status });
      return { ok: false, error: 'Failed to send email' };
    }

    return { ok: true };
  } catch (error) {
    console.error('Resend request failed', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return { ok: false, error: 'Failed to send email' };
  }
}
