/** GSAP / scroll animation SSOT — slow, deliberate motion policy. */

export const ANIMATION_DURATION = {
  base: 1.4,
  hero: 1.6,
  section: 1.8,
  pageTransition: 0.6,
} as const;

export const ANIMATION_EASE = {
  base: 'expo.out',
  section: 'power3.inOut',
  reveal: 'power3.out',
} as const;

export const REVEAL_OFFSET = {
  x: -20,
  y: 20,
  stagger: 0.15,
  textRevealStagger: 0.06,
  maxStaggerItems: 6,
} as const;
