/** Design system tokens — dark/minimal visual language SSOT. */

export const colors = {
  background: '#0a0a0a',
  backgroundElevated: '#111111',
  foreground: '#f0f0f0',
  muted: '#9ca3af',
  accent: '#c4b5a0',
  accentSubtle: 'rgba(196, 181, 160, 0.6)',
  border: 'rgba(240, 240, 240, 0.12)',
  /** Section accent palette — mirrors Tailwind blue-400 / violet-400 / blue-300 */
  blue: '#60a5fa',
  blueLight: '#93c5fd',
  purple: '#a78bfa',
} as const;

/** PageHeader gradient divider accent per variant — Issue #15 */
export const pageHeaderDividerColors = {
  blue: colors.blue,
  purple: colors.purple,
  sky: colors.blueLight,
} as const;

/** PageHeader gradient divider variants — Issue #15 */
export const pageHeaderDividers = {
  blue: 'page-header-divider-blue',
  purple: 'page-header-divider-purple',
  sky: 'page-header-divider-sky',
} as const;

export type PageHeaderDividerVariant = keyof typeof pageHeaderDividers;

/** CSS custom property names for section accents — mirrors :root in globals.css */
export const sectionAccentCssVars: Record<PageHeaderDividerVariant, string> = {
  blue: '--section-blue',
  purple: '--section-purple',
  sky: '--section-blue-light',
};

export const spacing = {
  unit: 8,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
  section: 120,
} as const;

export const layout = {
  contentProse: '680px',
  contentStandard: '880px',
  contentWide: '1040px',
} as const;

export const typography = {
  fontSerif: 'var(--font-serif)',
  fontSerifJp: 'var(--font-serif-jp)',
  fontDisplay: 'var(--font-display)',
  sizeHero: 'clamp(48px, 10vw, 120px)',
  sizePageHeading: 'clamp(24px, 4vw, 40px)',
  sizeHeading: 'clamp(32px, 5vw, 64px)',
  sizeSubheading: 'clamp(20px, 2.5vw, 28px)',
  sizeQuote: 'clamp(18px, 2.5vw, 28px)',
  sizeBody: 'clamp(16px, 1.5vw, 18px)',
  sizeCaption: 'clamp(12px, 1vw, 14px)',
  sizeVisualWord: 'clamp(40px, 10vw, 140px)',
} as const;

/** CSS utility class names for typography sizes — Issue #15 */
export const typographySizeClasses = {
  heading: 'type-size-heading',
  subheading: 'type-size-subheading',
  quote: 'type-size-quote',
  body: 'type-size-body',
  caption: 'type-size-caption',
  visualWord: 'type-size-visual-word',
} as const;

/** CSS utility for Japanese serif stack — Issue #15 */
export const typographyFontClasses = {
  serifJp: 'type-font-serif-jp',
} as const;

export const motion = {
  durationBase: '1.4s',
  durationInteraction: '0.25s',
  easeBase: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const cursor = {
  size: 8,
  followerSize: 32,
  followerOpacity: 0.4,
  followerLerp: 0.12,
} as const;

/** Warm gold grade overlay for Hero cosmic background — Issue #102 */
const warmGradeOverlayStart = 'rgba(196, 181, 160, 0.08)';
const warmGradeOverlayMid = 'rgba(196, 181, 160, 0.12)';
const warmGradeOverlayEnd = 'rgba(196, 181, 160, 0.15)';
const warmGradeOverlayMidStop = '45%';

export const warmGrade = {
  overlayStart: warmGradeOverlayStart,
  overlayMid: warmGradeOverlayMid,
  overlayEnd: warmGradeOverlayEnd,
  overlayMidStop: warmGradeOverlayMidStop,
  overlayGradient: `linear-gradient(180deg, ${warmGradeOverlayStart} 0%, ${warmGradeOverlayMid} ${warmGradeOverlayMidStop}, ${warmGradeOverlayEnd} 100%)`,
  /** Desktop-only nebula filter — disabled on mobile / reduced-motion via CSS */
  nebulaFilter: 'sepia(0.08) saturate(1.05) hue-rotate(-5deg)',
  testId: 'cosmic-warm-grade-overlay',
} as const;

/** Typography mix-blend-mode for cosmic vs solid section backgrounds — Issue #101 */
export const typographyBlend = {
  cosmic: 'screen',
  solid: 'normal',
  classCosmic: 'type-blend-cosmic',
  classSolid: 'type-blend-solid',
  testIdCosmic: 'type-blend-cosmic',
} as const;
