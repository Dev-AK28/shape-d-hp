import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colors, cosmicGrade, cursor, layout, motion, pageHeaderDividers, pageHeaderDividerColors, sectionAccentCssVars, spacing, topColors, topColorCssVars, topFontCssVars, topNextFontCssVars, topShell, typography, typographyBlend, typographySizeClasses, typographySizeCssVars, typographySizeTokenKeys } from '@/lib/design/tokens';
import {
  MOBILE_BREAKPOINT_PX,
  desktopMinWidthMediaQuery,
  mobileMaxWidthMediaQuery,
} from '@/lib/performance/device-profile';

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

describe('design tokens ↔ globals.css sync', () => {
  it('mirrors color tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--background: ${colors.background}`);
    expect(globalsCss).toContain(`--foreground: ${colors.foreground}`);
    expect(globalsCss).toContain(`--muted: ${colors.muted}`);
    expect(globalsCss).toContain(`--accent: ${colors.accent}`);
    expect(globalsCss).toContain(`--accent-subtle: ${colors.accentSubtle}`);
    expect(globalsCss).toContain(`--border: ${colors.border}`);
    expect(globalsCss).toContain(`--section-blue: ${colors.blue}`);
    expect(globalsCss).toContain(`--section-blue-light: ${colors.blueLight}`);
    expect(globalsCss).toContain(`--section-purple: ${colors.purple}`);
  });

  it('mirrors spacing tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--space-1: ${spacing.xs}px`);
    expect(globalsCss).toContain(`--space-2: ${spacing.sm}px`);
    expect(globalsCss).toContain(`--space-3: ${spacing.md}px`);
    expect(globalsCss).toContain(`--space-4: ${spacing.lg}px`);
    expect(globalsCss).toContain(`--space-6: ${spacing.xl}px`);
    expect(globalsCss).toContain(`--space-8: ${spacing.xxl}px`);
    expect(globalsCss).toContain(`--space-section: ${spacing.section}px`);
  });

  it('mirrors layout width tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--content-prose: ${layout.contentProse}`);
    expect(globalsCss).toContain(`--content-standard: ${layout.contentStandard}`);
    expect(globalsCss).toContain(`--content-wide: ${layout.contentWide}`);
  });

  it('mirrors motion tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--duration-base: ${motion.durationBase}`);
    expect(globalsCss).toContain(`--duration-interaction: ${motion.durationInteraction}`);
    expect(globalsCss).toContain(`--ease-base: ${motion.easeBase}`);
  });

  it('mirrors cosmic grade tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--cosmic-grade-overlay-start: ${cosmicGrade.overlayStart}`);
    expect(globalsCss).toContain(`--cosmic-grade-overlay-mid: ${cosmicGrade.overlayMid}`);
    expect(globalsCss).toContain(`--cosmic-grade-overlay-end: ${cosmicGrade.overlayEnd}`);
    expect(globalsCss).toContain(`--cosmic-grade-nebula-filter: ${cosmicGrade.nebulaFilter}`);
    expect(globalsCss).toContain(`--cosmic-grade-nebula-screen-opacity: ${cosmicGrade.nebulaScreenOpacity}`);
  });

  it('uses CSS variable for .cosmic-nebula-layer opacity (#201)', () => {
    expect(globalsCss).toMatch(/\.cosmic-nebula-layer\s*\{[^}]*opacity:\s*var\(--cosmic-grade-nebula-screen-opacity\)/);
    expect(globalsCss).not.toMatch(/\.cosmic-nebula-layer\s*\{[^}]*opacity:\s*[\d.]+[^}]*\}/);
  });

  it('mirrors cosmic grade overlay gradient structure in CSS', () => {
    expect(globalsCss).toContain('--cosmic-grade-overlay: linear-gradient');
    expect(globalsCss).toContain(`var(--cosmic-grade-overlay-start) 0%`);
    expect(globalsCss).toContain(`var(--cosmic-grade-overlay-mid) ${cosmicGrade.overlayMidStop}`);
    expect(globalsCss).toContain('var(--cosmic-grade-overlay-end) 100%');
    expect(cosmicGrade.overlayGradient).toContain(cosmicGrade.overlayMidStop);
  });

  it('mirrors typography blend tokens in CSS variables', () => {
    expect(globalsCss).toContain(`--type-blend-cosmic: ${typographyBlend.cosmic}`);
    expect(globalsCss).toContain(`--type-blend-solid: ${typographyBlend.solid}`);
  });

  it('mirrors typography size tokens and utility classes', () => {
    expect(globalsCss).toContain(`--type-size-heading: ${typography.sizeHeading}`);
    expect(globalsCss).toContain(`--type-size-subheading: ${typography.sizeSubheading}`);
    expect(globalsCss).toContain(`--type-size-quote: ${typography.sizeQuote}`);
    expect(globalsCss).toContain(`--type-size-body: ${typography.sizeBody}`);
    expect(globalsCss).toContain(`--type-size-caption: ${typography.sizeCaption}`);
    expect(globalsCss).toContain(`--type-size-visual-word: ${typography.sizeVisualWord}`);

    for (const [key, className] of Object.entries(typographySizeClasses) as Array<
      [keyof typeof typographySizeClasses, string]
    >) {
      const cssVar = typographySizeCssVars[key];
      expect(globalsCss).toContain(`.${className}`);
      expect(globalsCss).toContain(`font-size: var(${cssVar})`);
      expect(globalsCss).toContain(`${cssVar}: ${typography[typographySizeTokenKeys[key]]}`);
    }

    expect(globalsCss).toMatch(
      /\.type-font-serif\s*\{[^}]*font-family:\s*var\(--font-serif\)/,
    );
    expect(globalsCss).toMatch(
      /\.type-font-serif-jp\s*\{[^}]*font-family:\s*var\(--font-serif-jp\)/,
    );
    expect(globalsCss).toContain('--font-serif: var(--font-display)');
  });

  it('mirrors page header divider classes and section accent CSS variables', () => {
    for (const variant of Object.keys(pageHeaderDividers) as Array<
      keyof typeof pageHeaderDividers
    >) {
      const className = pageHeaderDividers[variant];
      const accentVar = sectionAccentCssVars[variant];
      expect(globalsCss).toContain(`.${className}`);
      expect(globalsCss).toContain(`var(${accentVar})`);
      expect(globalsCss).toContain(pageHeaderDividerColors[variant]);
      expect(globalsCss).toContain(`${accentVar}: ${pageHeaderDividerColors[variant]}`);
    }
  });

  it('mirrors desktop breakpoint in cosmic grade nebula filter media query', () => {
    expect(desktopMinWidthMediaQuery()).toBe(`(min-width: ${MOBILE_BREAKPOINT_PX}px)`);
    expect(globalsCss).toContain(
      `@media (min-width: ${MOBILE_BREAKPOINT_PX}px) and (prefers-reduced-motion: no-preference)`,
    );
  });

  it('defines custom cursor CSS hooks', () => {
    expect(globalsCss).toContain("html[data-custom-cursor='active']");
    expect(globalsCss).toContain('cursor: text');
  });

  it('mirrors mobile breakpoint in cursor fallback media query', () => {
    expect(mobileMaxWidthMediaQuery()).toBe(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    expect(globalsCss).toContain(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
  });
});

