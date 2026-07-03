import { describe, expect, it } from 'vitest';
import { topColors, topColorCssVars, topFontCssVars, topNextFontCssVars, topShell } from '@/lib/design/tokens';

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
});
