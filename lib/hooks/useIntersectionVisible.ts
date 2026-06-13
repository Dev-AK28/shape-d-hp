'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useIntersectionVisible(
  targetRef: RefObject<Element | null>,
  options?: IntersectionObserverInit,
  enabled = true,
): boolean {
  const [visible, setVisible] = useState(false);

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
        setVisible(entry?.isIntersecting ?? false);
      },
      options ?? { threshold: 0 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      setVisible(false);
    };
  }, [targetRef, options, enabled]);

  return enabled ? visible : false;
}
