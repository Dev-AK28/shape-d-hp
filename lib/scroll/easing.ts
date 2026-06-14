import { ANIMATION_DURATION, REVEAL_OFFSET } from './animation-tokens';

export const scrollEase = [0.22, 1, 0.36, 1] as const;

export const scrollViewport = {
  once: true,
  margin: '-80px' as const,
  amount: 0.2 as const,
};

export const scrollTransition = {
  duration: ANIMATION_DURATION.base,
  ease: scrollEase,
};

export const textRevealStagger = REVEAL_OFFSET.textRevealStagger;

export const scrollVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: REVEAL_OFFSET.y },
    visible: { opacity: 1, y: 0 },
  },
  /** Same offset as fadeUp; ScrollReveal may override `y` via prop for larger sections. */
  fadeUpLarge: {
    hidden: { opacity: 0, y: REVEAL_OFFSET.y },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: REVEAL_OFFSET.x },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
} as const;

export type ScrollVariant = keyof typeof scrollVariants;

export const scrollStagger = {
  item: REVEAL_OFFSET.stagger,
  card: REVEAL_OFFSET.stagger,
} as const;
