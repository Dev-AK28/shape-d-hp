import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectWebGLSupport, resetWebGLSupportCache } from '@/lib/webgl/support';

/**
 * Tests run in the Node.js environment (no jsdom).
 * We stub global.window and global.document to simulate browser / SSR contexts.
 */

function makeCanvasMock(ctxResult: unknown) {
  return { getContext: vi.fn().mockReturnValue(ctxResult) };
}

function stubBrowser(canvas: ReturnType<typeof makeCanvasMock>) {
  vi.stubGlobal('window', {});
  vi.stubGlobal('document', { createElement: vi.fn().mockReturnValue(canvas) });
}

describe('detectWebGLSupport', () => {
  afterEach(() => {
    resetWebGLSupportCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns false when window is not available (SSR)', () => {
    // In the Node.js test environment, window is undefined by default.
    expect(detectWebGLSupport()).toBe(false);
  });

  it('returns true when WebGL2 context is available', () => {
    stubBrowser(makeCanvasMock({}));
    expect(detectWebGLSupport()).toBe(true);
  });

  it('falls back to WebGL1 when WebGL2 is unavailable', () => {
    const canvas = { getContext: vi.fn().mockImplementation((type: string) => (type === 'webgl2' ? null : {})) };
    stubBrowser(canvas);
    expect(detectWebGLSupport()).toBe(true);
  });

  it('returns false when neither WebGL2 nor WebGL1 is available', () => {
    stubBrowser(makeCanvasMock(null));
    expect(detectWebGLSupport()).toBe(false);
  });

  it('caches the result after the first call', () => {
    const canvas = makeCanvasMock({});
    stubBrowser(canvas);

    detectWebGLSupport();
    detectWebGLSupport();

    // canvas.getContext is only called once (cache hit on second call)
    expect(canvas.getContext).toHaveBeenCalledTimes(1);
  });

  it('returns false when getContext throws', () => {
    const canvas = { getContext: vi.fn().mockImplementation(() => { throw new Error('no WebGL'); }) };
    stubBrowser(canvas);
    expect(detectWebGLSupport()).toBe(false);
  });
});
