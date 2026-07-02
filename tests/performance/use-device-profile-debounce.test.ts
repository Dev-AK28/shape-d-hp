import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { RESIZE_DEBOUNCE_MS } from '@/lib/hooks/useDeviceProfile';

const source = readFileSync(
  resolve(process.cwd(), 'lib/hooks/useDeviceProfile.ts'),
  'utf8',
);

/**
 * Static-analysis tests for the debounce guard on the resize listener
 * introduced in Issue #251.
 *
 * Why static analysis instead of renderHook?
 * subscribeToDeviceProfile is an implementation detail that is passed directly
 * to useSyncExternalStore. Calling it in tests requires a full matchMedia/window
 * mock harness. The key invariants (debounce wrapper, cleanup, constant value)
 * are structural — a static scan enforces them reliably without the overhead of
 * a JSDOM mount and fake-timer orchestration.
 */
describe('useDeviceProfile — resize debounce (#251)', () => {
  it('exports RESIZE_DEBOUNCE_MS as 150 ms', () => {
    expect(RESIZE_DEBOUNCE_MS).toBe(150);
  });

  it('uses setTimeout with RESIZE_DEBOUNCE_MS for the resize handler', () => {
    // The resize listener must NOT call onStoreChange directly.
    // It must pass through a debounced wrapper that uses setTimeout.
    expect(source).toContain('setTimeout(onStoreChange, RESIZE_DEBOUNCE_MS)');
  });

  it('clears the pending timer in the cleanup function to prevent stale callbacks', () => {
    // When the subscriber is removed (component unmount or React re-subscribe),
    // any pending debounce timer must be cancelled to prevent a stale onStoreChange
    // from firing after the component is gone.
    expect(source).toContain('clearTimeout(resizeTimer)');
  });

  it('attaches the debounced wrapper (not raw onStoreChange) to the resize event', () => {
    // Direct: window.addEventListener('resize', onStoreChange)   ← forbidden
    // Correct: window.addEventListener('resize', debouncedStoreChange)
    const addResizeLine = source
      .split('\n')
      .find((line) => line.includes("addEventListener('resize'"));
    expect(addResizeLine).toBeDefined();
    expect(addResizeLine).not.toContain('onStoreChange');
  });

  it('removes the same debounced wrapper in cleanup (no listener leak)', () => {
    // removeEventListener must reference the same wrapper reference, otherwise
    // the original handler is never removed.
    const removeResizeLine = source
      .split('\n')
      .find((line) => line.includes("removeEventListener('resize'"));
    expect(removeResizeLine).toBeDefined();
    expect(removeResizeLine).not.toContain('onStoreChange');
  });
});
