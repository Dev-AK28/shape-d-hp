import type { ContactFormInput } from './schema';

const DEFAULT_FROM_NAME = 'shape-d-hp';
const SITE_URL = 'https://www.shape-d.com';

export function sanitizeEmailHeaderValue(value: string): string {
  return value.replace(/[\r\n\0]/g, '').trim();
}

export function getFromName(): string {
  return sanitizeEmailHeaderValue(process.env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME);
}

export function formatFromAddress(): string {
  const email = sanitizeEmailHeaderValue(
    process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
  );
  return `${getFromName()} <${email}>`;
}

export function buildContactEmailSubject(name: string): string {
  return `[${getFromName()}] お問い合わせ: ${sanitizeEmailHeaderValue(name)}`;
}

export function buildContactEmailBody(data: ContactFormInput): string {
  return [
    `送信元: ${getFromName()} (${SITE_URL})`,
    '',
    `お名前: ${data.name}`,
    `メール: ${data.email}`,
    `会社名: ${data.company || '（未入力）'}`,
    '',
    data.message,
  ].join('\n');
}
