'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import type { ScrollVariant } from '@/lib/scroll/easing';

type ScrollRevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  duration?: number;
  variant?: ScrollVariant;
  y?: number;
};

export default function ScrollReveal({
  children,
  delay = 0,
  duration,
  variant = 'fadeUp',
  y,
  ...props
}: ScrollRevealProps) {
  const { reduceMotion, staticReveal } = useStaticReveal();
  const resolvedVariant =
    y !== undefined && variant === 'fadeUp'
      ? ('fadeUpLarge' as const)
      : variant;

  const revealProps = getScrollRevealProps(reduceMotion, {
    delay,
    duration,
    variant: resolvedVariant,
    staticReveal,
  });

  const initial =
    !staticReveal && y !== undefined && !reduceMotion && resolvedVariant === 'fadeUpLarge'
      ? { opacity: 0, y }
      : revealProps.initial;

  return (
    <motion.div
      initial={initial}
      whileInView={revealProps.whileInView}
      transition={revealProps.transition}
      viewport={revealProps.viewport}
      {...props}
    >
      {children}
    </motion.div>
  );
}