/**
 * トップページ刷新（#302）基盤 — Issue #303
 * 新トークンは既存トークンと並存し、`.top-scope` 配下（トップページ限定）でのみ使用する。
 */
describe('top page renewal tokens ↔ globals.css sync (#303)', () => {
  it('mirrors the top palette in CSS variables', () => {
    for (const key of Object.keys(topColors) as Array<keyof typeof topColors>) {
      expect(globalsCss).toContain(`${topColorCssVars[key]}: ${topColors[key]}`);
    }
  });

  it('scopes the top palette under .top-scope (not :root)', () => {
    const rootBlock = globalsCss.slice(0, globalsCss.indexOf('@tailwind base'));
    expect(rootBlock).not.toContain('--ink:');
    expect(globalsCss).toContain(`.${topShell.scopeClass} {`);
  });

  it('maps semantic font variables to next/font variables', () => {
    expect(globalsCss).toContain(
      `${topFontCssVars.serif}: var(${topNextFontCssVars.shipporiMincho})`,
    );
    expect(globalsCss).toContain(
      `${topFontCssVars.gothic}: var(${topNextFontCssVars.zenKakuGothicNew})`,
    );
    expect(globalsCss).toContain(
      `${topFontCssVars.latin}: var(${topNextFontCssVars.cormorantGaramond})`,
    );
    expect(globalsCss).toContain(
      `${topFontCssVars.mono}: var(${topNextFontCssVars.jetBrainsMono})`,
    );
  });

  it('applies the top base style (ink background / moon text / gothic body)', () => {
    const scopeBlock = globalsCss.slice(globalsCss.indexOf(`.${topShell.scopeClass} {`));
    expect(scopeBlock).toContain('background: var(--ink)');
    expect(scopeBlock).toContain('color: var(--moon)');
    expect(scopeBlock).toContain('font-family: var(--gothic)');
  });

  it('defines shared .stage / .eyebrow styles scoped to the top page', () => {
    expect(globalsCss).toContain(`.${topShell.scopeClass} .stage`);
    expect(globalsCss).toContain(`.${topShell.scopeClass} .eyebrow`);
    expect(globalsCss).toContain(`.${topShell.scopeClass} .eyebrow em`);
  });

  it('defines the #thread signature line with scaleY(0) initial transform', () => {
    expect(globalsCss).toMatch(/#thread\s*\{[^}]*transform:\s*scaleY\(0\)/);
    expect(globalsCss).toMatch(/#thread\s*\{[^}]*transform-origin:\s*top center/);
  });

  it('defines top nav shrink styles with blur + hairline border', () => {
    expect(globalsCss).toContain('.top-nav.scrolled');
    expect(globalsCss).toMatch(/\.top-nav\.scrolled\s*\{[^}]*backdrop-filter:\s*blur\(14px\)/);
    expect(globalsCss).toMatch(
      /\.top-nav\.scrolled\s*\{[^}]*border-bottom:\s*1px solid var\(--hairline\)/,
    );
  });

  it('keeps safe-area-inset-top compensation in the top nav (#166 regression guard)', () => {
    expect(globalsCss).toMatch(/\.top-nav\s*\{[^}]*safe-area-inset-top/);
  });

  it('defines hero section styles scoped to the top page (#304)', () => {
    expect(globalsCss).toContain('.top-scope .top-hero');
    expect(globalsCss).toContain('.top-scope #rain-canvas');
    expect(globalsCss).toContain('.top-scope .hero-mark');
    expect(globalsCss).toContain('.top-scope .hero-copy .line');
    expect(globalsCss).toContain('.top-scope .hero-sub');
    expect(globalsCss).toContain('.top-scope .scroll-cue');
    // 雨 Canvas は opacity 0.5（参照HTML L130）
    expect(globalsCss).toMatch(/\.top-scope #rain-canvas\s*\{[^}]*opacity:\s*0\.5/);
    // ヒーロー要素はイントロ前 opacity:0（参照HTML L149/L163/L173/L183）
    expect(globalsCss).toMatch(/\.top-scope \.hero-mark\s*\{[^}]*opacity:\s*0/);
  });

  it('forces hero elements visible under reduced-motion (#304 fallback)', () => {
    // 参照HTML L611-L617 相当 — GSAP が走らない環境で全要素を即時表示
    const reducedBlocks = globalsCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const heroReduced = reducedBlocks.find((b) => b.includes('.top-scope .hero-mark'));
    expect(heroReduced, 'hero reduced-motion fallback block').toBeDefined();
    expect(heroReduced).toContain('opacity: 1 !important');
  });

  it('defines philosophy (#vision) styles scoped to the top page (#305)', () => {
    expect(globalsCss).toContain('.top-scope #vision');
    expect(globalsCss).toContain('.top-scope .vision-tagline');
    expect(globalsCss).toContain('.top-scope .vision-note');
    // 文字送り前の初期 opacity 0.08（参照HTML L214）
    expect(globalsCss).toMatch(/\.top-scope \.vision-tagline \.w\s*\{[^}]*opacity:\s*0\.08/);
  });

  it('forces tagline chars visible under reduced-motion (#305 fallback)', () => {
    const reducedBlocks = globalsCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const block = reducedBlocks.find((b) => b.includes('.top-scope .vision-tagline .w'));
    expect(block, 'philosophy reduced-motion fallback block').toBeDefined();
    expect(block).toContain('opacity: 1 !important');
  });

  it('defines pain (#pain) styles scoped to the top page (#306)', () => {
    expect(globalsCss).toContain('.top-scope #pain');
    expect(globalsCss).toContain('.top-scope .pain-line');
    expect(globalsCss).toContain('.top-scope .pain-close');
    // 背景は ink→ink-2 グラデーション（参照HTML L225）
    expect(globalsCss).toMatch(/\.top-scope #pain\s*\{[^}]*linear-gradient\(to bottom, var\(--ink\), var\(--ink-2\)\)/);
    // 行はリビール前 opacity:0 + translateY(24px)（参照HTML L238-L239）
    expect(globalsCss).toMatch(/\.top-scope \.pain-line\s*\{[^}]*opacity:\s*0/);
    expect(globalsCss).toMatch(/\.top-scope \.pain-line\s*\{[^}]*translateY\(24px\)/);
  });

  it('forces pain lines + close visible under reduced-motion (#306 fallback)', () => {
    const reducedBlocks = globalsCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const block = reducedBlocks.find((b) => b.includes('.top-scope .pain-line'));
    expect(block, 'pain reduced-motion fallback block').toBeDefined();
    expect(block).toContain('.top-scope .pain-close');
    expect(block).toContain('opacity: 1 !important');
  });

  it('defines theory (#theory) circle styles scoped to the top page (#307)', () => {
    expect(globalsCss).toContain('.top-scope #theory');
    expect(globalsCss).toContain('.top-scope .circles');
    expect(globalsCss).toContain('.top-scope .circle.ideal');
    expect(globalsCss).toContain('.top-scope .circle.real');
    expect(globalsCss).toContain('.top-scope .congruence-label');
    // 円は初期位置（ideal 左 / real 右）に配置、congruence-label は初期 opacity:0
    expect(globalsCss).toMatch(/\.top-scope \.circle\.ideal\s*\{[^}]*translate\(-118%, -50%\)/);
    expect(globalsCss).toMatch(/\.top-scope \.circle\.real\s*\{[^}]*translate\(18%, -50%\)/);
    expect(globalsCss).toMatch(/\.top-scope \.congruence-label\s*\{[^}]*opacity:\s*0/);
    // 375px 等で円 160px に縮小
    expect(globalsCss).toMatch(/@media \(max-width: 640px\)\s*\{[\s\S]*?\.top-scope \.circle\s*\{[^}]*width:\s*160px/);
  });

  it('shows theory converged state + label under reduced-motion (#307 fallback)', () => {
    const reducedBlocks = globalsCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const block = reducedBlocks.find((b) => b.includes('.top-scope .congruence-label'));
    expect(block, 'theory reduced-motion fallback block').toBeDefined();
    // 円を中央へ寄せて収束状態を静的表示 + ラベル表示
    expect(block).toContain('translate(-50%, -50%) !important');
    expect(block).toMatch(/\.top-scope \.congruence-label\s*\{[^}]*opacity:\s*1 !important/);
  });

  it('defines services (#services) panel styles scoped to the top page (#308)', () => {
    expect(globalsCss).toContain('.top-scope #services');
    expect(globalsCss).toContain('.top-scope .svc-stage');
    expect(globalsCss).toContain('.top-scope .svc-panel');
    expect(globalsCss).toContain('.top-scope .svc-progress');
    expect(globalsCss).toContain('.top-scope .svc-dot.on');
    // パネルは絶対配置で重ね、初期は非表示（先頭のみ表示）— 参照HTML L333-L344
    expect(globalsCss).toMatch(/\.top-scope \.svc-panel\s*\{[^}]*position:\s*absolute/);
    expect(globalsCss).toMatch(/\.top-scope \.svc-panel\s*\{[^}]*visibility:\s*hidden/);
    expect(globalsCss).toMatch(/\.top-scope \.svc-panel:first-of-type\s*\{[^}]*visibility:\s*visible/);
    // アウトライン数字（text-stroke）
    expect(globalsCss).toMatch(/\.top-scope \.svc-num\s*\{[^}]*text-stroke:\s*1px var\(--rain-dim\)/);
  });

  it('stacks service panels vertically under reduced-motion (#308 fallback)', () => {
    const reducedBlocks = globalsCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const block = reducedBlocks.find((b) => b.includes('.top-scope .svc-panel'));
    expect(block, 'services reduced-motion fallback block').toBeDefined();
    // 各パネルを relative + min-height 100vh で縦積み、全表示
    expect(block).toMatch(/\.top-scope \.svc-panel\s*\{[^}]*position:\s*relative/);
    expect(block).toMatch(/\.top-scope \.svc-panel\s*\{[^}]*min-height:\s*100vh/);
    expect(block).toContain('visibility: visible !important');
  });

  it('defines process (#process) timeline styles scoped to the top page (#309)', () => {
    expect(globalsCss).toContain('.top-scope #process');
    expect(globalsCss).toContain('.top-scope .steps');
    expect(globalsCss).toContain('.top-scope .step');
    expect(globalsCss).toContain('.top-scope .step::before');
    // 背景は ink-2→ink グラデーション（参照HTML L392）
    expect(globalsCss).toMatch(/\.top-scope #process\s*\{[^}]*linear-gradient\(to bottom, var\(--ink-2\), var\(--ink\)\)/);
    // 左ボーダー + リビール前 opacity:0 + translateY(20px)（参照HTML L403-L405）
    expect(globalsCss).toMatch(/\.top-scope \.step\s*\{[^}]*border-left:\s*1px solid var\(--hairline\)/);
    expect(globalsCss).toMatch(/\.top-scope \.step\s*\{[^}]*translateY\(20px\)/);
    // rain ドット（::before）
    expect(globalsCss).toMatch(/\.top-scope \.step::before\s*\{[^}]*background:\s*var\(--rain\)/);
  });

  it('forces steps visible under reduced-motion (#309 fallback)', () => {
    const reducedBlocks = globalsCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const block = reducedBlocks.find((b) => b.includes('.top-scope .step'));
    expect(block, 'process reduced-motion fallback block').toBeDefined();
    expect(block).toContain('opacity: 1 !important');
  });

  it('defines profile (#profile) styles scoped to the top page (#310)', () => {
    expect(globalsCss).toContain('.top-scope #profile');
    expect(globalsCss).toContain('.top-scope .profile-head');
    expect(globalsCss).toContain('.top-scope .thoughts');
    expect(globalsCss).toContain('.top-scope .thought');
    expect(globalsCss).toContain('.top-scope .converge');
    expect(globalsCss).toContain('.top-scope .creed');
    // thoughts は 2 カラムグリッド、converge circle は初期 opacity:0
    expect(globalsCss).toMatch(/\.top-scope \.thoughts\s*\{[^}]*grid-template-columns:\s*1fr 1fr/);
    expect(globalsCss).toMatch(/\.top-scope \.converge circle\s*\{[^}]*opacity:\s*0/);
    // 640px 以下で 1 カラム化 + converge 非表示
    expect(globalsCss).toMatch(/@media \(max-width: 640px\)\s*\{[\s\S]*?\.top-scope \.thoughts\s*\{[^}]*grid-template-columns:\s*1fr\b/);
    expect(globalsCss).toMatch(/@media \(max-width: 640px\)\s*\{[\s\S]*?\.top-scope \.converge\s*\{[^}]*display:\s*none/);
  });

  it('shows profile cards/dot/creed under reduced-motion (#310 fallback)', () => {
    const reducedBlocks = globalsCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? [];
    const block = reducedBlocks.find((b) => b.includes('.top-scope .profile-head'));
    expect(block, 'profile reduced-motion fallback block').toBeDefined();
    expect(block).toContain('.top-scope .thought');
    expect(block).toContain('.top-scope .creed');
    // ドット即時点灯
    expect(block).toMatch(/\.top-scope \.converge circle\s*\{[^}]*opacity:\s*1 !important/);
  });

  it('defines cta (#cta) styles with hover fill + focus-visible (#311)', () => {
    expect(globalsCss).toContain('.top-scope #cta');
    expect(globalsCss).toContain('.top-scope .cta-copy');
    expect(globalsCss).toContain('.top-scope .cta-note');
    expect(globalsCss).toContain('.top-scope .cta-button');
    // 背景は ink→ink-3 グラデーション（参照HTML L539）
    expect(globalsCss).toMatch(/\.top-scope #cta\s*\{[^}]*linear-gradient\(to bottom, var\(--ink\), var\(--ink-3\)\)/);
    // ホバーで rain 背景が左から scaleX（::after transform-origin: left → scaleX(1)）
    expect(globalsCss).toMatch(/\.top-scope \.cta-button::after\s*\{[^}]*transform:\s*scaleX\(0\)/);
    expect(globalsCss).toMatch(/\.top-scope \.cta-button::after\s*\{[^}]*transform-origin:\s*left/);
    expect(globalsCss).toMatch(/\.top-scope \.cta-button:hover::after\s*\{[^}]*transform:\s*scaleX\(1\)/);
    // ホバーで文字色が ink に反転
    expect(globalsCss).toMatch(/\.top-scope \.cta-button:hover\s*\{[^}]*color:\s*var\(--ink\)/);
    // focus-visible で rain アウトライン
    expect(globalsCss).toMatch(/\.top-scope \.cta-button:focus-visible\s*\{[^}]*outline:\s*1px solid var\(--rain\)/);
  });
});

describe('design token cross-layer sync', () => {
  it('keeps cursor token values stable', () => {
    expect(cursor.size).toBe(8);
    expect(cursor.followerSize).toBe(32);
    expect(cursor.followerOpacity).toBe(0.4);
    expect(cursor.followerLerp).toBe(0.12);
  });
});
