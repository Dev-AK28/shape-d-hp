'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { scrollTransition, scrollViewport } from '@/lib/scroll/easing';

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
      transition={{ ...scrollTransition, delay, duration: reduceMotion ? 0 : scrollTransition.duration }}
      viewport={scrollViewport}
      {...props}
    >
      {children}
    </motion.div>
  );
}
