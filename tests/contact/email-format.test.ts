import { describe, expect, it } from 'vitest';
import {
  buildContactEmailBody,
  buildContactEmailSubject,
  formatFromAddress,
  sanitizeEmailHeaderValue,
} from '@/lib/contact/email-format';

describe('email-format', () => {
  it('formats From header per spec', () => {
    process.env.RESEND_FROM_NAME = 'shape-d-hp';
    process.env.RESEND_FROM_EMAIL = 'onboarding@resend.dev';

    expect(formatFromAddress()).toBe('shape-d-hp <onboarding@resend.dev>');
  });

  it('sanitizes From email address', () => {
    process.env.RESEND_FROM_NAME = 'shape-d-hp';
    process.env.RESEND_FROM_EMAIL = 'bad\r\n@resend.dev';

    expect(formatFromAddress()).toBe('shape-d-hp <bad@resend.dev>');
  });

  it('builds subject with from name prefix', () => {
    process.env.RESEND_FROM_NAME = 'shape-d-hp';

    expect(buildContactEmailSubject('山田太郎')).toBe('[shape-d-hp] お問い合わせ: 山田太郎');
  });

  it('includes site header in body', () => {
    process.env.RESEND_FROM_NAME = 'shape-d-hp';

    const body = buildContactEmailBody({
      name: '山田太郎',
      email: 'test@example.com',
      company: '',
      message: 'テスト',
    });

    expect(body.startsWith('送信元: shape-d-hp (https://www.shape-d.com)')).toBe(true);
    expect(body).toContain('テスト');
  });

  it('strips control characters from subject name', () => {
    process.env.RESEND_FROM_NAME = 'shape-d-hp';

    expect(buildContactEmailSubject('悪意\nBcc: attacker@evil.com')).toBe(
      '[shape-d-hp] お問い合わせ: 悪意Bcc: attacker@evil.com',
    );
  });

  it('sanitizes header values', () => {
    expect(sanitizeEmailHeaderValue('  hello\r\nworld  ')).toBe('helloworld');
  });
});
