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
};

export type ScrollRevealMotionProps = {
  initial: false | TargetAndTransition;
  whileInView: TargetAndTransition;
  transition: Transition;
  viewport: ViewportOptions;
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
  } = options;

  const staggerDelay = resolveStaggerDelay(staggerIndex, staggerStep);
  const totalDelay = delay + staggerDelay;

  return {
    initial: reduceMotion ? false : scrollVariants[variant].hidden,
    whileInView: scrollVariants[variant].visible,
    transition: {
      duration: reduceMotion ? 0 : duration,
      delay: reduceMotion ? 0 : totalDelay,
      ease: scrollEase,
    },
    viewport: scrollViewport,
  };
}
