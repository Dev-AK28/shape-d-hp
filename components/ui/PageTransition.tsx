'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ANIMATION_DURATION } from '@/lib/scroll/animation-tokens';
import { pageTransitionEase } from '@/lib/scroll/easing';

type PageTransitionProps = {
  children: React.ReactNode;
};

/** Tracks first site visit so initial LCP is not obscured by fade-in. */
let hasVisitedOnce = false;

/** @internal Test-only reset for visit tracking. */
export function resetPageTransitionVisitForTests(): void {
  hasVisitedOnce = false;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();
  const shouldFade = hasVisitedOnce && !reduceMotion;

  useEffect(() => {
    hasVisitedOnce = true;
  }, []);

  return (
    <motion.div
      initial={shouldFade ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldFade ? ANIMATION_DURATION.pageTransition : 0,
        ease: [...pageTransitionEase],
      }}
    >
      {children}
    </motion.div>
  );
}
