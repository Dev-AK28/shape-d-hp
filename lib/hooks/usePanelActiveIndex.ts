'use client';

import { useEffect, useState, type RefObject } from 'react';

const PANEL_SELECTOR = '[data-philosophy-panel]';

interface UsePanelActiveIndexOptions {
  /**
   * When false, skips IntersectionObserver setup entirely and the hook always
   * returns 0 — even if a nonzero index was observed while `enabled` was
   * previously `true` (see PR #250 review). Desktop horizontal mode drives its
   * own GSAP-based index and never reads this hook's result, so observing
   * every panel there is wasted cost (#187).
   */
  enabled?: boolean;
}

export function usePanelActiveIndex(
  containerRef: RefObject<HTMLElement | null>,
  { enabled = true }: UsePanelActiveIndexOptions = {},
): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Bail out without touching state: the returned value is discarded by
    // callers whenever `enabled` is false (see #187), so there is nothing to sync.
    if (!enabled) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const panels = Array.from(
      container.querySelectorAll<HTMLElement>(PANEL_SELECTOR),
    );
    if (panels.length === 0) {
      return;
    }

    const ratios = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }

        let bestIndex = 0;
        let bestRatio = -1;
        panels.forEach((panel, index) => {
          const ratio = ratios.get(panel) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        });

        setActiveIndex(bestIndex);
      },
      {
        root: null,
        threshold: Array.from({ length: 11 }, (_, index) => index / 10),
      },
    );

    panels.forEach((panel) => observer.observe(panel));

    return () => observer.disconnect();
  }, [containerRef, enabled]);

  // Gate on `enabled` here too (not just in the effect): guarantees the public
  // contract holds even right after `enabled` flips true → false, before the
  // cleanup above has a chance to matter — no stale nonzero value leaks out.
  return enabled ? activeIndex : 0;
}
