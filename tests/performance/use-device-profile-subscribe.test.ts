/**
 * @vitest-environment jsdom
 *
 * Behavioral contract tests for the resize debounce in subscribeToDeviceProfile (#258).
 *
 * The static-analysis test (tests/performance/use-device-profile-debounce.test.ts, #251/#257)
 * guarantees structural invariants (setTimeout wrapper / clearTimeout / listener identity).
 * These tests complement it with the runtime behavior that static analysis cannot prove:
 *   1. rapid resize events within RESIZE_DEBOUNCE_MS collapse into a single onStoreChange
 *   2. cleanup before the timer fires cancels the pending onStoreChange
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESIZE_DEBOUNCE_MS, subscribeToDeviceProfile } from '@/lib/hooks/useDeviceProfile';

type MockMediaQuery = {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
};

const makeMockQuery = (): MockMediaQuery => ({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

beforeEach(() => {
  // jsdom does not implement matchMedia; subscribeToDeviceProfile calls it 4 times.
  vi.stubGlobal('matchMedia', vi.fn(() => makeMockQuery()));
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('subscribeToDeviceProfile — debounce behavioral contract (#258)', () => {
  it('calls onStoreChange once, RESIZE_DEBOUNCE_MS after a burst of resize events', () => {
    const onStoreChange = vi.fn();
    const cleanup = subscribeToDeviceProfile(onStoreChange);

    // Three resize events well within the debounce window.
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS - 1);
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS - 1);
    window.dispatchEvent(new Event('resize'));

    // No fire yet — the timer keeps resetting.
    expect(onStoreChange).not.toHaveBeenCalled();

    // After the full debounce delay from the last event, exactly one call.
    vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);
    expect(onStoreChange).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it('does not call onStoreChange when cleanup runs before the debounce timer fires', () => {
    const onStoreChange = vi.fn();
    const cleanup = subscribeToDeviceProfile(onStoreChange);

    window.dispatchEvent(new Event('resize'));
    // Tear down before the pending timer would fire.
    cleanup();

    vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS * 2);
    expect(onStoreChange).not.toHaveBeenCalled();
  });

  it('detaches the resize listener on cleanup so later resize events are ignored', () => {
    const onStoreChange = vi.fn();
    const cleanup = subscribeToDeviceProfile(onStoreChange);

    cleanup();

    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS * 2);
    expect(onStoreChange).not.toHaveBeenCalled();
  });
});
