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

/** Props for immediate reveal (staticReveal / reduced-motion): animate at mount, no IO. */
export type StaticScrollRevealProps = {
  initial: false;
  animate: TargetAndTransition;
  whileInView?: never;
  viewport?: never;
  transition: Transition;
};

/** Props for scroll-driven reveal: hidden until IntersectionObserver fires. */
export type DynamicScrollRevealProps = {
  initial: TargetAndTransition;
  animate?: never;
  whileInView: TargetAndTransition;
  viewport: ViewportOptions;
  transition: Transition;
};

/**
 * Discriminated union: `animate` is present iff staticReveal/reduced-motion (immediate);
 * `whileInView` + `viewport` are present iff scroll-driven (IO-dependent).
 * The two modes are mutually exclusive at the type level via `never` cross-fields.
 */
export type ScrollRevealMotionProps = StaticScrollRevealProps | DynamicScrollRevealProps;

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
  const isStaticReveal = reduceMotion === true || staticReveal;

  const visible = scrollVariants[variant].visible;
  const transition = {
    duration: isStaticReveal ? 0 : duration,
    delay: isStaticReveal ? 0 : totalDelay,
    ease: scrollEase,
  };

  if (isStaticReveal) {
    // Suspected interaction: omitting transform properties prevents Framer Motion from
    // injecting `transform: translateY(0px)`, which on iOS may create a GPU compositing
    // layer that is incorrectly clipped when a `backdrop-filter` ancestor is present (#150).
    return {
      initial: false,
      animate: { opacity: 1 },
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
