import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { MAX_CSP_REPORT_BODY_BYTES } from '@/lib/csp-report/constants';
import {
  CSP_REPORT_RATE_LIMIT_MAX,
  resetRateLimitServiceForTests,
} from '@/lib/csp-report/rate-limit-service';
import { POST } from '@/app/api/csp-report/route';

function createRequest(
  body: string,
  options: { contentType?: string; contentLength?: string; ip?: string } = {},
) {
  const headers: Record<string, string> = {
    'content-type': options.contentType ?? 'application/reports+json',
  };
  if (options.contentLength !== undefined) {
    headers['content-length'] = options.contentLength;
  }
  if (options.ip !== undefined) {
    headers['x-forwarded-for'] = options.ip;
  }

  return new NextRequest('http://localhost/api/csp-report', {
    method: 'POST',
    body,
    headers,
  });
}

describe('POST /api/csp-report', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    // Force the in-memory rate-limit backend regardless of the ambient
    // environment (mirrors tests/csp-report/rate-limit-service.test.ts and
    // tests/http/rate-limit-service.test.ts) — otherwise real Upstash/KV
    // credentials present in the environment would route these assertions
    // through Redis, making them flaky/order-dependent against remote state.
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');
    resetRateLimitServiceForTests();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.unstubAllEnvs();
    resetRateLimitServiceForTests();
  });

  it('returns 204 and logs a Reporting API v1 (report-to) batch', async () => {
    const payload = JSON.stringify([
      {
        type: 'csp-violation',
        body: {
          documentURL: 'https://example.com/',
          effectiveDirective: 'script-src-elem',
          disposition: 'enforce',
          blockedURL: 'https://evil.example/x.js',
        },
      },
    ]);

    const response = await POST(createRequest(payload));

    expect(response.status).toBe(204);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CSP violation report',
      expect.objectContaining({ blockedUri: 'https://evil.example/x.js' }),
    );
  });

  it('returns 204 and logs a legacy report-uri payload', async () => {
    const payload = JSON.stringify({
      'csp-report': {
        'document-uri': 'https://example.com/',
        'violated-directive': 'style-src-attr',
        'blocked-uri': 'inline',
      },
    });

    const response = await POST(
      createRequest(payload, { contentType: 'application/csp-report' }),
    );

    expect(response.status).toBe(204);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CSP violation report',
      expect.objectContaining({ blockedUri: 'inline' }),
    );
  });

  it('returns 204 without logging when the batch has no csp-violation entries', async () => {
    const response = await POST(createRequest(JSON.stringify([{ type: 'deprecation' }])));

    expect(response.status).toBe(204);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(createRequest('not-json'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ success: false, error: 'Invalid report' });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('returns 400 for a recognized-but-unexpected JSON shape', async () => {
    const response = await POST(createRequest(JSON.stringify({ unexpected: true })));

    expect(response.status).toBe(400);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('returns 413 when Content-Length exceeds the body limit', async () => {
    const response = await POST(
      createRequest('{}', { contentLength: String(MAX_CSP_REPORT_BODY_BYTES + 1) }),
    );

    expect(response.status).toBe(413);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('returns 413 when the actual body exceeds the limit without a matching Content-Length', async () => {
    const oversized = JSON.stringify([
      { type: 'csp-violation', body: { blockedURL: 'x'.repeat(MAX_CSP_REPORT_BODY_BYTES) } },
    ]);

    const response = await POST(createRequest(oversized));

    expect(response.status).toBe(413);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  describe('rate limiting (#475)', () => {
    it('returns 429 without parsing/logging once an IP exceeds the request-volume limit', async () => {
      const validPayload = JSON.stringify({ 'csp-report': { 'blocked-uri': 'inline' } });

      for (let i = 0; i < CSP_REPORT_RATE_LIMIT_MAX; i += 1) {
        const response = await POST(
          createRequest(validPayload, { contentType: 'application/csp-report', ip: '203.0.113.9' }),
        );
        expect(response.status).toBe(204);
      }

      consoleErrorSpy.mockClear();

      const blocked = await POST(
        createRequest(validPayload, { contentType: 'application/csp-report', ip: '203.0.113.9' }),
      );

      expect(blocked.status).toBe(429);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns 429 (not 413) for an oversized body once the IP is rate-limited, so an oversized-body flood cannot dodge the limiter', async () => {
      const validPayload = JSON.stringify({ 'csp-report': { 'blocked-uri': 'inline' } });

      for (let i = 0; i < CSP_REPORT_RATE_LIMIT_MAX; i += 1) {
        await POST(
          createRequest(validPayload, { contentType: 'application/csp-report', ip: '203.0.113.10' }),
        );
      }

      const oversized = JSON.stringify([
        { type: 'csp-violation', body: { blockedURL: 'x'.repeat(MAX_CSP_REPORT_BODY_BYTES) } },
      ]);

      const response = await POST(createRequest(oversized, { ip: '203.0.113.10' }));

      expect(response.status).toBe(429);
    });

    it('does not rate-limit one IP based on another IP’s volume', async () => {
      const validPayload = JSON.stringify({ 'csp-report': { 'blocked-uri': 'inline' } });

      for (let i = 0; i < CSP_REPORT_RATE_LIMIT_MAX; i += 1) {
        await POST(
          createRequest(validPayload, { contentType: 'application/csp-report', ip: '198.51.100.1' }),
        );
      }

      const otherIp = await POST(
        createRequest(validPayload, { contentType: 'application/csp-report', ip: '198.51.100.2' }),
      );

      expect(otherIp.status).toBe(204);
    });

    it('does not rate-limit when the client IP cannot be resolved', async () => {
      // No `ip` option -> no x-forwarded-for header -> extractClientIp() returns null.
      const validPayload = JSON.stringify({ 'csp-report': { 'blocked-uri': 'inline' } });

      for (let i = 0; i < CSP_REPORT_RATE_LIMIT_MAX + 5; i += 1) {
        const response = await POST(
          createRequest(validPayload, { contentType: 'application/csp-report' }),
        );
        expect(response.status).toBe(204);
      }
    });
  });
});
