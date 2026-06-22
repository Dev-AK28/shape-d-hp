/**
 * 全幕モバイル簡略版・reduced-motion ポリシー監査テスト（Issue #214）
 *
 * 各コンポーネントが以下のポリシーを遵守しているかをソース読み取りで検証する:
 * - GSAP ピン / スクラブを使う幕は `isTouchInputDevice` でモバイル分岐を持つ
 * - `useGsapContext` を使う幕は reduced-motion で自動スキップされる（フック内実装）
 * - framer-motion リビール消費コンポーネントは `useStaticReveal` 経由で staticReveal を取得する
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function src(relPath: string): string {
  return readFileSync(join(process.cwd(), relPath), 'utf8');
}

// ── Act 3: About ─────────────────────────────────────────────────────────────
describe('Act 3 About — mobile/reduced-motion policy', () => {
  it('uses isTouchInputDevice to branch pin vs stagger on mobile', () => {
    const s = src('components/About.tsx');
    expect(s).toContain('isTouchInputDevice');
    // Desktop path: pin=true
    expect(s).toContain('pin: true');
    // Mobile path: toggleActions (simple ScrollTrigger, no pin)
    expect(s).toContain('toggleActions');
  });

  it('uses useGsapContext (auto-skips on prefers-reduced-motion)', () => {
    const s = src('components/About.tsx');
    expect(s).toContain('useGsapContext');
  });

  it('uses useStaticReveal for staticReveal guard', () => {
    const s = src('components/About.tsx');
    expect(s).toContain('useStaticReveal');
    expect(s).toContain('staticReveal');
  });
});

// ── Act 4: MissionVision ──────────────────────────────────────────────────────
describe('Act 4 MissionVision — mobile/reduced-motion policy', () => {
  it('uses isTouchInputDevice + mobileScale to weaken parallax on mobile', () => {
    const s = src('components/MissionVision.tsx');
    expect(s).toContain('isTouchInputDevice');
    expect(s).toContain('mobileScale');
    expect(s).toContain('offsetScale');
  });

  it('uses useGsapContext (auto-skips on prefers-reduced-motion)', () => {
    const s = src('components/MissionVision.tsx');
    expect(s).toContain('useGsapContext');
  });

  it('uses useStaticReveal for staticReveal guard', () => {
    const s = src('components/MissionVision.tsx');
    expect(s).toContain('useStaticReveal');
    expect(s).toContain('staticReveal');
  });

  it('ParallaxSection falls back to plain div on prefers-reduced-motion (via useReducedMotion)', () => {
    const s = src('components/scroll/ParallaxSection.tsx');
    expect(s).toContain('useReducedMotion');
    // Reduced-motion path returns plain div
    expect(s).toContain('reduceMotion');
  });
});

// ── Philosophy: horizontal scroll ────────────────────────────────────────────
describe('PhilosophyContent — mobile/reduced-motion policy', () => {
  it('gates horizontal pin-scroll with enableHorizontal (no pin on mobile/coarse-pointer)', () => {
    const s = src('components/PhilosophyContent.tsx');
    expect(s).toContain('enableHorizontal');
    // isTouchInputDevice encapsulates both isMobile and prefersCoarsePointer (#190)
    expect(s).toContain('isTouchInputDevice');
    // Pin only inside enableHorizontal branch
    expect(s).toContain('pin: true');
  });

  it('uses useGsapContext (auto-skips on prefers-reduced-motion)', () => {
    const s = src('components/PhilosophyContent.tsx');
    expect(s).toContain('useGsapContext');
  });

  it('uses useStaticReveal for staticReveal guard', () => {
    const s = src('components/PhilosophyContent.tsx');
    expect(s).toContain('useStaticReveal');
    expect(s).toContain('staticReveal');
  });
});

// ── useGsapContext: reduced-motion auto-skip ──────────────────────────────────
describe('useGsapContext — reduced-motion auto-skip', () => {
  it('skips setup when shouldDisableGsapAnimation returns true', () => {
    const s = src('lib/hooks/useGsapContext.ts');
    expect(s).toContain('shouldDisableGsapAnimation');
    expect(s).toContain('disableAnimation');
    // Guard: early return when disableAnimation
    expect(s).toContain('if (!isReady || disableAnimation)');
  });

  it('also skips when useReducedMotion returns true', () => {
    const s = src('lib/hooks/useGsapContext.ts');
    expect(s).toContain('useReducedMotion');
    expect(s).toContain('reduceMotion === true');
  });
});

// ── shouldDisableGsapAnimation: only prefers-reduced-motion ──────────────────
describe('shouldDisableGsapAnimation policy', () => {
  it('delegates to shouldDisableSmoothScroll (prefers-reduced-motion only, NOT isMobile)', () => {
    const s = src('lib/scroll/gsap-config.ts');
    expect(s).toContain('shouldDisableSmoothScroll');
    // Must NOT gate on isMobile — mobile also gets GSAP (just no pin)
    expect(s).not.toContain('isMobile');
  });

  it('device-profile.ts contains prefersReducedMotion (shouldDisableSmoothScroll basis)', () => {
    const s = src('lib/performance/device-profile.ts');
    expect(s).toContain('prefersReducedMotion');
  });

  it('isTouchInputDevice is defined in device-profile.ts (separate from shouldDisableSmoothScroll)', () => {
    const s = src('lib/performance/device-profile.ts');
    expect(s).toContain('isTouchInputDevice');
  });
});

// ── framer-motion consumers: staticReveal via useStaticReveal ─────────────────
describe('framer-motion reveal consumers — staticReveal guard', () => {
  const framerComponents = [
    'components/ServicesContent.tsx',
    'components/WorksContent.tsx',
    'components/ConsultingContent.tsx',
    'components/DevelopmentContent.tsx',
    'components/ProcessNavigation.tsx',
  ];

  for (const file of framerComponents) {
    it(`${file} uses useStaticReveal`, () => {
      const s = src(file);
      expect(s).toContain('useStaticReveal');
      expect(s).toContain('staticReveal');
    });
  }
});
