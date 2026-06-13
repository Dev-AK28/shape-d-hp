import { CONTACT_EMAIL } from './constants';
import {
  buildContactEmailBody,
  buildContactEmailSubject,
  formatFromAddress,
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

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: formatFromAddress(),
      to: [CONTACT_EMAIL],
      reply_to: data.email,
      subject: buildContactEmailSubject(data.name),
      text: buildContactEmailBody(data),
    }),
  });

  if (!response.ok) {
    return { ok: false, error: 'Failed to send email' };
  }

  return { ok: true };
}
