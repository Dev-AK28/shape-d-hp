'use client';

import { m, type HTMLMotionProps } from 'framer-motion';
import { isTouchInputDevice } from '@/lib/performance/device-profile';
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
  const isTouchDevice = isTouchInputDevice(profile);
  const resolvedVariant =
    y !== undefined && variant === 'fadeUp'
      ? ('fadeUpLarge' as const)
      : variant;

  const revealProps = getScrollRevealProps(reduceMotion, {
    delay,
    duration,
    variant: resolvedVariant,
    staticReveal,
    isMobile: isTouchDevice,
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
    <m.div
      // Remount when staticReveal changes so framer `initial` re-evaluates.
      // Handles both mobile/desktop breakpoint resize (#151) and the isReady→true
      // hydration transition on desktop (#153: restores whileInView scroll reveal).
      // Focus loss from remount is mitigated by useFocusRestore in parent sections (#175).
      key={staticReveal ? 'static' : 'reveal'}
      initial={initial}
      transition={revealProps.transition}
      {...motionRevealProps}
      // Consumer props intentionally spread last: className / style / event handlers override
      // motionRevealProps. Callers must not pass whileInView/animate/viewport — to enforce
      // this at the type level, Omit those keys from ScrollRevealProps (tracked in #155).
      {...props}
    >
      {children}
    </m.div>
  );
}
