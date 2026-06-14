/** GSAP / scroll animation SSOT — slow, deliberate motion policy. */

export const ANIMATION_DURATION = {
  base: 1.4,
  hero: 1.6,
  /** Staggered Hero child blocks (values / CTA) — faster than main hero title. */
  heroChild: 1.2,
  /** Large display typography (Philosophy acronym letters) — slower reveal. */
  display: 2,
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
  /** Hero child blocks use a larger vertical offset than standard reveals. */
  heroChildY: 40,
  stagger: 0.15,
  textRevealStagger: 0.06,
  /** TextReveal duration = scrollTransition.duration × this scale. */
  textRevealDurationScale: 0.65,
  maxStaggerItems: 6,
} as const;
