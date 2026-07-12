/** GSAP / scroll animation SSOT — slow, deliberate motion policy. */

export const ANIMATION_DURATION = {
  base: 1.4,
  /** Large display typography (Philosophy acronym letters) — slower reveal. */
  display: 2,
  section: 1.8,
  pageTransition: 0.6,
  /** Pointer hover micro-interactions (nav / CTA / footer) — mirrors --duration-interaction. */
  interaction: 0.25,
  /**
   * Framer-motion card-hover `whileHover` transitions (ServicesContent /
   * ProcessNavigation / ConsultingContent / DevelopmentContent). Distinct
   * layer from the GSAP `interaction` timing above (see design-system.md
   * "Micro-interactions" — Issue #103) — intentionally its own value, not a
   * drift from `interaction` (Issue #388).
   */
  cardHover: 0.3,
} as const;

export const ANIMATION_EASE = {
  base: 'expo.out',
  section: 'power3.inOut',
  reveal: 'power3.out',
  /** Hover quickTo — subtle, no bounce. */
  interaction: 'power2.out',
} as const;

export const REVEAL_OFFSET = {
  x: -20,
  y: 20,
  stagger: 0.15,
  textRevealStagger: 0.06,
  /** TextReveal duration = scrollTransition.duration × this scale. */
  textRevealDurationScale: 0.65,
  maxStaggerItems: 6,
} as const;

/** Stagger delays for scroll-reveal sequences (seconds). */
export const REVEAL_DELAY = {
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

/**
 * Scroll-velocity–driven skewY applied to `[data-velocity-content]`.
 * Lenis velocity → gsap.quickTo → CSS skewY.
 */
export const VELOCITY_SKEW = {
  maxDegrees: 1.8,
  velocityFactor: 0.028,
  quickToDuration: 0.85,
  quickToEase: 'power3',
} as const;

/**
 * Philosophy page horizontal scroll (desktop-only).
 * Panels are pinned and translated on the X axis via GSAP ScrollTrigger.
 *
 * `panDuration` is the GSAP timeline duration in seconds. Letter tweens are
 * positioned as `(i / sections.length) * panDuration` to keep positions
 * proportional and prevent the pan from completing before the full scroll ends.
 * `letterFadeDuration` must be short enough that letter tweens do not extend
 * the total timeline significantly beyond `panDuration`.
 */
export const PHILOSOPHY_HORIZONTAL = {
  scrub: 1.8,
  /**
   * `pinType: 'transform'` — mirrors TopTheory/TopServices (#307/#308). Subpages
   * (unlike the top page) keep velocity-skew enabled on `[data-velocity-content]`
   * (see design-system.md #312), and a default `position: fixed` pin breaks under
   * that transform-bearing ancestor. Without this, everything past the first
   * panel renders blank once the pin activates and skewY starts applying (#351).
   */
  pinType: 'transform' as const,
  /** GSAP timeline length in seconds; pan and letter tweens are anchored to this. */
  panDuration: 1,
  /** Per-panel letter opacity fade in/out duration (seconds). */
  letterFadeDuration: 0.08,
  letterOpacityPeak: 0.11,
  letterOpacityBase: 0.03,
} as const;
