import { describe, expect, it } from 'vitest';
import { contactFormSchema } from '@/lib/contact/schema';

describe('contactFormSchema', () => {
  it('accepts valid input', () => {
    const result = contactFormSchema.safeParse({
      name: '山田 太郎',
      email: 'test@example.com',
      company: '株式会社テスト',
      message: 'お問い合わせ内容です。',
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = contactFormSchema.safeParse({
      name: '',
      email: 'test@example.com',
      message: 'hello',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'not-an-email',
      message: 'hello',
    });

    expect(result.success).toBe(false);
  });

  it('ignores extra fields such as client-supplied to', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      message: 'hello',
      to: 'attacker@evil.com',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('to');
    }
  });
});
