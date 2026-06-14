'use client';

import { useEffect, useState, type RefObject } from 'react';

const PANEL_SELECTOR = '[data-philosophy-panel]';

export function usePanelActiveIndex(
  containerRef: RefObject<HTMLElement | null>,
): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
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
  }, [containerRef]);

  return activeIndex;
}
