'use client';

import { type RefObject, useEffect } from 'react';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Calculates the window scroll-Y position that places panel `panelIndex`
 * in the viewport for a GSAP horizontal-pin ScrollTrigger.
 *
 * Exported as a pure function so it can be unit-tested without a DOM.
 *
 * @param panelIndex  0-based index of the target panel.
 * @param stStart     ScrollTrigger `start` value (Y offset where the pin locks).
 * @param innerWidth  Current `window.innerWidth` (one panel = one viewport width).
 */
export function computePanelScrollTarget(
  panelIndex: number,
  stStart: number,
  innerWidth: number,
): number {
  return stStart + panelIndex * innerWidth;
}

/**
 * Syncs the window scroll position with keyboard focus inside a GSAP
 * horizontal-pin ScrollTrigger.
 *
 * ## Problem
 * GSAP's horizontal-scroll pin uses `transform: translateX` to move panels —
 * the browser's native "scroll focused element into view" logic does not fire
 * because the layout offset of focusable elements never changes. Tabbing to
 * an off-screen card CTA therefore leaves the viewport showing the wrong panel.
 *
 * ## Solution
 * Listen for `focusin` on the document. When the focused element lives inside
 * a known panel, calculate the scroll offset that would place that panel in
 * the viewport and call `window.scrollTo` (instant, no `behavior` option) to
 * jump there. Using instant scroll lets Lenis pick up the new position on its
 * next RAF tick and continue its own smooth interpolation, avoiding competing
 * animations between Lenis's RAF loop and the browser's native smooth scroll.
 *
 * The calculation: `st.start + panelIndex * window.innerWidth`
 * matches the animation formula used by both `ShowcaseSection` and
 * `PhilosophyContent` (one viewport-width of virtual scroll per panel).
 *
 * ## Safety
 * - If `enabled` is false (touch/mobile), no listener is attached.
 * - If `tlRef.current` is null (GSAP not yet initialised or
 *   `prefers-reduced-motion` caused early return), the handler is a no-op.
 * - If the viewport is already showing the target panel (`scrollY ≈ targetScroll`),
 *   the handler returns early to suppress redundant calls when tabbing within
 *   the same panel.
 *
 * @param panelsRef      Ref to the flex container that holds the panel elements.
 * @param panelSelector  CSS attribute selector matching panel roots
 *                       (e.g. `[data-showcase-card]`).
 * @param tlRef          Ref to the GSAP Timeline whose `.scrollTrigger` exposes `start`.
 * @param enabled        Pass `enableHorizontal` — false on touch/mobile disables the listener.
 */
export function useHorizontalFocusSync(
  panelsRef: RefObject<HTMLElement | null>,
  panelSelector: string,
  tlRef: RefObject<gsap.core.Timeline | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return;

    const onFocusIn = (e: FocusEvent): void => {
      const panelsEl = panelsRef.current;
      const tl = tlRef.current;
      if (!panelsEl || !tl) return;

      const target = e.target;
      if (!(target instanceof Element)) return;
      if (!panelsEl.contains(target)) return;

      const panelEls = Array.from(
        panelsEl.querySelectorAll<HTMLElement>(panelSelector),
      );
      const panelIndex = panelEls.findIndex((p) => p.contains(target));
      if (panelIndex < 0) return;

      const st = tl.scrollTrigger as ScrollTrigger | undefined;
      if (!st) return;

      const targetScroll = computePanelScrollTarget(
        panelIndex,
        st.start,
        window.innerWidth,
      );
      // Skip when the viewport is already positioned at this panel to suppress
      // redundant calls (e.g. tabbing between elements within the same panel).
      if (Math.abs(window.scrollY - targetScroll) < 1) return;
      // Omit `behavior` (instant) so Lenis picks up the new scroll position on
      // its next RAF tick instead of racing with a browser-native smooth scroll.
      window.scrollTo({ top: targetScroll });
    };

    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, [enabled, panelsRef, panelSelector, tlRef]);
}
