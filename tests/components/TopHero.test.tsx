/**
 * @vitest-environment jsdom
 *
 * ヒーローセクション TopHero — Issue #304
 * - マーク（SHAPE∞D, h1）/ コピー2行 / サブ / スクロールキュー / 雨 Canvas を描画
 * - 通常モード: イントロタイムライン（mark→copy→sub→cue の順）を参照HTMLの尺で組む
 * - reduced-motion: GSAP を初期化しない（CSS フォールバックで表示）
 */

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { topHero } from '@/lib/design/tokens';

const { mockUseReducedMotion, mockUseDeviceProfile, mockTimeline, mockTo, mockContext, mockRegister } =
  vi.hoisted(() => {
    const to = vi.fn();
    const timelineObj = { to };
    to.mockReturnValue(timelineObj);
    return {
      mockUseReducedMotion: vi.fn<() => boolean | null>(),
      mockUseDeviceProfile: vi.fn<() => { isReady: boolean }>(),
      mockTimeline: vi.fn(() => timelineObj),
      mockTo: to,
      mockContext: vi.fn((fn: () => void) => {
        fn();
        return { revert: vi.fn() };
      }),
      mockRegister: vi.fn(),
    };
  });

vi.mock('framer-motion', () => ({ useReducedMotion: mockUseReducedMotion }));
vi.mock('@/lib/hooks/useDeviceProfile', () => ({ useDeviceProfile: mockUseDeviceProfile }));
vi.mock('@/lib/scroll/gsap-config', () => ({
  gsap: { timeline: mockTimeline, context: mockContext },
  registerGsapPlugins: mockRegister,
}));
// RainCanvas は canvas 2D を触るため描画をスタブ
vi.mock('@/components/top/RainCanvas', () => ({
  default: () => React.createElement('canvas', { 'data-testid': 'hero-rain-canvas', id: 'rain-canvas' }),
}));

import TopHero from '@/components/top/TopHero';

beforeEach(() => {
  mockTo.mockClear();
  mockTimeline.mockClear();
  mockContext.mockClear();
  mockUseDeviceProfile.mockReturnValue({ isReady: true });
});

describe('TopHero', () => {
  it('renders the mark, copy lines, sub copy, scroll cue and rain canvas', () => {
    mockUseReducedMotion.mockReturnValue(false);
    render(<TopHero />);

    const mark = screen.getByRole('heading', { level: 1 });
    expect(mark.textContent?.replace(/\s/g, '')).toBe('SHAPE∞D');
    expect(mark.querySelector('.inf')?.textContent).toBe('∞');

    const lines = document.querySelectorAll('.hero-copy .line');
    expect(lines).toHaveLength(2);
    expect(lines[0].textContent).toContain('機能だけなら');
    expect(lines[1].textContent).toContain('想いまで実装');

    expect(document.querySelector('.hero-sub')?.textContent).toContain('SELF-CONGRUENCE');
    expect(screen.getByTestId('hero-scroll-cue')).toBeTruthy();
    expect(screen.getByTestId('hero-rain-canvas')).toBeTruthy();
  });

  it('builds the intro timeline in mark→copy→sub→cue order with reference durations', () => {
    mockUseReducedMotion.mockReturnValue(false);
    render(<TopHero />);

    expect(mockTimeline).toHaveBeenCalledWith({ defaults: { ease: topHero.intro.ease } });
    const targets = mockTo.mock.calls.map((c) => c[0]);
    expect(targets).toEqual(['.hero-mark', '.hero-copy .line', '.hero-sub', '.scroll-cue']);

    const [markVars, markAt] = mockTo.mock.calls[0].slice(1);
    expect(markVars).toMatchObject({ opacity: 1, duration: topHero.intro.mark.duration });
    expect(markAt).toBe(topHero.intro.mark.at);

    const [copyVars] = mockTo.mock.calls[1].slice(1);
    expect(copyVars).toMatchObject({ opacity: 1, y: 0, stagger: topHero.intro.copy.stagger });
  });

  it('does not initialize GSAP when reduced-motion is preferred', () => {
    mockUseReducedMotion.mockReturnValue(true);
    render(<TopHero />);
    expect(mockContext).not.toHaveBeenCalled();
    expect(mockTimeline).not.toHaveBeenCalled();
  });

  it('waits for device profile readiness before animating', () => {
    mockUseReducedMotion.mockReturnValue(false);
    mockUseDeviceProfile.mockReturnValue({ isReady: false });
    render(<TopHero />);
    expect(mockContext).not.toHaveBeenCalled();
  });
});
