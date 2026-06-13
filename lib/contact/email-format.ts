import type { ContactFormInput } from './schema';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.shape-d.com';

export function formatFromAddress(
  fromEmail?: string,
  fromName?: string,
): string {
  const email = fromEmail ?? process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const name = fromName ?? process.env.RESEND_FROM_NAME ?? 'shape-d-hp';
  return `${name} <${email}>`;
}

export function buildContactEmailSubject(name: string): string {
  return `[shape-d-hp] お問い合わせ: ${name}`;
}

export function buildContactEmailBody(data: ContactFormInput): string {
  return [
    `送信元: shape-d-hp (${SITE_URL})`,
    '',
    `お名前: ${data.name}`,
    `メール: ${data.email}`,
    `会社名: ${data.company || '（未入力）'}`,
    '',
    data.message,
    '',
    '---',
    'このメールは shape-d-hp お問い合わせフォームから送信されました。',
  ].join('\n');
}
