import type { NextRequest } from 'next/server';

export type ReadBodyResult =
  | { ok: true; body: string }
  | { ok: false; reason: 'too_large' };

/** Reads the request body up to maxBytes without buffering excess data. */
export async function readRequestBodyWithLimit(
  request: NextRequest,
  maxBytes: number,
): Promise<ReadBodyResult> {
  const reader = request.body?.getReader();

  if (!reader) {
    return { ok: true, body: '' };
  }

  const decoder = new TextDecoder();
  let received = 0;
  let body = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      return { ok: false, reason: 'too_large' };
    }

    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return { ok: true, body };
}

/**
 * Rejects an oversized body cheaply via `Content-Length` when present and
 * accurate, then falls back to the streaming `readRequestBodyWithLimit`
 * (which also catches a missing/understated `Content-Length`). Shared by
 * every route handler that needs a size-bounded read so the two checks
 * can't drift apart between routes (see app/api/contact/route.ts and
 * app/api/csp-report/route.ts).
 */
export async function readBodyWithSizeGuard(
  request: NextRequest,
  maxBytes: number,
): Promise<ReadBodyResult> {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const length = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(length) && length > maxBytes) {
      return { ok: false, reason: 'too_large' };
    }
  }

  return readRequestBodyWithLimit(request, maxBytes);
}
