/**
 * @vitest-environment jsdom
 *
 * 課題提起セクション TopPain — Issue #306
 * - eyebrow / 3 行の pain-line（lead + strong）/ pain-close を描画
 * - 通常モード: 各行が自身をトリガーに独立フェードイン + close
 * - reduced-motion: GSAP を初期化しない（CSS フォールバックで表示）
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { topHero } from '@/lib/design/tokens';

const { mockUseGsapContext, mockGsapTo, mockToArray } = vi.hoisted(() => ({
  mockUseGsapContext: vi.fn<(setup: () => void, deps?: ReadonlyArray<unknown>) => void>(),
  mockGsapTo: vi.fn(),
  mockToArray: vi.fn(),
}));

vi.mock('@/lib/hooks/useGsapContext', () => ({ useGsapContext: mockUseGsapContext }));
vi.mock('@/lib/scroll/gsap-config', () => ({
  gsap: { to: mockGsapTo, utils: { toArray: mockToArray } },
}));

import TopPain from '@/components/top/TopPain';

beforeEach(() => {
  mockGsapTo.mockClear();
  mockToArray.mockReset();
  // 3 行分のダミー要素を返す
  mockToArray.mockReturnValue([{ id: 'l1' }, { id: 'l2' }, { id: 'l3' }]);
  mockUseGsapContext.mockReset();
  mockUseGsapContext.mockImplementation((setup) => setup());
});

describe('TopPain', () => {
  it('renders the eyebrow, three pain lines with strong emphasis, and the close', () => {
    render(<TopPain />);

    expect(screen.getByText('REALITY')).toBeTruthy();
    const lines = document.querySelectorAll('#pain .pain-line');
    expect(lines).toHaveLength(3);
    // 各行に強調（strong）が含まれる
    expect(lines[0].querySelector('strong')?.textContent).toContain('時間だけが過ぎていく');
    expect(lines[1].querySelector('strong')?.textContent).toContain('価格で比べられている');
    expect(lines[2].querySelector('strong')?.textContent).toContain('想いは載っていなかった');
    expect(document.querySelector('#pain .pain-close')?.textContent).toContain('翻訳する相手');
  });

  it('fades each line in on its own trigger + fades the close in', () => {
    render(<TopPain />);

    // 3 行 + close = 4 回
    expect(mockGsapTo).toHaveBeenCalledTimes(4);

    const lineCall = mockGsapTo.mock.calls[0][1] as {
      opacity: number;
      y: number;
      duration: number;
      ease: string;
      scrollTrigger: { trigger: unknown; start: string };
    };
    expect(lineCall).toMatchObject({
      opacity: 1,
      y: 0,
      duration: topHero.pain.line.duration,
      ease: topHero.pain.line.ease,
    });
    expect(lineCall.scrollTrigger.trigger).toEqual({ id: 'l1' });
    expect(lineCall.scrollTrigger.start).toBe(topHero.pain.line.start);

    const [closeTarget, closeVars] = mockGsapTo.mock.calls[3] as [
      string,
      { opacity: number; duration: number; scrollTrigger: { start: string } },
    ];
    expect(closeTarget).toBe('#pain .pain-close');
    expect(closeVars.duration).toBe(topHero.pain.close.duration);
    expect(closeVars.scrollTrigger.start).toBe(topHero.pain.close.start);
  });

  it('does not animate when useGsapContext skips setup (reduced-motion)', () => {
    mockUseGsapContext.mockImplementation(() => {
      /* reduced-motion: setup は呼ばれない */
    });
    render(<TopPain />);
    expect(mockGsapTo).not.toHaveBeenCalled();
  });
});
