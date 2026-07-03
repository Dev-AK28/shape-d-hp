/**
 * @vitest-environment jsdom
 *
 * 自己一致セクション TopTheory — Issue #307
 * - eyebrow / title / 2円 + congruence-label / desc を描画
 * - 通常モード: pinned scrub タイムラインで円収束・ラベルフェード・減光を構成
 * - reduced-motion: GSAP を初期化しない（CSS フォールバックで収束状態を静的表示）
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { topHero } from '@/lib/design/tokens';

const { mockUseGsapContext, mockTimeline, mockTo } = vi.hoisted(() => {
  const to = vi.fn();
  const tl = { to };
  to.mockReturnValue(tl);
  return {
    mockUseGsapContext: vi.fn<(setup: () => void, deps?: ReadonlyArray<unknown>) => void>(),
    mockTimeline: vi.fn<(vars?: Record<string, unknown>) => typeof tl>(() => tl),
    mockTo: to,
  };
});

vi.mock('@/lib/hooks/useGsapContext', () => ({ useGsapContext: mockUseGsapContext }));
vi.mock('@/lib/scroll/gsap-config', () => ({ gsap: { timeline: mockTimeline } }));

import TopTheory from '@/components/top/TopTheory';

beforeEach(() => {
  mockTo.mockClear();
  mockTimeline.mockClear();
  mockUseGsapContext.mockReset();
  mockUseGsapContext.mockImplementation((setup) => setup());
});

describe('TopTheory', () => {
  it('renders eyebrow, title, two labeled circles, congruence label and desc', () => {
    render(<TopTheory />);

    expect(screen.getByText('APPROACH')).toBeTruthy();
    expect(screen.getByText('自己一致 × AIエンジニアリング')).toBeTruthy();
    expect(document.getElementById('c-ideal')?.textContent).toContain('こうありたい姿');
    expect(document.getElementById('c-real')?.textContent).toContain('いまの姿');
    const label = document.getElementById('c-label');
    expect(label?.querySelector('b')?.textContent).toBe('一致');
    expect(label?.querySelector('small')?.textContent).toContain('SELF-EXPRESSION');
    // 図には代替テキスト（role=img + aria-label）
    const circles = document.querySelector('.circles');
    expect(circles?.getAttribute('role')).toBe('img');
    expect(circles?.getAttribute('aria-label')).toContain('重なっていく図');
    expect(document.querySelector('.theory-desc')?.textContent).toContain('自己一致');
  });

  it('builds a pinned scrub timeline that converges circles and reveals the label', () => {
    render(<TopTheory />);

    expect(mockTimeline).toHaveBeenCalledTimes(1);
    const tlArg = mockTimeline.mock.calls[0][0] as unknown as {
      defaults: { duration: number };
      scrollTrigger: Record<string, unknown>;
    };
    // グローバル 1.4 の影響を打ち消し、参照HTMLの尺比を再現するため duration を 0.5 に固定
    expect(tlArg.defaults).toEqual({ duration: topHero.theory.tweenDuration });
    expect(tlArg.scrollTrigger).toMatchObject({
      trigger: '#theory',
      start: topHero.theory.pin.start,
      end: topHero.theory.pin.end,
      pin: true,
      pinType: topHero.theory.pin.pinType,
      scrub: topHero.theory.pin.scrub,
    });

    const calls = mockTo.mock.calls;
    // 円の収束（xPercent ±84）
    expect(calls[0][0]).toBe('#c-ideal');
    expect(calls[0][1]).toMatchObject({ xPercent: topHero.theory.idealXPercent, ease: 'none' });
    expect(calls[0][2]).toBe(0);
    expect(calls[1][0]).toBe('#c-real');
    expect(calls[1][1]).toMatchObject({ xPercent: topHero.theory.realXPercent });
    // ラベルフェードは position 0.72
    const labelCall = calls.find((c) => c[0] === '#c-label');
    expect(labelCall?.[1]).toMatchObject({ opacity: 1 });
    expect(labelCall?.[2]).toBe(topHero.theory.labelAt);
  });

  it('does not animate when useGsapContext skips setup (reduced-motion)', () => {
    mockUseGsapContext.mockImplementation(() => {
      /* reduced-motion: setup は呼ばれない */
    });
    render(<TopTheory />);
    expect(mockTimeline).not.toHaveBeenCalled();
  });
});
