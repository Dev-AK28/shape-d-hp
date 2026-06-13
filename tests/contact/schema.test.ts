import { describe, expect, it } from 'vitest';
import { contactFormSchema } from '@/lib/contact/schema';

describe('contactFormSchema', () => {
  it('accepts valid input', () => {
    const result = contactFormSchema.safeParse({
      name: '山田太郎',
      email: 'test@example.com',
      company: 'Shape-D',
      message: 'お問い合わせ内容',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = contactFormSchema.safeParse({
      name: '',
      email: 'test@example.com',
      message: 'message',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test',
      email: 'not-an-email',
      message: 'message',
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty message', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
      message: '',
    });

    expect(result.success).toBe(false);
  });

  it('strips unknown fields such as client-provided to', () => {
    const result = contactFormSchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
      message: 'Hello',
      to: 'attacker@example.com',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('to');
    }
  });
});
