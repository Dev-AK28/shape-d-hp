/**
 * @vitest-environment jsdom
 *
 * Hero コンポーネントの mobileStaticHero レイアウト統合テスト
 *
 * prefersCoarsePointer=true かつ isMobile=false（大画面タッチ端末）で
 * staticFallback が有効なとき、Hero が flex-col h-auto レイアウトになり
 * CTA が flow 内（relative）に配置されることを検証する。
 *
 * 背景: #136 で mobileStaticHero 条件を isTouchInputDevice に拡張。
 * Issue: #147
 */

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DEFAULT_DEVICE_PROFILE } from '@/lib/performance/device-profile';
import type { DeviceProfile } from '@/lib/performance/device-profile';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockUseDeviceProfile, mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseDeviceProfile: vi.fn<() => { profile: DeviceProfile; isReady: boolean }>(),
  mockUseReducedMotion: vi.fn<() => boolean | null>(),
}));

vi.mock('@/lib/hooks/useDeviceProfile', () => ({
  useDeviceProfile: mockUseDeviceProfile,
}));

vi.mock('framer-motion', () => ({
  useReducedMotion: mockUseReducedMotion,
}));

// next/image はブラウザ最適化ロジックを含むため jsdom では動かない
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => React.createElement('img', { alt }),
}));

// WebGL / Canvas を必要とするため jsdom では動かない
vi.mock('@/components/hero/LogoParticleFormation', () => ({
  default: () => null,
}));

vi.mock('@/components/BrandLogo', () => ({
  default: () => null,
}));

// GSAP / ScrollTrigger は jsdom 環境で matchMedia を要求するため no-op に差し替える。
// このテストの関心はレイアウトクラスであり、アニメーション挙動ではない。
vi.mock('@/lib/hooks/useGsapContext', () => ({
  useGsapContext: vi.fn(),
}));

// ─── Test profiles ─────────────────────────────────────────────────────────────

/**
 * 大画面タッチ端末 (iPad Pro 等) + prefers-reduced-motion 有効
 * — prefersCoarsePointer=true, isMobile=false, prefersReducedMotion=true
 *
 * prefersReducedMotion はデバイス特性ではなくユーザーのアクセシビリティ設定。
 * Issue #147 のテストシナリオがこの組み合わせを明示的に要求するため名前に含める。
 *
 * Note: mockUseReducedMotion.mockReturnValue(true) は skipFormation など
 * 他の分岐のために設定しているが、mobileStaticHero の計算は
 * shouldDisableGsapAnimation(profile) = profile.prefersReducedMotion を参照する。
 * 両者を一致させることでテストの意図と実装ロジックを整合させている。
 */
const LARGE_TOUCH_TABLET_REDUCED_MOTION: DeviceProfile = {
  ...DEFAULT_DEVICE_PROFILE,
  prefersCoarsePointer: true,
  isMobile: false,
  prefersReducedMotion: true,
};

/** 通常デスクトップ — coarse/touch なし, prefersReducedMotion=false */
const DESKTOP: DeviceProfile = {
  ...DEFAULT_DEVICE_PROFILE,
  prefersCoarsePointer: false,
  isMobile: false,
  prefersReducedMotion: false,
};

// ─── Import under test ────────────────────────────────────────────────────────

import Hero from '@/components/Hero';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Hero mobileStaticHero レイアウト — coarse pointer + staticFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('大画面タッチ端末 (prefersCoarsePointer=true, isMobile=false, prefersReducedMotion=true)', () => {
    beforeEach(() => {
      mockUseDeviceProfile.mockReturnValue({ profile: LARGE_TOUCH_TABLET_REDUCED_MOTION, isReady: true });
      mockUseReducedMotion.mockReturnValue(true);
    });

    it('root <section> に flex-col クラスが付与される', () => {
      render(<Hero variant="immersive" />);
      const section = screen.getByTestId('hero-pin-section');
      expect(section.className.split(' ')).toContain('flex-col');
    });

    it('root <section> に h-auto クラスが付与される（h-svh ではない）', () => {
      render(<Hero variant="immersive" />);
      const section = screen.getByTestId('hero-pin-section');
      expect(section.className.split(' ')).toContain('h-auto');
      expect(section.className.split(' ')).not.toContain('h-svh');
    });

    it('CTA ラッパーが relative クラスを持ち、absolute ではない', () => {
      render(<Hero variant="immersive" />);
      const cta = screen.getByTestId('hero-cta-wrapper');
      expect(cta.className.split(' ')).toContain('relative');
      expect(cta.className.split(' ')).not.toContain('absolute');
    });
  });

  describe('デスクトップ (prefersCoarsePointer=false, isMobile=false, prefersReducedMotion=false)', () => {
    beforeEach(() => {
      mockUseDeviceProfile.mockReturnValue({ profile: DESKTOP, isReady: true });
      mockUseReducedMotion.mockReturnValue(false);
    });

    it('root <section> に h-svh クラスが付与される（h-auto ではない）', () => {
      render(<Hero variant="immersive" />);
      const section = screen.getByTestId('hero-pin-section');
      expect(section.className.split(' ')).toContain('h-svh');
      expect(section.className.split(' ')).not.toContain('h-auto');
    });

    it('CTA ラッパーが absolute + bottom 配置クラスを持ち、relative ではない', () => {
      render(<Hero variant="immersive" />);
      const cta = screen.getByTestId('hero-cta-wrapper');
      expect(cta.className.split(' ')).toContain('absolute');
      expect(cta.className.split(' ')).toContain('bottom-[var(--space-6)]');
      expect(cta.className.split(' ')).not.toContain('relative');
    });
  });

  describe('isReady=false — SSR 初回表示は staticFallback=true として扱われる', () => {
    it('大画面タッチ端末で isReady=false → mobileStaticHero=true → flex-col', () => {
      mockUseDeviceProfile.mockReturnValue({
        profile: { ...LARGE_TOUCH_TABLET_REDUCED_MOTION, prefersReducedMotion: false },
        isReady: false,
      });
      mockUseReducedMotion.mockReturnValue(false);

      render(<Hero variant="immersive" />);
      const section = screen.getByTestId('hero-pin-section');
      expect(section.className.split(' ')).toContain('flex-col');
      expect(section.className.split(' ')).toContain('h-auto');
    });
  });
});
