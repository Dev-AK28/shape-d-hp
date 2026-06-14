/** Design system tokens — dark/minimal visual language SSOT. */

export const colors = {
  background: '#0a0a0a',
  backgroundElevated: '#111111',
  foreground: '#f0f0f0',
  muted: '#9ca3af',
  accent: '#c4b5a0',
  accentSubtle: 'rgba(196, 181, 160, 0.6)',
  border: 'rgba(240, 240, 240, 0.12)',
} as const;

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

export const typography = {
  fontSerif: 'var(--font-serif)',
  fontSerifJp: 'var(--font-serif-jp)',
  fontDisplay: 'var(--font-display)',
  sizeHero: 'clamp(48px, 10vw, 120px)',
  sizeHeading: 'clamp(32px, 5vw, 64px)',
  sizeSubheading: 'clamp(20px, 2.5vw, 28px)',
  sizeBody: 'clamp(16px, 1.5vw, 18px)',
  sizeCaption: 'clamp(12px, 1vw, 14px)',
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
