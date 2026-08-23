import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { readBodyWithSizeGuard, readRequestBodyWithLimit } from '@/lib/http/read-body';

describe('readRequestBodyWithLimit', () => {
  it('returns an empty body when the request has no readable stream', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
    });

    await expect(readRequestBodyWithLimit(request, 32)).resolves.toEqual({
      ok: true,
      body: '',
    });
  });

  it('returns the full body when under the limit', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: '{"ok":true}',
    });

    await expect(readRequestBodyWithLimit(request, 32)).resolves.toEqual({
      ok: true,
      body: '{"ok":true}',
    });
  });

  it('allows a body exactly at the byte limit', async () => {
    const body = 'a'.repeat(32);
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body,
    });

    await expect(readRequestBodyWithLimit(request, 32)).resolves.toEqual({
      ok: true,
      body,
    });
  });

  it('stops reading once the limit is exceeded', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: 'a'.repeat(40),
    });

    await expect(readRequestBodyWithLimit(request, 32)).resolves.toEqual({
      ok: false,
      reason: 'too_large',
    });
  });
});

describe('readBodyWithSizeGuard', () => {
  it('rejects via Content-Length without reading the stream when it exceeds the limit', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: 'a'.repeat(10),
      headers: { 'content-length': '9999' },
    });

    await expect(readBodyWithSizeGuard(request, 32)).resolves.toEqual({
      ok: false,
      reason: 'too_large',
    });
  });

  it('falls back to the streaming read when Content-Length is missing or understated', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: 'a'.repeat(40),
      headers: { 'content-length': '1' },
    });

    await expect(readBodyWithSizeGuard(request, 32)).resolves.toEqual({
      ok: false,
      reason: 'too_large',
    });
  });

  it('returns the body when it is within the limit', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: '{"ok":true}',
    });

    await expect(readBodyWithSizeGuard(request, 32)).resolves.toEqual({
      ok: true,
      body: '{"ok":true}',
    });
  });
});
