'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useIntersectionVisible(targetRef: RefObject<Element | null>): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [targetRef]);

  return visible;
}
