/** Design system tokens — dark/minimal visual language SSOT. */

export const colors = {
  background: '#0a0a0a',
  backgroundElevated: '#111111',
  foreground: '#f0f0f0',
  muted: '#9ca3af',
  accent: '#c4b5a0',
  accentSubtle: 'rgba(196, 181, 160, 0.6)',
  border: 'rgba(240, 240, 240, 0.12)',
  /** Faint foreground tint for large decorative numerals / background glyphs */
  foregroundFaint: 'rgba(240, 240, 240, 0.04)',
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

/** CSS custom property names for typography sizes — mirrors :root in globals.css */
export const typographySizeCssVars: Record<keyof typeof typographySizeClasses, string> = {
  heading: '--type-size-heading',
  subheading: '--type-size-subheading',
  quote: '--type-size-quote',
  body: '--type-size-body',
  caption: '--type-size-caption',
  visualWord: '--type-size-visual-word',
};

/** Maps typographySizeClasses keys to typography.size* keys — used by css-token-sync tests */
export const typographySizeTokenKeys: Record<
  keyof typeof typographySizeClasses,
  'sizeHeading' | 'sizeSubheading' | 'sizeQuote' | 'sizeBody' | 'sizeCaption' | 'sizeVisualWord'
> = {
  heading: 'sizeHeading',
  subheading: 'sizeSubheading',
  quote: 'sizeQuote',
  body: 'sizeBody',
  caption: 'sizeCaption',
  visualWord: 'sizeVisualWord',
};

/** CSS utility for font stacks — Issue #15 */
export const typographyFontClasses = {
  /** Cormorant via :root --font-serif = --font-display */
  serif: 'type-font-serif',
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

/** Cosmic grade overlay for Hero cosmic background — Issue #102 / #227. Cool deep-space (silver/blue) palette. */
const cosmicGradeOverlayStart = 'rgba(150, 170, 210, 0.08)';
const cosmicGradeOverlayMid = 'rgba(150, 170, 210, 0.12)';
const cosmicGradeOverlayEnd = 'rgba(150, 170, 210, 0.15)';
const cosmicGradeOverlayMidStop = '45%';

export const cosmicGrade = {
  overlayStart: cosmicGradeOverlayStart,
  overlayMid: cosmicGradeOverlayMid,
  overlayEnd: cosmicGradeOverlayEnd,
  overlayMidStop: cosmicGradeOverlayMidStop,
  overlayGradient: `linear-gradient(180deg, ${cosmicGradeOverlayStart} 0%, ${cosmicGradeOverlayMid} ${cosmicGradeOverlayMidStop}, ${cosmicGradeOverlayEnd} 100%)`,
  /** Desktop-only nebula filter (no warm tint) — disabled on mobile / reduced-motion via CSS */
  nebulaFilter: 'saturate(1.05) brightness(1.04)',
  /** screen blend opacity for the cosmic nebula layer; prevents white blowout at high luminance (#201) */
  nebulaScreenOpacity: 0.42,
  testId: 'cosmic-grade-overlay',
} as const;

/**
 * トップページ刷新（#302）基盤トークン — Issue #303
 * SSOT: lib/design/shape-d-prototype-v4.html（:root L11-L25）
 * 既存トークンと並存し、`.top-scope`（トップページ）配下でのみ使用する。下層ページはスコープ外。
 */
export const topColors = {
  ink: '#07090d',
  ink2: '#0b0e15',
  ink3: '#10141d',
  moon: '#dfe3ea',
  mist: '#8b93a1',
  mistDim: '#545c6a',
  rain: '#7d9cc4',
  rainDim: 'rgba(125, 156, 196, 0.35)',
  hairline: 'rgba(139, 147, 161, 0.16)',
} as const;

/** CSS custom property names for topColors — mirrors .top-scope in globals.css */
export const topColorCssVars: Record<keyof typeof topColors, string> = {
  ink: '--ink',
  ink2: '--ink-2',
  ink3: '--ink-3',
  moon: '--moon',
  mist: '--mist',
  mistDim: '--mist-dim',
  rain: '--rain',
  rainDim: '--rain-dim',
  hairline: '--hairline',
};

/** 参照HTMLのセマンティックフォント変数（--serif 等）— .top-scope で next/font 変数へ解決 */
export const topFontCssVars = {
  serif: '--serif',
  gothic: '--gothic',
  latin: '--latin',
  mono: '--mono',
} as const;

/** next/font が生成する変数名（components/top/top-fonts.ts と同期）。Cormorant は既存 --font-display を流用 */
export const topNextFontCssVars = {
  shipporiMincho: '--font-shippori-mincho',
  zenKakuGothicNew: '--font-zen-kaku-gothic-new',
  jetBrainsMono: '--font-jetbrains-mono',
  cormorantGaramond: '--font-display',
} as const;

/** 共通シェル挙動定数（参照HTML L875 / L892-L896） */
export const topShell = {
  scopeClass: 'top-scope',
  /** nav.classList.toggle("scrolled", window.scrollY > 60) */
  navScrollThresholdPx: 60,
  /** gsap.to("#thread", { scrollTrigger: { scrub: 1.2 } }) */
  threadScrub: 1.2,
} as const;

/**
 * ヒーローセクション（#hero）の演出定数 — Issue #304
 * SSOT: lib/design/shape-d-prototype-v4.html（雨 Canvas L816-L857 / イントロ L898-L903）
 */
export const topHero = {
  /**
   * イントロタイムライン — 参照HTML L898-L903（ease power3.out）
   * #326: 実装は globals.css の CSS アニメーション（top-hero-intro-*）。ハイドレーションを
   * 待たずに開始し FCP/LCP を遅らせないため GSAP から移行した。ここが尺の SSOT で、
   * CSS 側の duration / delay と css-token-sync テストで同期する。
   * delay 展開: mark 0.4s / copy 1.2s（stagger 0.9s → 2行目 2.1s）/
   * sub = copy終端(3.9s) - 0.6 = 3.3s / cue = sub終端(4.9s) - 0.8 = 4.1s
   */
  intro: {
    ease: 'power3.out',
    /** .hero-mark { opacity:1, duration:2.4 } at 0.4 */
    mark: { duration: 2.4, at: 0.4 },
    /** .hero-copy .line { opacity:1, y:0, duration:1.8, stagger:0.9 } at 1.2 */
    copy: { duration: 1.8, stagger: 0.9, at: 1.2 },
    /** .hero-sub { opacity:1, duration:1.6 } at "-=0.6" */
    sub: { duration: 1.6, at: '-=0.6' },
    /** .scroll-cue { opacity:1, duration:1.4 } at "-=0.8" */
    cue: { duration: 1.4, at: '-=0.8' },
  },
  /** PHILOSOPHY タグラインの文字送り — 参照HTML L905-L911 */
  taglineScrub: {
    /** .vision-tagline .w の初期 opacity（参照HTML L214） */
    opacityFrom: 0.08,
    stagger: 0.05,
    scrub: 0.8,
    start: 'top 70%',
    end: 'center center',
    /**
     * 各文字トゥイーンの duration。参照HTMLは GSAP 既定（0.5s）に依存するが、本アプリは
     * configureGsapDefaults() が 1.4s を設定するため、明示しないと文字送りの尺比がズレる（#313）。
     */
    tweenDuration: 0.5,
  },
  /** 課題提起 #pain の行フェードイン — 参照HTML L913-L923 */
  pain: {
    /** .pain-line: opacity 0→1, y 24→0, duration 1.6, power2.out, trigger 各行 top 78% */
    line: { duration: 1.6, ease: 'power2.out', yFrom: 24, start: 'top 78%' },
    /** .pain-close: opacity 0→1, duration 2, power2.out, trigger top 82% */
    close: { duration: 2, ease: 'power2.out', start: 'top 82%' },
  },
  /** 自己一致 #theory の円収束 pinned scrub — 参照HTML L925-L936 */
  theory: {
    /**
     * pin ScrollTrigger（trigger #theory / start top top / end +=120% / scrub 1）。
     * pinType は 'transform' を明示: velocity-skew（[data-velocity-content] の transform）が
     * 祖先に残るため、既定の position:fixed pin は破綻する。transform pin なら周囲の
     * コンテンツと一貫して動く（#312 で velocity-skew 無効化後も安全）。
     */
    pin: { start: 'top top', end: '+=120%', scrub: 1, pinType: 'transform' },
    /**
     * タイムライン各トゥイーンの duration。参照HTMLは GSAP 既定（0.5s）に依存するが、
     * 本アプリは configureGsapDefaults() が duration を 1.4s に設定するため、明示しないと
     * position（0.5/0.72/0.6）に対する総尺が変わりラベル出現のスクロール割合がズレる。
     * 0.5 を明示して参照HTMLの尺比を再現する。
     */
    tweenDuration: 0.5,
    /** 円の収束: xPercent ±84（参照HTML L932-L933） */
    idealXPercent: 84,
    realXPercent: -84,
    /** タイムライン position: border 強調 0.5 / label 0.72 / 円ラベル減光 0.6（参照HTML L934-L936） */
    borderAt: 0.5,
    labelAt: 0.72,
    dimAt: 0.6,
    borderColor: 'rgba(125,156,196,0.7)',
    dimColor: 'rgba(139,147,161,0.25)',
  },
  /** サービス #services の pinned パネル切替 — 参照HTML L938-L960 */
  services: {
    /** pin ScrollTrigger（trigger #services / start top top / scrub 0.8）。pinType transform（#307 と同理由） */
    pin: { start: 'top top', scrub: 0.8, pinType: 'transform' },
    /** end = +=(パネル数 × 90)%（参照HTML L944） */
    panelStepPercent: 90,
    /** 先頭パネルの初期表示（autoAlpha 1, duration 0.001）— 参照HTML L954 */
    firstRevealDuration: 0.001,
    /** クロスフェード: 前 y-30 フェードアウト → 次 y+30→0 フェードイン（各 duration 0.35、次は +0.15 オフセット）— 参照HTML L956-L957 */
    transitionDuration: 0.35,
    fadeOutY: -30,
    fadeInYFrom: 30,
    fadeInOffset: 0.15,
    /** 末尾の余白トゥイーン（参照HTML L959） */
    tailDuration: 0.6,
  },
  /** プロセス #process の縦タイムライン ステップフェードイン — 参照HTML L962-L968 */
  process: {
    /** .step: opacity 0→1, y 20→0, duration 1.4, power2.out, delay i×0.12, trigger 各 step top 82% */
    step: { duration: 1.4, ease: 'power2.out', yFrom: 20, staggerDelay: 0.12, start: 'top 82%' },
  },
  /** Profile #profile の各演出 — 参照HTML L970-L999 */
  profile: {
    /** .profile-head: opacity 0→1, y 16→0, duration 1.6, top 84% */
    head: { duration: 1.6, yFrom: 16, start: 'top 84%' },
    /** .thought × 2: duration 1.6, delay i×0.3, trigger .thoughts top 80%, y 20 */
    thought: { duration: 1.6, staggerDelay: 0.3, yFrom: 20, start: 'top 80%' },
    /** 収束 SVG パス: strokeDashoffset を scrub 描画（trigger .converge top 88%→top 42% / scrub 0.8） */
    converge: { start: 'top 88%', end: 'top 42%', scrub: 0.8 },
    /** #cv-dot: opacity 0→1, duration 0.8, top 44% */
    dot: { duration: 0.8, start: 'top 44%' },
    /** .creed: opacity 0→1, y 14→0, duration 2, top 40% */
    creed: { duration: 2, yFrom: 14, start: 'top 40%' },
  },
  /** 雨 Canvas — 参照HTML L816-L857。色は topColors.rain の rgb（125,156,196） */
  rain: {
    /** 線密度: offsetWidth / 26 本 */
    columnWidthPx: 26,
    strokeRgb: '125,156,196',
    /** reduced-motion 静止描画時の一律 alpha */
    staticAlpha: 0.08,
    lengthMinPx: 40,
    lengthRangePx: 70,
    speedMin: 0.4,
    speedRange: 0.8,
    alphaMin: 0.05,
    alphaRange: 0.12,
    /** #rain-canvas { opacity: 0.5 } */
    canvasOpacity: 0.5,
  },
} as const;

/** Typography mix-blend-mode for cosmic vs solid section backgrounds — Issue #101 */
export const typographyBlend = {
  cosmic: 'screen',
  solid: 'normal',
  classCosmic: 'type-blend-cosmic',
  classSolid: 'type-blend-solid',
  testIdCosmic: 'type-blend-cosmic',
} as const;
