import type { TargetAndTransition, Transition, ViewportOptions } from 'framer-motion';
import {
  scrollEase,
  scrollStagger,
  scrollTransition,
  scrollVariants,
  scrollViewport,
  type ScrollVariant,
} from './easing';

type ScrollRevealOptions = {
  delay?: number;
  duration?: number;
  variant?: ScrollVariant;
  staggerIndex?: number;
  staggerStep?: keyof typeof scrollStagger | number;
  /** Skip scroll-driven reveal (reduced-motion profile or explicit override). */
  staticReveal?: boolean;
};

export type ScrollRevealMotionProps = {
  initial: false | TargetAndTransition;
  /** Immediate visible target when staticReveal / reduced-motion (no IO). */
  animate?: TargetAndTransition;
  whileInView?: TargetAndTransition;
  transition: Transition;
  viewport?: ViewportOptions;
};

function resolveStaggerDelay(
  staggerIndex: number | undefined,
  staggerStep: keyof typeof scrollStagger | number | undefined,
): number {
  if (staggerIndex === undefined) {
    return 0;
  }

  const step =
    typeof staggerStep === 'number'
      ? staggerStep
      : scrollStagger[staggerStep ?? 'item'];

  return staggerIndex * step;
}

export function getScrollRevealProps(
  reduceMotion: boolean | null,
  options: ScrollRevealOptions = {},
): ScrollRevealMotionProps {
  const {
    delay = 0,
    duration = scrollTransition.duration,
    variant = 'fadeUpLarge',
    staggerIndex,
    staggerStep,
    staticReveal = false,
  } = options;

  const staggerDelay = resolveStaggerDelay(staggerIndex, staggerStep);
  const totalDelay = delay + staggerDelay;
  const useStaticReveal = reduceMotion === true || staticReveal;

  const visible = scrollVariants[variant].visible;
  const transition = {
    duration: useStaticReveal ? 0 : duration,
    delay: useStaticReveal ? 0 : totalDelay,
    ease: scrollEase,
  };

  if (useStaticReveal) {
    return {
      initial: false,
      animate: visible,
      transition,
    };
  }

  return {
    initial: scrollVariants[variant].hidden,
    whileInView: visible,
    transition,
    viewport: scrollViewport,
  };
}
