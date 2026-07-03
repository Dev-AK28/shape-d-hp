/**
 * @vitest-environment jsdom
 *
 * プロセスセクション TopProcess — Issue #309
 * - eyebrow / 4 ステップ（num/title/desc）を描画
 * - 通常モード: 各 step が個別トリガーで時差フェードイン
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

import TopProcess from '@/components/top/TopProcess';

beforeEach(() => {
  mockGsapTo.mockClear();
  mockToArray.mockReset();
  mockToArray.mockReturnValue([{ id: 's0' }, { id: 's1' }, { id: 's2' }, { id: 's3' }]);
  mockUseGsapContext.mockReset();
  mockUseGsapContext.mockImplementation((setup) => setup());
});

describe('TopProcess', () => {
  it('renders the eyebrow and four steps with num/title/desc', () => {
    render(<TopProcess />);

    expect(screen.getByText('PROCESS')).toBeTruthy();
    const steps = document.querySelectorAll('#process .step');
    expect(steps).toHaveLength(4);
    expect(steps[0].querySelector('.step-num')?.textContent).toBe('01 — LISTEN');
    expect(steps[0].querySelector('.step-title')?.textContent).toBe('聴く');
    expect(steps[3].querySelector('.step-title')?.textContent).toBe('育てる');
  });

  it('fades each step in on its own trigger with staggered delay', () => {
    render(<TopProcess />);

    expect(mockGsapTo).toHaveBeenCalledTimes(4);
    const { step } = topHero.process;
    mockGsapTo.mock.calls.forEach((call, i) => {
      const [target, vars] = call as [
        { id: string },
        { opacity: number; y: number; duration: number; ease: string; delay: number; scrollTrigger: { trigger: unknown; start: string } },
      ];
      expect(target).toEqual({ id: `s${i}` });
      expect(vars).toMatchObject({ opacity: 1, y: 0, duration: step.duration, ease: step.ease });
      expect(vars.delay).toBeCloseTo(i * step.staggerDelay);
      expect(vars.scrollTrigger).toEqual({ trigger: { id: `s${i}` }, start: step.start });
    });
  });

  it('does not animate when useGsapContext skips setup (reduced-motion)', () => {
    mockUseGsapContext.mockImplementation(() => {
      /* reduced-motion: setup は呼ばれない */
    });
    render(<TopProcess />);
    expect(mockGsapTo).not.toHaveBeenCalled();
  });
});
