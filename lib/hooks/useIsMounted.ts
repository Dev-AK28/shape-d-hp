'use client';

import { useSyncExternalStore } from 'react';

/**
 * SSR-safe "has the client mounted" flag — shared by Navigation.tsx,
 * PhilosophyProgressDots.tsx and useDeviceProfile's `isReady` (#385).
 *
 * Uses `useSyncExternalStore` with a no-op subscribe rather than an
 * effect + `useState`, so React itself resolves SSR-vs-client without a
 * post-mount re-render flash — `false` on the server/first paint, then
 * `true` on the client, in the same commit React would otherwise need an
 * extra render for.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
