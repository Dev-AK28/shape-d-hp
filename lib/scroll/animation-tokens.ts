/** GSAP / scroll animation SSOT — slow, deliberate motion policy. */

export const ANIMATION_DURATION = {
  base: 1.4,
  hero: 1.6,
  /** Staggered Hero child blocks (values / CTA) — faster than main hero title. */
  heroChild: 1.2,
  /** Hero scroll indicator fade-in duration (opacity 0→1 after REVEAL_DELAY.heroScrollIndicator). */
  heroScrollIndicator: 0.6,
  /** Large display typography (Philosophy acronym letters) — slower reveal. */
  display: 2,
  section: 1.8,
  pageTransition: 0.6,
  /** Pointer hover micro-interactions (nav / CTA / footer) — mirrors --duration-interaction. */
  interaction: 0.25,
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
  /** CTA reveal start offset (seconds) after copy reveal — creates a subtle entrance stagger. */
  ctaStaggerOffset: 0.07,
  /** Logo opacity hides at copy reveal so cosmic mix-blend-mode composites against nebula only (#101). */
  logoOpacityHideAt: 0.35,
  particleBand: {
    initialOpacity: 0.65,
    approachScale: 1.28,
    approachY: 32,
    passScale: 2.05,
    passY: 96,
    /** CSS blur (px) applied at end of pass-through phase (camera fly-through effect). */
    passBlurPx: 36,
  },
  logo: {
    approachScale: 1.14,
    approachY: 12,
    passScale: 0.32,
    passY: -72,
    /** CSS blur (px) applied during pass-through phase (depth-of-field exit). */
    passBlurPx: 18,
  },
  cosmic: {
    perspectiveScale: 1.2,
    transformOrigin: '50% 45%',
  },
} as const;

/**
 * Hero big-bang intro (Act 1, Issue #211): particles burst from a central flash,
 * drift, then converge into the SHAPE∞D logo silhouette. Rendered on a Canvas2D
 * overlay covering the full hero section; on completion the crisp `BrandLogo`
 * cross-fades in and the existing `HERO_DEPTH_PASSAGE` (Act 2) takes over on scroll.
 *
 * Phase durations (ms) are sequential: bigBang → drift → gather. `revealMs` extends
 * the logo cross-fade tail past the gather arrival point. `formationMs` (= bigBang +
 * drift + gather) is re-exported as `LOGO_PARTICLE_FORMATION_MS` (SSOT for the
 * component + E2E waits).
 *
 * `quality.*` counts are selected per device: `high` (desktop / fine pointer) vs
 * `low` (mobile / coarse pointer). Low power drops ambient dust + nebula motes and
 * caps devicePixelRatio to protect fill-rate-bound mobile GPUs.
 */
export const HERO_BIGBANG = {
  bigBangMs: 1100,
  driftMs: 1200,
  gatherMs: 1800,
  /** Logo cross-fade tail (ms) after the grains arrive (overlaps gather end). */
  revealMs: 700,
  /** Fraction of gather before arrival where the crisp-logo cross-fade begins. */
  revealLeadFraction: 0.12,
  /** Burst displacement multiplier applied to each grain's initial velocity. */
  burstScale: 28,
  quality: {
    high: {
      particleCount: 3500,
      sampleStep: 3,
      dustCount: 1800,
      moteCount: 500,
      dprCap: 2,
      textures: ['core', 'rays', 'nebula'] as const,
    },
    low: {
      particleCount: 1200,
      sampleStep: 5,
      dustCount: 0,
      moteCount: 0,
      dprCap: 1.5,
      textures: ['core', 'rays'] as const,
    },
  },
} as const;

/** Sequential arrival point (ms) where grains finish forming the logo silhouette. */
export const HERO_BIGBANG_FORMATION_MS =
  HERO_BIGBANG.bigBangMs + HERO_BIGBANG.driftMs + HERO_BIGBANG.gatherMs;

/**
 * About section (Act 3) pin + scrub ScrollTrigger — desktop only.
 * Mobile (`isTouchInputDevice`) uses simple stagger reveals without pinning.
 *
 * Timeline positions are fractions of `timelineDuration` (seconds). Each
 * `*RevealAt` value is the timeline offset where that element begins appearing.
 * The last history item lands at `historyRevealAt + (maxItems-1)*historyStagger +
 * historyItemDuration ≈ 0.97`, filling the timeline end cleanly.
 */
export const ABOUT_PIN_SCROLL = {
  start: 'top top',
  /** Pin for 1.6× viewport height — ample scroll room for each reveal phase. */
  end: '+=160%',
  scrub: 1.4,
  anticipatePin: 1,
  /** Total GSAP timeline length (seconds); all offsets are relative to this. */
  timelineDuration: 1,
  headingRevealAt: 0,
  headingRevealDuration: 0.13,
  pillar1RevealAt: 0.14,
  pillarRevealDuration: 0.13,
  pillar2RevealAt: 0.28,
  historyRevealAt: 0.42,
  historyItemDuration: 0.10,
  historyStagger: 0.09,
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
  /** GSAP timeline length in seconds; pan and letter tweens are anchored to this. */
  panDuration: 1,
  /** Per-panel letter opacity fade in/out duration (seconds). */
  letterFadeDuration: 0.08,
  letterOpacityPeak: 0.11,
  letterOpacityBase: 0.03,
} as const;
