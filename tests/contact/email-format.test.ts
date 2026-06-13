import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildContactEmailBody,
  buildContactEmailSubject,
  formatFromAddress,
} from '@/lib/contact/email-format';

describe('formatFromAddress', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses shape-d-hp as default display name', () => {
    vi.stubEnv('RESEND_FROM_EMAIL', 'hello@shape-d.com');
    expect(formatFromAddress()).toBe('shape-d-hp <hello@shape-d.com>');
  });

  it('allows overriding display name via RESEND_FROM_NAME', () => {
    vi.stubEnv('RESEND_FROM_NAME', 'Shape-D Website');
    vi.stubEnv('RESEND_FROM_EMAIL', 'noreply@shape-d.com');
    expect(formatFromAddress()).toBe('Shape-D Website <noreply@shape-d.com>');
  });
});

describe('buildContactEmailSubject', () => {
  it('includes shape-d-hp in subject', () => {
    expect(buildContactEmailSubject('山田太郎')).toBe('[shape-d-hp] お問い合わせ: 山田太郎');
  });
});

describe('buildContactEmailBody', () => {
  it('includes shape-d-hp source label in body', () => {
    const body = buildContactEmailBody({
      name: 'Test User',
      email: 'user@example.com',
      company: '',
      message: 'Hello',
    });

    expect(body).toContain('送信元: shape-d-hp');
    expect(body).toContain('shape-d-hp お問い合わせフォーム');
    expect(body).toContain('Hello');
  });
});
