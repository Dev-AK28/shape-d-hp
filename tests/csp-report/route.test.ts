import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { MAX_CSP_REPORT_BODY_BYTES } from '@/lib/csp-report/constants';
import { POST } from '@/app/api/csp-report/route';

function createRequest(
  body: string,
  options: { contentType?: string; contentLength?: string } = {},
) {
  const headers: Record<string, string> = {
    'content-type': options.contentType ?? 'application/reports+json',
  };
  if (options.contentLength !== undefined) {
    headers['content-length'] = options.contentLength;
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
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
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
});
