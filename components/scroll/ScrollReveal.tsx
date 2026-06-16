'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import type { ScrollVariant } from '@/lib/scroll/easing';

type ScrollRevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  duration?: number;
  variant?: ScrollVariant;
  /**
   * Custom initial y-offset in pixels for scroll-driven reveal.
   * Ignored when `staticReveal` is true (mobile / reduced-motion): in that mode
   * `getScrollRevealProps` returns `{ animate: { opacity: 1 } }` — opacity-only, no transform —
   * so overriding y would have no effect. Desktop and non-static paths apply the offset.
   * The transform-free animate is intentional: it avoids GPU compositing conflicts with
   * `backdrop-filter` ancestors on iOS (#150).
   */
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
  const { reduceMotion, staticReveal, profile } = useStaticReveal();
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

  const motionRevealProps = revealProps.animate
    ? { animate: revealProps.animate }
    : {
        whileInView: revealProps.whileInView,
        viewport: revealProps.viewport,
      };

  return (
    <motion.div
      // Remount at mobile breakpoint so framer `initial` re-evaluates (#151 resize).
      // Focus loss on resize is tracked in #155.
      key={profile.isMobile ? 'mobile' : 'desktop'}
      initial={initial}
      transition={revealProps.transition}
      {...motionRevealProps}
      // Consumer props intentionally spread last: className / style / event handlers override
      // motionRevealProps. Callers must not pass whileInView/animate/viewport — to enforce
      // this at the type level, Omit those keys from ScrollRevealProps (tracked in #155).
      {...props}
    >
      {children}
    </motion.div>
  );
}
