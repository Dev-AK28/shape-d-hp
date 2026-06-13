import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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

function createRequest(body: string, ip = '203.0.113.50') {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
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
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: {
        'content-type': 'application/json',
        'content-length': String(33 * 1024),
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Payload too large',
    });
  });

  it('returns 200 when email send succeeds', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();
    const response = await POST(createRequest(JSON.stringify(validPayload), '203.0.113.51'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(sendContactEmail).toHaveBeenCalledOnce();
  });

  it('returns 500 and releases the rate limit slot when send fails', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: false, error: 'Resend error' });
    const POST = await loadPostHandler();
    const ip = '203.0.113.52';

    for (let i = 0; i < 5; i += 1) {
      const okResponse = await POST(createRequest(JSON.stringify(validPayload), ip));
      expect(okResponse.status).toBe(500);
    }

    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const recoveryResponse = await POST(createRequest(JSON.stringify(validPayload), ip));
    expect(recoveryResponse.status).toBe(200);
  });

  it('returns 429 after five successful sends within the window', async () => {
    vi.mocked(sendContactEmail).mockResolvedValue({ ok: true });
    const POST = await loadPostHandler();
    const ip = '203.0.113.53';

    for (let i = 0; i < 5; i += 1) {
      const response = await POST(createRequest(JSON.stringify(validPayload), ip));
      expect(response.status).toBe(200);
    }

    const limited = await POST(createRequest(JSON.stringify(validPayload), ip));
    expect(limited.status).toBe(429);
    await expect(limited.json()).resolves.toEqual({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
  });
});
