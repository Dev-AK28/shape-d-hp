/**
 * @vitest-environment jsdom
 *
 * サービスセクション TopServices — Issue #308
 * - 4 パネル（数字/見出し/英字/説明）+ 4 プログレスドットを描画
 * - 通常モード: pinned scrub タイムラインでパネルをクロスフェード、onUpdate でドット同期
 * - reduced-motion: GSAP を初期化しない（CSS フォールバックで縦積み表示）
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { topHero } from '@/lib/design/tokens';

const { mockUseGsapContext, mockTimeline, mockTo, mockFromTo, mockToArray } = vi.hoisted(() => {
  const to = vi.fn();
  const fromTo = vi.fn();
  const tl = { to, fromTo };
  to.mockReturnValue(tl);
  fromTo.mockReturnValue(tl);
  return {
    mockUseGsapContext: vi.fn<(setup: () => void, deps?: ReadonlyArray<unknown>) => void>(),
    mockTimeline: vi.fn<(vars?: Record<string, unknown>) => typeof tl>(() => tl),
    mockTo: to,
    mockFromTo: fromTo,
    mockToArray: vi.fn(),
  };
});

vi.mock('@/lib/hooks/useGsapContext', () => ({ useGsapContext: mockUseGsapContext }));
vi.mock('@/lib/scroll/gsap-config', () => ({
  gsap: { timeline: mockTimeline, utils: { toArray: mockToArray } },
}));

import TopServices from '@/components/top/TopServices';

beforeEach(() => {
  mockTo.mockClear();
  mockFromTo.mockClear();
  mockTimeline.mockClear();
  mockToArray.mockReset();
  // 1回目 = panels(4), 2回目 = dots(4)
  mockToArray
    .mockReturnValueOnce([{ id: 'p0' }, { id: 'p1' }, { id: 'p2' }, { id: 'p3' }])
    .mockReturnValueOnce([{}, {}, {}, {}]);
  mockUseGsapContext.mockReset();
  mockUseGsapContext.mockImplementation((setup) => setup());
});

describe('TopServices', () => {
  it('renders four panels with number/title/en/desc and four progress dots', () => {
    render(<TopServices />);

    const panels = document.querySelectorAll('#services .svc-panel');
    expect(panels).toHaveLength(4);
    expect(panels[0].querySelector('.svc-num')?.textContent).toBe('01');
    expect(panels[0].querySelector('.svc-title')?.textContent).toBe('基幹システム開発');
    expect(panels[3].querySelector('.svc-title')?.textContent).toBe('継続開発・伴走');
    expect(document.querySelectorAll('#services .svc-dot')).toHaveLength(4);
    // 先頭ドットのみ初期 on
    expect(document.querySelector('#services .svc-dot')?.className).toContain('on');
    // 数字は装飾（aria-hidden）
    expect(panels[0].querySelector('.svc-num')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('builds a pinned scrub timeline whose end scales with panel count', () => {
    render(<TopServices />);

    expect(mockTimeline).toHaveBeenCalledTimes(1);
    const st = (mockTimeline.mock.calls[0][0] as { scrollTrigger: Record<string, unknown> }).scrollTrigger;
    expect(st).toMatchObject({
      trigger: '#services',
      start: topHero.services.pin.start,
      pin: true,
      pinType: topHero.services.pin.pinType,
      scrub: topHero.services.pin.scrub,
    });
    // end = +=(4 * 90)% = 360%
    expect(st.end).toBe(`+=${4 * topHero.services.panelStepPercent}%`);
    expect(typeof st.onUpdate).toBe('function');
  });

  it('crossfades: first panel reveal + 3 transitions (out + fromTo in)', () => {
    render(<TopServices />);
    // i=0: to(panel, autoAlpha1) ; i=1..3: to(prev out) ×3 ; tail to({}) ×1 → to 合計 5
    expect(mockTo).toHaveBeenCalledTimes(5);
    // fromTo は i=1..3 の 3 回
    expect(mockFromTo).toHaveBeenCalledTimes(3);
    const firstReveal = mockTo.mock.calls[0][1] as { autoAlpha: number; duration: number };
    expect(firstReveal).toMatchObject({ autoAlpha: 1, duration: topHero.services.firstRevealDuration });
    const fadeInFrom = mockFromTo.mock.calls[0][1] as { autoAlpha: number; y: number };
    expect(fadeInFrom).toMatchObject({ autoAlpha: 0, y: topHero.services.fadeInYFrom });
  });

  it('onUpdate toggles the active dot based on scroll progress', () => {
    render(<TopServices />);
    const onUpdate = (mockTimeline.mock.calls[0][0] as { scrollTrigger: { onUpdate: (s: { progress: number }) => void } })
      .scrollTrigger.onUpdate;

    const dots = mockToArray.mock.results[1].value as Array<{ classList: { toggle: ReturnType<typeof vi.fn> } }>;
    dots.forEach((d) => (d.classList = { toggle: vi.fn() }));

    onUpdate({ progress: 0.6 }); // floor(0.6*4)=2 → index 2 が active
    expect(dots[2].classList.toggle).toHaveBeenCalledWith('on', true);
    expect(dots[0].classList.toggle).toHaveBeenCalledWith('on', false);
  });

  it('does not animate when useGsapContext skips setup (reduced-motion)', () => {
    mockUseGsapContext.mockImplementation(() => {
      /* reduced-motion: setup は呼ばれない */
    });
    render(<TopServices />);
    expect(mockTimeline).not.toHaveBeenCalled();
  });
});
