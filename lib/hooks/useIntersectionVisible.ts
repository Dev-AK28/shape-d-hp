'use client';

import { useEffect, useState, type RefObject } from 'react';

export type IntersectionVisibility = {
  visible: boolean;
  /** true after the first IntersectionObserver callback (IO 初回判定完了) */
  observed: boolean;
};

const HIDDEN: IntersectionVisibility = { visible: false, observed: false };

/**
 * Observes target visibility via IntersectionObserver.
 * Pass a stable `options` reference (module-level constants) to avoid observer churn.
 */
export function useIntersectionVisible(
  targetRef: RefObject<Element | null>,
  options?: IntersectionObserverInit,
  enabled = true,
): IntersectionVisibility {
  const [state, setState] = useState<IntersectionVisibility>(HIDDEN);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const target = targetRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState({
          visible: entry?.isIntersecting ?? false,
          observed: true,
        });
      },
      options ?? { threshold: 0 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      setState(HIDDEN);
    };
  }, [targetRef, options, enabled]);

  return enabled ? state : HIDDEN;
}
