import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_RECIPIENTS } from '@/lib/contact/constants';
import { sendContactEmail } from '@/lib/contact/send-email';

describe('sendContactEmail', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns ok in development when RESEND_API_KEY is unset', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendContactEmail({
      name: 'Test User',
      email: 'test@example.com',
      company: '',
      message: 'Hello',
    });

    expect(result).toEqual({ ok: true });
  });

  it('returns error in production when RESEND_API_KEY is unset', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendContactEmail({
      name: 'Test User',
      email: 'test@example.com',
      company: '',
      message: 'Hello',
    });

    expect(result).toEqual({ ok: false, error: 'Email service is not configured' });
  });

  it('sends email via Resend when API key is configured', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'noreply@shape-d.example');

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendContactEmail({
      name: 'Test User',
      email: 'test@example.com',
      company: 'Shape-D',
      message: 'Hello',
    });

    expect(result).toEqual({ ok: true });
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(requestInit.body as string) as { to: string[] };
    expect(body.to).toEqual([...CONTACT_RECIPIENTS]);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test_key',
        }),
      })
    );
  });
});
