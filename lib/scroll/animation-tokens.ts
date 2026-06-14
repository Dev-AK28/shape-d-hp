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

/** Stagger delays for scroll-reveal sequences (seconds). */
export const REVEAL_DELAY = {
  heroChild: {
    wrapper: 0.2,
    values: 0.35,
    copy: 0.5,
    cta: 0.65,
  },
  heroScrollIndicator: 1.2,
  philosophy: {
    title: 0.3,
    body: 0.6,
    closing: 0.9,
    mission: 0.5,
    cta: 1.0,
  },
} as const;

/** GSAP ticker lagSmoothing restore values after Lenis teardown. */
export const GSAP_TICKER = {
  lagSmoothingActive: 0,
  lagSmoothingRestoreMs: 500,
  lagSmoothingRestoreThreshold: 33,
} as const;

/** Hero immersive pin ScrollTrigger — shared by Hero.tsx and HomePageShell. */
export const HERO_PIN_SCROLL = {
  start: 'top top',
  end: '+=120%',
  scrub: ANIMATION_DURATION.hero,
  anticipatePin: 1,
} as const;

/** HomePageShell ↔ Hero coupling for hero pin ScrollTrigger (Issue #100). */
export const HERO_PIN_TEST_ID = 'hero-pin-section' as const;

export const HERO_PIN_SELECTOR = `[data-testid="${HERO_PIN_TEST_ID}"]` as const;

/**
 * Scroll-driven depth passage (Issue #100): layered scale / translate / opacity
 * simulating camera movement through nebula, particle band, and logo.
 *
 * Timeline positions (`approachPhaseEnd`, `revealTimelineStart`) are fractions of
 * `timelineDuration` (seconds). GSAP tweens must set explicit `duration` from these
 * fractions so approach / pass phases do not overlap.
 */
export const HERO_DEPTH_PASSAGE = {
  /** Total scrub timeline length in seconds (scroll maps 0→1 across this span). */
  timelineDuration: 1,
  /** Fraction of timelineDuration where approach ends and pass-through begins. */
  approachPhaseEnd: 0.55,
  /** Fraction of timelineDuration where copy/CTA reveal begins. */
  revealTimelineStart: 0.35,
  particleBand: {
    initialOpacity: 0.65,
    approachScale: 1.28,
    approachY: 32,
    passScale: 2.05,
    passY: 96,
  },
  logo: {
    approachScale: 1.14,
    approachY: 12,
    passScale: 0.32,
    passY: -72,
  },
  cosmic: {
    perspectiveScale: 1.2,
    transformOrigin: '50% 45%',
  },
} as const;
