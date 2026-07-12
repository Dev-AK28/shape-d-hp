import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { MAX_CONTACT_BODY_BYTES } from '@/lib/contact/constants';

vi.mock('@/lib/contact/send-email', () => ({
  sendContactEmail: vi.fn(),
}));

import { sendContactEmail } from '@/lib/contact/send-email';

const validPayload = {
  name: 'Test User',
  email: 'test@example.com',
  company: 'Example Co',
  message: 'Hello from integration test',
};

function createRequest(body: string, options: { ip?: string; contentLength?: string } = {}) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (options.ip !== undefined) {
    headers['x-forwarded-for'] = options.ip;
  }

  if (options.contentLength !== undefined) {
    headers['content-length'] = options.contentLength;
  }

  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body,
    headers,
  });
}

async function loadPostHandler() {
  vi.resetModules();
  const route = await import('@/app/api/contact/route');
  return route.POST;
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.mocked(sendContactEmail).mockReset();
  });

  it('returns 400 for invalid JSON', async () => {
    const POST = await loadPostHandler();
    const response = await POST(createRequest('not-json'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Invalid input',
    });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('returns 400 for an empty body', async () => {
    const POST = await loadPostHandler();
    const response = await POST(createRequest(''));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Invalid input',
    });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('returns 400 for schema validation errors', async () => {
    const POST = await loadPostHandler();
    const response = await POST(createRequest(JSON.stringify({ name: '', email: 'bad', message: '' })));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid input');
    expect(body.details).toBeDefined();
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('returns 413 when content-length exceeds the limit', async () => {
    const POST = await loadPostHandler();
    const response = await POST(
      createRequest(JSON.stringify(validPayload), {
        contentLength: String(MAX_CONTACT_BODY_BYTES + 1),
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Payload too large',
    });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('returns 413 when body exceeds the limit without content-length', async () => {
    const POST = await loadPostHandler();
    const oversizedBody = JSON.stringify({
      ...validPayload,
      message: 'x'.repeat(MAX_CONTACT_BODY_BYTES),
    });

    const response = await POST(createRequest(oversizedBody));

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Payload too large',
    });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('returns 413 when content-length underreports the body size', async () => {
    const POST = await loadPostHandler();
    const oversizedBody = JSON.stringify({
      ...validPayload,
      message: 'x'.repeat(MAX_CONTACT_BODY_BYTES),
    });

    const response = await POST(
      createRequest(oversizedBody, {
        contentLength: '1',
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Payload too large',
    });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('returns 200 when email send succeeds', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();
    const response = await POST(createRequest(JSON.stringify(validPayload), { ip: '203.0.113.51' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(sendContactEmail).toHaveBeenCalledOnce();
  });

  it('returns 500 with a fixed message and releases the rate limit slot when send fails', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: false, error: 'Resend error' });
    const POST = await loadPostHandler();
    const ip = '203.0.113.52';

    for (let i = 0; i < 5; i += 1) {
      const failedResponse = await POST(createRequest(JSON.stringify(validPayload), { ip }));
      expect(failedResponse.status).toBe(500);
      await expect(failedResponse.json()).resolves.toEqual({
        success: false,
        error: 'Failed to process form',
      });
    }

    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const recoveryResponse = await POST(createRequest(JSON.stringify(validPayload), { ip }));
    expect(recoveryResponse.status).toBe(200);
  });

  it('releases the rate limit slot when sendContactEmail throws', async () => {
    vi.mocked(sendContactEmail)
      .mockRejectedValueOnce(new Error('Unexpected Resend failure'))
      .mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();
    const ip = '203.0.113.56';

    const failedResponse = await POST(createRequest(JSON.stringify(validPayload), { ip }));
    expect(failedResponse.status).toBe(500);

    const recoveryResponse = await POST(createRequest(JSON.stringify(validPayload), { ip }));
    expect(recoveryResponse.status).toBe(200);
    expect(sendContactEmail).toHaveBeenCalledTimes(2);
  });

  it('returns 429 after five successful sends within the window', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();
    const ip = '203.0.113.53';

    for (let i = 0; i < 5; i += 1) {
      const response = await POST(createRequest(JSON.stringify(validPayload), { ip }));
      expect(response.status).toBe(200);
    }

    vi.mocked(sendContactEmail).mockClear();
    const limited = await POST(createRequest(JSON.stringify(validPayload), { ip }));
    expect(limited.status).toBe(429);
    await expect(limited.json()).resolves.toEqual({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it('does not consume rate limit slots for 400 responses', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();
    const ip = '203.0.113.54';

    for (let i = 0; i < 6; i += 1) {
      const response = await POST(createRequest('not-json', { ip }));
      expect(response.status).toBe(400);
    }

    const successResponse = await POST(createRequest(JSON.stringify(validPayload), { ip }));
    expect(successResponse.status).toBe(200);
    expect(sendContactEmail).toHaveBeenCalledOnce();
  });

  it('does not consume rate limit slots for 413 responses', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();
    const ip = '203.0.113.55';
    const oversizedBody = JSON.stringify({
      ...validPayload,
      message: 'x'.repeat(MAX_CONTACT_BODY_BYTES),
    });

    for (let i = 0; i < 6; i += 1) {
      const response = await POST(createRequest(oversizedBody, { ip }));
      expect(response.status).toBe(413);
    }

    const successResponse = await POST(createRequest(JSON.stringify(validPayload), { ip }));
    expect(successResponse.status).toBe(200);
    expect(sendContactEmail).toHaveBeenCalledOnce();
  });

  it('skips rate limiting when no IP headers are present', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();

    for (let i = 0; i < 6; i += 1) {
      const response = await POST(createRequest(JSON.stringify(validPayload)));
      expect(response.status).toBe(200);
    }

    expect(sendContactEmail).toHaveBeenCalledTimes(6);
  });

  it('awaits rate limit release when sendContactEmail fails with Redis backend', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const tryAcquire = vi.fn().mockResolvedValue(true);

    vi.doMock('@/lib/contact/rate-limit-service', () => ({
      getRateLimitService: () => ({ tryAcquire, release }),
    }));

    vi.mocked(sendContactEmail).mockResolvedValue({ ok: false, error: 'Resend error' });
    vi.resetModules();
    const route = await import('@/app/api/contact/route');
    const POST = route.POST;

    const response = await POST(createRequest(JSON.stringify(validPayload), { ip: '203.0.113.60' }));

    expect(response.status).toBe(500);
    expect(tryAcquire).toHaveBeenCalledOnce();
    expect(release).toHaveBeenCalledOnce();

    vi.doUnmock('@/lib/contact/rate-limit-service');
  });

  it('fails open and still sends the email when the rate limiter throws (Redis outage)', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const tryAcquire = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const release = vi.fn().mockResolvedValue(undefined);

    vi.doMock('@/lib/contact/rate-limit-service', () => ({
      getRateLimitService: () => ({ tryAcquire, release }),
    }));

    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    vi.resetModules();
    const route = await import('@/app/api/contact/route');
    const POST = route.POST;

    const response = await POST(createRequest(JSON.stringify(validPayload), { ip: '203.0.113.61' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(sendContactEmail).toHaveBeenCalledOnce();
    expect(tryAcquire).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Rate limit acquire failed; failing open (allowing request)',
      expect.objectContaining({ name: 'Error' }),
    );

    vi.doUnmock('@/lib/contact/rate-limit-service');
    consoleErrorSpy.mockRestore();
  });

  it('warns when rate limiting is skipped because the client IP could not be resolved', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();

    const response = await POST(createRequest(JSON.stringify(validPayload)));

    expect(response.status).toBe(200);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Rate limiting skipped: client IP could not be resolved',
      expect.any(Object),
    );

    consoleWarnSpy.mockRestore();
  });
});
