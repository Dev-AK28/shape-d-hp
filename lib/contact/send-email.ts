import { CONTACT_RECIPIENTS } from './constants';
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
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: [...CONTACT_RECIPIENTS],
      reply_to: data.email,
      subject: `[Shape-D] お問い合わせ: ${data.name}`,
      text: [
        `お名前: ${data.name}`,
        `メール: ${data.email}`,
        `会社名: ${data.company || '（未入力）'}`,
        '',
        data.message,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    return { ok: false, error: 'Failed to send email' };
  }

  return { ok: true };
}
