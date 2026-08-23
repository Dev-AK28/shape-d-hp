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
