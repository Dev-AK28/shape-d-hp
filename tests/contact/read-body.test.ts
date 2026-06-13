import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { readRequestBodyWithLimit } from '@/lib/contact/read-body';

describe('readRequestBodyWithLimit', () => {
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
