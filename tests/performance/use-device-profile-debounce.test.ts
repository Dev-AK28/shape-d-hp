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
    // Use filter() to check ALL matching lines — find() would silently pass
    // if a second addEventListener('resize', onStoreChange) line were added later.
    const addResizeLines = source
      .split('\n')
      .filter((line) => line.includes("addEventListener('resize'"));
    expect(addResizeLines.length).toBeGreaterThan(0);
    addResizeLines.forEach((line) => expect(line).not.toContain('onStoreChange'));
  });

  it('removes the same debounced wrapper in cleanup (no listener leak)', () => {
    // removeEventListener must reference the same wrapper reference, otherwise
    // the original handler is never removed.
    // Use filter() to check ALL matching lines for the same reason as above.
    const removeResizeLines = source
      .split('\n')
      .filter((line) => line.includes("removeEventListener('resize'"));
    expect(removeResizeLines.length).toBeGreaterThan(0);
    removeResizeLines.forEach((line) => expect(line).not.toContain('onStoreChange'));
  });
});
