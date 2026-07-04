'use client';

import { createContext, useContext } from 'react';
import type Lenis from 'lenis';

/**
 * Exposes the active Lenis instance created by `SmoothScrollProvider` (#260).
 *
 * `null` when Lenis is not running — i.e. before the async `import('lenis')`
 * resolves, on the server, or when `shouldDisableSmoothScroll` is true
 * (`prefers-reduced-motion`). Consumers must fall back to native scrolling
 * (`window.scrollTo`) when the value is `null`.
 */
export const LenisContext = createContext<Lenis | null>(null);

/** Returns the active Lenis instance, or `null` when smooth scrolling is inactive. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}
