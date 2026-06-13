'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { scrollEase, scrollViewport } from '@/lib/scroll/easing';

type ScrollRevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  y?: number;
};

export default function ScrollReveal({
  children,
  delay = 0,
  y = 48,
  ...props
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.9, delay, ease: scrollEase }}
      viewport={scrollViewport}
      {...props}
    >
      {children}
    </motion.div>
  );
}
