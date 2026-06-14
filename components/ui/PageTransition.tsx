'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ANIMATION_DURATION } from '@/lib/scroll/animation-tokens';

type PageTransitionProps = {
  children: React.ReactNode;
};

export default function PageTransition({ children }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduceMotion ? 0 : ANIMATION_DURATION.pageTransition,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
