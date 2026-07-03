import { describe, expect, it } from 'vitest';
import { topColors, topColorCssVars, topFontCssVars, topHero, topNextFontCssVars, topShell } from '@/lib/design/tokens';

/**
 * トップページ刷新（#302）基盤トークン — Issue #303
 * SSOT: lib/design/shape-d-prototype-v4.html の :root 定義（L11-L25）
 */
describe('top page renewal tokens (#303)', () => {
  it('defines the ink/moon/rain palette matching the reference HTML', () => {
    expect(topColors.ink).toBe('#07090d');
    expect(topColors.ink2).toBe('#0b0e15');
    expect(topColors.ink3).toBe('#10141d');
    expect(topColors.moon).toBe('#dfe3ea');
    expect(topColors.mist).toBe('#8b93a1');
    expect(topColors.mistDim).toBe('#545c6a');
    expect(topColors.rain).toBe('#7d9cc4');
    expect(topColors.rainDim).toBe('rgba(125, 156, 196, 0.35)');
    expect(topColors.hairline).toBe('rgba(139, 147, 161, 0.16)');
  });

  it('maps every palette entry to a CSS custom property name', () => {
    expect(topColorCssVars.ink).toBe('--ink');
    expect(topColorCssVars.ink2).toBe('--ink-2');
    expect(topColorCssVars.ink3).toBe('--ink-3');
    expect(topColorCssVars.moon).toBe('--moon');
    expect(topColorCssVars.mist).toBe('--mist');
    expect(topColorCssVars.mistDim).toBe('--mist-dim');
    expect(topColorCssVars.rain).toBe('--rain');
    expect(topColorCssVars.rainDim).toBe('--rain-dim');
    expect(topColorCssVars.hairline).toBe('--hairline');
    expect(Object.keys(topColorCssVars).sort()).toEqual(Object.keys(topColors).sort());
  });

  it('maps semantic font CSS vars to next/font variables', () => {
    expect(topFontCssVars.serif).toBe('--serif');
    expect(topFontCssVars.gothic).toBe('--gothic');
    expect(topFontCssVars.latin).toBe('--latin');
    expect(topFontCssVars.mono).toBe('--mono');

    expect(topNextFontCssVars.shipporiMincho).toBe('--font-shippori-mincho');
    expect(topNextFontCssVars.zenKakuGothicNew).toBe('--font-zen-kaku-gothic-new');
    expect(topNextFontCssVars.jetBrainsMono).toBe('--font-jetbrains-mono');
    // Cormorant Garamond は既存 --font-display を流用（#303 本文）
    expect(topNextFontCssVars.cormorantGaramond).toBe('--font-display');
  });

  it('defines top shell behavior constants matching the reference HTML', () => {
    // nav.classList.toggle("scrolled", window.scrollY > 60) — 参照HTML L875
    expect(topShell.navScrollThresholdPx).toBe(60);
    // gsap.to("#thread", { scrub: 1.2 }) — 参照HTML L895
    expect(topShell.threadScrub).toBe(1.2);
    expect(topShell.scopeClass).toBe('top-scope');
  });

  it('defines hero intro timeline constants matching the reference HTML (#304)', () => {
    // gsap.timeline({defaults:{ease:"power3.out"}}) — 参照HTML L899-L903
    expect(topHero.intro.ease).toBe('power3.out');
    expect(topHero.intro.mark).toEqual({ duration: 2.4, at: 0.4 });
    expect(topHero.intro.copy).toEqual({ duration: 1.8, stagger: 0.9, at: 1.2 });
    expect(topHero.intro.sub).toEqual({ duration: 1.6, at: '-=0.6' });
    expect(topHero.intro.cue).toEqual({ duration: 1.4, at: '-=0.8' });
  });

  it('defines tagline scrub constants matching the reference HTML (#305)', () => {
    // gsap.to("#tagline .w", {opacity:1, stagger:0.05, scrollTrigger:{start,end,scrub:0.8}}) — 参照HTML L905-L911
    expect(topHero.taglineScrub.opacityFrom).toBe(0.08);
    expect(topHero.taglineScrub.stagger).toBe(0.05);
    expect(topHero.taglineScrub.scrub).toBe(0.8);
    expect(topHero.taglineScrub.start).toBe('top 70%');
    expect(topHero.taglineScrub.end).toBe('center center');
  });

  it('defines pain-line reveal constants matching the reference HTML (#306)', () => {
    // .pain-line: duration 1.6, power2.out, y 24, trigger top 78% — 参照HTML L915-L918
    expect(topHero.pain.line).toEqual({ duration: 1.6, ease: 'power2.out', yFrom: 24, start: 'top 78%' });
    // .pain-close: duration 2, power2.out, trigger top 82% — 参照HTML L920-L923
    expect(topHero.pain.close).toEqual({ duration: 2, ease: 'power2.out', start: 'top 82%' });
  });

  it('defines theory pinned-scrub constants matching the reference HTML (#307)', () => {
    // pinned scrub: start top top / end +=120% / scrub 1、pinType transform（velocity-skew 回避）
    expect(topHero.theory.pin).toEqual({ start: 'top top', end: '+=120%', scrub: 1, pinType: 'transform' });
    // 円収束 xPercent ±84（参照HTML L932-L933）
    expect(topHero.theory.idealXPercent).toBe(84);
    expect(topHero.theory.realXPercent).toBe(-84);
    // タイムライン position: label 0.72（参照HTML L935）
    expect(topHero.theory.labelAt).toBe(0.72);
    expect(topHero.theory.borderAt).toBe(0.5);
    expect(topHero.theory.dimAt).toBe(0.6);
  });

  it('defines rain canvas constants matching the reference HTML (#304)', () => {
    // Math.floor(offsetWidth / 26) — 参照HTML L825
    expect(topHero.rain.columnWidthPx).toBe(26);
    // rgba(125,156,196,...) — topColors.rain の rgb と一致
    expect(topHero.rain.strokeRgb).toBe('125,156,196');
    expect(topHero.rain.canvasOpacity).toBe(0.5);
    // 長さ 40+rand*70 / 速度 0.4+rand*0.8 / alpha 0.05+rand*0.12 — 参照HTML L828-L830
    expect(topHero.rain.lengthMinPx).toBe(40);
    expect(topHero.rain.lengthRangePx).toBe(70);
    expect(topHero.rain.speedMin).toBe(0.4);
    expect(topHero.rain.speedRange).toBe(0.8);
    expect(topHero.rain.alphaMin).toBe(0.05);
    expect(topHero.rain.alphaRange).toBe(0.12);
  });
});
